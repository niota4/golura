const env = process.env;
const _ = require('lodash');
const Jimp = require('jimp');
const cloudinary = require('../config/cloudinary');
const {
    Sequelize,
    Op
} = require('sequelize');
const { computeRecurringEventInstances } = require('../helpers/recurring'); 
const {
    Client,
    ClientPhoneNumber,
    ClientEmail,
    ClientNote,
    ClientAddress,
    Priority,
    State,
    Address,
    Email,
    EmailAddress,
    PhoneNumber,
    PhoneCall,
    Event,
    EventStatus,
    EventType,
    EventCategory,
    EventParticipant,
    Estimate,
    EstimateStatus,
    EstimateSignature,
    WorkOrder,
    WorkOrderStatus,
    WorkOrderLineItem,
    Invoice,
    InvoiceLineItem,
    RecurrencePattern,
    Item,
    Marketing,
    Group,
    User,
    UserPreference,
    Image,
    Document,
    Video
} = require('../models');
const { MeiliSearch } = require('meilisearch');
const meiliClient = new MeiliSearch({
  host: env.MEILI_HOST,
  apiKey: env.MEILI_API_KEY
});

// Import centralized helpers for Phase 1 refactor
const { authenticate } = require('../helpers/validate');
const { hasPermission } = require('../helpers/permissions');
const { ValidationRunner } = require('../helpers/validationSchemas');
const { createPIIField } = require('../helpers/piiHelper');

