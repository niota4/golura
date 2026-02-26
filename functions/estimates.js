const { 
    Company, 
    Client,
    ClientPhoneNumber,
    ClientEmail,
    ClientNote,
    ClientAddress,
    State,
    PhoneNumber,
    Address,
    Email,
    Estimate, 
    Event,
    EstimatePreference, 
    EstimateHistory,
    EstimateStatus,
    EstimateLineItem,
    EstimateActivity,
    EstimateSignature,
    EstimateFollowUp,
    EstimateTemplate,
    Priority,
    Notification,
    LineItem, 
    LineItemItem,
    Item,
    Image,
    Invoice,
    Video,
    VendorItem,
    Vendor,
    User,
    UserPreference,
    WorkOrder,
    WorkOrderLineItem,
    Template,
    Document

} = require('../models');

const _ = require('lodash');
const { Op } = require('sequelize');
const evaluateFormula = require('../helpers/formula');
const { calculateWorkOrderTotalCost } = require('./workOrders');
const { createNotification, updateNotification } = require('./notifications');
const { getEstimateNotificationUsers, sendNotificationsToUsers } = require('../helpers/notificationHelpers');
const { sendEstimateCreationEmail, sendEstimateSignedEmail } = require('../helpers/emails');
const { generateWorkOrder } = require('./workOrders');
const { generateInvoice } = require('./invoices');
const { generateEstimatePdf } = require('../helpers/pdf');
const { uploadEstimatePdfToCloudinary } = require('../helpers/upload');
const { stat } = require('fs-extra');
const { re } = require('mathjs');
const { includes } = require('lodash');
const e = require('cors');
const { read } = require('fs');
const fs = require('fs');
const path = require('path');

