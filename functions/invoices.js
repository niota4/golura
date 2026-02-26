const { 
    Invoice, 
    InvoiceLineItem, 
    InvoicePreferences,
    InvoiceHistory,
    Estimate, 
    EstimateLineItem,
    Client, 
    ClientAddress,
    ClientEmail,
    ClientPhoneNumber,
    State,
    WorkOrder, 
    LineItem,
    LineItemItem,
    Item,
    Company,
    User,
    Event,
    Template,
    Document
} = require('../models');

const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { generateInvoicePdf } = require('../helpers/pdf');
const { uploadInvoicePdfToCloudinary } = require('../helpers/upload');

const getInvoice = async (req, res) => {
    try {
        const { id } = req.body;
        const invoice = await Invoice.findOne({
            where: { id },
            include: [
                { model: Client, as: 'Client' },
                { model: WorkOrder, as: 'WorkOrder' },
                { model: Estimate, as: 'Estimate' },
                {
                    model: InvoiceLineItem, as: 'InvoiceLineItems',
                    include: [{ model: LineItem, as: 'LineItem' }]
                }
            ]
        });

        if (!invoice) {
            return res.status(404).json({ err: true, msg: 'Invoice not found' });
        }

        res.status(200).json({ err: false, msg: 'Invoice successfully retrieved', invoice });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const getInvoiceLineItem = async (req, res) => {
    try {
        const { id } = req.body;
        const invoiceLineItem = await InvoiceLineItem.findOne({
            where: { id },
            include: [{ model: LineItem, as: 'LineItem' }]
        });

        if (!invoiceLineItem) {
            return res.status(404).json({ err: true, msg: 'Invoice Line Item not found' });
        }

        res.status(200).json({ err: false, msg: 'Invoice Line Item successfully retrieved', invoiceLineItem });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const searchInvoices = async (req, res) => {
    const { query, status, clientId, startDate, endDate } = req.body;
    const page = req.body.page || 1;
    const limit = req.body.limit || 100;
    const offset = (page - 1) * limit;
    const where = {};

    if (query) {
        where[Op.or] = [
            { invoiceNumber: { [Op.like]: `%${query}%` } },
            { status: { [Op.like]: `%${query}%` } }
        ];
    }
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (startDate && endDate) {
        where.date = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }

    try {
        const invoices = await Invoice.findAndCountAll({
            where,
            include: [
                { model: Client, as: 'Client' },
                { model: WorkOrder, as: 'WorkOrder' }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.status(200).json({
            err: false,
            msg: 'Invoices successfully retrieved',
            total: invoices.count,
            pages: Math.ceil(invoices.count / limit),
            invoices: invoices.rows
        });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const listInvoices = async (req, res) => {
    const query = req.body.query || '';
    const page = req.body.page || 1;
    const limit = req.body.limit || 100;
    const offset = (page - 1) * limit;

    try {
        const invoices = await Invoice.findAndCountAll({
            where: {
                [Op.or]: [
                    { invoiceNumber: { [Op.like]: `%${query}%` } },
                    { status: { [Op.like]: `%${query}%` } }
                ]
            },
            include: [
                { model: Client, as: 'Client' },
                { model: WorkOrder, as: 'WorkOrder' }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.status(200).json({
            err: false,
            msg: 'Invoices successfully retrieved',
            total: invoices.count,
            pages: Math.ceil(invoices.count / limit),
            invoices: invoices.rows
        });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const createInvoice = async (req, res) => {
    try {
        const { clientId, estimateId, workOrderId, adHocReason } = req.body;
        const userId = req.userId;
        const companyId = res.companyId || req.companyId;

        if (!userId) {
            return res.status(400).json({
                err: true,
                msg: 'userId is required'
            });
        }

        if (!clientId) {
            return res.status(400).json({
                err: true,
                msg: 'clientId is required'
            });
        }

        const invoice = await generateInvoice(req.companyId, estimateId, workOrderId, userId, companyId, clientId, adHocReason);

        res.status(201).json({
            err: false,
            msg: 'Invoice successfully created',
            invoice
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createInvoiceLineItem = async (req, res) => {
    try {
        const {
            invoiceId,
            lineItemId,
            itemId,
            laborId,
            name,
            description,
            quantity = 1,
            rate = 0,
            unit = 'each',
            subTotal = 0,
            unitPrice = 0,
            totalPrice = 0,
            taxable = true,
            markup = 0,
            salesTaxRate = 0,
            salesTaxTotal = 0,
            lineItemPrice = true,
            category = 'Material',
            pricedBy = 'custom',
            formulaId,
            questionId,
            moduleDescription,
            instructions,
            adHoc = false,
            isActive = true,
            hours,
            useOvertimeRate = false,
            standardHours,
            overtimeHours
        } = req.body;

        const userId = req.userId;
        const companyId = res.companyId || req.companyId;

        // Sanitize decimal fields
        const safeDecimal = v => (v === '' || v === undefined || v === null ? 0 : isNaN(Number(v)) ? 0 : Number(v));
        const safeNullableDecimal = v => (v === '' || v === undefined || v === null ? null : isNaN(Number(v)) ? null : Number(v));
        const safeInteger = v => (v === '' || v === undefined || v === null ? null : isNaN(Number(v)) ? null : parseInt(v));

        // Validate required fields
        if (!invoiceId || !name) {
            return res.status(400).json({
                err: true,
                msg: 'invoiceId and name are required'
            });
        }

        // Verify invoice exists
        const invoice = await Invoice.findByPk(invoiceId);
        if (!invoice) {
            return res.status(404).json({
                err: true,
                msg: 'Invoice not found'
            });
        }

        // Calculate totals if not provided
        const _rate = safeDecimal(rate);
        const _quantity = safeDecimal(quantity);
        const _markup = safeDecimal(markup);
        const _salesTaxRate = safeNullableDecimal(salesTaxRate);
        const _unitPrice = unitPrice === '' ? _rate : safeDecimal(unitPrice);
        const _subTotal = subTotal === '' ? _rate * _quantity : safeDecimal(subTotal);
        const _taxable = typeof taxable === 'string' ? taxable === 'true' : !!taxable;
        const _salesTaxTotal = _taxable && _salesTaxRate !== null ? (_subTotal * (_salesTaxRate / 100)) : 0;
        const _totalPrice = totalPrice === '' ? (_subTotal + _salesTaxTotal + _markup) : safeDecimal(totalPrice);

        // Create the InvoiceLineItem
        const newInvoiceLineItem = await InvoiceLineItem.create({
            companyId,
            invoiceId,
            lineItemId,
            itemId: safeInteger(itemId),
            laborId: safeInteger(laborId),
            name,
            description: description || '',
            quantity: _quantity,
            rate: _rate,
            unit,
            subTotal: _subTotal,
            unitPrice: _unitPrice,
            totalPrice: _totalPrice,
            taxable: _taxable,
            markup: _markup,
            userId,
            salesTaxRate: _salesTaxRate,
            salesTaxTotal: _salesTaxTotal,
            lineItemPrice: typeof lineItemPrice === 'string' ? lineItemPrice === 'true' : !!lineItemPrice,
            category,
            pricedBy,
            formulaId: safeInteger(formulaId),
            questionId: safeInteger(questionId),
            moduleDescription,
            instructions,
            adHoc: typeof adHoc === 'string' ? adHoc === 'true' : !!adHoc,
            isActive: typeof isActive === 'string' ? isActive === 'true' : !!isActive,
            hours: safeNullableDecimal(hours),
            useOvertimeRate: typeof useOvertimeRate === 'string' ? useOvertimeRate === 'true' : !!useOvertimeRate,
            standardHours: safeNullableDecimal(standardHours),
            overtimeHours: safeNullableDecimal(overtimeHours)
        });

        // Recalculate invoice totals
        await calculateInvoiceTotals(invoiceId);

        res.status(201).json({ 
            err: false, 
            msg: 'Invoice Line Item successfully added', 
            invoiceLineItem: newInvoiceLineItem 
        });
    } catch (err) {
        console.error('Error adding InvoiceLineItem:', err);
        res.status(400).json({ 
            err: true, 
            msg: err.message 
        });
    }
};
const createInvoicePdf = async (req, res) => {
    try {
        const { invoiceId } = req.body;

        if (!invoiceId) {
            return res.status(400).json({
                err: true,
                msg: 'invoiceId is required'
            });
        }
        await generateAndUploadInvoicePdf(invoiceId, res.companyId);

        res.status(201).json({
            err: false,
            msg: 'Invoice PDF successfully created and uploaded'
        });
    } catch (err) {
        console.error('Error creating Invoice PDF:', err);
        res.status(400).json({
            err: true,
            msg: 'Failed to create Invoice PDF',
            details: err.message
        });
    }
};
const updateInvoice = async (req, res) => {
    try {
        const { 
            id, 
            invoiceNumber, 
            clientId, 
            estimateId, 
            workOrderId, 
            salesTaxRate, 
            markUp, 
            memo, 
            adHocReason, 
            itemize 
        } = req.body;
        
        const invoice = await Invoice.findByPk(id);

        if (!invoice) {
            return res.status(404).json({ err: true, msg: 'Invoice not found' });
        }

        await invoice.update({
            invoiceNumber,
            clientId,
            estimateId,
            workOrderId,
            salesTaxRate,
            markUp,
            memo,
            adHocReason,
            itemize
        });

        // Fetch updated invoice with associations
        const updatedInvoice = await Invoice.findByPk(id, {
            include: [
                { model: Client, as: 'Client' },
                { model: WorkOrder, as: 'WorkOrder' },
                { model: Estimate, as: 'Estimate' },
                {
                    model: InvoiceLineItem, as: 'InvoiceLineItems',
                    include: [{ model: LineItem, as: 'LineItem' }]
                }
            ]
        });

        res.status(200).json({ err: false, msg: 'Invoice successfully updated', invoice: updatedInvoice });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const updateInvoiceTotal = async (req, res) => {
    try {
        const { id } = req.body;
        const invoice = await Invoice.findByPk(id, {
            include: [{ model: InvoiceLineItem, as: 'InvoiceLineItems' }]
        });

        if (!invoice) {
            return res.status(404).json({ err: true, msg: 'Invoice not found' });
        }

        const total = invoice.InvoiceLineItems.reduce((sum, item) => sum + parseFloat(item.totalPrice || 0), 0);

        await invoice.update({ total });

        res.status(200).json({ err: false, msg: 'Invoice total successfully updated', invoice });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const updateInvoiceLineItem = async (req, res) => {
    try {
        const { 
            id, 
            itemId,
            laborId,
            name,
            description,
            quantity,
            rate, 
            unit, 
            subTotal, 
            unitPrice,
            totalPrice, 
            taxable, 
            markup, 
            userId, 
            salesTaxRate, 
            salesTaxTotal,
            lineItemPrice,
            category,
            pricedBy,
            formulaId,
            questionId,
            moduleDescription,
            instructions,
            adHoc,
            isActive,
            hours,
            useOvertimeRate,
            standardHours,
            overtimeHours
        } = req.body;

        const invoiceLineItem = await InvoiceLineItem.findByPk(id);

        if (!invoiceLineItem) {
            return res.status(404).json({ err: true, msg: 'Invoice Line Item not found' });
        }

        // Sanitize decimal fields
        const safeDecimal = v => (v === '' || v === undefined || v === null ? 0 : isNaN(Number(v)) ? 0 : Number(v));
        const safeNullableDecimal = v => (v === '' || v === undefined || v === null ? null : isNaN(Number(v)) ? null : Number(v));
        const safeInteger = v => (v === '' || v === undefined || v === null ? null : isNaN(Number(v)) ? null : parseInt(v));

        const _rate = rate !== undefined ? safeDecimal(rate) : invoiceLineItem.rate;
        const _quantity = quantity !== undefined ? safeDecimal(quantity) : invoiceLineItem.quantity;
        const _markup = markup !== undefined ? safeDecimal(markup) : invoiceLineItem.markup;
        const _salesTaxRate = salesTaxRate !== undefined ? safeNullableDecimal(salesTaxRate) : invoiceLineItem.salesTaxRate;
        const _unitPrice = unitPrice !== undefined ? (unitPrice === '' ? _rate : safeDecimal(unitPrice)) : invoiceLineItem.unitPrice;
        const _subTotal = subTotal !== undefined ? (subTotal === '' ? _rate * _quantity : safeDecimal(subTotal)) : invoiceLineItem.subTotal;
        const _taxable = taxable !== undefined ? (typeof taxable === 'string' ? taxable === 'true' : !!taxable) : invoiceLineItem.taxable;
        const _salesTaxTotal = salesTaxTotal !== undefined ? safeDecimal(salesTaxTotal) : (_taxable && _salesTaxRate !== null ? (_subTotal * (_salesTaxRate / 100)) : 0);
        const _totalPrice = totalPrice !== undefined ? (totalPrice === '' ? (_subTotal + _salesTaxTotal + _markup) : safeDecimal(totalPrice)) : invoiceLineItem.totalPrice;

        await invoiceLineItem.update({
            itemId: itemId !== undefined ? safeInteger(itemId) : invoiceLineItem.itemId,
            laborId: laborId !== undefined ? safeInteger(laborId) : invoiceLineItem.laborId,
            name: name !== undefined ? name : invoiceLineItem.name,
            description: description !== undefined ? description : invoiceLineItem.description,
            quantity: _quantity,
            rate: _rate,
            unit: unit !== undefined ? unit : invoiceLineItem.unit,
            subTotal: _subTotal,
            unitPrice: _unitPrice,
            totalPrice: _totalPrice,
            taxable: _taxable,
            markup: _markup,
            userId: userId !== undefined ? userId : invoiceLineItem.userId,
            salesTaxRate: _salesTaxRate,
            salesTaxTotal: _salesTaxTotal,
            lineItemPrice: lineItemPrice !== undefined ? (typeof lineItemPrice === 'string' ? lineItemPrice === 'true' : !!lineItemPrice) : invoiceLineItem.lineItemPrice,
            category: category !== undefined ? category : invoiceLineItem.category,
            pricedBy: pricedBy !== undefined ? pricedBy : invoiceLineItem.pricedBy,
            formulaId: formulaId !== undefined ? safeInteger(formulaId) : invoiceLineItem.formulaId,
            questionId: questionId !== undefined ? safeInteger(questionId) : invoiceLineItem.questionId,
            moduleDescription: moduleDescription !== undefined ? moduleDescription : invoiceLineItem.moduleDescription,
            instructions: instructions !== undefined ? instructions : invoiceLineItem.instructions,
            adHoc: adHoc !== undefined ? (typeof adHoc === 'string' ? adHoc === 'true' : !!adHoc) : invoiceLineItem.adHoc,
            isActive: isActive !== undefined ? (typeof isActive === 'string' ? isActive === 'true' : !!isActive) : invoiceLineItem.isActive,
            hours: hours !== undefined ? safeNullableDecimal(hours) : invoiceLineItem.hours,
            useOvertimeRate: useOvertimeRate !== undefined ? (typeof useOvertimeRate === 'string' ? useOvertimeRate === 'true' : !!useOvertimeRate) : invoiceLineItem.useOvertimeRate,
            standardHours: standardHours !== undefined ? safeNullableDecimal(standardHours) : invoiceLineItem.standardHours,
            overtimeHours: overtimeHours !== undefined ? safeNullableDecimal(overtimeHours) : invoiceLineItem.overtimeHours
        });

        // Recalculate invoice totals after update
        await calculateInvoiceTotals(invoiceLineItem.invoiceId);

        res.status(200).json({ err: false, msg: 'Invoice Line Item successfully updated', invoiceLineItem });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const addInvoiceLineItemToInvoice = async (req, res) => {
    try {
        const { id, invoiceId } = req.body;
        const userId = req.userId;
        const companyId = res.companyId || req.companyId;

        if (!invoiceId || !id) {
            return res.status(400).json({
                err: true,
                msg: 'invoiceId and lineItemId are required'
            });
        }

        const invoice = await Invoice.findByPk(invoiceId, {
            include: [{ model: LineItem, as: 'AssociatedLineItems' }]
        });
        if (!invoice) {
            return res.status(404).json({
                err: true,
                msg: 'Invoice not found'
            });
        }

        const lineItem = await LineItem.findByPk(id);
        if (!lineItem) {
            return res.status(404).json({
                err: true,
                msg: 'LineItem not found'
            });
        }

        // Clone lineItem and create a new InvoiceLineItem with all new fields
        const newInvoiceLineItem = await InvoiceLineItem.create({
            companyId,
            invoiceId,
            lineItemId: id,
            itemId: lineItem.itemId || null,
            laborId: lineItem.laborId || null,
            name: lineItem.name,
            description: lineItem.description || '',
            quantity: lineItem.quantity || 1,
            rate: lineItem.rate || 0,
            unit: lineItem.unit || 'each',
            subTotal: lineItem.subTotal || 0,
            unitPrice: lineItem.unitPrice || lineItem.rate || 0,
            totalPrice: lineItem.totalPrice || lineItem.total || 0,
            taxable: lineItem.taxable !== undefined ? lineItem.taxable : true,
            markup: lineItem.markup || 0,
            userId: userId,
            salesTaxRate: lineItem.salesTaxRate || null,
            salesTaxTotal: lineItem.salesTaxTotal || 0,
            lineItemPrice: lineItem.lineItemPrice !== undefined ? lineItem.lineItemPrice : true,
            category: lineItem.category || 'Material',
            pricedBy: lineItem.pricedBy || 'custom',
            formulaId: lineItem.formulaId || null,
            questionId: lineItem.questionId || null,
            moduleDescription: lineItem.moduleDescription || null,
            instructions: lineItem.instructions || null,
            adHoc: lineItem.adHoc !== undefined ? lineItem.adHoc : false,
            isActive: lineItem.isActive !== undefined ? lineItem.isActive : true,
            hours: lineItem.hours || null,
            useOvertimeRate: lineItem.useOvertimeRate !== undefined ? lineItem.useOvertimeRate : false,
            standardHours: lineItem.standardHours || null,
            overtimeHours: lineItem.overtimeHours || null
        });

        const { subTotal, total } = await calculateInvoiceTotals(invoiceId);

        await invoice.update({ subTotal, total });

        // Generate and upload updated PDF since line items changed
        try {
            await generateAndUploadInvoicePdf(invoiceId);
        } catch (pdfError) {
            console.error('Error regenerating invoice PDF after adding line item:', pdfError.message);
            // Don't throw error for PDF generation failure, just log it
        }

        res.status(201).json({
            err: false,
            msg: 'LineItem successfully added to Invoice',
            invoice,
            invoiceLineItem: newInvoiceLineItem
        });
    } catch (err) {
        console.error('Error adding line item:', err);
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({
                err: true,
                msg: 'Validation error',
                details: err.errors.map(e => e.message)
            });
        }
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const removeInvoiceLineItemFromInvoice = async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Invoice Line Item ID is required'
            });
        }

        const invoiceLineItem = await InvoiceLineItem.findByPk(id);

        if (!invoiceLineItem) {
            return res.status(404).json({ err: true, msg: 'Invoice Line Item not found' });
        }

        const invoiceId = invoiceLineItem.invoiceId;
        
        // Verify invoice exists before proceeding
        const invoice = await Invoice.findByPk(invoiceId);
        if (!invoice) {
            return res.status(404).json({
                err: true,
                msg: 'Associated Invoice not found'
            });
        }
        
        await invoiceLineItem.destroy();

        // Recalculate invoice totals after removal
        await calculateInvoiceTotals(invoiceId);

        // Generate and upload updated PDF since line items changed
        try {
            await generateAndUploadInvoicePdf(invoiceId);
        } catch (pdfError) {
            console.error('Error regenerating invoice PDF after removing line item:', pdfError.message);
            // Don't throw error for PDF generation failure, just log it
        }

        res.status(200).json({ 
            err: false, 
            msg: 'Invoice Line Item successfully removed',
            invoiceId: invoiceId
        });
    } catch (err) {
        console.error('Error removing InvoiceLineItem:', err);
        res.status(400).json({ 
            err: true, 
            msg: err.message 
        });
    }
};
const bulkUpdateInvoices = async (req, res) => {
    try {
        const { ids, status } = req.body;

        await Invoice.update(
            { status },
            {
                where: {
                    id: {
                        [Op.in]: ids
                    }
                }
            }
        );

        res.status(200).json({ err: false, msg: 'Invoices successfully updated' });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const cloneInvoice = async (req, res) => {
    try {
        const { id } = req.body;
        const invoice = await Invoice.findByPk(id, {
            include: [{ model: InvoiceLineItem, as: 'InvoiceLineItems' }]
        });

        if (!invoice) {
            return res.status(404).json({ err: true, msg: 'Invoice not found' });
        }

        const newInvoice = await Invoice.create({
            workOrderId: invoice.workOrderId,
            estimateId: invoice.estimateId,
            clientId: invoice.clientId,
            invoiceNumber: `INV-${Date.now()}`,
            date: new Date(),
            dueDate: invoice.dueDate,
            total: invoice.total,
            status: 'Pending',
            isActive: true,
            createdBy: invoice.createdBy
        });

        for (const lineItem of invoice.InvoiceLineItems) {
            await InvoiceLineItem.create({
                companyId: lineItem.companyId,
                invoiceId: newInvoice.id,
                lineItemId: lineItem.lineItemId,
                itemId: lineItem.itemId,
                laborId: lineItem.laborId,
                name: lineItem.name,
                description: lineItem.description,
                quantity: lineItem.quantity,
                rate: lineItem.rate,
                unit: lineItem.unit,
                subTotal: lineItem.subTotal,
                unitPrice: lineItem.unitPrice,
                totalPrice: lineItem.totalPrice,
                taxable: lineItem.taxable,
                markup: lineItem.markup,
                userId: lineItem.userId,
                salesTaxRate: lineItem.salesTaxRate,
                salesTaxTotal: lineItem.salesTaxTotal,
                lineItemPrice: lineItem.lineItemPrice,
                category: lineItem.category,
                pricedBy: lineItem.pricedBy,
                formulaId: lineItem.formulaId,
                questionId: lineItem.questionId,
                moduleDescription: lineItem.moduleDescription,
                instructions: lineItem.instructions,
                adHoc: lineItem.adHoc,
                isActive: lineItem.isActive,
                hours: lineItem.hours,
                useOvertimeRate: lineItem.useOvertimeRate,
                standardHours: lineItem.standardHours,
                overtimeHours: lineItem.overtimeHours
            });
        }

        res.status(201).json({ err: false, msg: 'Invoice successfully cloned', newInvoice });
    } catch (err) {
        res.status(400).json({ err: true, msg: err.message });
    }
};
const generateInvoice = async (estimateId, workOrderId, userId, companyId, clientId = null, adHocReason) => {
    try {
        let totalAmount = 0;
        let resolvedClientId = clientId;
        let estimate = null;
        let workOrder = null;

        if (estimateId) {
            estimate = await Estimate.findByPk(estimateId, {
                include: [
                    { model: Client, as: 'Client' },
                    {
                        model: EstimateLineItem, as: 'EstimateLineItems',
                        include: [
                            {
                                model: LineItem, as: 'LineItems',
                                include: [
                                    { model: LineItemItem, as: 'AssociatedItems', include: [{ model: Item, as: 'Item' }] }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (estimate) {
                resolvedClientId = resolvedClientId || estimate.clientId;

                // Calculate total from estimate line items instead of payments
                totalAmount = estimate.EstimateLineItems.reduce((sum, lineItem) => {
                    return sum + parseFloat(lineItem.totalPrice || lineItem.total || 0);
                }, 0);
            } else {
                throw new Error('Estimate not found');
            }
        }

        if (workOrderId && !estimateId) {
            workOrder = await WorkOrder.findByPk(workOrderId);
            if (workOrder) {
                totalAmount = parseFloat(workOrder.cost || 0);
                resolvedClientId = resolvedClientId || workOrder.clientId;
            } else {
                throw new Error('Work Order not found');
            }
        }

        if (!resolvedClientId) {
            throw new Error('Client ID is required');
        }

        // Ensure totalAmount is never less than 0
        totalAmount = Math.max(totalAmount, 0);

        // Fetch the company details - use companyId if provided, otherwise get from user
        let company;
        if (companyId) {
            company = await Company.findByPk(companyId);
        } else {
            const user = await User.findByPk(userId);
            if (user?.companyId) {
                company = await Company.findByPk(user.companyId);
            }
        }

        if (!company) {
            throw new Error('Company not found');
        }

        const defaultStatusId = company.invoiceDefaultStatusId || null;

        // Create the InvoicePreferences with default values
        const invoicePreferences = await InvoicePreferences.create({
            email: company.invoiceEmailNotification || false,
            call: company.invoiceCallNotification || false,
            emailDate: company.invoiceEmailNotificationDelay !== null 
                        ? new Date(Date.now() + (company.invoiceEmailNotificationDelay * 24 * 60 * 60 * 1000))
                        : null,
            callDate: company.invoiceCallNotificationDelay !== null 
                        ? new Date(Date.now() + (company.invoiceCallNotificationDelay * 24 * 60 * 60 * 1000))
                        : null,
        });

        const invoice = await Invoice.create({
            estimateId: estimate ? estimate.id : null,
            workOrderId: workOrder ? workOrder.id : null,
            clientId: resolvedClientId,
            companyId: company.id,
            invoiceNumber: `INV-${Date.now()}`,
            total: totalAmount,
            subTotal: totalAmount,
            salesTaxTotal: 0,
            createdBy: userId,
            adHocReason: adHocReason || null,
            invoicePreferenceId: invoicePreferences.id
        });

        // Create an entry in the InvoiceHistory
        await InvoiceHistory.create({
            invoiceId: invoice.id,
            statusId: defaultStatusId,
            amount: totalAmount, // Set the initial amount to the calculated total amount
            createdAt: new Date(),
            updatedAt: new Date()
        });

        if (estimate) {
            for (const estimateLineItem of estimate.EstimateLineItems) {
                await InvoiceLineItem.create({
                    companyId: company.id,
                    invoiceId: invoice.id,
                    lineItemId: estimateLineItem.lineItemId,
                    itemId: estimateLineItem.itemId || null,
                    laborId: estimateLineItem.laborId || null,
                    name: estimateLineItem.name,
                    description: estimateLineItem.description || '',
                    quantity: estimateLineItem.quantity || 1,
                    rate: estimateLineItem.rate || 0,
                    unit: estimateLineItem.unit || 'each',
                    subTotal: estimateLineItem.subTotal || 0,
                    unitPrice: estimateLineItem.unitPrice || estimateLineItem.rate || 0,
                    totalPrice: estimateLineItem.totalPrice || estimateLineItem.total || 0,
                    taxable: estimateLineItem.taxable !== undefined ? estimateLineItem.taxable : true,
                    markup: estimateLineItem.markup || 0,
                    userId: estimateLineItem.userId || userId,
                    salesTaxRate: estimateLineItem.salesTaxRate || null,
                    salesTaxTotal: estimateLineItem.salesTaxTotal || 0,
                    lineItemPrice: estimateLineItem.lineItemPrice !== undefined ? estimateLineItem.lineItemPrice : true,
                    category: estimateLineItem.category || 'Material',
                    pricedBy: estimateLineItem.pricedBy || 'custom',
                    formulaId: estimateLineItem.formulaId || null,
                    questionId: estimateLineItem.questionId || null,
                    moduleDescription: estimateLineItem.moduleDescription || null,
                    instructions: estimateLineItem.instructions || null,
                    adHoc: estimateLineItem.adHoc !== undefined ? estimateLineItem.adHoc : false,
                    isActive: estimateLineItem.isActive !== undefined ? estimateLineItem.isActive : true,
                    hours: estimateLineItem.hours || null,
                    useOvertimeRate: estimateLineItem.useOvertimeRate !== undefined ? estimateLineItem.useOvertimeRate : false,
                    standardHours: estimateLineItem.standardHours || null,
                    overtimeHours: estimateLineItem.overtimeHours || null
                });
            }
        }

        return invoice;
    } catch (error) {
        console.error('Error generating invoice:', error.message);
        throw error;
    }
};
const generateAndUploadInvoicePdf = async (invoiceId, companyId) => {
    try {
        // Get the invoice with all necessary data
        const invoice = await Invoice.findByPk(invoiceId, {
            include: [
                {
                    model: Client,
                    as: 'Client',
                    include: [
                        {
                            model: ClientAddress,
                            as: 'ClientAddresses',
                            include: [{ model: State, as: 'State' }]
                        },
                        {
                            model: ClientEmail,
                            as: 'ClientEmails'
                        },
                        {
                            model: ClientPhoneNumber,
                            as: 'ClientPhoneNumbers'
                        }
                    ]
                },
                {
                    model: InvoiceLineItem,
                    as: 'InvoiceLineItems',
                    include: [
                        {
                            model: LineItem,
                            as: 'LineItem'
                        }
                    ]
                }
            ]
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        // Get company information
        const company = await Company.findByPk(companyId);
        
        // Add company terms and conditions - access the plain object
        const invoiceData = invoice.get ? invoice.get({ plain: true }) : invoice;
        invoiceData.invoiceTermsAndConditions = company ? company.invoiceTermsAndConditions : null;

        // Ensure InvoiceLineItems is an array and transform it
        if (!Array.isArray(invoiceData.InvoiceLineItems)) {
            invoiceData.InvoiceLineItems = [];
        } else {
            // Transform InvoiceLineItems to use their own fields instead of LineItem fields
            invoiceData.InvoiceLineItems = invoiceData.InvoiceLineItems.map(item => {
                const lineItemData = item.get ? item.get({ plain: true }) : item;
                return {
                    ...lineItemData,
                    // Use InvoiceLineItem fields directly, not LineItem fields
                    name: lineItemData.name || (lineItemData.LineItem ? lineItemData.LineItem.name : 'Unnamed Item'),
                    description: lineItemData.description || (lineItemData.LineItem ? lineItemData.LineItem.description : ''),
                    totalPrice: lineItemData.totalPrice || lineItemData.total || (lineItemData.LineItem ? lineItemData.LineItem.total : '0.00'),
                    // Remove LineItem reference to force template to use InvoiceLineItem fields
                    LineItem: null
                };
            });
        }

        // Get client address, email, and phone number
        if (invoice.clientAddressId) {
            const clientAddress = await ClientAddress.findByPk(invoice.clientAddressId, {
                include: [{ model: State, as: 'State' }]
            });
            if (clientAddress) {
                const addressData = clientAddress.get ? clientAddress.get({ plain: true }) : clientAddress;
                invoiceData.clientAddress = {
                    fullAddress: `${addressData.address}, ${addressData.city}, ${addressData.State ? addressData.State.abbreviation : ''} ${addressData.zipCode}`
                };
            }
        }

        if (invoice.billingAddressId) {
            const billingAddress = await ClientAddress.findByPk(invoice.billingAddressId, {
                include: [{ model: State, as: 'State' }]
            });
            if (billingAddress) {
                const billingData = billingAddress.get ? billingAddress.get({ plain: true }) : billingAddress;
                invoiceData.billingAddress = {
                    fullAddress: `${billingData.address}, ${billingData.city}, ${billingData.State ? billingData.State.abbreviation : ''} ${billingData.zipCode}`
                };
            }
        }

        if (invoice.clientEmailId) {
            const clientEmail = await ClientEmail.findByPk(invoice.clientEmailId);
            if (clientEmail) {
                const emailData = clientEmail.get ? clientEmail.get({ plain: true }) : clientEmail;
                invoiceData.clientEmail = { email: emailData.email };
            }
        }

        if (invoice.clientPhoneNumberId) {
            const clientPhoneNumber = await ClientPhoneNumber.findByPk(invoice.clientPhoneNumberId);
            if (clientPhoneNumber) {
                const phoneData = clientPhoneNumber.get ? clientPhoneNumber.get({ plain: true }) : clientPhoneNumber;
                invoiceData.clientPhoneNumber = { 
                    formattedNumber: phoneData.phoneNumber 
                };
            }
        }

        // Get the invoice template - try database first, then fall back to file system
        let invoiceTemplate = await Template.findOne({
            where: { 
                type: 'invoice',
                isActive: true 
            },
            order: [['createdAt', 'DESC']]
        });

        let templateContent;
        if (invoiceTemplate) {
            templateContent = invoiceTemplate.content;
        } else {
            // Fall back to reading from file system
            try {
                const templatePath = path.join(__dirname, '../public/partials/templates/invoices/invoice.html');
                templateContent = fs.readFileSync(templatePath, 'utf8');
            } catch (fileError) {
                throw new Error('Invoice template not found in database or file system');
            }
        }

        // Generate PDF filename
        const filename = `invoice-${invoiceData.invoiceNumber || invoiceData.id}-${Date.now()}.pdf`;

        // Generate the PDF
        const pdfPath = await generateInvoicePdf(
            templateContent,
            invoiceData,
            company,
            filename
        );

        // Upload to Cloudinary
        const { url, publicId } = await uploadInvoicePdfToCloudinary(pdfPath, invoice.id);

        // Update the invoice with the PDF URL
        await invoice.update({ invoiceUrl: url });

        // Save document record
        const document = await Document.create({
            title: `Invoice ${invoiceData.invoiceNumber || invoiceData.id}`,
            url: url,
            publicId: publicId,
            invoiceId: invoice.id,
            clientId: invoice.clientId,
            userId: invoice.createdBy,
            format: 'pdf',
            size: fs.existsSync(pdfPath) ? fs.statSync(pdfPath).size : 0
        });

        return { url, publicId, document };
    } catch (error) {
        console.error('Error generating invoice PDF:', error);
        throw error;
    }
};
const calculateInvoiceTotals = async (invoiceId) => {
    try {
        const invoice = await Invoice.findByPk(invoiceId, {
            include: [{ model: InvoiceLineItem, as: 'InvoiceLineItems' }]
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        let lineItemSubTotal = 0;
        let lineItemSalesTaxTotal = 0;
        let lineItemTotal = 0;

        // Calculate totals from individual line items
        invoice.InvoiceLineItems.forEach(lineItem => {
            const itemSubTotal = parseFloat(lineItem.subTotal || 0);
            const itemSalesTax = parseFloat(lineItem.salesTaxTotal || 0);
            const itemTotal = parseFloat(lineItem.totalPrice || 0);

            lineItemSubTotal += itemSubTotal;
            lineItemSalesTaxTotal += itemSalesTax;
            lineItemTotal += itemTotal;
        });

        // Get invoice-level adjustments
        const invoiceMarkup = parseFloat(invoice.markUp || 0);
        const invoiceSalesTaxRate = parseFloat(invoice.salesTaxRate || 0);

        // Calculate adjusted subtotal (line items subtotal + invoice markup)
        const adjustedSubTotal = lineItemSubTotal + invoiceMarkup;

        // Calculate invoice-level sales tax if applicable
        let invoiceLevelSalesTax = 0;
        if (invoiceSalesTaxRate > 0) {
            // Apply invoice-level tax rate to the adjusted subtotal
            invoiceLevelSalesTax = (adjustedSubTotal * (invoiceSalesTaxRate / 100));
        }

        // Calculate final totals
        const finalSubTotal = adjustedSubTotal;
        const finalSalesTaxTotal = lineItemSalesTaxTotal + invoiceLevelSalesTax;
        const finalTotal = finalSubTotal + finalSalesTaxTotal;

        // Update the invoice with calculated totals
        await invoice.update({
            subTotal: finalSubTotal.toFixed(2),
            salesTaxTotal: finalSalesTaxTotal.toFixed(2),
            total: finalTotal.toFixed(2)
        });

        return { 
            subTotal: finalSubTotal, 
            salesTaxTotal: finalSalesTaxTotal, 
            total: finalTotal,
            lineItemSubTotal,
            lineItemSalesTaxTotal,
            lineItemTotal,
            invoiceMarkup,
            invoiceLevelSalesTax
        };
    } catch (error) {
        console.error('Error calculating invoice totals:', error.message);
        throw error;
    }
};

module.exports = {
    getInvoice,
    getInvoiceLineItem,
    searchInvoices,
    listInvoices,
    createInvoice,
    createInvoiceLineItem,
    updateInvoice,
    updateInvoiceTotal,
    updateInvoiceLineItem,
    addInvoiceLineItemToInvoice,
    removeInvoiceLineItemFromInvoice,
    bulkUpdateInvoices,
    cloneInvoice,
    generateInvoice,
    createInvoicePdf,
    generateAndUploadInvoicePdf
};