const get = async (req, res) => {
    try {
        // Validate input parameters
        const validationResult = await ValidationRunner.validate(req.body, 'GET_CLIENT');
        if (!validationResult.isValid) {
            return res.status(400).json({
                err: true,
                msg: 'Invalid request parameters',
                errors: validationResult.errors
            });
        }

        // Check permissions using centralized helper
        const hasClientViewPermission = await hasPermission(req.userId, 'clients', 'view');
        if (!hasClientViewPermission) {
            return res.status(403).json({
                err: true,
                msg: 'Insufficient permissions to view client details'
            });
        }

        const includeInactive = req.body.includeInactive || false;
        const client = await Client.findOne({
            where: {
                id: req.body.id,
                ...(includeInactive ? {} : { isActive: true }),
            },
            include: [
                {
                    model: ClientAddress,
                    as: 'ClientAddresses',
                    include: [{ model: State, as: 'State' }],
                    separate: true, // Ensures ordering is applied correctly
                    order: [['createdAt', 'DESC']],
                },
                {
                    model: ClientEmail,
                    as: 'ClientEmails',
                    separate: true,
                    order: [['createdAt', 'DESC']],
                },
                {
                    model: ClientNote,
                    as: 'ClientNotes',
                    separate: true,
                    order: [['createdAt', 'DESC']],
                },
                {
                    model: ClientPhoneNumber,
                    as: 'ClientPhoneNumbers',
                    separate: true,
                    order: [['createdAt', 'DESC']],
                },
                {
                    model: Priority,
                    as: 'Priority',
                },
                {
                    model: Priority,
                    as: 'Priority',
                    attributes: ['id', 'level'],
                }
            ],
        });

        if (!client) {
            return res.status(404).json({
                err: true,
                msg: 'Client not found',
            });
        }

        // Apply PII protection to client data
        const clientData = client.toJSON();
        clientData.firstName = createPIIField(clientData.firstName, 'firstName');
        clientData.lastName = createPIIField(clientData.lastName, 'lastName');
        
        // Protect emails
        if (clientData.ClientEmails) {
            clientData.ClientEmails = clientData.ClientEmails.map(email => ({
                ...email,
                email: createPIIField(email.email, 'email')
            }));
        }

        // Protect phone numbers
        if (clientData.ClientPhoneNumbers) {
            clientData.ClientPhoneNumbers = clientData.ClientPhoneNumbers.map(phone => ({
                ...phone,
                phoneNumber: createPIIField(phone.phoneNumber, 'phoneNumber')
            }));
        }

        // Protect addresses
        if (clientData.ClientAddresses) {
            clientData.ClientAddresses = clientData.ClientAddresses.map(addr => ({
                ...addr,
                address: createPIIField(addr.address, 'address'),
                city: createPIIField(addr.city, 'city')
            }));
        }

        // Protect notes
        if (clientData.ClientNotes) {
            clientData.ClientNotes = clientData.ClientNotes.map(note => ({
                ...note,
                notes: createPIIField(note.notes, 'notes')
            }));
        }

        res.status(201).json({
            err: false,
            msg: 'Client successfully retrieved',
            client: clientData,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: err.message,
        });
    }
};
const list = async (req, res) => {
    try {
        // Validate input parameters
        const validationResult = await ValidationRunner.validate(req.body, 'LIST_CLIENTS');
        if (!validationResult.isValid) {
            return res.status(400).json({
                err: true,
                msg: 'Invalid request parameters',
                errors: validationResult.errors
            });
        }

        // Check permissions using centralized helper
        const hasClientListPermission = await hasPermission(req.userId, 'clients', 'list');
        if (!hasClientListPermission) {
            return res.status(403).json({
                err: true,
                msg: 'Insufficient permissions to list clients'
            });
        }

        const query = req.body.query || '';
        const page = req.body.page || 1;
        const limit = req.body.limit || 100;
        const offset = (page - 1) * limit;
        const includeInactive = req.body.includeInactive || false;

        if (query.trim()) {
            // Use MeiliSearch for searching clients
            const searchRes = await meiliClient.index('clients').search(query, { limit, offset });
            const ids = searchRes.hits.map(hit => hit.id);
            let clients = [];
            if (ids.length > 0) {
                clients = await Client.findAll({
                    where: {
                        id: ids,
                        ...(includeInactive ? {} : { isActive: true })
                    },
                    include: [
                        {
                            model: ClientAddress,
                            as: 'ClientAddresses',
                            include: [{ model: State, as: 'State' }]
                        },
                        { model: ClientEmail, as: 'ClientEmails' },
                        { model: ClientNote, as: 'ClientNotes' },
                        { model: ClientPhoneNumber, as: 'ClientPhoneNumbers' },
                        { model: Priority, as: 'Priority' }
                    ]
                });
                // Preserve MeiliSearch order
                clients = ids.map(id => clients.find(c => c.id === id)).filter(Boolean);
            }

            // Apply PII protection to clients from search
            const protectedClients = clients.map(client => {
                const clientData = client.toJSON ? client.toJSON() : client;
                clientData.firstName = createPIIField(clientData.firstName, 'firstName');
                clientData.lastName = createPIIField(clientData.lastName, 'lastName');
                return clientData;
            });

            return res.status(201).json({
                err: false,
                msg: 'Clients successfully retrieved',
                total: searchRes.estimatedTotalHits,
                pages: Math.ceil(searchRes.estimatedTotalHits / limit),
                clients: {
                    count: searchRes.estimatedTotalHits,
                    rows: protectedClients
                }
            });
        } else {
            // Fallback to Sequelize for no query
            const clients = await Client.findAndCountAll({
                where: {
                    ...(includeInactive ? {} : { isActive: true })
                },
                include: [
                    {
                        model: ClientAddress,
                        as: 'ClientAddresses',
                        include: [{ model: State, as: 'State' }]
                    },
                    { model: ClientEmail, as: 'ClientEmails' },
                    { model: ClientNote, as: 'ClientNotes' },
                    { model: ClientPhoneNumber, as: 'ClientPhoneNumbers' },
                    { model: Priority, as: 'Priority' }
                ],
                order: [['createdAt', 'DESC']],
                limit,
                offset
            });

            // Apply PII protection to clients from database
            const protectedClients = {
                ...clients,
                rows: clients.rows.map(client => {
                    const clientData = client.toJSON();
                    clientData.firstName = createPIIField(clientData.firstName, 'firstName');
                    clientData.lastName = createPIIField(clientData.lastName, 'lastName');
                    return clientData;
                })
            };

            return res.status(201).json({
                err: false,
                msg: 'Clients successfully retrieved',
                total: clients.count,
                pages: Math.ceil(clients.count / limit),
                clients: protectedClients
            });
        }
    } catch (err) {
        res.json({
            err: true,
            msg: err.message
        });
    }
};
const listEvents = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Client ID is required.' });
        }

        // Fetch all events for the client
        const events = await Event.findAll({
            where: { clientId: id, isActive: true },
            include: [
                {
                    model: Group,
                    as: 'Group',
                },
                {
                    model: Image,
                    as: 'Images',
                },
                {
                    model: EventParticipant,
                    as: 'EventParticipants',
                    include: [
                        {
                            model: User,
                            as: 'User',
                            attributes: ['id', 'email', 'firstName', 'lastName', 'roleId', 'isActive'],
                            include: [
                                { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                            ]
                        }
                    ]
                },
                {
                    model: RecurrencePattern,
                    as: 'RecurrencePattern',
                },
                { model: EventType, as: 'EventType', attributes: ['id', 'name', 'backgroundColor'] },
                { model: EventStatus, as: 'EventStatus', attributes: ['id', 'name'] },
                { model: EventCategory, as: 'EventCategory', attributes: ['id', 'name'] },
                { 
                    model: User, 
                    as: 'Creator', 
                    attributes: ['id', 'firstName', 'lastName'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
                { 
                    model: User, 
                    as: 'TargetUser', 
                    attributes: ['id', 'firstName', 'lastName'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
                { model: RecurrencePattern, as: 'RecurrencePattern', attributes: ['id', 'frequency', 'interval'] },
            ],
            order: [['endDate', 'DESC']], // Order by most recent
        });

        // Separate recurring and non-recurring events
        const nonRecurringEvents = events.filter(event => !event.RecurrencePattern);
        const recurringEvents = events.filter(event => event.RecurrencePattern);

        // Compute recurring instances for recurring events
        const recurringInstances = recurringEvents.map(recurringEvent => {
            // You can use a helper function to compute recurring instances
            // Placeholder logic for recurring instances
            return {
                ...recurringEvent.toJSON(),
                instances: computeRecurringEventInstances(
                    recurringEvent,
                    new Date() // Example: Compute from today
                ),
            };
        });

        // Combine non-recurring events and recurring event instances
        const allEvents = [...nonRecurringEvents, ...recurringInstances];

        // Map through the events to include the address details
        const eventsWithAddress = await Promise.all(allEvents.map(async (event) => {
            // Convert Sequelize instances to plain objects, otherwise use the event as-is
            const eventData = event instanceof Event ? event.toJSON() : event;

            let address = null;

            if (eventData.clientId) {
                // Get client address if clientId exists
                address = await ClientAddress.findOne({
                    where: { id: eventData.addressId },
                });
            } else {
                // Get address from the address table if no clientId
                address = await Address.findOne({
                    where: { id: eventData.addressId },
                });
            }

            return {
                ...eventData,
                Address: address ? address.toJSON() : null,
            };
        }));

        const now = new Date();

        const futureEvents = eventsWithAddress.filter(event => new Date(event.endDate) > now);
        const pastEvents = eventsWithAddress.filter(event => new Date(event.endDate) <= now);

        res.status(201)
            .json({
                err: false,
                msg: 'Client Events successfully retrieved',
                events: events,
                pastEvents: pastEvents,
                futureEvents: futureEvents

            });
    } catch (err) {
        return res.json({
            err: true,
            msg: err.message,
        });
    }
};
const listEstimates = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.send({
            err: true,
            msg: 'clientId is required'
        });
    }

    try {
        const clientId = id;
        const estimates = await Estimate.findAll({
            where: { clientId: id, isActive: true },
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
                {
                    model: EstimateStatus,
                    as: 'EstimateStatus'
                },
                {
                    model: User,
                    as: 'AssignedUser',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: EstimateSignature,
                    as: 'EstimateSignature'
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        res.status(201).send({
            err: false,
            msg: 'Client Estimates successfully retrieved',
            estimates: estimates
        });
    } catch (err) {
        res.send({
            err: true,
            msg: 'Error processing estimates',
            details: err
        });
    }
};
const listPhotos = async (req, res) => {
    const {
        id,
        type,
        eventId,
        marketingId,

    } = req.body;

    if (!id) {
        return res.send({
            err: true,
            msg: 'clientId is required'
        });
    }

    try {
        const clientId = id;
        let filter = {
            clientId,
            isActive: true
        };
        if (type === 'events') {
            filter.eventId = eventId
        }
        else if (type === 'estimates') {
            filter.estimateId = estimateId
        }
        else if (type === 'marketing') {
            filter.marketingId = marketingId
        }
        else {
            filter.eventId = null;
            filter.marketingId = null;
        }


        const images = await Image.findAll({
            where: filter,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'email', 'firstName', 'lastName', 'roleId', 'isActive'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
                {
                    model: Estimate,
                    as: 'Estimate',
                },
                {
                    model: Event,
                    as: 'Event',
                }
            ]
        });
        res.status(201).send({
            err: false,
            msg: 'Client Images successfully retrieved',
            images: images
        });
    }
    catch (err) {
        res.send({
            err: true,
            msg: 'Error processing images',
            details: err
        });
    }
};
const listDocuments = async (req, res) => {
    const {
        id,
        type,
        eventId,
        marketingId,

    } = req.body;

    if (!id) {
        return res.send({
            err: true,
            msg: 'clientId is required'
        });
    }

    try {
        const clientId = id;
        let filter = {
            clientId,
            isActive: true
        };
        if (type === 'events') {
            filter.eventId = eventId
        }
        else if (type === 'marketing') {
            filter.marketingId = marketingId
        }
        else {
            filter.eventId = null;
            filter.marketingId = null;
        }


        const documents = await Document.findAll({
            where: filter,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'email', 'firstName', 'lastName', 'roleId', 'isActive'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
                {
                    model: Estimate,
                    as: 'Estimate',
                },
                {
                    model: Event,
                    as: 'Event',
                },
            ]
        });
        res.status(201).send({
            err: false,
            msg: 'Client Documents successfully retrieved',
            documents: documents
        });
    }
    catch (err) {
        res.send({
            err: true,
            msg: 'Error processing Documents',
            details: err
        });
    }
};
const listVideos = async (req, res) => {
    const {
        id,
        type,
        eventId,
        marketingId,

    } = req.body;

    if (!id) {
        return res.send({
            err: true,
            msg: 'clientId is required'
        });
    }

    try {
        const clientId = id;
        let filter = {
            clientId,
            isActive: true
        };
        if (type === 'events') {
            filter.eventId = eventId
        }
        else if (type === 'marketing') {
            filter.marketingId = marketingId
        }
        else {
            filter.eventId = null;
            filter.marketingId = null;
        }

        const videos = await Video.findAll({
            where: filter,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'email', 'firstName', 'lastName', 'roleId', 'isActive'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
                {
                    model: Estimate,
                    as: 'Estimate',
                },
                {
                    model: Event,
                    as: 'Event',
                }
            ]
        });
        res.status(201).send({
            err: false,
            msg: 'Client Videos successfully retrieved',
            videos: videos
        });
    }
    catch (err) {
        res.send({
            err: true,
            msg: 'Error processing Videos',
            details: err
        });
    }
};
const listWorkOrders = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).send({
            err: true,
            msg: 'clientId is required'
        });
    }

    try {
        const workOrders = await WorkOrder.findAll({
            where: { clientId: id, isActive: true },
            include: [
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
                    model: WorkOrderLineItem,
                    as: 'LineItems',
                    include: [
                        {
                            model: Item,
                            as: 'Item'
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        res.status(201).send({
            err: false,
            msg: 'Client WorkOrders successfully retrieved',
            workOrders
        });
    } catch (err) {
        res.status(500).send({
            err: true,
            msg: 'Error retrieving WorkOrders',
            details: err.message
        });
    }
};
const listInvoices = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).send({
            err: true,
            msg: 'clientId is required'
        });
    }

    try {
        const invoices = await Invoice.findAll({
            where: { clientId: id, isActive: true },
            include: [
                {
                    model: Client,
                    as: 'Client',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Estimate,
                    as: 'Estimate',
                    attributes: ['id', 'total']
                },
                {
                    model: WorkOrder,
                    as: 'WorkOrder',
                    attributes: ['id', 'workOrderNumber', 'cost']
                },
                {
                    model: InvoiceLineItem,
                    as: 'InvoiceLineItems',
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            err: false,
            msg: 'Invoices successfully retrieved',
            invoices: invoices
        });
    } catch (error) {
        console.error('Error retrieving invoices:', error);
        res.status(500).json({
            err: true,
            msg: 'Error retrieving invoices',
            details: error.message
        });
    }
};
const listClientAddresses = async (req, res) => {
    try {
        const { id } = req.body;
    
        if (!id) {
            return res.status(400).send({
                err: true,
                msg: 'clientId is required'
            });
        }
        const addresses = await ClientAddress.findAll(
            { 
                where: { 
                    clientId: id,
                    isActive: true 
                },
                include: [{ model: State, as: 'State' }],
                order: [['createdAt', 'DESC']],
            }
        );
        res.status(200).json({ err: false, msg: 'Client addresses retrieved successfully', addresses });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const listClientEmails = async (req, res) => {
    try {
        const { id } = req.body;
    
        if (!id) {
            return res.status(400).send({
                err: true,
                msg: 'clientId is required'
            });
        }
        const emails = await ClientEmail.findAll(
            { 
                where: { 
                    clientId: id,
                    isActive: true 
                },
                order: [['createdAt', 'DESC']],
            }
        );
        res.status(200).json({ err: false, msg: 'Client emails retrieved successfully', emails });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const listClientNotes = async (req, res) => {
    try {
        const { id } = req.body;
    
        if (!id) {
            return res.status(400).send({
                err: true,
                msg: 'clientId is required'
            });
        }
        const notes = await ClientNote.findAll(
            { 
                where: { 
                    clientId: id,
                    isActive: true 
                },
                order: [['createdAt', 'DESC']],
            }
        );
        res.status(200).json({ err: false, msg: 'Client notes retrieved successfully', notes });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const listClientPhoneNumbers = async (req, res) => {
    try {
        const { id } = req.body;
    
        if (!id) {
            return res.status(400).send({
                err: true,
                msg: 'clientId is required'
            });
        }
        const phoneNumbers = await ClientPhoneNumber.findAll(
            { 
                where: { 
                    clientId: id,
                    isActive: true 
                },
                order: [['createdAt', 'DESC']],
            }
        );
        res.status(200).json({ err: false, msg: 'Client phone numbers retrieved successfully', phoneNumbers });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const listEmails = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ err: true, msg: 'Client ID is required.' });
        }
        
        const emails = await Email.findAll({
            where: { clientId: id, isActive: true },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'email', 'firstName', 'lastName', 'roleId', 'isActive'],
                    required: false,
                    include: [
                        { 
                            model: UserPreference, 
                            as: 'Preferences', 
                            attributes: ['backgroundColor'],
                            required: false
                        },
                    ]
                },
                {
                    model: Client,
                    as: 'Client',
                    attributes: ['id', 'firstName', 'lastName'],
                    required: false
                },
                {
                    model: Estimate,
                    as: 'Estimate',
                    attributes: ['id', 'estimateNumber'],
                    required: false
                },
                {
                    model: Event,
                    as: 'Event',
                    attributes: ['id', 'title'],
                    required: false
                },
                {
                    model: WorkOrder,
                    as: 'WorkOrder',
                    attributes: ['id', 'workOrderNumber'],
                    required: false
                },
                {
                    model: Invoice,
                    as: 'Invoice',
                    attributes: ['id', 'invoiceNumber'],
                    required: false
                }
            ]
        });

        // Enrich emails with additional email data from emailId
        const enrichedEmails = await Promise.all(emails.map(async (email) => {
            const emailData = email.toJSON();
            
            if (emailData.emailId) {
                // First try to find in ClientEmail using clientId
                const clientEmail = await ClientEmail.findOne({
                    where: { 
                        id: emailData.emailId,
                        clientId: id,
                        isActive: true 
                    }
                });

                if (clientEmail) {
                    emailData.ClientEmail = clientEmail.toJSON();
                } else {
                    // If not found in ClientEmail, try EmailAddress
                    const emailAddress = await EmailAddress.findOne({
                        where: { 
                            id: emailData.emailId,
                            isActive: true 
                        }
                    });

                    if (emailAddress) {
                        emailData.emailAddressData = emailAddress.toJSON();
                    }
                }
            }
            
            return emailData;
        }));

        res.status(200).json({ err: false, msg: 'Client emails retrieved successfully', emails: enrichedEmails });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};  
const listPhoneCalls = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ err: true, msg: 'Client ID is required.' });
        }

        const phoneCalls = await PhoneCall.findAll({
            where: { clientId: id },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'email', 'firstName', 'lastName', 'roleId', 'isActive'],
                    required: false,
                    include: [
                        { 
                            model: UserPreference, 
                            as: 'Preferences', 
                            attributes: ['backgroundColor'],
                            required: false
                        },
                    ]
                },
                {
                    model: Client,
                    as: 'Client',
                    attributes: ['id', 'firstName', 'lastName'],
                    required: false
                },
                {
                    model: Estimate,
                    as: 'Estimate',
                    attributes: ['id', 'estimateNumber'],
                    required: false
                },
                {
                    model: Event,
                    as: 'Event',
                    attributes: ['id', 'title'],
                    required: false
                },
                {
                    model: WorkOrder,
                    as: 'WorkOrder',
                    attributes: ['id', 'workOrderNumber'],
                    required: false
                },
                {
                    model: Invoice,
                    as: 'Invoice',
                    attributes: ['id', 'invoiceNumber'],
                    required: false
                }
            ]
        });

        // Enrich phone calls with additional email data from emailId
        const enrichedPhoneNumbers = await Promise.all(phoneCalls.map(async (phoneCall) => {
            const phoneCallData = phoneCall.toJSON();
            
            if (phoneCallData.phoneNumberId) {
                // First try to find in ClientPhoneNumber using clientId
                const clientPhoneNumber = await ClientPhoneNumber.findOne({
                    where: { 
                        id: phoneCallData.phoneNumberId,
                        clientId: id,
                        isActive: true 
                    }
                });

                if (clientPhoneNumber) {
                    phoneCallData.ClientPhoneNumber = clientPhoneNumber.toJSON();
                } else {
                    // If not found in ClientPhoneNumber, try PhoneNumber
                    const phoneNumber = await PhoneNumber.findOne({
                        where: { 
                            id: phoneCallData.phoneNumberId,
                            isActive: true 
                        }
                    });

                    if (phoneNumber) {
                        phoneCallData.phoneNumberData = phoneNumber.toJSON();
                    }
                }
            }
            
            return phoneCallData;
        }));
        res.status(200).json({ 
            err: false, 
            msg: 'Client phone calls retrieved successfully', 
            calls: enrichedPhoneNumbers
        });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};  