const get = async (req, res) => {
    try {
        const { id } = req.body;

        const estimate = await Estimate.findOne({
            where: { id: id, isActive: true },
            include: [
                {
                    model: EstimatePreference,
                    as: 'EstimatePreference'
                },
                {
                    model: EstimateStatus,
                    as: 'EstimateStatus'
                },
                {
                    model: Client,
                    as: 'Client',
                    include: [
                        {
                            model: ClientAddress,
                            as: 'ClientAddresses',
                            include: [
                                {
                                    model: State,
                                    as: 'State'
                                }
                            ]
                        },
                        {
                            model: ClientEmail,
                            as: 'ClientEmails'
                        },
                        {
                            model: ClientNote,
                            as: 'ClientNotes'
                        },
                        {
                            model: ClientPhoneNumber,
                            as: 'ClientPhoneNumbers'
                        }
                    ]
                },
                {
                    model: EstimateFollowUp,
                    as: 'EstimateFollowUps',
                    include: [
                        {
                            model: User,
                            as: 'CompletedBy',
                            attributes: ['id', 'firstName', 'lastName', 'email'],
                            include: [
                                { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                            ]
                        },
                        {
                            model: User,
                            as: 'Creator',
                            attributes: ['id', 'firstName', 'lastName', 'email'],
                            include: [
                                { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                            ]
                        }
                    ]
                },
                {
                    model: Event,
                    as: 'Event'
                },
                {
                    model: EstimateLineItem,
                    as: 'EstimateLineItems',
                    include: [
                        {
                            model: LineItem,
                            as: 'LineItem',
                        }
                    ]
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
                    model: EstimateSignature,
                    as: 'EstimateSignature'
                },
                {
                    model: Image,
                    as: 'Images'
                },
                {
                    model: Video,
                    as: 'Videos'
                }
            ]
        });

        if (!estimate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate not found'
            });
        }

        // Fetch associated client phone number, email, and addresses
        const clientPhoneNumber = estimate.clientPhoneNumberId 
            ? await ClientPhoneNumber.findByPk(estimate.clientPhoneNumberId) 
            : null;
        const clientEmail = estimate.clientEmailId 
            ? await ClientEmail.findByPk(estimate.clientEmailId) 
            : null;
        const clientAddress = estimate.clientAddressId 
            ? await ClientAddress.findByPk(estimate.clientAddressId, {
                include: [{ model: State, as: 'State' }]
              }) 
            : null;
        const billingAddress = estimate.billingAddressId 
            ? await ClientAddress.findByPk(estimate.billingAddressId, {
                include: [{ model: State, as: 'State' }]
              }) 
            : null;

        // Fetch the company to get the minimumEstimatePaymentPercentage
        const company = await Company.findByPk(res.companyId);
        const minimumEstimatePaymentPercentage = company ? company.minimumEstimatePaymentPercentage : 0;
        const estimateTermsAndConditions = company ? company.estimateTermsAndConditions : null;
        
        // Calculate the dueNow amount and format it to 2 decimal places
        const dueNow = parseFloat((estimate.total * minimumEstimatePaymentPercentage / 100).toFixed(2));

        // Add the dueNow amount to the estimate object - use plain object to avoid issues
        const estimateData = estimate.get ? estimate.get({ plain: true }) : estimate;
        estimateData.dueNow = dueNow;
        estimateData.estimateTermsAndConditions = estimateTermsAndConditions;
        estimateData.clientPhoneNumber = clientPhoneNumber ? (clientPhoneNumber.get ? clientPhoneNumber.get({ plain: true }) : clientPhoneNumber) : null;
        estimateData.clientEmail = clientEmail ? (clientEmail.get ? clientEmail.get({ plain: true }) : clientEmail) : null;
        estimateData.clientAddress = clientAddress ? (clientAddress.get ? clientAddress.get({ plain: true }) : clientAddress) : null;
        estimateData.billingAddress = billingAddress ? (billingAddress.get ? billingAddress.get({ plain: true }) : billingAddress) : null;

        res.status(200).json({
            err: false,
            msg: 'Estimate successfully retrieved',
            estimate: estimateData
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const getEstimatePhotos = async (req, res) => {
    const { id, clientId, eventId } = req.body;

    if (!clientId) {
        return res.send({
            err: true,
            msg: 'clientId is required'
        });
    }

    if (!id) {
        return res.send({
            err: true,
            msg: 'estimateId is required'
        });
    }

    try {
        let filter = {
            clientId,
            estimateId: id
        };

        if (eventId) {
            filter.eventId = eventId;
        } else {
            filter.eventId = {
                [Op.or]: [null, eventId]
            };
        }

        const images = await Image.findAll({
            where: filter
        });

        res.status(201).send({
            err: false,
            msg: 'Estimate Images successfully retrieved',
            images: images
        });
    } catch (err) {
        res.send({
            err: true,
            msg: 'Error processing images',
            details: err
        });
    }
};
const getEstimateVideos = async (req, res) => {
    const { id, clientId, eventId } = req.body;

    if (!clientId) {
        return res.status(400).send({
            err: true,
            msg: 'clientId is required'
        });
    }

    if (!id) {
        return res.status(400).send({
            err: true,
            msg: 'estimateId is required'
        });
    }

    try {
        let filter = {
            clientId,
            estimateId: id
        };

        if (eventId) {
            filter.eventId = eventId;
        } else {
            filter.eventId = {
                [Op.or]: [null, eventId]
            };
        }

        const videos = await Video.findAll({
            where: filter
        });

        res.status(201).send({
            err: false,
            msg: 'Estimate Videos successfully retrieved',
            videos: videos
        });
    } catch (err) {
        res.status(500).send({
            err: true,
            msg: 'Error processing videos',
            details: err
        });
    }
};
const getLineItem = async (req, res) => {
    try {
        const lineItem = await LineItem.findOne({
            where: {
                id: req.body.id
            },
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
        if (lineItem) {
            // Convert DECIMAL fields to floats
            lineItem.rate = parseFloat(lineItem.rate);
            lineItem.subTotal = parseFloat(lineItem.subTotal);
            lineItem.total = parseFloat(lineItem.total);
            lineItem.markup = parseFloat(lineItem.markup);
            lineItem.salesTaxRate = lineItem.salesTaxRate !== null ? parseFloat(lineItem.salesTaxRate) : null;
            lineItem.salesTaxTotal = lineItem.salesTaxTotal !== null ? parseFloat(lineItem.salesTaxTotal) : null;

            res.status(201).json({
                err: false,
                msg: 'Line Item successfully retrieved',
                lineItem: lineItem
            });
        } else {
            res.json({
                err: true,
                msg: 'Line Item not found'
            });
        }
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const getEstimateTemplate = async (req, res) => {
    try {
        const { id } = req.body;

        const estimateTemplate = await EstimateTemplate.findOne({
            where: { id: id, isActive: true, },
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
            ]
        });
        
        if (!estimateTemplate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate Template not found'
            });
        }
        res.status(200).json({
            err: false,
            msg: 'Estimate Template successfully retrieved',
            estimateTemplate
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listItems = async (req, res) => {
    const query = req.body.query || '';
    const page = req.body.page || 1;
    const limit = req.body.limit || 100;
    const offset = (page - 1) * limit;

    try {
        const items = await Item.findAndCountAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${query}%` } },
                    { description: { [Op.like]: `%${query}%` } }
                ]
            },
            include: [
                {
                    model: VendorItem,
                    as: 'VendorItems',
                    include: [
                        {
                            model: Vendor,
                            as: 'Vendor'
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.status(200).json({
            err: false,
            msg: 'Items successfully retrieved',
            total: items.count,
            pages: Math.ceil(items.count / limit),
            items: items.rows
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listLineItems = async (req, res) => {
    try {
        const lineItems = await LineItem.findAll({
            include: [
                {
                    model: Item,
                    as: 'Items'
                }
            ]
        });

        res.status(200).json({
            err: false,
            msg: 'Line items successfully retrieved',
            lineItems
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listAdHocLineItems = async (req, res) => {
    try {
        const lineItems = await LineItem.findAll({
            where: { adHoc: true},
            include: [
                {
                    model: Item,
                    as: 'Items'
                }
            ]
        });

        res.status(200).json({
            err: false,
            msg: 'Line items successfully retrieved',
            lineItems
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listEstimateStatuses = async (req, res) => {
    try {
        const estimateStatuses = await EstimateStatus.findAll();

        res.status(200).json({
            err: false,
            msg: 'Estimate Statuses successfully retrieved',
            estimateStatuses
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listEstimateTemplates = async (req, res) => {
    try {
        const estimateTemplates = await EstimateTemplate.findAll({
            where: { isActive: true },
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            err: false,
            msg: 'Estimate templates successfully retrieved',
            estimateTemplates
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listEstimateFollowUps = async (req, res) => {
    try {
        const { id } = req.body;
        const estimateFollowUps = await EstimateFollowUp.findAll({
            where: { id },
            include: [
                {
                    model: User,
                    as: 'CompletedBy',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                }
            ],
            order: [['scheduledDate', 'ASC']]
        });
        res.status(200).json({
            err: false,
            msg: 'Estimate Follow Ups successfully retrieved',
            estimateFollowUps
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const create = async (req, res) => {
    try {
        const { clientId, eventId, adHocReason } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({
                err: true,
                msg: 'userId are required'
            });
        }

        const estimate = await generateEstimate(req.companyId, clientId, eventId, userId, adHocReason);

        res.status(201).json({
            err: false,
            msg: 'Estimate successfully created',
            estimate
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createLineItem = async (req, res) => {
    try {
        const { 
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
            questionId,
            formulaId,
            pricedBy,// Default to 'variable' if not provided
            adHoc,
            instructions 
        } = req.body;

        
        let updatedQuestionId = questionId;
        let updatedFormulaId = formulaId;

        if (!pricedBy) {
            return res.status(400).json({
                err: true,
                msg: 'pricedBy is required'
            });
        };
        switch (pricedBy) {
            case 'formula':
                if (!formulaId) {
                    return res.status(400).json({
                        err: true,
                        msg: 'formulaId is required when pricedBy is formula'
                    });
                }
                updatedQuestionId = null; // Ensure questionId is null when pricedBy is formula
            break;
            case 'question':
                if (!questionId) {
                    return res.status(400).json({
                        err: true,
                        msg: 'questionId is required when pricedBy is question'
                    });
                }
                updatedFormulaId = null; // Ensure formulaId is null when pricedBy is question
            break;

        }
        const newLineItem = await LineItem.create({
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
            pricedBy,
            updatedQuestionId,
            updatedFormulaId,
            adHoc,
            instructions,
            userId: req.userId
        });

        res.status(201).json({
            err: false,
            msg: 'Line Item successfully created',
            lineItem: newLineItem
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createEstimateFollowUp = async (req, res) => {

    try {
        const { 
            estimateId,
            eventId,
            parentEventId,
            notes, 
            type, 
            scheduledDate, 
            completedBy, 
            completedAt 
        } = req.body;
        const userId = req.userId; // Assuming req.userId contains the authenticated user's ID

        if (!estimateId || !scheduledDate || !type) {
            return res.status(400).json({
                err: true,
                msg: 'estimateId, notes, and date are required'
            });
        }
        // Validate followUpDate format
        if (isNaN(new Date(scheduledDate).getTime())) {
            return res.status(400).json({
                err: true,
                msg: 'Invalid followUpDate format'
            });
        }
        const estimate = await Estimate.findByPk(estimateId);
        if (!estimate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate not found'
            });
        }

        // Create the Estimate Follow Up entry
        const estimateFollowUp = await EstimateFollowUp.create({
            estimateId,
            eventId,
            parentEventId,
            notes,
            type,
            scheduledDate,
            completedBy,
            completedAt: completedAt ? new Date(completedAt) : null,
            createdBy: userId
        });
        // If completedAt is provided, update the completedAt field
        if (completedAt) {
            estimateFollowUp.completedAt = new Date(completedAt);
            await estimateFollowUp.save();
        };
        
        res.status(201).json({
            err: false,
            msg: 'Estimate Follow Up successfully created',
            estimateFollowUp
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: 'Failed to create Estimate Follow Up',
            details: err.message
        });
    }
};  
const createEstimateLineItem = async (req, res) => {
    try {

        const {
            estimateId,
            name,
            description,
            category = 'Material',
            quantity = 1,
            hours,
            rate = 0,
            totalPrice = 0,
            unit = 'each',
            taxable = true,
            markup = 0,
            laborId,
            useOvertimeRate = false,
            pricedBy = 'custom',
            formulaId,
            questionId,
            standardHours,
            overtimeHours
        } = req.body;

        const userId = req.userId;

        // Sanitize decimal fields
        const safeDecimal = v => (v === '' || v === undefined || v === null ? 0 : isNaN(Number(v)) ? 0 : Number(v));
        const safeNullableDecimal = v => (v === '' || v === undefined || v === null ? null : isNaN(Number(v)) ? null : Number(v));

        // Validate required fields
        if (!estimateId || !name) {
            return res.status(400).json({
                err: true,
                msg: 'estimateId and name are required'
            });
        }

        // Verify estimate exists
        const estimate = await Estimate.findByPk(estimateId);
        if (!estimate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate not found'
            });
        }

        // Calculate and sanitize fields
        const _rate = safeDecimal(rate);
        const _quantity = safeDecimal(quantity);
        const _hours = safeDecimal(hours);
        const _markup = safeDecimal(markup);
        const _totalPrice = safeDecimal(totalPrice);
        const _taxable = typeof taxable === 'string' ? taxable === 'true' : !!taxable;
        const _salesTaxRate = safeNullableDecimal(req.body.salesTaxRate);
        const _salesTaxTotal = _taxable && _salesTaxRate !== null ? (_totalPrice * (_salesTaxRate / 100)) : 0;
        const _total = _totalPrice === 0 ? (_rate * (_hours || _quantity) + _salesTaxTotal + _markup) : _totalPrice;

        // Create the EstimateLineItem
        const estimateLineItem = await EstimateLineItem.create({
            estimateId,
            name,
            description: description || '',
            category,
            quantity: _hours || _quantity,
            hours: _hours,
            rate: _rate,
            unitPrice: _rate,
            totalPrice: _totalPrice,
            unit,
            taxable: _taxable,
            markup: _markup,
            laborId,
            useOvertimeRate,
            pricedBy,
            formulaId,
            questionId,
            standardHours,
            overtimeHours,
            userId,
            subTotal: _totalPrice,
            total: _total,
            salesTaxRate: _salesTaxRate,
            salesTaxTotal: _salesTaxTotal,
            isActive: true
        });

        // Recalculate estimate totals
        const { subTotal, total } = await calculateEstimateTotals(estimateId);
        await estimate.update({ subTotal, total });

        res.status(201).json({
            err: false,
            msg: 'Estimate Line Item successfully created',
            estimateLineItem
        });
    } catch (err) {
        console.error('Error creating EstimateLineItem:', err);
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createEstimateTemplate = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            markUp,
            salesTaxRate,
            itemize,
            lineItemPrice,
            lineItemIds,
            imageIds,
            videoIds,
            documentIds,
            memo,
            tags
        } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                err: true,
                msg: 'Template name is required'
            });
        }

        // Create the estimate template
        const estimateTemplate = await EstimateTemplate.create({
            name,
            description,
            category,
            markUp,
            salesTaxRate,
            itemize,
            lineItemPrice,
            lineItemIds,
            imageIds,
            videoIds,
            documentIds,
            memo,
            tags,
            isActive: true, // Default to true
            creatorId: req.userId, // Assuming req.userId contains the authenticated user's ID
            companyId: req.companyId // Assuming req.companyId contains the user's company ID
        });

        res.status(201).json({
            err: false,
            msg: 'Estimate template successfully created',
            estimateTemplate
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: 'Failed to create estimate template',
            details: err
        });
    }
};
const createEstimatePdf = async (req, res) => {
    try {
        const { estimateId } = req.body;

        if (!estimateId) {
            return res.status(400).json({
                err: true,
                msg: 'estimateId is required'
            });
        }
        await generateAndUploadEstimatePdf(estimateId, res.companyId);

        res.status(201).json({
            err: false,
            msg: 'Estimate PDF successfully created and uploaded'
        });
    } catch (err) {
        console.error('Error creating Estimate PDF:', err);
        res.status(400).json({
            err: true,
            msg: 'Failed to create Estimate PDF',
            details: err.message
        });
    }
};
const update = async (req, res) => {
    try {
        const {
            id,
            clientId,
            eventId,
            statusId,
            estimatePreferenceId,
            assignedUserId,
            clientPhoneNumberId,
            clientEmailId,
            clientAddressId,
            billingAddressId,
            estimateNumber,
            markUp,
            salesTaxRate,
            lineItemPrice,
            salesTaxTotal,
            subTotal,
            discountTotal,
            total,
            converted,
            memo,
            adHocReason,
            itemize,
        } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: "Estimate ID is required.",
            });
        }

        const estimate = await Estimate.findOne({ where: { id } });
        if (!estimate) {
            return res.status(404).json({
                err: true,
                msg: "Estimate not found.",
            });
        }

        const oldEstimateData = estimate.toJSON();
        const changes = {};

        const formatValueForDescription = async (field, value) => {
            switch (field) {
                case 'clientId': {
                    const client = value ? await Client.findByPk(value) : null;
                    return client ? `${client.firstName} ${client.lastName}` : 'Client Not Found';
                }
                case 'eventId': {
                    const event = value ? await Event.findByPk(value) : null;
                    return event ? event.name : 'Event Not Found';
                }
                case 'statusId': {
                    const status = value ? await EstimateStatus.findByPk(value) : null;
                    return status ? status.name : 'Status Not Found';
                }
                case 'estimatePreferenceId': {
                    const preference = value ? await EstimatePreference.findByPk(value) : null;
                    return preference ? preference.name : 'Preference Not Found';
                }
                case 'assignedUserId': {
                    const user = value ? await User.findByPk(value) : null;
                    return user ? `${user.firstName} ${user.lastName}` : 'User Not Found';
                }
                case 'clientPhoneNumberId': {
                    const phoneNumber = value ? await ClientPhoneNumber.findByPk(value) : await PhoneNumber.findByPk(value);
                    return phoneNumber ? phoneNumber.number : 'Phone Number Not Found';
                }
                case 'clientEmailId': {
                    const email = value ? await Email.findByPk(value) : null;
                    return email ? email.address : 'Email Not Found';
                }
                case 'clientAddressId': {
                    const address = value ? await Address.findByPk(value) : null;
                    return address ? `${address.street}, ${address.city}` : 'Address Not Found';
                }
                case 'billingAddressId': {
                    const billingAddress = value ? await Address.findByPk(value) : null;
                    return billingAddress ? `${billingAddress.street}, ${billingAddress.city}` : 'Billing Address Not Found';
                }
                case 'estimateNumber': {
                    return value || 'Estimate Number Not Found';
                }
                case 'estimateSignatureId': {
                    const signature = value ? await EstimateSignature.findByPk(value) : null;
                    return signature ? signature.name : 'Signature Not Found';
                }
                case 'markUp': {
                    return value !== undefined ? `${value}%` : 'Mark Up Not Found';
                }
                case 'salesTaxRate': {
                    return value !== undefined ? `${value}%` : 'Sales Tax Rate Not Found';
                }
                case 'salesTaxTotal': {
                    return value !== undefined ? `$${value}` : 'Sales Tax Total Not Found';
                }
                case 'subTotal': {
                    return value !== undefined ? `$${value}` : 'Sub Total Not Found';
                }
                case 'discountTotal': {
                    return value !== undefined ? `$${value}` : 'Discount Total Not Found';
                }
                case 'total': {
                    return value !== undefined ? `$${value}` : 'Total Not Found';
                }
                case 'converted': {
                    return value !== undefined ? (value ? 'Yes' : 'No') : 'Conversion Status Not Found';
                }
                case 'memo': {
                    return value || 'No Memo Provided';
                }
                case 'adHocReason': {
                    return value || 'No Ad Hoc Reason Provided';
                }
                case 'itemize': {
                    return value !== undefined ? (value ? 'Itemized' : 'Not Itemized') : 'Itemization Status Not Found';
                }
                default:
                    return value;
            }
        };
        const compareAndUpdate = async (field, newValue) => {
            const oldValue = oldEstimateData[field];
            if (newValue !== oldValue) {
                const formattedOldValue = await formatValueForDescription(field, oldValue);
                const formattedNewValue = await formatValueForDescription(field, newValue);

                changes[field] = {
                    oldValue: oldValue || null,
                    newValue: newValue || null,
                    description: `${formattedOldValue || oldValue} was changed to ${formattedNewValue || newValue}`,
                };

                // Notification logic for specific fields
                if (field === 'statusId' || field === 'assignedUserId') {
                    const notificationMessage =
                        field === 'statusId'
                            ? `Esitmate ${estimate.estimateNumber}'s Status changed to ${formattedNewValue}`
                            : `You have been assigned to Estimate ${estimate.estimateNumber}`;

                    const targetUserId = field === 'assignedUserId' ? newValue : estimate.assignedUserId;

                    if (targetUserId) {
                        await createNotification({
                            body: {
                                userId: req.userId,
                                targetUserId,
                                relatedModel: 'Estimate',
                                relatedModelId: id,
                                priorityId: 1, // Default priority
                                title: field === 'statusId' ? 'An Estimate your assigned too has changed status' : 
                                'New Estimate Assignment',
                                type: 'general',
                                message: notificationMessage,
                            },
                        });
                    }
                }
                return newValue;
            }
            return oldValue;
        };

        // Update fields and track changes
        estimate.clientId = await compareAndUpdate('clientId', clientId);
        estimate.eventId = await compareAndUpdate('eventId', eventId);
        estimate.statusId = await compareAndUpdate('statusId', statusId);
        estimate.estimatePreferenceId = await compareAndUpdate('estimatePreferenceId', estimatePreferenceId);
        estimate.assignedUserId = await compareAndUpdate('assignedUserId', assignedUserId);
        estimate.clientPhoneNumberId = await compareAndUpdate('clientPhoneNumberId', clientPhoneNumberId);
        estimate.clientEmailId = await compareAndUpdate('clientEmailId', clientEmailId);
        estimate.clientAddressId = await compareAndUpdate('clientAddressId', clientAddressId);
        estimate.billingAddressId = await compareAndUpdate('billingAddressId', billingAddressId);
        estimate.estimateNumber = await compareAndUpdate('estimateNumber', estimateNumber);
        estimate.markUp = await compareAndUpdate('markUp', markUp);
        estimate.salesTaxRate = await compareAndUpdate('salesTaxRate', salesTaxRate);
        estimate.salesTaxTotal = await compareAndUpdate('salesTaxTotal', salesTaxTotal);
        estimate.lineItemPrice = await compareAndUpdate('lineItemPrice', lineItemPrice);
        estimate.subTotal = await compareAndUpdate('subTotal', subTotal);
        estimate.discountTotal = await compareAndUpdate('discountTotal', discountTotal);
        estimate.total = await compareAndUpdate('total', total);
        estimate.converted = await compareAndUpdate('converted', converted);
        estimate.memo = await compareAndUpdate('memo', memo);
        estimate.adHocReason = await compareAndUpdate('adHocReason', adHocReason);
        estimate.itemize = await compareAndUpdate('itemize', itemize);

        // Recalculate totals based on line items and applied rates
        const estimateLineItems = await EstimateLineItem.findAll({
            where: { estimateId: id, isActive: true }
        });

        // Calculate subtotal from line items if not explicitly provided or if no line items exist
        let calculatedSubTotal = 0;
        for (const lineItem of estimateLineItems) {
            calculatedSubTotal += parseFloat(lineItem.totalPrice || lineItem.total || 0);
        }

        // Use provided subtotal or calculated subtotal from line items
        const finalSubTotal = subTotal !== undefined ? parseFloat(subTotal) : calculatedSubTotal;
        
        // Update subtotal if it was calculated from line items
        if (subTotal === undefined) {
            estimate.subTotal = calculatedSubTotal;
        }

        // Always recalculate total based on subtotal, markup, taxes, and discounts
        let calculatedTotal = finalSubTotal;

        // Apply markup percentage
        if (estimate.markUp && estimate.markUp > 0) {
            const markupAmount = calculatedTotal * (parseFloat(estimate.markUp) / 100);
            calculatedTotal += markupAmount;
        }

        // Apply sales tax
        if (estimate.salesTaxRate && estimate.salesTaxRate > 0) {
            const salesTaxAmount = calculatedTotal * (parseFloat(estimate.salesTaxRate) / 100);
            calculatedTotal += salesTaxAmount;
            
            // Update salesTaxTotal if not explicitly provided
            if (salesTaxTotal === undefined) {
                estimate.salesTaxTotal = salesTaxAmount;
            }
        } else if (estimate.salesTaxTotal && estimate.salesTaxTotal > 0) {
            // Use explicit sales tax total if provided
            calculatedTotal += parseFloat(estimate.salesTaxTotal);
        }

        // Subtract discount
        if (estimate.discountTotal && estimate.discountTotal > 0) {
            calculatedTotal -= parseFloat(estimate.discountTotal);
        }

        // Always update total with calculated value
        estimate.total = Math.max(0, calculatedTotal); // Ensure total is not negative

        // Track calculated changes
        if (subTotal === undefined && calculatedSubTotal !== parseFloat(oldEstimateData.subTotal || 0)) {
            changes['subTotal'] = {
                oldValue: oldEstimateData.subTotal,
                newValue: estimate.subTotal,
                description: `Subtotal recalculated from line items: $${oldEstimateData.subTotal || 0} to $${estimate.subTotal}`
            };
        }

        if (salesTaxTotal === undefined && estimate.salesTaxTotal !== parseFloat(oldEstimateData.salesTaxTotal || 0)) {
            changes['salesTaxTotal'] = {
                oldValue: oldEstimateData.salesTaxTotal,
                newValue: estimate.salesTaxTotal,
                description: `Sales tax total recalculated: $${oldEstimateData.salesTaxTotal || 0} to $${estimate.salesTaxTotal}`
            };
        }

        // Always track total changes since we always recalculate it
        if (estimate.total !== parseFloat(oldEstimateData.total || 0)) {
            changes['total'] = {
                oldValue: oldEstimateData.total,
                newValue: estimate.total,
                description: `Total recalculated: $${oldEstimateData.total || 0} to $${estimate.total}`
            };
        }

        // Save changes with context for afterUpdate hooks
        await estimate.save({
            individualHooks: true,
            context: {
                changes,
                changedBy: req.userId,
            },
        });

        try {
            await generateAndUploadEstimatePdf(id, res.companyId);
        } catch (pdfError) {
            console.error('Error regenerating estimate PDF:', pdfError.message);
            // Don't throw error for PDF generation failure, just log it
        }

        return res.status(200).json({
            err: false,
            msg: "Estimate updated successfully.",
            changes,
        });
    } catch (error) {
        console.error("Error updating estimate:", error);
        return res.status(500).json({
            err: true,
            msg: "Failed to update estimate.",
            error: error.message,
        });
    }
};
const updateEstimateLineItem = async (req, res) => {
    try {

        const {
            id,
            rate,
            unit,
            subTotal,
            total,
            taxable,
            markup,
            name,
            salesTaxRate,
            salesTaxTotal,
            moduleDescription,
            instructions,
            lineItemPrice,
            isActive,
            sortOrder,
            userId // Assuming userId is passed to track changes
        } = req.body;

        let description = req.body.description || '';

        // Sanitize decimal fields
        const safeDecimal = v => (v === '' || v === undefined || v === null ? 0 : isNaN(Number(v)) ? 0 : Number(v));
        const safeNullableDecimal = v => (v === '' || v === undefined || v === null ? null : isNaN(Number(v)) ? null : Number(v));
        const _rate = safeDecimal(rate);
        const _markup = safeDecimal(markup);
        const _salesTaxRate = safeNullableDecimal(salesTaxRate);
        const _subTotal = subTotal === '' ? _rate : safeDecimal(subTotal);
        const _taxable = typeof taxable === 'string' ? taxable === 'true' : !!taxable;
        const _salesTaxTotal = _taxable && _salesTaxRate !== null ? (_subTotal * (_salesTaxRate / 100)) : 0;
        const _total = total === '' ? (_subTotal + _salesTaxTotal + _markup) : safeDecimal(total);

        const estimateLineItem = await EstimateLineItem.findByPk(id);
        if (!estimateLineItem) {
            return res.status(404).json({
                err: true,
                msg: 'EstimateLineItem not found'
            });
        }

        // Track changes for logging in EstimateActivity
        const changes = {};
        const formatValueForDescription = async (field, value) => {
            switch (field) {
                case 'rate': {
                    return value !== undefined ? `$${value}` : 'Rate Not Found';
                }
                case 'unit': {
                    return value || 'Unit Not Found';
                }
                case 'subTotal': {
                    return value !== undefined ? `$${value}` : 'Sub Total Not Found';
                }
                case 'total': {
                    return value !== undefined ? `$${value}` : 'Total Not Found';
                }
                case 'taxable': {
                    return value !== undefined ? (value ? 'Yes' : 'No') : 'Taxable Status Not Found';
                }
                case 'markup': {
                    return value !== undefined ? `${value}%` : 'Markup Not Found';
                }
                case 'name': {
                    return value || 'Name Not Found';
                }
                case 'description': {
                    return value || 'Description Not Found';
                }
                case 'salesTaxRate': {
                    return value !== undefined ? `${value}%` : 'Sales Tax Rate Not Found';
                }
                case 'salesTaxTotal': {
                    return value !== undefined ? `$${value}` : 'Sales Tax Total Not Found';
                }
                case 'lineItemPrice': {
                    return value !== undefined ? `$${value}` : 'Line Item Price Not Found';
                }
                case 'moduleDescription': {
                    return value || 'Module Description Not Found';
                }
                case 'instructions': {
                    return value || 'Instructions Not Found';
                }
                case 'isActive': {
                    return value !== undefined ? (value ? 'Active' : 'Inactive') : 'Active Status Not Found';
                }
                case 'sortOrder': {
                    return value !== undefined ? value.toString() : 'Sort Order Not Found';
                }
                default:
                    return value;
            }
        };
        const fields = {
            rate: _rate,
            unit,
            subTotal: _subTotal,
            total: _total,
            taxable: _taxable,
            markup: _markup,
            name,
            description,
            salesTaxRate: _salesTaxRate,
            salesTaxTotal: _salesTaxTotal,
            lineItemPrice,
            moduleDescription,
            instructions,
            isActive,
            sortOrder
        };

        for (const field in fields) {
            if (fields[field] !== undefined && fields[field] !== estimateLineItem[field]) {
                changes[field] = {
                    oldValue: estimateLineItem[field],
                    newValue: fields[field],
                };
            }
        }
        // Update fields in the EstimateLineItem
        await estimateLineItem.update(fields);

        // Recalculate the totals for the associated estimate
        const { subTotal: updatedSubTotal, total: updatedTotal } = await calculateEstimateTotals(estimateLineItem.estimateId);

        const estimate = await Estimate.findByPk(estimateLineItem.estimateId);
        await estimate.update({ subTotal: updatedSubTotal, total: updatedTotal });

        // Log changes in EstimateActivity
        for (const field in changes) {
            await EstimateActivity.create({
                estimateId: estimateLineItem.estimateId,
                relatedModel: 'EstimateLineItem',
                relatedModelId: estimateLineItem.id,
                action: 'UPDATE',
                description: `${field} was updated from ${await formatValueForDescription(field, changes[field].oldValue)} to ${await formatValueForDescription(field, changes[field].newValue)}`,
                fieldName: field,
                oldValue: changes[field].oldValue,
                newValue: changes[field].newValue,
                changedBy: userId,
                timestamp: new Date()
            });
        }

        // Generate and upload updated PDF since line items changed
        try {
            await generateAndUploadEstimatePdf(estimateLineItem.estimateId, estimate.companyId);
        } catch (pdfError) {
            console.error('Error regenerating estimate PDF after line item update:', pdfError.message);
            // Don't throw error for PDF generation failure, just log it
        }

        res.status(200).json({
            err: false,
            msg: 'EstimateLineItem successfully updated',
            estimateLineItem,
        });
    } catch (err) {
        console.error('Error updating EstimateLineItem:', err);
        res.status(400).json({
            err: true,
            msg: err.message,
        });
    }
};
const updateLineItem = async (req, res) => {
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
            pricedBy,
            questionId,
            formulaId,
            salesTaxRate, 
            salesTaxTotal, 
            moduleDescription, 
            instructions 
        } = req.body;

        const lineItem = await LineItem.findByPk(id);

        if (!lineItem) {
            return res.status(404).json({
                err: true,
                msg: 'Line Item not found'
            });
        }

        await lineItem.update({
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
            pricedBy,
            questionId,
            formulaId,
            salesTaxRate,
            salesTaxTotal,
            moduleDescription,
            instructions
        });

        res.status(200).json({
            err: false,
            msg: 'Line Item successfully updated',
            lineItem
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const updateLineItemItemQuantity = async (req, res) => {
    try {
        const { id, newQuantity } = req.body;

        // Validate input
        if (!id || newQuantity == null) {
            return res.status(400).json({
                err: true,
                msg: 'id and newQuantity are required'
            });
        }

        // Find the LineItemItem entry to be updated
        const lineItemItem = await LineItemItem.findByPk(id);

        if (!lineItemItem) {
            return res.status(404).json({
                err: true,
                msg: 'LineItemItem not found'
            });
        }

        // Update the quantity
        lineItemItem.quantity = newQuantity > 0 ? newQuantity : 1; // Default to 1 if newQuantity is 0 or less
        await lineItemItem.save();

        res.status(200).json({
            err: false,
            msg: 'LineItemItem quantity updated successfully',
            lineItemItem
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const updateEstimateTemplate = async (req, res) => {
    try {
        const {
            id,
            name,
            description,
            category,
            markUp,
            salesTaxRate,
            itemize,
            lineItemPrice,
            lineItemIds,
            imageIds,
            videoIds,
            documentIds,
            memo,
            tags
        } = req.body;

        // Validate required fields
        if (!id || !name) {
            return res.status(400).json({
                err: true,
                msg: 'Template ID and name are required'
            });
        }
        // Find the existing estimate template
        const estimateTemplate = await EstimateTemplate.findByPk(id);
        if (!estimateTemplate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate template not found'
            });
        }
        // Update the estimate template
        await estimateTemplate.update({
            name,
            description,
            category,
            markUp,
            salesTaxRate,
            itemize,
            lineItemPrice,
            lineItemIds,
            imageIds,
            videoIds,
            documentIds,
            memo,
            tags,
        });
        res.status(200).json({
            err: false,
            msg: 'Estimate template successfully updated',
            estimateTemplate
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: 'Failed to update estimate template',
            details: err.message
        });
    }
};
const addEstimateLineItemtoEstimate = async (req, res) => {
    try {
        const { id, estimateId } = req.body;
        const userId = req.userId;  // Assuming req.userId contains the authenticated user's ID

        if (!estimateId || !id) {
            return res.status(400).json({
                err: true,
                msg: 'estimateId and lineItemId are required'
            });
        }

        const estimate = await Estimate.findByPk(estimateId, {
            include: [{ model: LineItem, as: 'AssociatedLineItems' }]
        });
        if (!estimate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate not found'
            });
        }

        const lineItem = await LineItem.findByPk(id);
        if (!lineItem) {
            return res.status(404).json({
                err: true,
                msg: 'LineItem not found'
            });
        }

        // Clone lineItem and create a new EstimateLineItem
        const newEstimateLineItem = await EstimateLineItem.create({
            estimateId,
            lineItemId: id,
            rate: lineItem.rate,
            unitPrice: lineItem.rate, // Add unitPrice field
            unit: lineItem.unit,
            subTotal: lineItem.subTotal,
            total: lineItem.total,
            taxable: lineItem.taxable,
            markup: lineItem.markup,
            name: lineItem.name,
            description: lineItem.description || '', // Ensure description is not null
            userId: userId,
            salesTaxRate: lineItem.salesTaxRate,
            salesTaxTotal: lineItem.salesTaxTotal,
            moduleDescription: lineItem.moduleDescription,
            instructions: lineItem.instructions
        });

        const { subTotal, total } = await calculateEstimateTotals(estimateId);

        await estimate.update({ subTotal, total });

        // Generate and upload updated PDF since line items changed
        try {
            await generateAndUploadEstimatePdf(estimateId, res.companyId);
        } catch (pdfError) {
            console.error('Error regenerating estimate PDF after adding line item:', pdfError.message);
            // Don't throw error for PDF generation failure, just log it
        }

        res.status(201).json({
            err: false,
            msg: 'LineItem successfully added to Estimate',
            estimate,
            estimateLineItem: newEstimateLineItem
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
const addItemToLineItem = async (req, res) => {
    try {
        const { id, lineItemId, quantity } = req.body;

        // Validate lineItemId and itemId
        if (!lineItemId || !id) {
            return res.status(400).json({
                err: true,
                msg: 'lineItemId and itemId are required'
            });
        }

        // Find the LineItem
        const lineItem = await LineItem.findByPk(lineItemId);
        if (!lineItem) {
            return res.status(404).json({
                err: true,
                msg: 'LineItem not found'
            });
        }

        // Find the Item
        const item = await Item.findByPk(id);
        if (!item) {
            return res.status(404).json({
                err: true,
                msg: 'Item not found'
            });
        }

        // Default quantity to 1 if null or 0
        const itemQuantity = quantity && quantity > 0 ? quantity : 1;

        // Create the LineItemItem entry
        const lineItemItem = await LineItemItem.create({
            lineItemId,
            itemId: id,
            quantity: itemQuantity
        });

        // Find all WorkOrders with status 1 or 2
        const workOrders = await WorkOrder.findAll({
            where: {
                workOrderStatusId: { [Op.in]: [1, 2] }
            }
        });

        // Add corresponding WorkOrderLineItems
        const workOrderLineItems = await Promise.all(workOrders.map(async workOrder => {
            return WorkOrderLineItem.create({
                workOrderId: workOrder.id,
                itemId: id,
                quantity: itemQuantity,
                unitPrice: item.cost, // Assuming cost is the unit price
                totalCost: itemQuantity * item.cost
            });
        }));

        // Update the total cost of the workOrders
        for (const workOrder of workOrders) {
            await calculateWorkOrderTotalCost(workOrder.id);
        }

        res.status(201).json({
            err: false,
            msg: 'Item successfully added to LineItem and WorkOrders',
            lineItemItem,
            workOrderLineItems
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const removeEstimateLineItemFromEstimate = async (req, res) => {
    try {
        const { estimateId, lineItemId } = req.body;

        if (!estimateId || !lineItemId) {
            return res.status(400).json({
                err: true,
                msg: 'estimateId and lineItemId are required'
            });
        }

        const estimateLineItem = await EstimateLineItem.findOne({
            where: {
                estimateId,
                lineItemId
            }
        });

        if (!estimateLineItem) {
            return res.status(404).json({
                err: true,
                msg: 'LineItem not found in Estimate'
            });
        }

        await estimateLineItem.destroy();

        const { subTotal, total } = await calculateEstimateTotals(estimateId);

        const estimate = await Estimate.findByPk(estimateId);
        await estimate.update({ subTotal, total });

        res.status(200).json({
            err: false,
            msg: 'LineItem successfully removed from Estimate',
            estimate
        });
    } catch (err) {
        console.error('Error removing line item:', err);
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const removeItemFromLineItem = async (req, res) => {
    try {
        const { id } = req.body;

        // Validate item ID
        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'id is required'
            });
        }

        // Find the LineItemItem entry
        const lineItemItem = await LineItemItem.findOne({
            where: { id },
            include: [{ model: LineItem, as: 'LineItem' }]
        });

        if (!lineItemItem) {
            return res.status(404).json({
                err: true,
                msg: 'LineItemItem not found'
            });
        }

        // Find all WorkOrders with status 1 or 2
        const workOrders = await WorkOrder.findAll({
            where: {
                workOrderStatusId: { [Op.in]: [1, 2] }
            }
        });

        // Remove corresponding WorkOrderLineItems
        const workOrderLineItems = await Promise.all(workOrders.map(async workOrder => {
            const workOrderLineItem = await WorkOrderLineItem.findOne({
                where: {
                    workOrderId: workOrder.id,
                    itemId: lineItemItem.itemId
                }
            });

            if (workOrderLineItem) {
                await workOrderLineItem.destroy();
            }

            return workOrderLineItem;
        }));

        // Remove the LineItemItem entry
        await lineItemItem.destroy();

        // Update the total cost of the workOrders
        for (const workOrder of workOrders) {
            await calculateWorkOrderTotalCost(workOrder.id);
        }

        res.status(200).json({
            err: false,
            msg: 'Item successfully removed from LineItem and WorkOrders',
            workOrderLineItems
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const signEstimate = async (req, res) => {
    try {
        const { estimateId, signature } = req.body;
        const userId = req.userId;

        if (!estimateId || !signature) {
            return res.status(400).json({
                err: true,
                msg: 'estimateId and signature are required'
            });
        }

        // Create the EstimateSignature entry
        const newSignature = await EstimateSignature.create({
            estimateId,
            signature,
            collectedBy: userId
        });

        // Update the Estimate with the new signature ID and status ID
        const estimate = await Estimate.findByPk(estimateId);
        if (!estimate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate not found'
            });
        }

        await estimate.update({
            estimateSignatureId: newSignature.id,
            statusId: 7, // Assuming 7 is the status ID for a signed estimate
            collectedBy: userId
        });

        // Send estimate signed email
        await sendEstimateSignedEmail(estimate, res.companyId);

        res.status(200).json({
            err: false,
            msg: 'Estimate successfully signed',
            estimate
        });
    } catch (err) {
        console.error('Error signing estimate:', err);
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const convertEstimateToInvoice = async (req, res) => {
    try {
        const { id, conversionReason } = req.body;
        const userId = req.userId;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Estimate Id is required'
            });
        }

        const estimate = await Estimate.findByPk(id);
        if (!estimate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate not found'
            });
        }

        // Check if the estimate is already converted
        if (estimate.converted) {
            return res.status(400).json({
                err: true,
                msg: 'This estimate has already been converted to an invoice.'
            });
        }
        const advanceStatus = await EstimateStatus.findOne({
            where: { name: 'advance' }
        });

        const workOrder = await generateWorkOrder(estimate.id, userId);
        
        await generateInvoice(estimate.id, workOrder.id, userId);

        // Update the Estimate as converted
        await estimate.update({ conversionReason: conversionReason, converted: true, statusId: advanceStatus.id, won: true });

        // Create an entry in the EstimateHistory
        await EstimateHistory.create({
            estimateId: estimate.id,
            statusId: estimate.statusId,
            amount: estimate.amount || 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Create notifications for estimate conversion
        try {
            const usersToNotify = await getEstimateNotificationUsers(
                req.companyId, 
                estimate.assignedUserId, 
                estimate.clientId
            );
            
            const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
            const converter = await User.findByPk(userId);
            const client = estimate.clientId ? await Client.findByPk(estimate.clientId) : null;
            const clientName = client ? `${client.firstName} ${client.lastName}` : 'Client';
            
            const message = `Estimate ${estimate.estimateNumber} converted to Invoice for ${clientName} by ${converter ? converter.firstName + ' ' + converter.lastName : 'Administrator'}`;
            
            await sendNotificationsToUsers(
                usersToNotify,
                {
                    userId: userId,
                    relatedModel: 'estimates',
                    relatedModelId: estimate.id,
                    priorityId: priority.id,
                    title: 'Estimate Converted to Invoice',
                    message: message,
                    type: 'general'
                },
                userId // Don't notify the person who converted it
            );
        } catch (notificationError) {
            console.error('Error creating estimate conversion notifications:', notificationError);
        }

        res.status(201).json({
            err: false,
            msg: 'Estimate successfully converted to Invoice',
            estimate
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
}
const generateEstimate = async (companyId, clientId, eventId, userId, adHocReason) => {
    try {
        const company = await Company.findByPk(companyId);
        const activeStatus = await EstimateStatus.findOne(
            {
                where: { name: 'active' },
            }
        );
        const defaultStatusId = company.estimateDefaultStatusId || activeStatus.id;
        const reason = adHocReason ? adHocReason : null;

        let clientAddressId = null;
        let billingAddressId = null;
        let clientEmailId = null;
        let clientPhoneNumberId = null;

        if (clientId) {
            const clientAddresses = await ClientAddress.findAll({
                where: { clientId },
                order: [['createdAt', 'DESC']]
            });

            if (clientAddresses.length > 0) {
                const primaryAddress = clientAddresses.find(address => address.isPrimary);
                if (primaryAddress) {
                    clientAddressId = primaryAddress.id;
                    billingAddressId = primaryAddress.id;
                } else {
                    const latestAddress = clientAddresses[0];
                    clientAddressId = latestAddress.id;
                    billingAddressId = latestAddress.id;
                }
            }

            const clientEmails = await ClientEmail.findAll({
                where: { clientId },
                order: [['createdAt', 'DESC']]
            });

            if (clientEmails.length > 0) {
                const primaryEmail = clientEmails.find(email => email.isPrimary);
                if (primaryEmail) {
                    clientEmailId = primaryEmail.id;
                } else {
                    const latestEmail = clientEmails[0];
                    clientEmailId = latestEmail.id;
                }
            }

            const clientPhoneNumbers = await ClientPhoneNumber.findAll({
                where: { clientId },
                order: [['createdAt', 'DESC']]
            });

            if (clientPhoneNumbers.length > 0) {
                const primaryPhoneNumber = clientPhoneNumbers.find(phone => phone.isPrimary);
                if (primaryPhoneNumber) {
                    clientPhoneNumberId = primaryPhoneNumber.id;
                } else {
                    const latestPhoneNumber = clientPhoneNumbers[0];
                    clientPhoneNumberId = latestPhoneNumber.id;
                }
            }
        }
        const estimatePreferences = await EstimatePreference.create({
            email: company.estimateEmailNotification,
            call: company.estimateCallNotification,
            emailDate: new Date(Date.now() + (company.estimateEmailNotificationDelay || 0)),
            callDate: new Date(Date.now() + (company.estimateCallNotificationDelay || 0)),
        }, { userId });

        const estimate = await Estimate.create({
            clientId,
            eventId,
            estimateNumber: `EST-${Date.now()}`,
            statusId: defaultStatusId,
            estimatePreferenceId: estimatePreferences.id,
            assignedUserId: userId,
            userId,
            markUp: company.estimateDefaultMarkup,
            adHocReason: reason,
            salesTaxRate: company.estimateDefaultSalesTaxRate,
            subTotal: 0,
            total: 0,
            clientAddressId,
            billingAddressId,
            clientEmailId,
            clientPhoneNumberId,
        }, { userId });

        await EstimateHistory.create({
            estimateId: estimate.id,
            statusId: defaultStatusId,
            amount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const estimateLineItems = await EstimateLineItem.findAll({
            where: { estimateId: estimate.id },
            include: [{ model: LineItem, as: 'LineItem' }]
        });

        let subTotal = 0;
        let total = 0;

        for (const estimateLineItem of estimateLineItems) {
            const lineItem = estimateLineItem.LineItem;
            const lineItemItems = await LineItemItem.findAll({
                where: { lineItemId: lineItem.id },
                include: [{ model: Item, as: 'Item' }]
            });

            for (const lineItemItem of lineItemItems) {
                const item = lineItemItem.Item;
                const itemTotal = parseFloat(item.rate) * lineItemItem.quantity;
                subTotal += itemTotal;

                const markUp = itemTotal * (parseFloat(lineItem.markup) / 100);
                const lineItemTotal = itemTotal + markUp;

                total += lineItemTotal;

                if (lineItem.taxable) {
                    const tax = lineItemTotal * (parseFloat(lineItem.salesTaxRate) / 100);
                    total += tax;
                }
            }
        }
        estimate.lineItemPrice = company.lineItemPrice;
        estimate.subTotal = subTotal;
        estimate.total = total;
        await estimate.save();

        // Generate and upload PDF after estimate creation
        try {
            await generateAndUploadEstimatePdf(estimate.id, company.id);
        } catch (pdfError) {
            console.error('Error generating estimate PDF:', pdfError.message);
            // Don't throw error for PDF generation failure, just log it
        }

        // Create notifications for estimate creation
        try {
            const usersToNotify = await getEstimateNotificationUsers(
                company.id, // Using company.id as companyId 
                userId, // assignedEstimatorId
                clientId
            );
            
            const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
            const creator = await User.findByPk(userId);
            const client = clientId ? await Client.findByPk(clientId) : null;
            const clientName = client ? `${client.firstName} ${client.lastName}` : 'Client';
            
            const message = `New estimate created for ${clientName} (${estimate.estimateNumber}) by ${creator ? creator.firstName + ' ' + creator.lastName : 'Administrator'}`;
            
            await sendNotificationsToUsers(
                usersToNotify,
                {
                    userId: userId,
                    relatedModel: 'estimates',
                    relatedModelId: estimate.id,
                    priorityId: priority.id,
                    title: 'New Estimate Created',
                    message: message,
                    type: 'general'
                },
                userId // Don't notify the creator
            );
        } catch (notificationError) {
            console.error('Error creating estimate creation notifications:', notificationError);
        }

        return estimate;
    } catch (error) {
        console.error('Error creating estimate:', error.message);
        throw error;
    }
};
const calculateEstimateTotals = async (estimateId) => {
    const estimateLineItems = await EstimateLineItem.findAll({
        where: { estimateId },
        include: [{ model: LineItem, as: 'LineItem' }]
    });

    let subTotal = 0;
    for (const estimateLineItem of estimateLineItems) {
        const lineItem = estimateLineItem.LineItem;
        if (!lineItem) {
            continue;
        }
        subTotal += parseFloat(lineItem.total);
    }

    // Calculate total including markup, sales tax, and discount
    const estimate = await Estimate.findByPk(estimateId);
    let total = subTotal;

    if (estimate.markUp) {
        total += subTotal * (parseFloat(estimate.markUp) / 100);
    }

    if (estimate.salesTaxRate) {
        total += subTotal * (parseFloat(estimate.salesTaxRate) / 100);
    }

    if (estimate.salesTaxTotal) {
        total += parseFloat(estimate.salesTaxTotal);
    }

    if (estimate.discountTotal) {
        total -= parseFloat(estimate.discountTotal);
    }

    return { subTotal, total };
};
const generateAndUploadEstimatePdf = async (estimateId, companyId) => {
    try {
        // Get the estimate with all necessary data
        const estimate = await Estimate.findByPk(estimateId, {
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
                    model: EstimateLineItem,
                    as: 'EstimateLineItems',
                    include: [
                        {
                            model: LineItem,
                            as: 'LineItem'
                        }
                    ]
                }
            ]
        });

        if (!estimate) {
            throw new Error('Estimate not found');
        }

        // Get company information
        const company = await Company.findByPk(companyId);
        
        // Calculate the dueNow amount
        const minimumEstimatePaymentPercentage = company ? company.minimumEstimatePaymentPercentage : 0;
        const dueNow = parseFloat((estimate.total * minimumEstimatePaymentPercentage / 100).toFixed(2));
        
        // Add calculated fields to estimate - use plain object
        const estimateData = estimate.get ? estimate.get({ plain: true }) : estimate;
        estimateData.dueNow = dueNow;
        estimateData.estimateTermsAndConditions = company ? company.estimateTermsAndConditions : null;

        // Ensure EstimateLineItems is an array
        if (!Array.isArray(estimateData.EstimateLineItems)) {
            estimateData.EstimateLineItems = [];
        } else {
            // Transform EstimateLineItems to use their own fields instead of LineItem fields
            estimateData.EstimateLineItems = estimateData.EstimateLineItems.map(item => {
                const lineItemData = item.get ? item.get({ plain: true }) : item;
                return {
                    ...lineItemData,
                    // Use EstimateLineItem fields directly, not LineItem fields
                    name: lineItemData.name || (lineItemData.LineItem ? lineItemData.LineItem.name : 'Unnamed Item'),
                    description: lineItemData.description || (lineItemData.LineItem ? lineItemData.LineItem.description : ''),
                    totalPrice: lineItemData.totalPrice || lineItemData.total || (lineItemData.LineItem ? lineItemData.LineItem.total : '0.00'),
                    // Remove LineItem reference to force template to use EstimateLineItem fields
                    LineItem: null
                };
            });
        }

        // Get the estimate template - try database first, then fall back to file system
        let estimateTemplate = await Template.findOne({
            where: { 
                type: 'estimate',
                isActive: true 
            },
            order: [['createdAt', 'DESC']]
        });

        let templateContent;
        if (estimateTemplate) {
            templateContent = estimateTemplate.content;
        } else {
            // Fall back to reading from file system
            try {
                const templatePath = path.join(__dirname, '../public/partials/templates/estimates/estimate.html');
                templateContent = fs.readFileSync(templatePath, 'utf8');
            } catch (fileError) {
                throw new Error('Estimate template not found in database or file system');
            }
        }

        // Generate PDF filename
        const filename = `estimate-${estimateData.estimateNumber || estimateData.id}-${Date.now()}.pdf`;

        // Generate the PDF
        const pdfPath = await generateEstimatePdf(
            templateContent,
            estimateData,
            company,
            filename
        );

        // Upload to Cloudinary
        const { url, publicId } = await uploadEstimatePdfToCloudinary(pdfPath, estimate.id);

        // Update the estimate with the PDF URL
        await estimate.update({ estimateUrl: url });

        // Save document record
        const document = await Document.create({
            title: `Estimate ${estimateData.estimateNumber || estimateData.id}`,
            url: url,
            publicId: publicId,
            estimateId: estimate.id,
            clientId: estimate.clientId,
            eventId: estimate.eventId,
            userId: estimate.userId,
            format: 'pdf',
            size: fs.existsSync(pdfPath) ? fs.statSync(pdfPath).size : 0
        });

        return { url, publicId, document };
    } catch (error) {
        console.error('Error generating estimate PDF:', error);
        throw error;
    }
};
const archive = async (req, res) => {
    try {
        const { id } = req.body;

        // Validate the ID
        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Estimate ID is required.',
            });
        }

        // Find the estimate
        const estimate = await Estimate.findOne({ 
            where: { id },
            include: [
                {
                    model: EstimateStatus,
                    as: 'EstimateStatus'
                },
            ] 
        });
        const inActiveStatus = await EstimateStatus.findOne({
            where: { name: 'inactive' },
        });

        if (!estimate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate not found.',
            });
        }

        // Update isActive to false
        await estimate.update({ isActive: false, statusId: inActiveStatus.id });

        await EstimateActivity.create({
            estimateId: estimate.id,
            relatedModel: 'Estimate',
            relatedModelId: estimate.id,
            action: 'UPDATE',
            description: `Estimate was Archived`,
            fieldName: 'isActive',
            oldValue: estimate.EstimateStatus.name,
            newValue: inActiveStatus.name,
            changedBy: req.userId,
            timestamp: new Date()
        });

        return res.status(200).json({
            err: false,
            msg: 'Estimate successfully archived.',
            estimate,
        });
    } catch (err) {
        console.error('Error archiving estimate:', err);
        return res.status(500).json({
            err: true,
            msg: 'Failed to archive estimate.',
            error: err.message,
        });
    }
};
const archiveEstimateTemplate = async (req, res) => {
    try {
        const { id } = req.body;
        // Validate the ID
        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Estimate Template ID is required.',
            });
        }

        // Find the estimate template
        const estimateTemplate = await EstimateTemplate.findByPk(id);

        if (!estimateTemplate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate Template not found.',
            });
        }

        // Update isActive to false
        await estimateTemplate.update({ isActive: false });

        return res.status(200).json({
            err: false,
            msg: 'Estimate template successfully archived.',
        });
    } catch (err) {
        console.error('Error archiving estimate template:', err);
        return res.status(500).json({
            err: true,
            msg: 'Failed to archive estimate template.',
            error: err.message,
        });
    }   
};
const unArchive = async (req, res) => {
    try {
        const { id } = req.body;

        // Validate the ID
        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Estimate ID is required.',
            });
        }

        // Find the estimate
        const estimate = await Estimate.findOne({ 
            where: { id },
            include: [
                {
                    model: EstimateStatus,
                    as: 'EstimateStatus'
                },
            ] 
        });
        const reActivatedStatus = await EstimateStatus.findOne({
            where: { name: 'reactivated' },
        });

        if (!estimate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate not found.',
            });
        }

        // Update isActive to true
        await estimate.update({ isActive: true, statusId: reActivatedStatus.id });

        await EstimateActivity.create({
            estimateId: estimate.id,
            relatedModel: 'Estimate',
            relatedModelId: estimate.id,
            action: 'UPDATE',
            description: `Estimate was Reactivated`,
            fieldName: 'isActive',
            oldValue: estimate.EstimateStatus.name,
            newValue: reActivatedStatus.name,
            changedBy: req.userId,
            timestamp: new Date()
        });

        return res.status(200).json({
            err: false,
            msg: 'Estimate successfully unarchived.',
            estimate,
        });
    } catch (err) {
        console.error('Error unarchiving estimate:', err);
        return res.status(500).json({
            err: true,
            msg: 'Failed to unarchived estimate.',
            error: err.message,
        });
    }
};
const checkandSendFollowUpNotifications = async () => {
    // find estimates that are 'in person' and not completed
    const followUpEstimates = await EstimateFollowUp.findAll({
        where: {
            type: 'in person',
            completedAt: null,
        }
    });
    if (followUpEstimates.length === 0) {
        console.log('Ran Estimate Follow Up Notifications but no estimates found');
        return;
    }
    // Loop through each estimate and send notifications based on if it nows or the next day
    for (const followUp of followUpEstimates) {
        const priorities = await Priority.findAll();
        
        const now = new Date();
        const followUpDate = new Date(followUp.scheduledDate);
        const nextDay = new Date(now);
        nextDay.setDate(now.getDate() + 1);
        
        let priorityId = _.find(priorities, { level: 'normal' }).id; // Default to low priority

        // check it there is already a notification for this follow up that has been sent today
        const existingNotification = await Notification.findOne({
            where: {
                relatedModel: 'Event',
                relatedModelId: followUp.eventId,
                read: false,
            }
        });
        if (existingNotification) {
            //check if the notification is for today or tomorrow
            if (existingNotification.title === 'Follow Up Reminder' && 
                (existingNotification.message.includes('today') || existingNotification.message.includes('tomorrow'))) {
                console.log(`Notification already sent for Follow Up ID ${followUp.id} today or tomorrow.`);

                // update the priority if it is overdue or update notification message if it is for today or tomorrow
                if (followUpDate < now) {
                    priorityId = _.find(priorities, { level: 'high' }).id; // Set to high priority for overdue follow-ups
                    existingNotification.priorityId = priorityId;
                    existingNotification.message = `You have an overdue in-person follow-up for Estimate ID ${followUp.estimateId}. Please complete it as soon as possible.`;
                } else if (followUpDate.toDateString() === now.toDateString()) {
                    existingNotification.message = `You have an in-person follow-up scheduled for today for Estimate ID ${followUp.estimateId}.`;
                } else if (followUpDate.toDateString() === nextDay.toDateString()) {
                    existingNotification.message = `You have an in-person follow-up scheduled for tomorrow for Estimate ID ${followUp.estimateId}.`;
                }
                await existingNotification.save();
            }
            return; // Skip sending a new notification
        };
        // Check if the estimate date is today, tomorrow or past due
        if (followUpDate.toDateString() === now.toDateString()) {
            // Send notification to assigned user
            await createNotification({
                body: {
                    userId: followUp.createdBy,
                    targetUserId: followUp.createdBy,
                    relatedModel: 'EstimateFollowUp',
                    relatedModelId: followUp.id,
                    subRelatedModel: 'Event',
                    subRelatedModelId: followUp.eventId,
                    priorityId: priorityId, // Default priority
                    title: 'Follow Up Reminder',
                    type: 'general',
                    message: `You have an in-person follow-up scheduled for today for Estimate ID ${followUp.estimateId}.`,
                },
            });
        } else if (followUpDate.toDateString() === nextDay.toDateString()) {
            // Send notification to assigned user
            await createNotification({
                body: {
                    userId: followUp.createdBy,
                    targetUserId: followUp.createdBy,
                    relatedModel: 'EstimateFollowUp',
                    relatedModelId: followUp.id,
                    subRelatedModel: 'Event',
                    subRelatedModelId: followUp.eventId,
                    priorityId: priorityId, // Default priority
                    title: 'Follow Up Reminder',
                    type: 'general',
                    message: `You have an in-person follow-up scheduled for tomorrow for Estimate ID ${followUp.estimateId}.`,
                },
            });
        } else if (followUpDate < now) {
            // Send notification to assigned user
            priorityId = _.find(priorities, { level: 'high' }).id; // Set to high priority for overdue follow-ups
            await createNotification({
                body: {
                    userId: followUp.createdBy,
                    targetUserId: followUp.createdBy,
                    relatedModel: 'EstimateFollowUp',
                    relatedModelId: followUp.id,
                    subRelatedModel: 'Event',
                    subRelatedModelId: followUp.eventId,
                    priorityId: priorityId, // High priority for overdue
                    title: 'Follow Up Overdue',
                    type: 'general',
                    message: `You have an overdue in-person follow-up for Estimate ID ${followUp.estimateId}. Please complete it as soon as possible.`,
                },
            });
        }
    }
};
const trackEstimateView = async (req, res) => {
    try {
        // This is a placeholder - implement based on your requirements
        res.status(501).json({
            err: true,
            msg: 'trackEstimateView not yet implemented'
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const clientApproveEstimate = async (req, res) => {
    try {
        const { id, clientApprovalReason } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Estimate ID is required'
            });
        }

        const estimate = await Estimate.findByPk(id);
        if (!estimate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate not found'
            });
        }

        // Find the approved status
        const approvedStatus = await EstimateStatus.findOne({
            where: { name: 'approved' }
        });

        if (!approvedStatus) {
            return res.status(500).json({
                err: true,
                msg: 'Approved status not found'
            });
        }

        // Update estimate status and approval information
        await estimate.update({
            statusId: approvedStatus.id,
            clientApprovalReason: clientApprovalReason || null,
            clientApprovedAt: new Date(),
            won: true
        });

        // Create an entry in the EstimateHistory
        await EstimateHistory.create({
            estimateId: estimate.id,
            statusId: approvedStatus.id,
            amount: estimate.amount || 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Create notifications for client approval
        try {
            const usersToNotify = await getEstimateNotificationUsers(
                estimate.companyId || req.companyId, 
                estimate.assignedUserId, 
                estimate.clientId
            );
            
            const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
            const client = estimate.clientId ? await Client.findByPk(estimate.clientId) : null;
            const clientName = client ? `${client.firstName} ${client.lastName}` : 'Client';
            
            const message = `Estimate ${estimate.estimateNumber} approved by ${clientName}`;
            
            await sendNotificationsToUsers(
                usersToNotify,
                {
                    userId: req.userId || null, // May not have userId for client approval
                    relatedModel: 'estimates',
                    relatedModelId: estimate.id,
                    priorityId: priority.id,
                    title: 'Estimate Approved by Client',
                    message: message,
                    type: 'general'
                }
            );
        } catch (notificationError) {
            console.error('Error creating estimate approval notifications:', notificationError);
        }

        res.status(200).json({
            err: false,
            msg: 'Estimate successfully approved by client',
            estimate
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const clientRejectEstimate = async (req, res) => {
    try {
        // This is a placeholder - implement based on your requirements
        res.status(501).json({
            err: true,
            msg: 'clientRejectEstimate not yet implemented'
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const clientRequestChanges = async (req, res) => {
    try {
        // This is a placeholder - implement based on your requirements
        res.status(501).json({
            err: true,
            msg: 'clientRequestChanges not yet implemented'
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const submitClientFeedback = async (req, res) => {
    try {
        // This is a placeholder - implement based on your requirements
        res.status(501).json({
            err: true,
            msg: 'submitClientFeedback not yet implemented'
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const acceptTerms = async (req, res) => {
    try {
        // This is a placeholder - implement based on your requirements
        res.status(501).json({
            err: true,
            msg: 'acceptTerms not yet implemented'
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};

module.exports = {
    create,
    createLineItem,
    createEstimateLineItem,
    createEstimateFollowUp,
    createEstimateTemplate,
    createEstimatePdf,
    listItems,
    get,
    getEstimateTemplate,
    getEstimatePhotos,
    getEstimateVideos,
    getLineItem,
    listLineItems,
    listAdHocLineItems,
    listEstimateStatuses,
    listEstimateTemplates,
    listEstimateFollowUps,
    update,
    updateLineItem,
    updateEstimateLineItem,
    updateLineItemItemQuantity,
    updateEstimateTemplate,
    addEstimateLineItemtoEstimate,
    addItemToLineItem,
    removeEstimateLineItemFromEstimate,
    removeItemFromLineItem,
    signEstimate,
    convertEstimateToInvoice,
    generateEstimate,
    generateAndUploadEstimatePdf,
    trackEstimateView,
    clientApproveEstimate,
    clientRejectEstimate,
    clientRequestChanges,
    submitClientFeedback,
    acceptTerms,
    archive,
    archiveEstimateTemplate,
    unArchive,
    checkandSendFollowUpNotifications,
    createEstimateTemplate
};
