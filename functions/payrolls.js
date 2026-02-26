const env = process.env;
const _ = require('lodash');
const { Sequelize, Op, where } = require('sequelize');
const { 
    Company,
    Payroll,
    PayrollItem,
    PayrollDeduction,
    UserPayRate,
    UserCredentials,
    User,
    EventCheckin,
    UserCheckIn,
    Event,
    Activity,
    UserPreference,
    Role,
    RolePermissions,
    UserPermissions,
    Permissions,
    Page,
    Priority
} = require('../models');
const fs = require('fs');
const path = require('path');
const { generatePaystubPdf } = require('../helpers/pdf');
const { uploadPayrollPdfToCloudinary } = require('../helpers/upload');
const { sendPaystubEmail, sendPayrollProcessedEmail } = require('../helpers/emails');
const { createNotification, updateNotification } = require('./notifications');

// Get users with the specified permission level on a given page
const getUsersByPermission = async (pageName, companyId, permissions = ['read', 'write', 'admin']) => {
    try {
        const page = await Page.findOne({ where: { name: pageName } });
        if (!page) return [];

        const users = await User.findAll({
            where: { 
                companyId: companyId,
                isActive: true 
            },
            include: [
                {
                    model: UserPermissions,
                    as: 'UserPermissions',
                    required: false,
                    include: [
                        {
                            model: Permissions,
                            as: 'Permission',
                            where: {
                                pageId: page.id,
                                name: { [Op.in]: permissions }
                            },
                            required: false
                        }
                    ]
                },
                {
                    model: Role,
                    as: 'Role',
                    required: false,
                    include: [
                        {
                            model: RolePermissions,
                            as: 'RolePermissions',
                            required: false,
                            include: [
                                {
                                    model: Permissions,
                                    as: 'Permission',
                                    where: {
                                        pageId: page.id,
                                        name: { [Op.in]: permissions }
                                    },
                                    required: false
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        return users.filter(user => {
            // Check direct user permissions
            const hasUserPermission = user.UserPermissions?.some(up => 
                up.Permission && permissions.includes(up.Permission.name)
            );
            
            // Check role-based permissions
            const hasRolePermission = user.Role?.RolePermissions?.some(rp => 
                rp.Permission && permissions.includes(rp.Permission.name)
            );
            
            return hasUserPermission || hasRolePermission;
        });
    } catch (error) {
        console.error('Error getting users by permission:', error);
        return [];
    }
};

// Collect users who should receive payroll notifications
const getPayrollNotificationUsers = async (companyId) => {
    try {
        // Get users with payroll permissions (managers, admins, HR)
        const payrollUsers = await getUsersByPermission('payroll', companyId, ['read', 'write', 'admin']);
        
        // Also get users with admin permissions on reports page (for payroll reports)
        const reportUsers = await getUsersByPermission('reports', companyId, ['write', 'admin']);
        
        // Combine and deduplicate users
        const allUsers = [...payrollUsers, ...reportUsers];
        const uniqueUsers = allUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
        );
        
        return uniqueUsers;
    } catch (error) {
        console.error('Error getting payroll notification users:', error);
        return [];
    }
};

const get = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll ID is required'
            });
        }

        const payroll = await Payroll.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: User,
                    as: 'ApprovedBy',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'ProcessedBy',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                },
                {
                    model: PayrollItem,
                    as: 'PayrollItems',
                    required: false,
                    where: { isActive: true },
                    include: [{
                        model: User,
                        as: 'Employee',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    }]
                }
            ]
        });

        if (!payroll) {
            return res.status(404).json({
                err: true,
                msg: 'Payroll not found'
            });
        }

        res.json({
            err: false,
            msg: 'Payroll successfully retrieved',
            payroll
        });

    } catch (error) {
        console.error('Error getting payroll:', error);
        res.status(500).json({
            err: true,
            msg: 'Error getting payroll',
            error: error.message
        });
    }
};
const getUserPayRate = async (userId, effectiveDate = new Date()) => {
    try {
        const payRate = await UserPayRate.findOne({
            where: {
                userId,
                isActive: true,
                effectiveDate: {
                    [Op.lte]: effectiveDate
                },
                [Op.or]: [
                    { endDate: null },
                    { endDate: { [Op.gte]: effectiveDate } }
                ]
            },
            order: [['effectiveDate', 'DESC']]
        });

        return payRate;
    } catch (error) {
        console.error('Error getting user pay rate:', error);
        throw error;
    }
};
const getUserPayStub = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll Item ID is required'
            });
        }

        const payStub = await getCompletePayStubData(id);
        
        res.status(200).json({
            err: false,
            msg: 'User pay stub successfully retrieved',
            payStub
        });
    } catch (error) {
        console.error('Error getting user pay stub:', error);
        res.status(500).json({
            err: true,
            msg: 'Error getting user pay stub',
            error: error.message
        });
    }
};
const getUserHoursFromCheckIns = async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.body;

        if (!userId || !startDate || !endDate) {
            return res.status(400).json({
                err: true,
                msg: 'User ID, start date, and end date are required'
            });
        }

        const hoursData = await calculateHoursFromCheckIns(userId, startDate, endDate);

        res.json({
            err: false,
            msg: 'User hours successfully calculated from check-ins',
            hours: hoursData
        });
    } catch (error) {
        console.error('Error generating user hours from check-ins:', error);
        res.status(500).json({
            err: true,
            msg: 'Error generating user hours from check-ins',
            error: error.message
        });
    }
};
const create = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            notes,
            calculateHours
        } = req.body;
        const userId = req.userId;
        if (!startDate || !endDate) {
            return res.status(400).json({
                err: true,
                msg: 'Start date and end date are required'
            });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start >= end) {
            return res.status(400).json({
                err: true,
                msg: 'Start date must be before end date'
            });
        }

        // Check for overlapping payroll periods
        const existingPayroll = await Payroll.findOne({
            where: {
                [Op.or]: [
                    {
                        startDate: { [Op.between]: [start, end] }
                    },
                    {
                        endDate: { [Op.between]: [start, end] }
                    },
                    {
                        [Op.and]: [
                            { startDate: { [Op.lte]: start } },
                            { endDate: { [Op.gte]: end } }
                        ]
                    }
                ],
                isActive: true
            }
        });

        if (existingPayroll) {
            return res.status(400).json({
                err: true,
                msg: 'A payroll already exists for this period',
                existingPayroll
            });
        }

        // Create the payroll
        const payroll = await Payroll.create({
            payrollNumber: `PR-${Date.now()}`,
            startDate: start,
            endDate: end,
            status: 'draft',
            totalGrossPay: 0.00,
            totalDeductions: 0.00,
            totalNetPay: 0.00,
            notes,
            creatorId: req.user?.id
        }, { userId });

        // If auto-calculate is enabled, create payroll items for all active users
        if (calculateHours) {
            await generatePayrollItems(payroll.id, start, end, req.user?.id);
        }

        // Reload with associations
        const createdPayroll = await Payroll.findByPk(payroll.id, {
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: User,
                    as: 'ApprovedBy',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'ProcessedBy',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                },
                {
                    model: PayrollItem,
                    as: 'PayrollItems',
                    required: false,
                    include: [{
                        model: User,
                        as: 'Employee',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    }]
                }
            ]
        });

        res.json({
            err: false,
            msg: 'Payroll created successfully',
            payroll: createdPayroll
        });

    } catch (error) {
        console.error('Error creating payroll:', error);
        res.status(500).json({
            err: true,
            msg: 'Error creating payroll',
            error: error.message
        });
    }
};
const list = async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 100;
    const offset = (page - 1) * limit;
    const includeInactive = req.body.includeInactive || false;
    const status = req.body.status;

    try {
        const whereClause = {
            ...(includeInactive ? {} : { isActive: true })
        };

        // Filter by status
        if (status) {
            whereClause.status = status;
        }
        // For now, we'll use Sequelize since payrolls might not have MeiliSearch setup
        // This can be enhanced later with search functionality if needed
        const payrolls = await Payroll.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: User,
                    as: 'ApprovedBy',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'ProcessedBy',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                },
                {
                    model: PayrollItem,
                    as: 'PayrollItems',
                    required: false,
                    include: [{
                        model: User,
                        as: 'Employee',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        return res.status(201).json({
            err: false,
            msg: 'Payrolls successfully retrieved',
            total: payrolls.count,
            pages: Math.ceil(payrolls.count / limit),
            payrolls: payrolls
        });
    } catch (err) {
        res.json({
            err: true,
            msg: err.message
        });
    }
};
const listDeductions = async (req, res) => {
    try {
        const employeeId = req.body.employeeId;

        // get all active deductions for the employee and company-wide deductions
        const deductions = await PayrollDeduction.findAll({
            where: {
                [Op.or]: [
                    { employeeId: employeeId },
                    { appliesTo: 'employer' },
                    { appliesTo: 'both' }
                ],
                isActive: true
            },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            err: false,
            msg: 'Payroll deductions successfully retrieved',
            deductions
        });
    } catch (error) {
        console.error('Error getting payroll deductions:', error);
        res.status(500).json({
            err: true,
            msg: 'Error getting payroll deductions',
            error: error.message
        });
    }
};
const listCheckInsForPeriod = async (req, res) => {
    try {
        const {
            startDate,
            endDate
        } = req.body;
        if (!startDate || !endDate) {
            return res.status(400).json({
                err: true,
                msg: 'Start date and end date are required'
            });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            return res.status(400).json({
                err: true,
                msg: 'Start date must be before end date'
            });
        }
        // Get event check-ins for the period
        const eventCheckIns = await EventCheckin.findAll({
            where: {
                checkInTime: {
                    [Op.between]: [start, end]
                },
            }
        });

        const userCheckIns = await UserCheckIn.findAll({
            where: {
                checkInTime: {
                    [Op.between]: [start, end]
                },
            }
        });

        res.json({
            err: false,
            msg: 'Check-ins successfully retrieved for period',
            eventCheckIns,
            userCheckIns
        });

    } catch (error) {
        console.error('Error getting check-ins for period:', error);
        res.status(500).json({
            err: true,
            msg: 'Error getting check-ins for period',
            error: error.message
        });
    }
};
const listUserCheckInsForPeriod = async (req, res) => {
    try {
        const {
            userId,
            startDate,
            endDate
        } = req.body;

        if (!userId || !startDate || !endDate) {
            return res.status(400).json({
                err: true,
                msg: 'User ID, start date, and end date are required'
            });
        }

        const hoursData = await calculateHoursFromCheckIns(userId, startDate, endDate);

        res.json({
            err: false,
            msg: 'User check-ins successfully retrieved for period',
            checkIns: {
                eventCheckIns: hoursData.eventCheckIns,
                userCheckIns: hoursData.userCheckIns
            },
            summary: {
                totalHours: hoursData.totalHours,
                regularHours: hoursData.regularHours,
                overtimeHours: hoursData.overtimeHours
            }
        });

    } catch (error) {
        console.error('Error getting check-ins for period:', error);
        res.status(500).json({
            err: true,
            msg: 'Error getting check-ins for period',
            error: error.message
        });
    }
};
const listPayStubsForPayroll = async (req, res) => {
    try {
        const { payrollId } = req.body;
        if (!payrollId) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll ID is required'
            });
        }
        const payrollItems = await PayrollItem.findAll({
            where: {
                payrollId,
                isActive: true
            }
        });
        if (!payrollItems || payrollItems.length === 0) {
            return res.status(404).json({
                err: true,
                msg: 'No payroll items found for this payroll'
            });
        }
        const company = await Company.findByPk(res.companyId);
        if (!company) {
            return res.status(404).json({
                err: true,
                msg: 'Company not found'
            });
        }
        const payStubs = payrollItems.map(item => ({
            id: item.id,
            employeeId: item.employeeId,
            regularHours: item.regularHours,
            overtimeHours: item.overtimeHours,
            totalHours: item.totalHours,
            rate: item.rate,
            overtimeRate: item.overtimeRate,
            grossPay: item.grossPay,
            deductions: item.deductions,
            netPay: item.netPay,
            paymentMethod: item.paymentMethod,
            notes: item.notes,
            company
        }));
        res.status(200).json({
            err: false,
            msg: 'Payroll items successfully retrieved for payroll',
            payStubs
        });
    } catch (error) {
        console.error('Error getting payroll items for payroll:', error);
        res.status(500).json({
            err: true,
            msg: 'Error getting payroll items for payroll',
            error: error.message
        });
    }
};
const update = async (req, res) => {
    try {
        const {
            id,
            startDate,
            endDate,
            status,
            notes,
            approvedBy
        } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll ID is required'
            });
        }

        const payroll = await Payroll.findByPk(id);

        if (!payroll) {
            return res.status(404).json({
                err: true,
                msg: 'Payroll not found'
            });
        }

        // Prepare update data
        const updateData = {};
        if (startDate) updateData.startDate = new Date(startDate);
        if (endDate) updateData.endDate = new Date(endDate);
        if (status) {
            updateData.status = status;
            // If status is being set to 'paid', record who processed it and when
            if (status === 'paid') {
                updateData.processedBy = req.userId;
                updateData.processedDate = new Date();
            }
        }
        if (notes !== undefined) updateData.notes = notes;
        if (approvedBy) {
            updateData.approvedBy = approvedBy;
            updateData.approvedAt = new Date();
        }

        // Update the payroll
        await payroll.update(updateData);

        // Reload with associations
        const updatedPayroll = await Payroll.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: User,
                    as: 'ApprovedBy',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'ProcessedBy',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    required: false
                },
                {
                    model: PayrollItem,
                    as: 'PayrollItems',
                    required: false,
                    include: [{
                        model: User,
                        as: 'Employee',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    }]
                }
            ]
        });

        res.json({
            err: false,
            msg: 'Payroll updated successfully',
            payroll: updatedPayroll
        });

    } catch (error) {
        console.error('Error updating payroll:', error);
        res.status(500).json({
            err: true,
            msg: 'Error updating payroll',
            error: error.message
        });
    }
};
const updatePayrollItem = async (req, res) => {
    try {
        const {
            id,
            regularHours,
            overtimeHours,
            rate,
            overtimeRate,
            deductions,
            paymentMethod,
            notes,
            grossPay,
            netPay,
            deductionsTotal
        } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll item ID is required'
            });
        }

        const payrollItem = await PayrollItem.findByPk(id);

        if (!payrollItem) {
            return res.status(404).json({
                err: true,
                msg: 'Payroll item not found'
            });
        }

        // Prepare update data
        const updateData = {};
        if (regularHours !== undefined) updateData.regularHours = regularHours;
        if (overtimeHours !== undefined) updateData.overtimeHours = overtimeHours;
        if (rate !== undefined) updateData.rate = rate;
        if (overtimeRate !== undefined) updateData.overtimeRate = overtimeRate;
        if (paymentMethod) updateData.paymentMethod = paymentMethod;
        if (notes !== undefined) updateData.notes = notes;

        // Always calculate totalHours as regularHours + overtimeHours
        const newRegularHours = regularHours !== undefined ? parseFloat(regularHours) : parseFloat(payrollItem.regularHours || 0);
        const newOvertimeHours = overtimeHours !== undefined ? parseFloat(overtimeHours) : parseFloat(payrollItem.overtimeHours || 0);
        updateData.totalHours = newRegularHours + newOvertimeHours;

        // Handle deductions and pay calculations
        let calculatedGrossPay, calculatedDeductions, calculatedNetPay;
        
        if (grossPay !== undefined && netPay !== undefined) {
            // Use provided values
            calculatedGrossPay = parseFloat(grossPay);
            calculatedNetPay = parseFloat(netPay);
            calculatedDeductions = deductionsTotal !== undefined ? parseFloat(deductionsTotal) : calculatedGrossPay - calculatedNetPay;
            
            updateData.grossPay = calculatedGrossPay;
            updateData.netPay = calculatedNetPay;
            updateData.deductions = calculatedDeductions;
            
        } else {
            // Recalculate pay if hours or rates changed
            if (regularHours !== undefined || overtimeHours !== undefined || 
                rate !== undefined || overtimeRate !== undefined) {
                
                const newRate = rate !== undefined ? rate : payrollItem.rate;
                const newOvertimeRate = overtimeRate !== undefined ? overtimeRate : payrollItem.overtimeRate;

                const regularPay = newRegularHours * parseFloat(newRate);
                const overtimePay = newOvertimeHours * parseFloat(newOvertimeRate);
                calculatedGrossPay = regularPay + overtimePay;

                // Handle deductions
                if (Array.isArray(deductions)) {
                    calculatedDeductions = deductions.reduce((total, deduction) => total + parseFloat(deduction.value || 0), 0);
                } else if (deductions !== undefined) {
                    calculatedDeductions = parseFloat(deductions);
                } else {
                    calculatedDeductions = parseFloat(payrollItem.deductions || 0);
                }

                calculatedNetPay = calculatedGrossPay - calculatedDeductions;

                updateData.grossPay = calculatedGrossPay;
                updateData.deductions = calculatedDeductions;
                updateData.netPay = calculatedNetPay;
            } else if (Array.isArray(deductions)) {
                // Only deductions changed, recalculate net pay
                calculatedDeductions = deductions.reduce((total, deduction) => total + parseFloat(deduction.value || 0), 0);
                calculatedGrossPay = parseFloat(payrollItem.grossPay || 0);
                calculatedNetPay = calculatedGrossPay - calculatedDeductions;
                
                updateData.deductions = calculatedDeductions;
                updateData.netPay = calculatedNetPay;
            } else if (deductions !== undefined) {
                // Single deduction value provided
                calculatedDeductions = parseFloat(deductions);
                calculatedGrossPay = parseFloat(payrollItem.grossPay || 0);
                calculatedNetPay = calculatedGrossPay - calculatedDeductions;
                
                updateData.deductions = calculatedDeductions;
                updateData.netPay = calculatedNetPay;
            }
        }

        // Update the payroll item
        await payrollItem.update(updateData);

        const payroll = await Payroll.findByPk(payrollItem.payrollId);
        if (payroll) {
            const payrollItems = await PayrollItem.findAll({
                where: {
                    payrollId: payroll.id,
                    isActive: true
                }
            });

            const totalGrossPay = payrollItems.reduce((sum, item) => sum + parseFloat(item.grossPay || 0), 0);
            const totalDeductions = payrollItems.reduce((sum, item) => sum + parseFloat(item.deductions || 0), 0);
            const totalNetPay = payrollItems.reduce((sum, item) => sum + parseFloat(item.netPay || 0), 0);

            await payroll.update({
                totalGrossPay,
                totalDeductions,
                totalNetPay
            });
        }

        // Reload with associations
        const updatedItem = await PayrollItem.findByPk(id, {
            include: [{
                model: User,
                as: 'Employee',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }]
        });

        res.json({
            err: false,
            msg: 'Payroll item updated successfully',
            payrollItem: updatedItem
        });

    } catch (error) {
        console.error('Error updating payroll item:', error);
        res.status(500).json({
            err: true,
            msg: 'Error updating payroll item',
            error: error.message
        });
    }
};
const updatePayrollDeduction = async (req, res) => {
    try {
        const {
            id,
            name,
            type,
            amount,
            appliesTo,
            employeeId,
            notes,
            effectiveDate,
            endDate,
            frequency
        } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll deduction ID is required'
            });
        }
        const deduction = await PayrollDeduction.findByPk(id);

        if (!deduction) {
            return res.status(404).json({
                err: true,
                msg: 'Payroll deduction not found'
            });
        }
        
        // Prepare update data
        const updateData = {};
        if (name) updateData.name = name;
        if (type) updateData.type = type;
        if (amount !== undefined) updateData.amount = parseFloat(amount);
        if (appliesTo) updateData.appliesTo = appliesTo;
        if (appliesTo === 'employee') {
            if (!employeeId) {
                return res.status(400).json({
                    err: true,
                    msg: 'Employee ID is required when appliesTo is "employee"'
                });
            }
            updateData.employeeId = employeeId;
        } else {
            updateData.employeeId = null; // Clear employeeId for non-employee-specific deductions
        }
        if (notes !== undefined) updateData.notes = notes;
        if (frequency) updateData.frequency = frequency;
        if (effectiveDate) updateData.effectiveDate = new Date(effectiveDate);
        if (endDate) updateData.endDate = new Date(endDate);
        
        // Update the deduction
        await deduction.update(updateData);

        res.status(200).json({
            err: false,
            msg: 'Payroll deduction updated successfully',
            data: deduction
        });
    } catch (error) {
        console.error('Error updating payroll deduction:', error);
        res.status(500).json({
            err: true,
            msg: 'Error updating payroll deduction',
            error: error.message
        });
    }
};
const archive = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll ID is required'
            });
        }

        const payroll = await Payroll.findByPk(id);

        if (!payroll) {
            return res.status(404).json({
                err: true,
                msg: 'Payroll not found'
            });
        }

        await payroll.update({ isActive: false });

        res.json({
            err: false,
            msg: 'Payroll archived successfully'
        });

    } catch (error) {
        console.error('Error archiving payroll:', error);
        res.status(500).json({
            err: true,
            msg: 'Error archiving payroll',
            error: error.message
        });
    }
};
const addPayrollItem = async (req, res) => {
    try {
        const {
            payrollId,
            employeeId,
            regularHours,
            overtimeHours,
            rate,
            overtimeRate,
            paymentMethod,
            notes,
            autoCalculateFromCheckIns = false,
            deductions = [],
            grossPay,
            netPay,
            deductionsTotal
        } = req.body;
        const userId = req.userId;

        if (!payrollId || !employeeId) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll ID and Employee ID are required'
            });
        }

        // Check if payroll exists
        const payroll = await Payroll.findByPk(payrollId);
        if (!payroll) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll not found'
            });
        }

        // Check if employee exists
        const employee = await User.findByPk(employeeId);
        if (!employee) {
            return res.status(400).json({
                err: true,
                msg: 'Employee not found'
            });
        }

        // Check if payroll item already exists for this employee
        const existingItem = await PayrollItem.findOne({
            where: {
                payrollId,
                employeeId,
                isActive: true
            }
        });

        if (existingItem) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll item already exists for this employee in this payroll'
            });
        }

        let itemData = {
            payrollId,
            employeeId,
            paymentMethod,
            notes,
            creatorId: req.user?.id
        };

        if (autoCalculateFromCheckIns) {
            // Calculate hours from check-ins
            const hoursData = await calculateHoursFromCheckIns(employeeId, payroll.startDate, payroll.endDate);
            
            // Get current pay rate
            const payRate = await getUserPayRate(employeeId, payroll.endDate);
            
            if (!payRate) {
                return res.status(400).json({
                    err: true,
                    msg: 'No pay rate found for this employee'
                });
            }

            itemData = {
                ...itemData,
                totalHours: hoursData.totalHours,
                regularHours: hoursData.regularHours,
                overtimeHours: hoursData.overtimeHours,
                rate: payRate.rate,
                overtimeRate: payRate.overtimeRate || parseFloat(payRate.rate) * 1.5
            };
        } else {
            // Use provided values and always calculate totalHours
            const parsedRegularHours = parseFloat(regularHours || 0);
            const parsedOvertimeHours = parseFloat(overtimeHours || 0);
            
            itemData = {
                ...itemData,
                totalHours: parsedRegularHours + parsedOvertimeHours,
                regularHours: parsedRegularHours,
                overtimeHours: parsedOvertimeHours,
                rate: rate || 0,
                overtimeRate: overtimeRate || 0
            };
        }

        // Calculate or use provided pay values
        let calculatedGrossPay, calculatedDeductions, calculatedNetPay;
        
        if (grossPay !== undefined && netPay !== undefined) {
            // Use provided values
            calculatedGrossPay = parseFloat(grossPay);
            calculatedNetPay = parseFloat(netPay);
            calculatedDeductions = deductionsTotal !== undefined ? parseFloat(deductionsTotal) : calculatedGrossPay - calculatedNetPay;
        } else {
            // Calculate from hours and rates
            const regularPay = parseFloat(itemData.regularHours) * parseFloat(itemData.rate);
            const overtimePay = parseFloat(itemData.overtimeHours) * parseFloat(itemData.overtimeRate);
            calculatedGrossPay = regularPay + overtimePay;
            
            // Calculate deductions total from deductions array
            calculatedDeductions = Array.isArray(deductions) ? 
                deductions.reduce((total, deduction) => total + parseFloat(deduction.value || 0), 0) : 0;
            
            calculatedNetPay = calculatedGrossPay - calculatedDeductions;
        }

        itemData.grossPay = calculatedGrossPay;
        itemData.deductions = calculatedDeductions;
        itemData.netPay = calculatedNetPay;
        itemData.isActive = true;
        itemData.creatorId = userId;

        // Create payroll item
        const payrollItem = await PayrollItem.create(itemData);

        // Update the payroll totals from the items
        const payrollItems = await PayrollItem.findAll({
            where: {
                payrollId,
                isActive: true
            }
        });
        const totalGrossPay = payrollItems.reduce((sum, item) => sum + parseFloat(item.grossPay || 0), 0);
        const totalDeductions = payrollItems.reduce((sum, item) => sum + parseFloat(item.deductions || 0), 0);
        const totalNetPay = payrollItems.reduce((sum, item) => sum + parseFloat(item.netPay || 0), 0);

        await payroll.update({
            totalGrossPay,
            totalDeductions,
            totalNetPay
        });
    
        // Reload with associations
        const createdItem = await PayrollItem.findByPk(payrollItem.id, {
            include: [{
                model: User,
                as: 'Employee',
                attributes: ['id', 'firstName', 'lastName', 'email']
            }]
        });

        res.json({
            err: false,
            msg: 'Payroll item added successfully',
            payrollItem: createdItem
        });

    } catch (error) {
        console.error('Error adding payroll item:', error);
        res.status(500).json({
            err: true,
            msg: 'Error adding payroll item',
            error: error.message
        });
    }
};
const addPayrollDeduction = async (req, res) => {
    try {
        const {
            name,
            type,
            amount,
            appliesTo = 'employee',
            employeeId,
            notes,
            effectiveDate,
            endDate,
            frequency = 'per_payroll'
        } = req.body;

        if (!name || !type || !amount || !effectiveDate) {
            return res.status(400).json({
                err: true,
                msg: 'Missing required fields: name, type, amount, and effectiveDate are required'
            });
        }
        
        if (appliesTo === 'employee' && !employeeId) {
            return res.status(400).json({
                err: true,
                msg: 'Employee ID is required when appliesTo is "employee"'
            });
        }

        const payrollDeduction = await PayrollDeduction.create({
            name,
            type,
            amount: parseFloat(amount),
            appliesTo,
            employeeId,
            notes,
            effectiveDate: new Date(effectiveDate),
            endDate: endDate ? new Date(endDate) : null,
            frequency,
            isActive: true,
            creatorId: req.user?.id
        });

        res.json({
            err: false,
            msg: 'Payroll deduction added successfully',
            data: payrollDeduction
        });

    } catch (error) {
        console.error('Error adding payroll deduction:', error);
        res.status(500).json({
            err: true,
            msg: 'Error adding payroll deduction',
            error: error.message
        });
    }
};
const removePayrollItem = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll item ID is required'
            });
        }

        const payrollItem = await PayrollItem.findByPk(id);

        if (!payrollItem) {
            return res.status(404).json({
                err: true,
                msg: 'Payroll item not found'
            });
        }

        // Soft delete by setting isActive to false
        await payrollItem.update({ isActive: false });

        // Update the payroll totals from the items
        const payroll = await Payroll.findByPk(payrollItem.payrollId);
        if (payroll) {
            const payrollItems = await PayrollItem.findAll({
                where: {
                    payrollId: payroll.id,
                    isActive: true
                }
            });
            const totalGrossPay = payrollItems.reduce((sum, item) => sum + parseFloat(item.grossPay || 0), 0);
            const totalDeductions = payrollItems.reduce((sum, item) => sum + parseFloat(item.deductions || 0), 0);
            const totalNetPay = payrollItems.reduce((sum, item) => sum + parseFloat(item.netPay || 0), 0);
            await payroll.update({
                totalGrossPay,
                totalDeductions,
                totalNetPay
            });
        }
        res.json({
            err: false,
            msg: 'Payroll item deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting payroll item:', error);
        res.status(500).json({
            err: true,
            msg: 'Error deleting payroll item',
            error: error.message
        });
    }
};
const removePayrollDeduction = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll deduction ID is required'
            });
        }
        const payrollDeduction = await PayrollDeduction.findByPk(id);
        if (!payrollDeduction) {
            return res.status(404).json({
                err: true,
                msg: 'Payroll deduction not found'
            });
        }
        // Soft delete by setting isActive to false
        await payrollDeduction.update({ isActive: false });
        res.json({
            err: false,
            msg: 'Payroll deduction deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting payroll deduction:', error);
        res.status(500).json({
            err: true,
            msg: 'Error deleting payroll deduction',
            error: error.message
        });
    }
};
const approvePayroll = async (req, res) => {
    try {
        const { id, processDate } = req.body;
        const userId = req.userId;
        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll ID is required'
            });
        }
        const payroll = await Payroll.findByPk(id);
        if (!payroll) {
            return res.status(404).json({
                err: true,
                msg: 'Payroll not found'
            });
        }
        // check if processDate is provided and is a valid date and if it is in the future
        if (processDate) {
            const parsedDate = new Date(processDate);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    err: true,
                    msg: 'Invalid process date'
                });
            };
            if (parsedDate < new Date()) {
                return res.status(400).json({
                    err: true,
                    msg: 'Process date cannot be in the past'
                });
            }
        }
        await payroll.update({ status: 'approved', processDate, approvedBy: userId, approvedAt: new Date() }, { userId });

        // Create notifications for payroll approval
        try {
            const usersToNotify = await getPayrollNotificationUsers(res.companyId);
            const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
            const approver = await User.findByPk(userId);
            
            const processDateStr = processDate ? ` (Scheduled: ${new Date(processDate).toLocaleDateString()})` : '';
            const message = `Payroll #${id} has been approved by ${approver ? approver.firstName + ' ' + approver.lastName : 'Administrator'}${processDateStr}`;
            
            for (const user of usersToNotify) {
                if (user.id !== userId) { // Don't notify the person who approved it
                    await createNotification({
                        body: {
                            userId: userId,
                            targetUserId: user.id,
                            relatedModel: 'payrolls',
                            relatedModelId: id,
                            priorityId: priority.id,
                            title: 'Payroll Approved',
                            message: message,
                            type: 'general'
                        }
                    });
                }
            }
        } catch (notificationError) {
            console.error('Error creating payroll approval notifications:', notificationError);
        }

        // Get payroll items with all necessary associations
        const payrollItems = await PayrollItem.findAll({
            where: {
                payrollId: id,
                isActive: true
            },
            include: [
                {
                    model: Payroll,
                    as: 'Payroll',
                    include: [
                        {
                            model: User,
                            as: 'Creator',
                            attributes: ['id', 'firstName', 'lastName', 'email']
                        },
                        {
                            model: User,
                            as: 'ApprovedBy',
                            attributes: ['id', 'firstName', 'lastName', 'email'],
                            required: false
                        },
                        {
                            model: User,
                            as: 'ProcessedBy',
                            attributes: ['id', 'firstName', 'lastName', 'email'],
                            required: false
                        }
                    ]
                },
                {
                    model: User,
                    as: 'Employee',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
                    include: [
                        {
                            model: UserCredentials,
                            as: 'Credentials',
                        }
                    ]
                }
            ]
        });

        if (!payrollItems || payrollItems.length === 0) {
            return res.status(400).json({
                err: true,
                msg: 'No payroll items found for this payroll'
            });
        }

        // Get company information
        const company = await Company.findByPk(res.companyId);
        if (!company) {
            return res.status(400).json({
                err: true,
                msg: 'Company not found'
            });
        }

        // Read the paystub template
        const templatePath = path.join(__dirname, '../public/partials/templates/payroll/paystub.html');
        const template = fs.readFileSync(templatePath, 'utf8');

        // Generate PDFs for each employee
        const pdfResults = [];
        
        for (const payrollItem of payrollItems) {
            try {
                // Get complete paystub data using the helper function
                const payStubData = await getCompletePayStubData(payrollItem.id);

                // Generate PDF filename
                const pdfFilename = `paystub-${payStubData.PayrollItem.employeeId}-${Date.now()}.pdf`;
                
                // Generate PDF
                const pdfPath = await generatePaystubPdf(template, payStubData, company, pdfFilename);
                
                // Upload to Cloudinary
                const uploadResult = await uploadPayrollPdfToCloudinary(pdfPath, id, payStubData.PayrollItem.employeeId);
                
                // Update the payroll item with the PDF URL
                await payStubData.PayrollItem.update({ payStubUrl: uploadResult.url }, { userId });
                
                // Send notification email to employee
                const emailResult = await sendPaystubEmail(payStubData.PayrollItem, company, uploadResult.url);

                await createNotification(payStubData.PayrollItem.employeeId, 'paystub_ready', { pdfUrl: uploadResult.url });
                
                pdfResults.push({
                    employeeId: payStubData.PayrollItem.employeeId,
                    employeeName: `${payStubData.Employee.firstName} ${payStubData.Employee.lastName}`,
                    pdfUrl: uploadResult.url,
                    publicId: uploadResult.publicId,
                    emailSent: emailResult.success
                });
                
            } catch (pdfError) {
                console.error(`Error generating PDF for employee ${payrollItem.employeeId}:`, pdfError);
                pdfResults.push({
                    employeeId: payrollItem.employeeId,
                    employeeName: `${payrollItem.Employee.firstName} ${payrollItem.Employee.lastName}`,
                    error: pdfError.message,
                    emailSent: false
                });
            }
        }

        res.json({
            err: false,
            msg: 'Payroll approved successfully',
            pdfResults: pdfResults
        });
    } catch (error) {
        console.error('Error approving payroll:', error);
        res.status(500).json({
            err: true,
            msg: 'Error approving payroll',
            error: error.message
        });
    }
};
const processPayroll = async (req, res) => {
    try {
        const { id } = req.body;
        const userId = req.userId;
        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll ID is required'
            });
        }
        const payroll = await Payroll.findByPk(id);
        if (!payroll) {
            return res.status(404).json({
                err: true,
                msg: 'Payroll not found'
            });
        }
        if (payroll.status !== 'approved') {
            return res.status(400).json({
                err: true,
                msg: 'Payroll is not approved'
            });
        }
        // Get payroll items with all necessary associations
        const payrollItems = await PayrollItem.findAll({
            where: {
                payrollId: id,
                isActive: true
            },
            include: [
                {
                    model: User,
                    as: 'Employee',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: Payroll,
                    as: 'Payroll'
                }
            ]
        });
        if (!payrollItems || payrollItems.length === 0) {
            return res.status(400).json({
                err: true,
                msg: 'No payroll items found for this payroll'
            });
        }
        // Get company info for email
        const company = await Company.findByPk(res.companyId);
        // Notify each employee, send email, and collect paystub URLs
        const paystubResults = [];
        for (const item of payrollItems) {
            const employeeId = item.employeeId;
            const payStubUrl = item.payStubUrl || null;
            const paystubId = item.id;
            const link = `/users/user/${employeeId}/pay-stub/${paystubId}`;
            // Send notification using the correct signature
            await createNotification({
                body: {
                    userId: userId, // The user who triggered the payroll process
                    targetUserId: employeeId, // The employee to notify
                    relatedModel: 'PayrollItem',
                    relatedModelId: paystubId,
                    priorityId: 2, // Example: 2 = normal, adjust as needed
                    title: 'Payroll Processed',
                    type: 'general',
                    message: `Your payroll has been processed. View your pay stub.`
                }
            });
            // Send payroll processed email
            if (company && item.Employee && item.Employee.email) {
                await sendPayrollProcessedEmail(item, company, payStubUrl);
            }
            paystubResults.push({
                employeeId,
                employeeName: item.Employee ? `${item.Employee.firstName} ${item.Employee.lastName}` : undefined,
                payStubUrl,
                link
            });
        }
        await payroll.update({ status: 'paid', processedBy: userId, processedDate: new Date() }, { userId });

        // Create notifications for payroll processing completion
        try {
            const usersToNotify = await getPayrollNotificationUsers(res.companyId);
            const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
            const processor = await User.findByPk(userId);
            
            const message = `Payroll #${id} has been processed and completed by ${processor ? processor.firstName + ' ' + processor.lastName : 'Administrator'}. All employees have been notified.`;
            
            for (const user of usersToNotify) {
                if (user.id !== userId) { // Don't notify the person who processed it
                    await createNotification({
                        body: {
                            userId: userId,
                            targetUserId: user.id,
                            relatedModel: 'payrolls',
                            relatedModelId: id,
                            priorityId: priority.id,
                            title: 'Payroll Processed',
                            message: message,
                            type: 'general'
                        }
                    });
                }
            }
        } catch (notificationError) {
            console.error('Error creating payroll processing notifications:', notificationError);
        }
        res.json({
            err: false,
            msg: 'Payroll processed successfully',
            paystubs: paystubResults
        });
    } catch (error) {
        console.error('Error processing payroll:', error);
        res.status(500).json({
            err: true,
            msg: 'Error processing payroll',
            error: error.message
        });
    }
};
const revertPayrollApproval = async (req, res) => {
    try {
        const { id } = req.body;
        const userId = req.userId;
        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll ID is required'
            });
        }
        const payroll = await Payroll.findByPk(id);
        if (!payroll) {
            return res.status(404).json({
                err: true,
                msg: 'Payroll not found'
            });
        }
        if (payroll.status !== 'approved') {
            return res.status(400).json({
                err: true,
                msg: 'Payroll is not approved or has already been processed'
            });
        }
        await payroll.update({ status: 'draft', approvedBy: null, approvedAt: null }, { userId });

        // Create notifications for payroll approval reversion
        try {
            const usersToNotify = await getPayrollNotificationUsers(res.companyId);
            const priority = await Priority.findOne({ where: { name: 'medium' } }) || { id: 2 };
            const reverter = await User.findByPk(userId);
            
            const message = `Payroll #${id} approval has been reverted by ${reverter ? reverter.firstName + ' ' + reverter.lastName : 'Administrator'}. Status changed back to draft.`;
            
            for (const user of usersToNotify) {
                if (user.id !== userId) { // Don't notify the person who reverted it
                    await createNotification({
                        body: {
                            userId: userId,
                            targetUserId: user.id,
                            relatedModel: 'payrolls',
                            relatedModelId: id,
                            priorityId: priority.id,
                            title: 'Payroll Approval Reverted',
                            message: message,
                            type: 'general'
                        }
                    });
                }
            }
        } catch (notificationError) {
            console.error('Error creating payroll reversion notifications:', notificationError);
        }
        res.json({
            err: false,
            msg: 'Payroll approval reverted successfully'
        });
    } catch (error) {
        console.error('Error reverting payroll approval:', error);
        res.status(500).json({
            err: true,
            msg: 'Error reverting payroll approval',
            error: error.message
        });
    }
};
const generatePayrollItems = async (payrollId, startDate, endDate, creatorId) => {
    try {
        // Get all active users
        const users = await User.findAll({
            where: {
                isActive: true
            },
            include: [{
                model: UserPayRate,
                as: 'PayRates',
                where: {
                    isActive: true,
                    effectiveDate: {
                        [Op.lte]: endDate
                    },
                    [Op.or]: [
                        { endDate: null },
                        { endDate: { [Op.gte]: startDate } }
                    ]
                },
                required: false
            }]
        });

        const payrollItems = [];

        for (const user of users) {
            // Calculate hours from check-ins
            const hoursData = await calculateHoursFromCheckIns(user.id, startDate, endDate);
            
            // Skip users with no hours worked
            if (hoursData.totalHours === 0) {
                continue;
            }

            // Get current pay rate
            const payRate = await getUserPayRate(user.id, endDate);
            
            if (!payRate) {
                console.warn(`No pay rate found for user ${user.id} (${user.firstName} ${user.lastName})`);
                continue;
            }

            // Calculate pay
            const regularPay = hoursData.regularHours * parseFloat(payRate.rate);
            const overtimePay = hoursData.overtimeHours * parseFloat(payRate.overtimeRate || payRate.rate * 1.5);
            const grossPay = regularPay + overtimePay;

            // Create payroll item
            const payrollItem = {
                payrollId,
                employeeId: user.id,
                totalHours: hoursData.totalHours,
                regularHours: hoursData.regularHours,
                overtimeHours: hoursData.overtimeHours,
                rate: payRate.rate,
                overtimeRate: payRate.overtimeRate || parseFloat(payRate.rate) * 1.5,
                grossPay,
                deductions: 0, // Will be calculated separately
                netPay: grossPay, // Will be updated after deductions
                paymentMethod: 'direct_deposit', // Default
                creatorId
            };

            payrollItems.push(payrollItem);
        }

        // Bulk create payroll items
        if (payrollItems.length > 0) {
            await PayrollItem.bulkCreate(payrollItems);
        }

        return payrollItems;
    } catch (error) {
        console.error('Error auto-creating payroll items:', error);
        throw error;
    }
};
const calculateTotals = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Payroll ID is required'
            });
        }

        const payroll = await Payroll.findByPk(id, {
            include: [{
                model: PayrollItem,
                as: 'PayrollItems',
                where: { isActive: true },
                required: false
            }]
        });

        if (!payroll) {
            return res.status(404).json({
                err: true,
                msg: 'Payroll not found'
            });
        }

        // Calculate totals from payroll items
        let totalGrossPay = 0;
        let totalDeductions = 0;
        let totalNetPay = 0;

        for (const item of payroll.PayrollItems) {
            totalGrossPay += parseFloat(item.grossPay || 0);
            totalDeductions += parseFloat(item.deductions || 0);
            totalNetPay += parseFloat(item.netPay || 0);
        }

        // Update payroll totals
        await payroll.update({
            totalGrossPay: totalGrossPay.toFixed(2),
            totalDeductions: totalDeductions.toFixed(2),
            totalNetPay: totalNetPay.toFixed(2)
        });

        res.json({
            err: false,
            msg: 'Payroll totals calculated successfully',
            totals: {
                totalGrossPay,
                totalDeductions,
                totalNetPay
            }
        });

    } catch (error) {
        console.error('Error calculating payroll totals:', error);
        res.status(500).json({
            err: true,
            msg: 'Error calculating payroll totals',
            error: error.message
        });
    }
};
const calculateHoursFromCheckIns = async (userId, startDate, endDate) => {
    try {
        let totalHours = 0;
        let regularHours = 0;
        let overtimeHours = 0;

        // Get event check-ins for the period
        const eventCheckIns = await EventCheckin.findAll({
            where: {
                userId,
                checkInTime: {
                    [Op.between]: [startDate, endDate]
                },
                checkOutTime: {
                    [Op.not]: null
                }
            },
            include: [{
                model: Event,
                as: 'Event',
                attributes: ['title', 'startDate', 'endDate']
            }]
        });

        // Get user check-ins for the period
        const userCheckIns = await UserCheckIn.findAll({
            where: {
                userId,
                checkInTime: {
                    [Op.between]: [startDate, endDate]
                },
                checkOutTime: {
                    [Op.not]: null
                }
            }
        });

        // Calculate hours from event check-ins
        for (const checkIn of eventCheckIns) {
            const checkInTime = new Date(checkIn.checkInTime);
            const checkOutTime = new Date(checkIn.checkOutTime);
            const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert to hours
            totalHours += hoursWorked;
        }

        // Calculate hours from user check-ins
        for (const checkIn of userCheckIns) {
            const checkInTime = new Date(checkIn.checkInTime);
            const checkOutTime = new Date(checkIn.checkOutTime);
            const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert to hours
            totalHours += hoursWorked;
        }

        // Calculate overtime (assuming 40 hours is standard work week)
        regularHours = Math.min(totalHours, 40);
        overtimeHours = Math.max(0, totalHours - 40);

        return {
            totalHours: parseFloat(totalHours.toFixed(2)),
            regularHours: parseFloat(regularHours.toFixed(2)),
            overtimeHours: parseFloat(overtimeHours.toFixed(2)),
            eventCheckIns,
            userCheckIns
        };
    } catch (error) {
        console.error('Error calculating hours from check-ins:', error);
        throw error;
    }
};
const getCompletePayStubData = async (payrollItemId) => {
    const payrollItem = await PayrollItem.findOne({
        where: {
            id: payrollItemId,
            isActive: true
        },
        include: [
            {
                model: Payroll,
                as: 'Payroll',
                include: [
                    {
                        model: User,
                        as: 'Creator',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                    },
                    {
                        model: User,
                        as: 'ApprovedBy',
                        attributes: ['id', 'firstName', 'lastName', 'email'],
                        required: false
                    },
                    {
                        model: User,
                        as: 'ProcessedBy',
                        attributes: ['id', 'firstName', 'lastName', 'email'],
                        required: false
                    }
                ]
            },
            {
                model: User,
                as: 'Employee',
                attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
                include: [
                    {
                        model: UserCredentials,
                        as: 'Credentials',
                    },
                    {
                        model: UserPreference,
                        as: 'Preferences',
                        attributes: ['id', 'notifyByEmail', 'notifyByText']
                    }
                ]
            }
        ]
    });

    if (!payrollItem) {
        throw new Error('Payroll item not found');
    }

    const company = await Company.findByPk(res.companyId);
    if (!company) {
        throw new Error('Company not found');
    }

    // Get deductions that apply to this employee
    const deductions = await PayrollDeduction.findAll({
        where: {
            [Op.or]: [
                { 
                    appliesTo: 'employer' 
                },
                { 
                    appliesTo: 'both' 
                },
                { 
                    employeeId: payrollItem.employeeId,
                    appliesTo: 'employee'
                }
            ],
            isActive: true,
            effectiveDate: {
                [Op.lte]: payrollItem.Payroll.endDate
            },
            [Op.or]: [
                { endDate: null },
                { endDate: { [Op.gte]: payrollItem.Payroll.startDate } }
            ]
        },
        order: [['effectiveDate', 'DESC']]
    });

    return {
        id: payrollItem.id,
        Employee: payrollItem.Employee,
        Payroll: payrollItem.Payroll,
        PayrollItem: payrollItem,
        hours: payrollItem.hours,
        rate: payrollItem.rate,
        overtimeRate: payrollItem.overtimeRate,
        deductions: payrollItem.deductions,
        netPay: payrollItem.netPay,
        regularHours: payrollItem.regularHours,
        overtimeHours: payrollItem.overtimeHours,
        totalHours: payrollItem.totalHours,
        grossPay: payrollItem.grossPay,
        paymentMethod: payrollItem.paymentMethod,
        Company: company,
        PayrollDeductions: deductions
    };
};
const processPayrolls = async () => {
    try {
        const today = new Date();
        // Find all approved payrolls with processDate today or earlier and not yet processed
        const payrollsToProcess = await Payroll.findAll({
            where: {
                status: 'approved',
                processDate: {
                    [Op.lte]: today
                },
                isActive: true
            }
        });
        for (const payroll of payrollsToProcess) {
            // Here you would integrate with payment processing systems
            // For this example, we'll just mark them as processed
            await payroll.update({ status: 'processed', processedBy: null, processedAt: new Date() });
        }
    } catch (error) {
        console.error('Error processing payrolls:', error);
    }
};  

module.exports = {
    get,
    getUserPayRate,
    getUserHoursFromCheckIns,
    getUserPayStub,
    getCompletePayStubData,
    list,
    listDeductions,
    listCheckInsForPeriod,
    listUserCheckInsForPeriod,
    listPayStubsForPayroll,
    create,
    update,
    updatePayrollItem,
    updatePayrollDeduction,
    archive,
    addPayrollItem,
    addPayrollDeduction,
    removePayrollItem,
    removePayrollDeduction,
    approvePayroll,
    processPayroll,
    revertPayrollApproval,
    generatePayrollItems,
    calculateTotals,
    processPayrolls,
};