const listArchived = async (req, res) => {
    try {
        const clients = await Client.findAll({
            where: { isActive: false },
            include: [
                {
                    model: ClientAddress,
                    as: 'ClientAddresses',
                },
                {
                    model: ClientEmail,
                    as: 'ClientEmails',
                },
                {
                    model: ClientNote,
                    as: 'ClientNotes',
                },
                {
                    model: ClientPhoneNumber,
                    as: 'ClientPhoneNumbers',
                },
                {
                    model: Priority,
                    as: 'Priority',
                },
            ],
        });

        res.status(200).json({
            err: false,
            msg: 'Archived clients successfully retrieved',
            clients,
        });
    } catch (error) {
        console.error("Error retrieving archived clients:", error);
        res.status(500).json({
            err: true,
            msg: 'Failed to retrieve archived clients',
            error: error.message,
        });
    }
};
const listArchivedEvents = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Client ID is required.' });
        }

        const events = await Event.findAll({
            where: { clientId: id, isActive: false },
            include: [
                {
                    model: Group,
                    as: 'Group',
                },
                {
                    model: RecurrencePattern,
                    as: 'RecurrencePattern',
                },
                { model: EventType, as: 'EventType', attributes: ['id', 'name', 'backgroundColor'] },
                { model: EventStatus, as: 'EventStatus', attributes: ['id', 'name'] },
                { model: EventCategory, as: 'EventCategory', attributes: ['id', 'name'] },
                { 
                    model: User, 
                    as: 'Creator', 
                    attributes: ['id', 'firstName', 'lastName'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
                { model: RecurrencePattern, as: 'RecurrencePattern', attributes: ['id', 'frequency', 'interval'] },
            ],
            order: [['endDate', 'DESC']],
        });

        res.status(200).json({
            err: false,
            msg: 'Archived client events successfully retrieved',
            events,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: 'Error retrieving archived client events',
            details: err.message,
        });
    }
};
const listArchivedEstimates = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Client ID is required.' });
        }

        const estimates = await Estimate.findAll({
            where: { clientId: id, isActive: false },
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
                {
                    model: EstimateStatus,
                    as: 'EstimateStatus'
                },
                {
                    model: User,
                    as: 'AssignedUser',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: EstimateSignature,
                    as: 'EstimateSignature'
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            err: false,
            msg: 'Archived client estimates successfully retrieved',
            estimates,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: 'Error retrieving archived client estimates',
            details: err.message,
        });
    }
};
const listArchivedPhotos = async (req, res) => {
    try {
        const { id, type, eventId, marketingId } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Client ID is required.' });
        }

        let filter = { clientId: id, isActive: false };
        if (type === 'events') {
            filter.eventId = eventId;
        } else if (type === 'estimates') {
            filter.estimateId = estimateId;
        } else if (type === 'marketing') {
            filter.marketingId = marketingId;
        }

        const images = await Image.findAll({
            where: filter,
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            err: false,
            msg: 'Archived client photos successfully retrieved',
            images,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: 'Error retrieving archived client photos',
            details: err.message,
        });
    }
};
const listArchivedDocuments = async (req, res) => {
    try {
        const { id, type, eventId, marketingId } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Client ID is required.' });
        }

        let filter = { clientId: id, isActive: false };
        if (type === 'events') {
            filter.eventId = eventId;
        } else if (type === 'marketing') {
            filter.marketingId = marketingId;
        }

        const documents = await Document.findAll({
            where: filter,
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            err: false,
            msg: 'Archived client documents successfully retrieved',
            documents,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: 'Error retrieving archived client documents',
            details: err.message,
        });
    }
};
const listArchivedVideos = async (req, res) => {
    try {
        const { id, type, eventId, marketingId } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Client ID is required.' });
        }

        let filter = { clientId: id, isActive: false };
        if (type === 'events') {
            filter.eventId = eventId;
        } else if (type === 'marketing') {
            filter.marketingId = marketingId;
        }

        const videos = await Video.findAll({
            where: filter,
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            err: false,
            msg: 'Archived client videos successfully retrieved',
            videos,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: 'Error retrieving archived client videos',
            details: err.message,
        });
    }
};
const listArchivedWorkOrders = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Client ID is required.' });
        }

        const workOrders = await WorkOrder.findAll({
            where: { clientId: id, isActive: false },
            include: [
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
                    model: WorkOrderLineItem,
                    as: 'LineItems',
                    include: [
                        {
                            model: Item,
                            as: 'Item'
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            err: false,
            msg: 'Archived client work orders successfully retrieved',
            workOrders,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: 'Error retrieving archived client work orders',
            details: err.message,
        });
    }
};
const listArchivedInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            where: { isActive: false },
            include: [
                {
                    model: Client,
                    as: 'Client',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Estimate,
                    as: 'Estimate',
                    attributes: ['id', 'total']
                },
                {
                    model: WorkOrder,
                    as: 'WorkOrder',
                    attributes: ['id', 'workOrderNumber', 'cost']
                },
                {
                    model: InvoiceLineItem,
                    as: 'InvoiceLineItems',
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            err: false,
            msg: 'Archived invoices successfully retrieved',
            invoices,
        });
    } catch (error) {
        console.error('Error retrieving archived invoices:', error);
        res.status(500).json({
            err: true,
            msg: 'Error retrieving archived invoices',
            details: error.message
        });
    }
};
const listArchivedClientAddresses = async (req, res) => {
    try {
        const clientAddresses = await ClientAddress.findAll({
            where: { isActive: false },
            include: [
                {
                    model: Client,
                    as: 'Client',
                },
                {
                    model: State,
                    as: 'State',
                },
            ],
        });

        res.status(200).json({
            err: false,
            msg: 'Archived client addresses successfully retrieved',
            clientAddresses,
        });
    } catch (error) {
        console.error("Error retrieving archived client addresses:", error);
        res.status(500).json({
            err: true,
            msg: 'Failed to retrieve archived client addresses',
            error: error.message,
        });
    }
};
const listArchivedClientEmails = async (req, res) => {
    try {
        const clientEmails = await ClientEmail.findAll({
            where: { isActive: false },
            include: [
                {
                    model: Client,
                    as: 'Client',
                },
            ],
        });

        res.status(200).json({
            err: false,
            msg: 'Archived client emails successfully retrieved',
            clientEmails,
        });
    } catch (error) {
        console.error("Error retrieving archived client emails:", error);
        res.status(500).json({
            err: true,
            msg: 'Failed to retrieve archived client emails',
            error: error.message,
        });
    }
};
const listArchivedClientNotes = async (req, res) => {
    try {
        const clientNotes = await ClientNote.findAll({
            where: { isActive: false },
            include: [
                {
                    model: Client,
                    as: 'Client',
                },
            ],
        });

        res.status(200).json({
            err: false,
            msg: 'Archived client notes successfully retrieved',
            clientNotes,
        });
    } catch (error) {
        console.error("Error retrieving archived client notes:", error);
        res.status(500).json({
            err: true,
            msg: 'Failed to retrieve archived client notes',
            error: error.message,
        });
    }
};
const listArchivedClientPhoneNumbers = async (req, res) => {
    try {
        const clientPhoneNumbers = await ClientPhoneNumber.findAll({
            where: { isActive: false },
            include: [
                {
                    model: Client,
                    as: 'Client',
                },
            ],
        });

        res.status(200).json({
            err: false,
            msg: 'Archived client phone numbers successfully retrieved',
            clientPhoneNumbers,
        });
    } catch (error) {
        console.error("Error retrieving archived client phone numbers:", error);
        res.status(500).json({
            err: true,
            msg: 'Failed to retrieve archived client phone numbers',
            error: error.message,
        });
    }
};
const create = async (req, res) => {
    const { 
        id, 
        firstName, 
        lastName, 
        email, 
        phoneNumber, 
        street1, 
        street2, 
        city, 
        state, 
        zip, 
        country, 
        notes, 
        type, 
        isActive 
    } = req.body;

    try {
        const newClient = await Client.create({
            id: id !== undefined && id !== null ? id : undefined,
            firstName: firstName !== undefined && firstName !== null ? firstName : undefined,
            lastName: lastName !== undefined && lastName !== null ? lastName : undefined,
            email: email !== undefined && email !== null ? email : undefined,
            phoneNumber: phoneNumber !== undefined && phoneNumber !== null ? phoneNumber : undefined,
            street1: street1 !== undefined && street1 !== null ? street1 : undefined,
            street2: street2 !== undefined && street2 !== null ? street2 : undefined,
            city: city !== undefined && city !== null ? city : undefined,
            state: state !== undefined && state !== null ? state : undefined,
            zip: zip !== undefined && zip !== null ? zip : undefined,
            country: country !== undefined && country !== null ? country : undefined,
            notes: notes !== undefined && notes !== null ? notes : undefined,
            type: type !== undefined && type !== null ? type : undefined,
            isActive: isActive !== undefined && isActive !== null ? isActive : true
        });
        res.status(201).json({ err: false, msg: 'Client created successfully', client: newClient });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const createClientAddress = async (req, res) => {
    const { 
        title,
        clientId, 
        street1, 
        street2, 
        city, 
        stateId, 
        zipCode, 
        latitude, 
        longitude, 
        isPrimary,
    } = req.body;

    try {
        console.log('Creating client address with data:', req.body);
        if (!clientId) {
            return res.status(400).json({ err: true, msg: 'Client ID is required' });
        }
        const newAddress = await ClientAddress.create({
            title,
            clientId,
            street1,
            street2,
            city,
            stateId,
            zipCode,
            latitude,
            longitude,
            isPrimary,
            userId: req.userId
        },
        {
            userId: req.userId, // Pass the userId here
        });
        res.status(201).json({ err: false, msg: 'Address created successfully', address: newAddress });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const createClientEmail = async (req, res) => {
    const { 
        id, 
        title,
        clientId, 
        email
    } = req.body;

    try {
        const newEmail = await ClientEmail.create({
            id: id !== undefined && id !== null ? id : undefined,
            title: title !== undefined && title !== null ? title : undefined,
            clientId: clientId !== undefined && clientId !== null ? clientId : undefined,
            email: email !== undefined && email !== null ? email : undefined,
            isActive: true
        },
        {
            userId: req.userId, // Pass the userId here
        });
        res.status(201).json({ err: false, msg: 'Email created successfully', email: newEmail });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const createClientNote = async (req, res) => {
    const { 
        title,
        clientId, 
        content,
    } = req.body;

    try {
        console.log('Creating client note with data:', req.body);
        const newNote = await ClientNote.create({
            title: title !== undefined && title !== null ? title : undefined,
            clientId: clientId !== undefined && clientId !== null ? clientId : undefined,
            content: content !== undefined && content !== null ? content : undefined,
            isActive: true,
            userId: req.userId
        },
        {
            userId: req.userId, // Pass the userId here
        });
        console.log('New note created:', newNote);
        res.status(201).json({ err: false, msg: 'Note created successfully', note: newNote });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const createClientPhoneNumber = async (req, res) => {
    const { 
        id, 
        title,
        clientId, 
        number, 
        isActive 
    } = req.body;

    try {
        const newPhoneNumber = await ClientPhoneNumber.create({
            id: id !== undefined && id !== null ? id : undefined,
            title: title !== undefined && title !== null ? title : undefined,
            clientId: clientId !== undefined && clientId !== null ? clientId : undefined,
            number: number !== undefined && number !== null ? number : undefined,
            isActive: isActive !== undefined && isActive !== null ? isActive : true,
            userId: req.userId
        },
        {
            userId: req.userId, // Pass the userId here
        });
        res.status(201).json({ err: false, msg: 'Phone number created successfully', phoneNumber: newPhoneNumber });
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const update = async (req, res) => {
    try {
        const {
            id,
            firstName,
            lastName,
            parentClientId,
            priorityId
        } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: "Client ID is required."
            });
        }

        const client = await Client.findOne({ where: { id, isActive: true } });

        if (!client) {
            return res.status(404).json({
                err: true,
                msg: "Client not found."
            });
        }

        const oldClientData = client.toJSON();
        const changes = {};

        const formatValueForDescription = async (field, value) => {
            switch (field) {
                case 'priorityId': {
                    const priority = value ? await Priority.findByPk(value) : null;
                    return priority ? priority.name : 'Priority Not Found';
                }
                case 'parentClientId': {
                    const parentClient = value ? await Client.findByPk(value) : null;
                    return parentClient ? `${parentClient.firstName} ${parentClient.lastName}` : 'Parent Client Not Found';
                }
                default:
                    return value;
            }
        };

        const compareAndUpdate = async (field, newValue) => {
            const oldValue = oldClientData[field];
            if (newValue !== oldValue) {
                const formattedOldValue = await formatValueForDescription(field, oldValue);
                const formattedNewValue = await formatValueForDescription(field, newValue);

                changes[field] = {
                    oldValue: oldValue || null,
                    newValue: newValue || null,
                    description: `${formattedOldValue || oldValue} was changed to ${formattedNewValue || newValue}`
                };

                return newValue;
            }
            return oldValue;
        };

        client.firstName = await compareAndUpdate('firstName', firstName);
        client.lastName = await compareAndUpdate('lastName', lastName);
        client.parentClientId = await compareAndUpdate('parentClientId', parentClientId);
        client.priorityId = await compareAndUpdate('priorityId', priorityId);

        await client.save({
            individualHooks: true,
            context: {
                changes,
                changedBy: req.userId
            }
        });

        res.status(200).json({
            err: false,
            msg: "Client updated successfully.",
            changes
        });
    } catch (error) {
        console.error("Error updating client:", error);
        res.status(500).json({
            err: true,
            msg: "Failed to update client.",
            error: error.message
        });
    }
};
const updateClientAddress = async (req, res) => {
    try {
        const {
            id,
            title,
            street1,
            street2,
            city,
            stateId,
            zipCode,
            latitude,
            longitude,
            isPrimary
        } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: "Address ID is required."
            });
        }

        const address = await ClientAddress.findOne({ where: { id, isActive: true } });

        if (!address) {
            return res.status(404).json({
                err: true,
                msg: "Address not found."
            });
        }

        const oldAddressData = address.toJSON();
        const changes = {};

        const compareAndUpdate = async (field, newValue) => {
            const oldValue = oldAddressData[field];
            if (newValue !== oldValue) {
                changes[field] = {
                    oldValue: oldValue || null,
                    newValue: newValue || null,
                    description: `${oldValue || 'null'} was changed to ${newValue || 'null'}`
                };
                return newValue;
            }
            return oldValue;
        };

        address.title = await compareAndUpdate('title', title);
        address.street1 = await compareAndUpdate('street1', street1);
        address.street2 = await compareAndUpdate('street2', street2);
        address.city = await compareAndUpdate('city', city);
        address.stateId = await compareAndUpdate('stateId', stateId);
        address.zipCode = await compareAndUpdate('zipCode', zipCode);
        address.latitude = await compareAndUpdate('latitude', latitude);
        address.longitude = await compareAndUpdate('longitude', longitude);

        if (isPrimary !== undefined && isPrimary !== null) {
            if (isPrimary) {
                // Make this address primary and update others to non-primary
                await ClientAddress.update(
                    { isPrimary: false },
                    { where: { clientId: address.clientId, id: { [Sequelize.Op.ne]: id }, isActive: true } }
                );
                address.isPrimary = true;
            } else if (address.isPrimary && !isPrimary) {
                // If removing primary, assign the newest address as primary
                const newestAddress = await ClientAddress.findOne({
                    where: { clientId: address.clientId, isActive: true },
                    order: [['createdAt', 'DESC']]
                });
                if (newestAddress && newestAddress.id !== address.id) {
                    newestAddress.isPrimary = true;
                    await newestAddress.save();
                }
                address.isPrimary = false;
            }
        }

        await address.save({
            individualHooks: true,
            context: {
                changes,
                changedBy: req.userId
            }
        });

        res.status(200).json({
            err: false,
            msg: "Address updated successfully.",
            changes
        });
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json({
            err: true,
            msg: "Failed to update address.",
            error: error.message
        });
    }
};
const updateClientEmail = async (req, res) => {
    try {
        const {
            id,
            title,
            email,
            isPrimary
        } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: "Email ID is required."
            });
        }

        const clientEmail = await ClientEmail.findOne({ where: { id, isActive: true } });

        if (!clientEmail) {
            return res.status(404).json({
                err: true,
                msg: "Email not found."
            });
        }

        const oldEmailData = clientEmail.toJSON();
        const changes = {};

        const compareAndUpdate = async (field, newValue) => {
            const oldValue = oldEmailData[field];
            if (newValue !== oldValue) {
                changes[field] = {
                    oldValue: oldValue || null,
                    newValue: newValue || null,
                    description: `${oldValue || 'null'} was changed to ${newValue || 'null'}`
                };
                return newValue;
            }
            return oldValue;
        };

        clientEmail.title = await compareAndUpdate('title', title);
        clientEmail.isPrimary = await compareAndUpdate('Primary', isPrimary);
        clientEmail.email = await compareAndUpdate('email', email);

        if (isPrimary !== undefined && isPrimary !== null) {
            if (isPrimary) {
                await ClientEmail.update(
                    { isPrimary: false },
                    { where: { clientId: clientEmail.clientId, id: { [Sequelize.Op.ne]: id }, isActive: true } }
                );
                clientEmail.isPrimary = true;
            } else if (clientEmail.isPrimary && !isPrimary) {
                const newestEmail = await ClientEmail.findOne({
                    where: { clientId: clientEmail.clientId, isActive: true },
                    order: [['createdAt', 'DESC']]
                });
                if (newestEmail && newestEmail.id !== clientEmail.id) {
                    newestEmail.isPrimary = true;
                    await newestEmail.save();
                }
                clientEmail.isPrimary = false;
            }
        }

        await clientEmail.save({
            individualHooks: true,
            context: {
                changes,
                changedBy: req.userId
            }
        });

        res.status(200).json({
            err: false,
            msg: "Email updated successfully.",
            changes
        });
    } catch (error) {
        console.error("Error updating email:", error);
        res.status(500).json({
            err: true,
            msg: "Failed to update email.",
            error: error.message
        });
    }
};
const updateClientNote = async (req, res) => {
    try {
        const {
            id,
            title,
            content,
            isImportant
        } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: "Note ID is required."
            });
        }

        const clientNote = await ClientNote.findOne({ where: { id, isActive: true } });

        if (!clientNote) {
            return res.status(404).json({
                err: true,
                msg: "Note not found."
            });
        }

        const oldNoteData = clientNote.toJSON();
        const changes = {};

        const compareAndUpdate = async (field, newValue) => {
            const oldValue = oldNoteData[field];
            if (newValue !== oldValue) {
                changes[field] = {
                    oldValue: oldValue || null,
                    newValue: newValue || null,
                    description: `${oldValue || 'null'} was changed to ${newValue || 'null'}`
                };
                return newValue;
            }
            return oldValue;
        };

        clientNote.title = await compareAndUpdate('title', title);
        clientNote.isImportant = await compareAndUpdate('isImportant', isImportant);
        clientNote.content = await compareAndUpdate('content', content);

        await clientNote.save({
            individualHooks: true,
            context: {
                changes,
                changedBy: req.userId
            }
        });

        res.status(200).json({
            err: false,
            msg: "Note updated successfully.",
            changes
        });
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({
            err: true,
            msg: "Failed to update note.",
            error: error.message
        });
    }
};
const updateClientPhoneNumber = async (req, res) => {
    try {
        const {
            id,
            clientId,
            title,
            number,
            type,
            isPrimary
        } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: "Phone number ID is required."
            });
        }

        const clientPhoneNumber = await ClientPhoneNumber.findOne({ where: { id, isActive: true } });

        if (!clientPhoneNumber) {
            return res.status(404).json({
                err: true,
                msg: "Phone number not found."
            });
        }

        const oldPhoneNumberData = clientPhoneNumber.toJSON();
        const changes = {};

        const compareAndUpdate = async (field, newValue) => {
            const oldValue = oldPhoneNumberData[field];
            if (newValue !== oldValue) {
                changes[field] = {
                    oldValue: oldValue || null,
                    newValue: newValue || null,
                    description: `${oldValue || 'null'} was changed to ${newValue || 'null'}`
                };
                return newValue;
            }
            return oldValue;
        };

        clientPhoneNumber.title = await compareAndUpdate('title', title);
        clientPhoneNumber.number = await compareAndUpdate('number', number);
        clientPhoneNumber.type = await compareAndUpdate('type', type);
        clientPhoneNumber.isPrimary = await compareAndUpdate('isPrimary', isPrimary);

        if (isPrimary !== undefined && isPrimary !== null) {
            if (isPrimary) {
                await ClientPhoneNumber.update(
                    { isPrimary: false },
                    { where: { clientId: clientPhoneNumber.clientId, id: { [Sequelize.Op.ne]: id }, isActive: true } }
                );
                clientPhoneNumber.isPrimary = true;
            } else if (clientPhoneNumber.isPrimary && !isPrimary) {
                const newestPhoneNumber = await ClientPhoneNumber.findOne({
                    where: { clientId: clientPhoneNumber.clientId, isActive: true },
                    order: [['createdAt', 'DESC']]
                });
                if (newestPhoneNumber && newestPhoneNumber.id !== clientPhoneNumber.id) {
                    newestPhoneNumber.isPrimary = true;
                    await newestPhoneNumber.save();
                }
                clientPhoneNumber.isPrimary = false;
            }
        }

        await clientPhoneNumber.save({
            individualHooks: true,
            context: {
                changes,
                changedBy: req.userId
            }
        });

        res.status(200).json({
            err: false,
            msg: "Phone number updated successfully.",
            changes
        });
    } catch (error) {
        console.error("Error updating phone number:", error);
        res.status(500).json({
            err: true,
            msg: "Failed to update phone number.",
            error: error.message
        });
    }
};
const deleteClient = async (req, res) => {
    const { id } = req.body;

    try {
        const [updated] = await Client.update({ isActive: false }, { where: { id } });
        if (updated) {
            res.status(200).json({ err: false, msg: 'Client deleted successfully' });
        } else {
            res.status(404).json({ err: true, msg: 'Client not found' });
        }
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const deleteClientAddress = async (req, res) => {
    const { id } = req.body;

    try {
        const [updated] = await ClientAddress.update(
            { isActive: false }, 
            { where: { id } },
            {
                userId: req.userId, // Pass the userId here
            }
        );
        if (updated) {
            res.status(200).json({ err: false, msg: 'Address deleted successfully' });
        } else {
            res.status(404).json({ err: true, msg: 'Address not found' });
        }
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const deleteClientEmail = async (req, res) => {
    const { id } = req.body;

    try {
        const [updated] = await ClientEmail.update(
            { isActive: false }, 
            { where: { id } },
            {
                userId: req.userId, // Pass the userId here
            }
        );
        if (updated) {
            res.status(200).json({ err: false, msg: 'Email deleted successfully' });
        } else {
            res.status(404).json({ err: true, msg: 'Email not found' });
        }
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const deleteClientNote = async (req, res) => {
    const { id } = req.body;

    try {
        const [updated] = await ClientNote.update(
            { isActive: false }, 
            { where: { id } },
            {
                userId: req.userId, // Pass the userId here
            }
        );
        if (updated) {
            res.status(200).json({ err: false, msg: 'Note deleted successfully' });
        } else {
            res.status(404).json({ err: true, msg: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};
const deleteClientPhoneNumber = async (req, res) => {
    const { id } = req.body;

    try {
        const [updated] = await ClientPhoneNumber.update(
            { isActive: false }, 
            { where: { id } },
            {
                userId: req.userId, // Pass the userId here
            }
        );
        if (updated) {
            res.status(200).json({ err: false, msg: 'Phone number deleted successfully' });
        } else {
            res.status(404).json({ err: true, msg: 'Phone number not found' });
        }
    } catch (error) {
        res.status(500).json({ err: true, msg: error.message });
    }
};

module.exports = {
    get,
    list,
    listEvents,
    listEstimates,
    listPhotos,
    listDocuments,
    listVideos,
    listWorkOrders,
    listInvoices,
    listClientAddresses,
    listClientEmails,
    listClientNotes,
    listClientPhoneNumbers,
    listEmails,
    listPhoneCalls,
    listArchived,
    listArchivedEvents,
    listArchivedEstimates,
    listArchivedPhotos,
    listArchivedDocuments,
    listArchivedVideos,
    listArchivedWorkOrders,
    listArchivedInvoices,
    listArchivedClientAddresses,
    listArchivedClientEmails,
    listArchivedClientNotes,
    listArchivedClientPhoneNumbers,
    create,
    createClientAddress,
    createClientEmail,
    createClientNote,
    createClientPhoneNumber,
    update,
    updateClientAddress,
    updateClientEmail,
    updateClientNote,
    updateClientPhoneNumber,
    deleteClient,
    deleteClientAddress,
    deleteClientEmail,
    deleteClientNote,
    deleteClientPhoneNumber
};