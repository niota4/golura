const { 
    WorkOrder, 
    PurchaseOrder,
    Estimate, 
    EstimateLineItem, 
    LineItem, 
    LineItemItem, 
    WorkOrderLineItem, 
    Item, 
    User, 
    Client,
    Company,
    Event,
    Priority,
    Payment,
    Invoice,
    InvoiceLineItem,
    Vendor,
    VendorItem,
    PurchaseOrderItem,
    PurchaseOrderStatus,
    WorkOrderStatus,
    EventActivity,
    WorkOrderActivity
} = require('../models');
const { Op } = require('sequelize');
const { getWorkOrderNotificationUsers, sendNotificationsToUsers } = require('../helpers/notificationHelpers');
const { event } = require('jquery');

const get = async (req, res) => {
    try {
        const { id } = req.body;

        const workOrder = await WorkOrder.findOne({
            where: { id },
            include: [
                {
                    model: PurchaseOrder,
                    as: 'PurchaseOrders',
                    include: [
                        {
                            model: PurchaseOrderItem,
                            as: 'PurchaseOrderItems',
                        },
                    ],
                },
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: User,
                    as: 'AssignedUser',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: User,
                    as: 'Completer',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: WorkOrderStatus,
                    as: 'WorkOrderStatus',
                    attributes: ['id', 'name']
                },
                {
                    model: Priority,
                    as: 'Priority',
                    attributes: ['id', 'level']
                },
                { 
                    model: Estimate, 
                    as: 'Estimate' 
                },
                { 
                    model: Client, 
                    as: 'Client' 
                },
                { 
                    model: Event, 
                    as: 'Event' 
                },
                { 
                    model: WorkOrderLineItem, 
                    as: 'LineItems',
                    where: { isActive: true },
                    required: false,
                    include: [
                        { 
                            model: Item, 
                            as: 'Item'
                        }
                    ]
                }
            ]
        });

        if (!workOrder) {
            return res.status(404).json({ err: true, msg: 'Work Order not found' });
        }

        res.status(200).json({ err: false, msg: 'Work Order successfully retrieved', workOrder });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const getWorkOrderLineItem = async (req, res) => {
    try {
        const { id } = req.body;
        const workOrderLineItem = await WorkOrderLineItem.findOne({
            where: { id },
            include: [{ model: Item, as: 'Item' }]
        });

        if (!workOrderLineItem) {
            return res.status(404).json({ err: true, msg: 'Work Order Item not found' });
        }

        res.status(200).json({ err: false, msg: 'Work Order Item successfully retrieved', workOrderLineItem });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const getPurchaseOrder = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Purchase Order ID is required',
            });
        }

        // Fetch the purchase order with all relationships
        const purchaseOrder = await PurchaseOrder.findOne({
            where: { id },
            include: [
                {
                    model: PurchaseOrderItem,
                    as: 'PurchaseOrderItems',
                    where: { isActive: true }, // Only include active items
                    required: false, // Ensure it doesn't filter out PurchaseOrders with no active items
                    include: [
                        {
                            model: WorkOrderLineItem,
                            as: 'WorkOrderLineItem',
                        },
                        {
                            model: Item,
                            as: 'Item',
                        },
                    ],
                },
                {
                    model: WorkOrder,
                    as: 'WorkOrder',
                },
                {
                    model: PurchaseOrderStatus,
                    as: 'PurchaseOrderStatus',
                },
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                },
                {
                    model: Vendor,
                    as: 'Vendor',
                },
            ],
        });        

        if (!purchaseOrder) {
            return res.status(404).json({
                err: true,
                msg: 'Purchase Order not found',
            });
        }

        res.status(200).json({
            err: false,
            msg: 'Purchase Order successfully retrieved',
            purchaseOrder,
        });
    } catch (err) {
        console.error('Error fetching purchase order:', err.message);
        res.status(500).json({
            err: true,
            msg: 'Failed to retrieve purchase order',
            error: err.message,
        });
    }
};
const searchWorkOrders = async (req, res) => {
    const { query, statusId, priorityId, startDate, endDate } = req.body;
    const page = req.body.page || 1;
    const limit = req.body.limit || 100;
    const offset = (page - 1) * limit;
    const where = {};

    if (query) {
        where[Op.or] = [
            { workOrderNumber: { [Op.like]: `%${query}%` } },
            { title: { [Op.like]: `%${query}%` } }
        ];
    }
    if (statusId) where.statusId = statusId;
    if (priorityId) where.priorityId = priorityId;
    
    // Handle date filtering if provided
    if (startDate && endDate) {
        where.createdAt = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    } else if (startDate) {
        where.createdAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
        where.createdAt = { [Op.lte]: new Date(endDate) };
    }

    try {
        const workOrders = await WorkOrder.findAndCountAll({
            where,
            include: [
                { model: Client, as: 'Client' },
                { model: Estimate, as: 'Estimate' },
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: User,
                    as: 'Completer',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: WorkOrderStatus,
                    as: 'WorkOrderStatus',
                    attributes: ['id', 'name']
                },
                {
                    model: Priority,
                    as: 'Priority',
                    attributes: ['id', 'level']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.status(200).json({
            err: false,
            msg: 'Work Orders successfully retrieved',
            total: workOrders.count,
            pages: Math.ceil(workOrders.count / limit),
            workOrders: workOrders.rows
        });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const list = async (req, res) => {
    const query = req.body.query || '';
    const page = req.body.page || 1;
    const limit = req.body.limit || 100;
    const offset = (page - 1) * limit;

    try {
        const workOrders = await WorkOrder.findAndCountAll({
            where: {
                [Op.or]: [
                    { workOrderNumber: { [Op.like]: `%${query}%` } },
                    { title: { [Op.like]: `%${query}%` } }
                ]
            },
            include: [
                { model: Client, as: 'Client' },
                { model: Estimate, as: 'Estimate' },
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: User,
                    as: 'Completer',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: WorkOrderStatus,
                    as: 'WorkOrderStatus',
                    attributes: ['id', 'name']
                },
                {
                    model: WorkOrderStatus,
                    as: 'WorkOrderStatus',
                    attributes: ['id', 'name']
                },
                {
                    model: Priority,
                    as: 'Priority',
                    attributes: ['id', 'level']
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.status(200).json({
            err: false,
            msg: 'Work Orders successfully retrieved',
            total: workOrders.count,
            pages: Math.ceil(workOrders.count / limit),
            workOrders: workOrders.rows
        });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const listPurchaseOrders = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Work Order ID is required to list purchase orders',
            });
        }

        // Fetch all purchase orders related to the work order
        const purchaseOrders = await PurchaseOrder.findAll({
            where: { workOrderId: id },
            include: [
                {
                    model: PurchaseOrderItem,
                    as: 'PurchaseOrderItems',
                },
                {
                    model: PurchaseOrderStatus,
                    as: 'PurchaseOrderStatus',
                },
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                },
                {
                    model: Vendor,
                    as: 'Vendor',
                },
            ],
            order: [['createdAt', 'DESC']], // Order by most recent purchase orders
        });

        if (!purchaseOrders || purchaseOrders.length === 0) {
            return res.status(200).json({
                err: false,
                msg: 'No purchase orders found for this work order',
                purchaseOrders: [],
            });
        }

        return res.status(200).json({
            err: false,
            msg: 'Purchase orders successfully retrieved',
            purchaseOrders,
        });
    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        return res.status(500).json({
            err: true,
            msg: 'Failed to retrieve purchase orders',
            error: error.message,
        });
    }
};
const listPurchaseOrderStatuses = async (req, res) => {
    try {
        const purchaseOrderStatuses = await PurchaseOrderStatus.findAll();
        if (purchaseOrderStatuses) {
            res.status(201)
                .json({
                    err: false,
                    msg: 'Purchase Order Statuses successfully retrieved',
                    purchaseOrderStatuses
                });
        }
        else {
            res.json({
                err: true,
                msg: 'Purchase Order Statuses not found'
            });
        }
    }
    catch (err) {
        res.json({
            err: true,
            msg: err.message
        });
    }
};
const listWorkOrderStatuses = async (req, res) => {
    try {
        const workOrderStatuses = await WorkOrderStatus.findAll();
        if (workOrderStatuses) {
            res.status(201)
                .json({
                    err: false,
                    msg: 'Work Order Statuses successfully retrieved',
                    workOrderStatuses
                });
        }
        else {
            res.json({
                err: true,
                msg: 'Work Order Statuses not found'
            });
        }
    }
    catch (err) {
        res.json({
            err: true,
            msg: err.message
        });
    }
};
const createPurchaseOrder = async (req, res) => {
    try {
        const { vendorId, eventId, workOrderId, clientId, adHocReason } = req.body;
        const userId = req.userId;

        if (!vendorId || !workOrderId) {
            return res.status(400).json({
                err: true,
                msg: 'vendorId and workOrderId are required',
            });
        }

        let createdWorkOrder = null;
        let relatedWorkOrderId = workOrderId;
        const pendingStatus = await WorkOrderStatus.findOne({ where: { name: 'Pending' } });
        if (!pendingStatus) {
            return res.status(500).json({
                err: true,
                msg: 'Pending status not found',
            });
        };
        // If workOrderId is not provided, create a new work order
        if (!workOrderId) {
            createdWorkOrder = await WorkOrder.create({
                eventId: eventId || null,
                estimateId: null,
                clientId: clientId || null,
                workOrderNumber: `WO-${Date.now()}`,
                title: `Work Order for Event ${eventId}`,
                description: `Auto-generated work order for event ${eventId}`,
                workOrderStatusId: pendingStatus.id, // Default status for new work orders
                createdBy: userId,
                isActive: true,
            },
            {
                userId, // Pass the userId here
            });

            relatedWorkOrderId = createdWorkOrder.id;

            // Log the EventActivity for the new work order
            await EventActivity.create({
                eventId,
                relatedModel: 'WorkOrder',
                relatedModelId: relatedWorkOrderId,
                action: 'CREATE',
                description: `Work Order ${createdWorkOrder.workOrderNumber} created for event ${eventId}`,
                changedBy: userId,
                timestamp: new Date(),
            });
        }

        // Get the statusId for "draft"
        const draftStatus = await PurchaseOrderStatus.findOne({ where: { name: 'pending' } });

        // Create the purchase order
        const purchaseOrder = await PurchaseOrder.create({
            workOrderId: relatedWorkOrderId,
            vendorId,
            purchaseOrderNumber: `PO-${Date.now()}`,
            statusId: draftStatus.id,
            orderDate: new Date(),
            totalCost: 0,
            adHocReason,
            isActive: true,
        },
        {
            userId, // Pass the userId here
        });

        // Log the WorkOrderActivity for the purchase order creation
        await WorkOrderActivity.create({
            workOrderId: relatedWorkOrderId,
            relatedModel: 'PurchaseOrder',
            relatedModelId: purchaseOrder.id,
            action: 'CREATE',
            description: `Ad-hoc purchase order ${purchaseOrder.purchaseOrderNumber} created.`,
            changedBy: userId,
            timestamp: new Date(),
        });

        return res.status(201).json({
            err: false,
            msg: 'Purchase order successfully generated',
            purchaseOrder,
            workOrder: createdWorkOrder || null,
        });
    } catch (error) {
        console.error('Error generating purchase order:', error);
        return res.status(500).json({
            err: true,
            msg: 'An error occurred while generating the purchase order',
            details: error.message,
        });
    }
};
const update = async (req, res) => {
    try {
        const {
            id,
            statusId,
            dueDate,
            title,
            workOrderNumber,
            priorityId,
            scheduledDate,
            estimatedHours,
            actualHours,
            cost,
            assignUserId,
            isActive
        } = req.body;

        if (!id) {
            return res.status(400).json({ err: true, msg: "Work Order ID is required." });
        }

        // Find the work order
        const workOrder = await WorkOrder.findOne({ where: { id } });
        if (!workOrder) {
            return res.status(404).json({ err: true, msg: "Work Order not found." });
        }

        // Store original data
        const oldWorkOrderData = workOrder.toJSON();
        let changes = {};

        // Function to format values for logging
        const formatValueForDescription = async (field, value) => {
            if (!value) return null;
            switch (field) {
                case 'priorityId':
                    const priority = await Priority.findByPk(value);
                    return priority ? priority.level : 'Priority Not Found';
                case 'statusId':
                    const status = await WorkOrderStatus.findByPk(value);
                    return status ? status.name : 'Status Not Found';
                case 'assignUserId':
                    const assignedUser = await User.findByPk(value);
                    return assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Assigned User Not Found';
                default:
                    return value;
            }
        };

        // Function to compare and update fields
        const compareAndUpdate = async (field, newValue) => {
            const oldValue = oldWorkOrderData[field];
            if (newValue !== undefined && newValue !== oldValue) {
                const formattedOldValue = await formatValueForDescription(field, oldValue);
                const formattedNewValue = await formatValueForDescription(field, newValue);

                changes[field] = {
                    oldValue: oldValue || null,
                    newValue: newValue || null,
                    description: `${formattedOldValue || oldValue} was changed to ${formattedNewValue || newValue}`,
                };

                return newValue;
            }
            return oldValue;
        };

        // Replace placeholders in the title if necessary
        let parsedTitle = title;
        const placeholderMappings = {
            assignUserId: async () => {
                if (assignUserId) {
                    const assignedUser = await User.findByPk(assignUserId);
                    return assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Assigned User Not Found';
                }
                return 'Assigned User Not Found';
            },
            priorityId: async () => {
                if (priorityId) {
                    const priority = await Priority.findByPk(priorityId);
                    return priority ? priority.level : 'Priority Not Found';
                }
                return 'Priority Not Found';
            },
            statusId: async () => {
                if (statusId) {
                    const status = await WorkOrderStatus.findByPk(statusId);
                    return status ? status.name : 'Status Not Found';
                }
                return 'Status Not Found';
            },
            creatorId: async () => {
                if (req.userId) {
                    const creator = await User.findByPk(req.userId);
                    return creator ? `${creator.firstName} ${creator.lastName}` : 'Creator Not Found';
                }
                return 'Creator Not Found';
            },
            createdDate: async () => new Date().toLocaleDateString(),
        };

        const matches = parsedTitle?.match(/\[\[{.*?\"value\":\"(.*?)\".*?}\]\]/g);
        if (matches) {
            for (const match of matches) {
                const key = JSON.parse(match.replace(/^\[\[/, '').replace(/\]\]$/, '')).value;
                if (placeholderMappings[key]) {
                    const replacement = await placeholderMappings[key]();
                    parsedTitle = parsedTitle.replace(match, replacement || `${key} Not Found`);
                }
            }
        }

        // Update fields and collect changes
        workOrder.statusId = await compareAndUpdate('statusId', statusId);
        workOrder.dueDate = await compareAndUpdate('dueDate', dueDate);
        workOrder.title = await compareAndUpdate('title', parsedTitle);
        workOrder.workOrderNumber = await compareAndUpdate('workOrderNumber', workOrderNumber);
        workOrder.priorityId = await compareAndUpdate('priorityId', priorityId);
        workOrder.scheduledDate = await compareAndUpdate('scheduledDate', scheduledDate);
        workOrder.estimatedHours = await compareAndUpdate('estimatedHours', estimatedHours);
        workOrder.actualHours = await compareAndUpdate('actualHours', actualHours);
        workOrder.cost = await compareAndUpdate('cost', cost);
        workOrder.assignUserId = await compareAndUpdate('assignUserId', assignUserId);
        workOrder.isActive = await compareAndUpdate('isActive', isActive);

        // If no changes detected, return early
        if (Object.keys(changes).length === 0) {
            return res.status(200).json({ err: false, msg: "No changes detected in work order update." });
        }

        // Save changes with the context for logging
        await workOrder.save({
            individualHooks: true,
            context: {
                changes,
                changedBy: req.userId,
            },
        });

        // Create notifications for work order updates (especially status changes)
        try {
            if (changes.statusId || changes.assignUserId) {
                // Get assigned users for this work order
                const assignedUserIds = [];
                if (workOrder.assignUserId) assignedUserIds.push(workOrder.assignUserId);
                
                const usersToNotify = await getWorkOrderNotificationUsers(
                    req.companyId,
                    assignedUserIds,
                    workOrder.clientId
                );
                
                const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
                const updater = await User.findByPk(req.userId);
                let message = '';
                
                if (changes.statusId) {
                    const newStatus = await WorkOrderStatus.findByPk(changes.statusId.newValue);
                    message = `Work Order #${workOrder.workOrderNumber} status changed to ${newStatus ? newStatus.name : 'Unknown'} by ${updater ? updater.firstName + ' ' + updater.lastName : 'Administrator'}`;
                } else if (changes.assignUserId) {
                    const newAssignedUser = await User.findByPk(changes.assignUserId.newValue);
                    message = `Work Order #${workOrder.workOrderNumber} reassigned to ${newAssignedUser ? newAssignedUser.firstName + ' ' + newAssignedUser.lastName : 'Unknown'} by ${updater ? updater.firstName + ' ' + updater.lastName : 'Administrator'}`;
                }
                
                if (message) {
                    await sendNotificationsToUsers(
                        usersToNotify,
                        {
                            userId: req.userId,
                            relatedModel: 'workOrders',
                            relatedModelId: workOrder.id,
                            priorityId: priority.id,
                            title: 'Work Order Updated',
                            message: message,
                            type: 'general'
                        },
                        req.userId // Don't notify the person who updated it
                    );
                }
            }
        } catch (notificationError) {
            console.error('Error creating work order update notifications:', notificationError);
        }

        return res.status(200).json({
            err: false,
            msg: "Work Order successfully updated",
            changes
        });

    } catch (error) {
        console.error("Error updating work order:", error);
        return res.status(500).json({
            err: true,
            msg: "Failed to update work order.",
            error: error.message,
        });
    }
};
const updateWorkOrderStatus = async (req, res) => {
    try {
        const { id, statusId } = req.body;

        // Find the work order
        const workOrder = await WorkOrder.findByPk(id);

        if (!workOrder) {
            return res.status(404).json({ err: true, msg: "Work Order not found" });
        }

        // Find the "Completed" status ID
        const completedStatus = await WorkOrderStatus.findOne({ where: { name: "Completed" } });

        if (!completedStatus) {
            return res.status(500).json({ err: true, msg: "Completed status not found in database" });
        }

        // Store original data
        const oldWorkOrderData = workOrder.toJSON();
        const changes = {};

        // Compare and update function
        const compareAndUpdate = (field, newValue) => {
            const oldValue = oldWorkOrderData[field];
            if (newValue !== oldValue) {
                changes[field] = {
                    oldValue: oldValue || null,
                    newValue: newValue || null,
                    description: `${oldValue || "null"} was changed to ${newValue || "null"}`
                };
                return newValue;
            }
            return oldValue;
        };

        // Prepare update data
        let updateData = {};
        updateData.statusId = compareAndUpdate("statusId", statusId);

        // If the status is "Completed", update `completedBy`
        if (statusId === completedStatus.id) {
            updateData.completedBy = compareAndUpdate("completedBy", req.userId);
        }

        // If no changes detected, return early
        if (Object.keys(changes).length === 0) {
            return res.status(200).json({ err: false, msg: "No changes detected in status update." });
        }

        // Update the work order
        await workOrder.update(updateData);

        // Create notifications for status updates
        try {
            if (changes.statusId) {
                // Get assigned users for this work order
                const assignedUserIds = [];
                if (workOrder.assignUserId) assignedUserIds.push(workOrder.assignUserId);
                
                const usersToNotify = await getWorkOrderNotificationUsers(
                    req.companyId,
                    assignedUserIds,
                    workOrder.clientId
                );
                
                const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
                const updater = await User.findByPk(req.userId);
                const newStatus = await WorkOrderStatus.findByPk(statusId);
                
                const message = `Work Order #${workOrder.workOrderNumber} status: ${newStatus ? newStatus.name : 'Unknown'} (updated by ${updater ? updater.firstName + ' ' + updater.lastName : 'Administrator'})`;
                
                await sendNotificationsToUsers(
                    usersToNotify,
                    {
                        userId: req.userId,
                        relatedModel: 'workOrders',
                        relatedModelId: workOrder.id,
                        priorityId: priority.id,
                        title: 'Work Order Status Updated',
                        message: message,
                        type: 'general'
                    },
                    req.userId // Don't notify the person who updated it
                );
            }
        } catch (notificationError) {
            console.error('Error creating work order status notifications:', notificationError);
        }

        res.status(200).json({ err: false, msg: "Work Order status successfully updated", workOrder });

    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const updateWorkOrdersPriorities = async (req, res) => {
    try {
        // Call the function to calculate and update priorities
        const updatedWorkOrders = await calculateWorkOrderPriorities();

        if (!updatedWorkOrders || updatedWorkOrders.length === 0) {
            return res.status(200).json({
                err: false,
                msg: "No work orders needed priority updates."
            });
        }

        return res.status(200).json({
            err: false,
            msg: `Successfully updated ${updatedWorkOrders.length} work orders' priorities.`,
            updatedCount: updatedWorkOrders.length
        });

    } catch (error) {
        console.error("Error updating work order priorities:", error);
        return res.status(500).json({
            err: true,
            msg: "An error occurred while updating work orders.",
            error: error.message
        });
    }
};
const updateWorkOrderLineItem = async (req, res) => {
    try {
        const { 
            id,
            quantity, 
            rate, 
            unit, 
            subTotal, 
            total, 
            taxable, 
            markup, 
            name, 
            description, 
            userId, 
            salesTaxRate, 
            salesTaxTotal, 
            moduleDescription, 
            instructions 
        } = req.body;

        if (!id) {
            return res.status(400).json({ err: true, msg: "Work Order Line Item ID is required." });
        }

        // Find the work order line item
        const workOrderLineItem = await WorkOrderLineItem.findByPk(id);

        if (!workOrderLineItem) {
            return res.status(404).json({ err: true, msg: "Work Order Line Item not found." });
        }

        // Store original data
        const oldData = workOrderLineItem.toJSON();
        let changes = {};

        // Function to compare and update fields
        const compareAndUpdate = async (field, newValue) => {
            const oldValue = oldData[field];
            if (newValue !== undefined && newValue !== oldValue) {
                changes[field] = {
                    oldValue: oldValue || null,
                    newValue: newValue || null,
                    description: `${oldValue || "null"} was changed to ${newValue || "null"}`
                };
                return newValue;
            }
            return oldValue;
        };

        // Prepare update data
        let updateData = {};
        updateData.quantity = await compareAndUpdate("quantity", quantity);
        updateData.rate = await compareAndUpdate("rate", rate);
        updateData.unit = await compareAndUpdate("unit", unit);
        updateData.subTotal = await compareAndUpdate("subTotal", subTotal);
        updateData.total = await compareAndUpdate("total", total);
        updateData.taxable = await compareAndUpdate("taxable", taxable);
        updateData.markup = await compareAndUpdate("markup", markup);
        updateData.name = await compareAndUpdate("name", name);
        updateData.description = await compareAndUpdate("description", description);
        updateData.userId = await compareAndUpdate("userId", userId);
        updateData.salesTaxRate = await compareAndUpdate("salesTaxRate", salesTaxRate);
        updateData.salesTaxTotal = await compareAndUpdate("salesTaxTotal", salesTaxTotal);
        updateData.moduleDescription = await compareAndUpdate("moduleDescription", moduleDescription);
        updateData.instructions = await compareAndUpdate("instructions", instructions);

        // Remove unchanged fields
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === oldData[key]) {
                delete updateData[key];
            }
        });

        // If no changes detected, return early
        if (Object.keys(changes).length === 0) {
            return res.status(200).json({ err: false, msg: "No changes detected in work order line item update." });
        }

        // Update the work order line item with context tracking
        await workOrderLineItem.update(updateData, {
            individualHooks: true,
            context: {
                changes,
                changedBy: req.userId
            }
        });

        res.status(200).json({
            err: false,
            msg: "Work Order Line Item successfully updated",
            changes
        });

    } catch (err) {
        console.error("Error updating work order line item:", err);
        res.status(400).json({ err: true, msg: err.message });
    }
};
const addWorkOrderLineItem = async (req, res) => {
    try {
        const { workOrderId, id } = req.body;
        const userId = req.userId;

        if (!workOrderId || !id) {
            return res.status(400).json({
                err: true,
                msg: 'workOrderId, lineItemId are required',
            });
        }

        // Fetch the line item details
        const lineItem = await LineItem.findByPk(id, {
            include: [
                { 
                    model: LineItemItem,
                    as: 'AssociatedItems'
                },
                {
                    model: Item,
                    as: 'Items'
                }
            ]
        });
        if (!lineItem) {
            return res.status(404).json({
                err: true,
                msg: 'Line item not found',
            });
        }


        // Add the line item to the work order
        const workOrderLineItem = await WorkOrderLineItem.create({
            workOrderId,
            lineItemId: id,
            rate: lineItem.rate,
            unit: lineItem.unit,
            subTotal: lineItem.subTotal,
            quantity: lineItem.quantity,
            total: lineItem.total,
            taxable: lineItem.taxable,
            markup: lineItem.markup,
            name: lineItem.name,
            description: lineItem.description,
            userId: userId,
            salesTaxRate: lineItem.salesTaxRate,
            salesTaxTotal: lineItem.salesTaxTotal,
            moduleDescription: lineItem.moduleDescription,
            instructions: lineItem.instructions
        });
        // Get the statusId for "draft"
        const pendingStatus = await PurchaseOrderStatus.findOne({ where: { name: 'pending approval' } });


        // Create a purchase order using the line item details
        const purchaseOrder = await PurchaseOrder.create({
            workOrderId,
            purchaseOrderNumber: `PO-${Date.now()}`,
            statusId: pendingStatus.id,
            orderDate: new Date(),
            totalCost: lineItem.total,
            isActive: true,
        },
        {
            userId, // Pass the userId here
        });

        // Create purchase order items from the line item items
        for (const item of lineItem.Items) {

            await PurchaseOrderItem.create({
                purchaseOrderId: purchaseOrder.id,
                itemId: item.id,
                lineItemId: workOrderLineItem.id,
                quantity: item.LineItemItem.quantity,
                unitPrice: item.cost,
                totalCost: item.cost * item.LineItemItem.quantity,
                isActive: true,
            });
        }

        await calculateWorkOrderTotalCost(workOrderId);
        
        
        // Log the WorkOrderActivity for the purchase order creation
        await WorkOrderActivity.create({
            workOrderId,
            relatedModel: 'PurchaseOrder',
            relatedModelId: purchaseOrder.id,
            action: 'CREATE',
            description: `Purchase order ${purchaseOrder.purchaseOrderNumber} created for line item ${id}.`,
            changedBy: userId,
            timestamp: new Date(),
        });

        return res.status(201).json({
            err: false,
            msg: 'Work order line item and purchase order successfully created',
            workOrderLineItem,
            purchaseOrder,
        });
    } catch (error) {
        console.error('Error adding work order line item:', error.message);
        return res.status(500).json({
            err: true,
            msg: 'An error occurred while adding the work order line item',
            details: error.message,
        });
    }
};
const archive = async (req, res) => {
    try {
        const { id } = req.body;
        const workOrder = await WorkOrder.findByPk(id);

        if (!workOrder) {
            return res.status(404).json({ err: true, msg: 'Work Order not found' });
        }
        await workOrder.update({ isActive: false });

        res.status(200).json({ err: false, msg: 'Work Order successfully deleted' });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const addItemToPurchaseOrder = async (req, res) => {
    try {
        const { purchaseOrderId, itemId, quantity } = req.body;

        // Validate required fields
        if (!purchaseOrderId || !itemId || !quantity || quantity <= 0) {
            return res.status(400).json({
                err: true,
                msg: 'purchaseOrderId, itemId, and a valid quantity are required',
            });
        }

        // Fetch the purchase order
        const purchaseOrder = await PurchaseOrder.findByPk(purchaseOrderId);

        if (!purchaseOrder) {
            return res.status(404).json({
                err: true,
                msg: 'Purchase order not found',
            });
        }

        // Fetch the item and verify it exists
        const item = await Item.findByPk(itemId);

        if (!item) {
            return res.status(404).json({
                err: true,
                msg: 'Item not found',
            });
        }

        // Calculate total cost
        const unitPrice = parseFloat(item.cost); // Use `cost` from the Item model
        const totalCost = unitPrice * quantity; // Total cost = unit price * quantity

        // Create the purchase order item
        const purchaseOrderItem = await PurchaseOrderItem.create({
            purchaseOrderId,
            itemId,
            quantity,
            unitPrice,
            totalCost,
        });

        // Update the total cost of the purchase order
        const purchaseOrderItems = await PurchaseOrderItem.findAll({
            where: { purchaseOrderId, isActive: true },
        });

        const purchaseOrderTotalCost = purchaseOrderItems.reduce(
            (sum, poItem) => sum + poItem.totalCost,
            0
        );

        await purchaseOrder.update({ totalCost: purchaseOrderTotalCost });

        // Return success response
        return res.status(201).json({
            err: false,
            msg: 'Item successfully added to purchase order',
            purchaseOrderItem,
            updatedPurchaseOrder: {
                id: purchaseOrder.id,
                totalCost: purchaseOrderTotalCost,
            },
        });
    } catch (error) {
        console.error('Error adding item to purchase order:', error.message);
        return res.status(500).json({
            err: true,
            msg: 'An error occurred while adding the item to the purchase order',
            details: error.message,
        });
    }
};
const removeWorkOrderLineItem = async (req, res) => {
    try {
        const { id, workOrderId } = req.body;
        
        const workOrderLineItem = await WorkOrderLineItem.findByPk(id);

        if (!workOrderLineItem) {
            return res.status(404).json({ err: true, msg: 'Work Order Item not found' });
        }

        
        await workOrderLineItem.update({ isActive: false });
        await calculateWorkOrderTotalCost(workOrderId);

        res.status(200).json({ err: false, msg: 'Work Order Item successfully removed' });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const removeItemFromPurchaseOrder = async (req, res) => {
    try {
        const { purchaseOrderId, itemId } = req.body;

        // Find the purchase order
        const purchaseOrder = await PurchaseOrder.findOne({
            where: { id: purchaseOrderId },
            include: [{
                model: PurchaseOrderItem,
                as: 'PurchaseOrderItems'
            }]
        });

        if (!purchaseOrder) {
            return res.status(404).json({ err: true, msg: 'Purchase order not found' });
        }

        // Find the item in the purchase order
        const itemToRemove = purchaseOrder.PurchaseOrderItems.find(item => item.itemId === itemId);
        if (!itemToRemove) {
            return res.status(404).json({ err: true, msg: 'Item not found in purchase order' });
        }

        // Remove the item
        await itemToRemove.update({ isActive: false });

        // Recalculate total cost
        const remainingItems = await PurchaseOrderItem.findAll({
            where: { purchaseOrderId, isActive: true },
            include: [{
                model: Item,
                as: 'Item'
            }]
        });

        const newTotalCost = remainingItems.reduce((sum, item) => sum + parseFloat(item.Item.cost), 0);
        await purchaseOrder.update({ totalCost: newTotalCost });

        return res.status(200).json({ err: false, msg: 'Item removed successfully', totalCost: newTotalCost });
    } catch (error) {
        console.error('Error removing item from purchase order:', error);
        return res.status(500).json({ err: true, msg: error.message });
    }
};
const assignUserToWorkOrder = async (req, res) => {
    try {
        const { id, assignedUserId } = req.body;
        const workOrder = await WorkOrder.findByPk(id);

        if (!workOrder) {
            return res.status(404).json({ err: true, msg: 'Work Order not found' });
        }

        await workOrder.update({ assignedUserId });

        // Create notifications for user assignment
        try {
            if (assignedUserId) {
                const assignedUser = await User.findByPk(assignedUserId);
                if (assignedUser) {
                    const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
                    const assigner = await User.findByPk(req.userId);
                    
                    const message = `You've been assigned to Work Order #${workOrder.workOrderNumber} by ${assigner ? assigner.firstName + ' ' + assigner.lastName : 'Administrator'}`;
                    
                    await sendNotificationsToUsers(
                        [assignedUser],
                        {
                            userId: req.userId,
                            relatedModel: 'workOrders',
                            relatedModelId: workOrder.id,
                            priorityId: priority.id,
                            title: 'Work Order Assignment',
                            message: message,
                            type: 'general'
                        },
                        req.userId // Don't notify the person who assigned it
                    );
                }
            }
        } catch (notificationError) {
            console.error('Error creating work order assignment notifications:', notificationError);
        }

        res.status(200).json({ err: false, msg: 'User successfully assigned', workOrder });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const cloneWorkOrder = async (req, res) => {
    try {
        const { id } = req.body;
        const workOrder = await WorkOrder.findByPk(id, {
            include: [{ model: WorkOrderLineItem, as: 'LineItems' }]
        });

        if (!workOrder) {
            return res.status(404).json({ err: true, msg: 'Work Order not found' });
        }

        const newWorkOrder = await WorkOrder.create({
            estimateId: workOrder.estimateId,
            clientId: workOrder.clientId,
            eventId: workOrder.eventId,
            workOrderNumber: `WO-${Date.now()}`,
            title: workOrder.title,
            description: workOrder.description,
            location: workOrder.location,
            category: workOrder.category,
            priorityId: workOrder.priorityId,
            scheduledDate: workOrder.scheduledDate,
            dueDate: workOrder.dueDate,
            estimatedHours: workOrder.estimatedHours,
            actualHours: workOrder.actualHours,
            cost: workOrder.cost,
            assignUserId: workOrder.assignUserId,
            createdBy: workOrder.createdBy,
            completedBy: workOrder.completedBy,
            workOrderStatusId: workOrder.workOrderStatusId,
            statusId: workOrder.statusId,
            comments: workOrder.comments,
            isActive: true
        });

        for (const item of workOrder.LineItems) {
            await WorkOrderLineItem.create({
                workOrderId: newWorkOrder.id,
                itemId: item.itemId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalCost: item.totalCost
            });
        }

        res.status(201).json({ err: false, msg: 'Work Order successfully cloned', workOrder: newWorkOrder });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const bulkUpdateWorkOrders = async (req, res) => {
    try {
        const { ids, status } = req.body;

        await WorkOrder.update(
            { status },
            {
                where: {
                    id: {
                        [Op.in]: ids
                    }
                }
            }
        );

        res.status(200).json({ err: false, msg: 'Work Orders successfully updated' });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const approvePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.body;

        const purchaseOrder = await PurchaseOrder.findByPk(id);

        if (!purchaseOrder) {
            return res.status(404).json({ err: true, msg: 'Purchase Order not found' });
        }
        const approvedStatus = await PurchaseOrderStatus.findOne({ where: { name: 'approved' } });
        if (!approvedStatus) {
            return res.status(500).json({ err: true, msg: 'Approved status not found in database' });
        }

        await purchaseOrder.update({ statusId: approvedStatus.id });
        res.status(200).json({ err: false, msg: 'Purchase Order successfully approved', purchaseOrder });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const generateWorkOrder = async (estimateId, userId) => {
    try {
        const estimate = await Estimate.findByPk(estimateId, {
            include: [
                {
                    model: EstimateLineItem,
                    as: 'EstimateLineItems',
                    include: [
                        {
                            model: LineItem,
                            as: 'LineItems',
                            include: [
                                {
                                    model: LineItemItem,
                                    as: 'AssociatedItems',
                                    include: [
                                        {
                                            model: Item,
                                            as: 'Item'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!estimate) {
            throw new Error('Estimate not found');
        }
        const pendingStatus = await WorkOrderStatus.findOne({ where: { name: 'Pending' } });
        const workOrder = await WorkOrder.create({
            estimateId: estimate.id,
            workOrderNumber: `WO-${Date.now()}`,
            title: `Work Order for Estimate ${estimate.id}`,
            description: estimate.memo,
            statusId: pendingStatus.id, // Assuming 1 is the default status for new work orders
            clientId: estimate.clientId,
            createdBy: userId,
            isActive: true
        });

        if (estimate.AssociatedLineItems && estimate.AssociatedLineItems.length > 0) {
            for (const estimateLineItem of estimate.AssociatedLineItems) {
                const lineItems = estimateLineItem.LineItems || [];
                for (const lineItem of lineItems) {
                    const associatedItems = lineItem.AssociatedItems || [];
                    for (const lineItemItem of associatedItems) {
                        const item = lineItemItem.Item;
        
                        // Instead of just moving item data, move relevant line item data
                        await WorkOrderLineItem.create({
                            statusId: 1,
                            workOrderId: workOrder.id,
                            lineItemId: lineItem.id,  // Keep reference to the line item
                            rate: estimateLineItem.rate,  // Move rate from estimate
                            unit: estimateLineItem.unit,  // Move unit
                            subTotal: estimateLineItem.subTotal, // Move subtotal
                            quantity: lineItemItem.quantity, // Retain quantity
                            unitPrice: item.cost,  // Keep unit price from the item
                            totalCost: lineItemItem.quantity * item.cost,  // Maintain cost calculation
                            isActive: true,
                        });
                    }
                }
            }
        }
        

        await calculateWorkOrderTotalCost(workOrder.id);
        return workOrder;
    } catch (error) {
        console.error('Error generating work order:', error.message);
        throw error;
    }
};
const calculateWorkOrderPriorities = async () => {
    try {
        // Fetch priority levels from the database
        const priorityLevels = {};
        const priorities = await Priority.findAll();
        priorities.forEach(priority => {
            priorityLevels[priority.level.toLowerCase()] = priority.id;
        });

        if (!priorityLevels.normal || !priorityLevels.medium || !priorityLevels.high || !priorityLevels.emergency) {
            console.error("Priority levels are missing in the database.");
            return [];
        }

        // Get "Pending" and "In Progress" work order statuses
        const statuses = await WorkOrderStatus.findAll({
            where: { name: { [Op.in]: ["Pending", "In Progress"] } }
        });
        const statusIds = statuses.map(status => status.id);

        // Fetch work orders with matching statuses
        const workOrders = await WorkOrder.findAll({
            where: { statusId: { [Op.in]: statusIds } },
            include: [
                { model: Client, as: "Client" },
                { model: Priority, as: "Priority" }
            ]
        });

        if (!workOrders.length) {
            return [];
        }

        // Fetch the first company's work order default reminder settings
        const company = await Company.findByPk(res.companyId);
        const warningDays = company?.workOrderDefaultWarningReminder ?? 10;
        const alertDays = company?.workOrderDefaultAlertReminder ?? 20;
        const emergencyDays = company?.workOrderDefaultEmergencyReminder ?? 30;

        // Current timestamp
        const now = new Date();
        let updatedWorkOrders = [];
        let changes = {};

        // Function to compare and update priority
        const compareAndUpdate = async (workOrder, newPriorityId) => {
            const oldPriority = workOrder.priorityId;
            if (newPriorityId !== oldPriority) {
                changes[workOrder.workOrderNumber] = {
                    oldValue: oldPriority,
                    newValue: newPriorityId,
                    relatedModel: 'Priority',
                    relatedModelId: newPriorityId,
                    description: `Priority changed from ${oldPriority} to ${newPriorityId}`,
                    scope: 'SYSTEM'
                };
                return newPriorityId;
            }
            return oldPriority;
        };

        // Update work orders based on time since creation
        for (const workOrder of workOrders) {
            const createdAt = new Date(workOrder.createdAt);
            const timeDiffInDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)); // Convert ms to days

            let newPriorityId = priorityLevels.normal;

            if (timeDiffInDays >= emergencyDays) {
                newPriorityId = priorityLevels.emergency;
            } else if (timeDiffInDays >= alertDays) {
                newPriorityId = priorityLevels.high;
            } else if (timeDiffInDays >= warningDays) {
                newPriorityId = priorityLevels.medium;
            }

            // Check if priority needs to be updated
            const updatedPriorityId = await compareAndUpdate(workOrder, newPriorityId);

            if (updatedPriorityId !== workOrder.priorityId) {
                await workOrder.update(
                    { priorityId: updatedPriorityId },
                    {
                        individualHooks: true,
                        context: {
                            changes,
                            changedBy: null
                        }
                    }
                );
                updatedWorkOrders.push(workOrder);
            }
        }

        return updatedWorkOrders;
    } catch (error) {
        console.error("Error updating work order priorities:", error);
        throw error;
    }
};
const calculateWorkOrderTotalCost = async (id) => {
    try {
        let totalCost = 0;

        // Fetch the work order without filtering by isActive
        const workOrder = await WorkOrder.findByPk(id, {
            include: [
                { 
                    model: WorkOrderLineItem, 
                    as: 'LineItems',
                    where: { isActive: true }, // Only include active line items
                    required: false, // Allow work orders with no active line items
                    include: [
                        { 
                            model: Item, 
                            as: 'Item'
                        }
                    ]
                }
            ]
        });

        if (!workOrder) {
            throw new Error(`Work Order with ID ${id} not found.`);
        }

        // Calculate the total cost from the line items
        workOrder.LineItems.forEach(item => {
            totalCost += parseFloat(item.total);
        });

        // Fix the total cost to 2 decimal places
        totalCost = parseFloat(totalCost.toFixed(2));

        // Update the work order's total cost
        await workOrder.update({ cost: totalCost });

        return totalCost;

    } catch (error) {
        console.error("Error calculating work order total cost:", error);
        throw error;
    }
}

module.exports = {
    get,
    getPurchaseOrder,
    getWorkOrderLineItem,
    searchWorkOrders,
    list,
    listPurchaseOrders,
    listWorkOrderStatuses,
    listPurchaseOrderStatuses,
    createPurchaseOrder,
    update,
    updateWorkOrderStatus,
    updateWorkOrdersPriorities,
    updateWorkOrderLineItem,
    archive,
    addWorkOrderLineItem,
    addItemToPurchaseOrder,
    removeWorkOrderLineItem,
    removeItemFromPurchaseOrder,
    assignUserToWorkOrder,
    cloneWorkOrder,
    bulkUpdateWorkOrders,
    approvePurchaseOrder,
    generateWorkOrder,
    calculateWorkOrderPriorities,
    calculateWorkOrderTotalCost
};
