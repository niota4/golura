const env = process.env;
const _ = require('lodash');
const { RRule, RRuleSet } = require('rrule');
const { Sequelize, Op, where } = require('sequelize');
const { createNotification, updateNotification } = require('./notifications');
const { getEventNotificationUsers, sendNotificationsToUsers } = require('../helpers/notificationHelpers');
const { 
    Event, 
    EventType, 
    EventStatus, 
    EventParticipant,
    EventCategory,
    EventCheckin,
    RecurrencePattern,
    EventReminderType,
    Reminder,
    Address,
    Email,
    PhoneNumber,
    User, 
    UserPreference,
    Company,
    Client,
    ClientAddress,
    ClientEmail,
    ClientPhoneNumber,
    Estimate,
    EstimateActivity,
    EstimateStatus,
    EstimateSignature,
    EstimateFollowUp,
    State,
    ReminderType,
    Item,
    Priority,
    Role, 
    Group,
    UserGroup,
    RoleGroup,
    Image,
    Document, 
    Video,
    Form,
    FormSubmission,
    WorkOrder,
    WorkOrderLineItem,
    WorkOrderStatus,
    PurchaseOrder,
    PurchaseOrderItem,
    GroupEventType,
    ToDo
} = require('../models');
const { dateRange } = require('../helpers/paginate');
const { computeRecurringEventInstances } = require('../helpers/recurring'); 
const { sendEventCreationEmail, sendAddParticipantEmail } = require('../helpers/emails'); // Import the email functions
const { re, mode } = require('mathjs');
const { event } = require('jquery');


const validateEventData = (data) => {
    const requiredFields = ['title', 'startDate', 'endDate', 'priorityId', 'creatorId'];

    // Check for required fields
    for (let field of requiredFields) {
        if (!data[field]) {
            throw new Error(`${field} is required.`);
        }
    }

    // Ensure startDate is before endDate
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate > endDate) {
        throw new Error('Start date cannot be later than end date.');
    }

    return true;
};
const get = async (req, res) => {
    try {
        const eventId = req.body.id;

        if (!eventId) {
            return res.status(400).json({ err: true, msg: 'Event ID is required' });
        }

        // Fetch the event and essential associations
        const event = await Event.findOne({
            where: { id: eventId, isActive: true },
            include: [
                {
                    model: EventParticipant,
                    as: 'EventParticipants',
                    include: [
                        {
                            model: User,
                            as: 'User',
                            attributes: ['id', 'email', 'firstName', 'lastName', 'roleId', 'profilePictureUrl', 'phoneNumber', 'lastSeen', 'isActive'],
                            include: [
                                { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                            ]
                        }
                    ]
                },
                {
                    model: EventReminderType,
                    as: 'EventReminderTypes'
                },
                {
                    model: Reminder,
                    as: 'Reminders'
                },
                {
                    model: EventType,
                    as: 'EventType',
                    attributes: ['id', 'name', 'backgroundColor', 'requireCheckIn', 'requireCheckOut']
                },
                {
                    model: EventStatus,
                    as: 'EventStatus',
                    attributes: ['id', 'name']
                },
                {
                    model: EventCategory,
                    as: 'EventCategory',
                    attributes: ['id', 'name']
                },
                {
                    model: Client,
                    as: 'Client',
                    attributes: ['id', 'firstName', 'lastName'],
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
                        { model: ClientEmail, as: 'ClientEmails', attributes: ['id', 'email'] },
                        { model: ClientPhoneNumber, as: 'ClientPhoneNumbers', attributes: ['id', 'number'] },
                    ]
                },
                {
                    model: Group,
                    as: 'Group',
                    attributes: ['id', 'name'],
                    required: false
                },
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
                {
                    model: User,
                    as: 'Completer',
                    attributes: ['id', 'firstName', 'lastName'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
                {
                    model: RecurrencePattern,
                    as: 'RecurrencePattern',
                    attributes: ['id', 'frequency', 'interval']
                },
                {
                    model: EventCheckin,
                    as: 'EventCheckins',
                    where: { userId: req.userId, isActive: true },
                    required: false // Ensure this does not block the query
                }
            ],
        });

        if (!event) {
            return res.status(404).json({ err: true, msg: 'Event not found' });
        }

        let eventAddress = await Address.findOne({
            where: { id: event.addressId },
            include: [
                {
                    model: State,
                    as: 'State'
                }
            ]
        });
        if (event.clientId) {
            eventAddress = await ClientAddress.findOne({
                where: { id: event.addressId },
                include: [
                    {
                        model: State,
                        as: 'State'
                    }
                ]
            });
        }

        // Process Event Participants and attach relevant reminders
        const participants = event.EventParticipants.map(participant => {
            const userReminders = event.Reminders?.filter(
                reminder => reminder.userId === participant.userId
            );

            const clientReminders = event.Reminders?.filter(
                reminder => reminder.clientId === participant.clientId
            );

            return {
                ...participant.toJSON(),
                Reminders: [...(userReminders || []), ...(clientReminders || [])],
            };
        });

        // Map Reminder Types for easy selection toggle
        const reminderTypes = event.EventReminderTypes.map(evtReminder => ({
            ...evtReminder.ReminderType?.toJSON(),
            selected: true,
        }));

        res.status(200).json({
            err: false,
            msg: 'Event successfully retrieved',
            event: {
                ...event.toJSON(),
                EventParticipants: participants,
                ReminderTypes: reminderTypes,
                Address: eventAddress
            },
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        return res.status(500).json({ err: true, msg: 'Failed to retrieve event', error: error.message });
    }
};
const getWorkOrder = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'eventId is required',
            });
        }

        const workOrder = await WorkOrder.findOne({
            where: {
                eventId: id,
                isActive: true,
            },
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
                    include: [
                        { 
                            model: Item, 
                            as: 'Item'
                        }
                    ]
                }
            ],
        });
        return res.status(200).json({
            err: false,
            msg: 'Active work order successfully retrieved.',
            workOrder,
        });
    } catch (error) {
        console.error('Error retrieving active work order:', error);
        return res.status(500).json({
            err: true,
            msg: 'An error occurred while retrieving the work order.',
            details: error.message,
        });
    }
};
const getEventsForCalendarSync = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const userId = req.userId; // Get from auth middleware, not request body
        
        if (!userId) {
            return res.status(400).json({ err: true, msg: 'User authentication required' });
        }

        // Default to next 3 months if no date range provided
        let syncStartDate = startDate ? new Date(startDate) : new Date();
        let syncEndDate = endDate ? new Date(endDate) : new Date();
        if (!endDate) {
            syncEndDate.setMonth(syncEndDate.getMonth() + 3);
        }

        // Fetch user and their groups (same logic as list function)
        const user = await User.findByPk(userId, {
            include: [
                { model: Role, as: 'Role' },
                { model: Group, as: 'Groups' }
            ],
        });

        if (!user) {
            return res.status(404).json({ err: true, msg: 'User not found' });
        }

        const userGroupIds = user.Groups ? user.Groups.map(group => group.id) : [];

        // Fetch groups associated with the user's role
        const roleGroups = await RoleGroup.findAll({
            where: { roleId: user.roleId },
            attributes: ['groupId']
        });
        const roleGroupIds = roleGroups.map(roleGroup => roleGroup.groupId);

        // Combine user and role group IDs
        const combinedGroupIds = [...new Set([...userGroupIds, ...roleGroupIds])];

        if (combinedGroupIds.length === 0) {
            return res.status(200).json({
                err: false,
                msg: 'No events found - user not in any groups',
                events: []
            });
        }

        // Fetch event types associated with the combined groups
        const groupEventTypeRecords = await GroupEventType.findAll({
            where: { groupId: combinedGroupIds },
            attributes: ['eventTypeId']
        });
        const eventTypeIds = groupEventTypeRecords.map(record => record.eventTypeId);

        if (eventTypeIds.length === 0) {
            return res.status(200).json({
                err: false,
                msg: 'No events found - no event types for user groups',
                events: []
            });
        }

        // Fetch non-recurring events within the time frame
        const nonRecurringEvents = await Event.findAll({
            where: {
                groupId: combinedGroupIds,
                eventTypeId: eventTypeIds,
                startDate: { [Op.between]: [syncStartDate, syncEndDate] },
                isActive: true,
                recurring: false
            },
            include: [
                { 
                    model: EventType, 
                    as: 'EventType',
                    attributes: ['id', 'name', 'backgroundColor', 'requireCheckIn', 'requireCheckOut']
                },
                { 
                    model: Group, 
                    as: 'Group',
                    attributes: ['id', 'name']
                },
                { 
                    model: RecurrencePattern, 
                    as: 'RecurrencePattern',
                    attributes: ['id', 'frequency', 'interval']
                },
                {
                    model: EventReminderType,
                    as: 'EventReminderTypes'
                }
            ]
        });

        // Fetch recurring events
        const recurringEvents = await Event.findAll({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { groupId: combinedGroupIds },
                            { groupId: null }
                        ]
                    },
                    {
                        eventTypeId: eventTypeIds,
                        isActive: true,
                        recurring: true
                    }
                ]
            },
            include: [
                { 
                    model: EventType, 
                    as: 'EventType',
                    attributes: ['id', 'name', 'backgroundColor', 'requireCheckIn', 'requireCheckOut']
                },
                { 
                    model: Group, 
                    as: 'Group', 
                    required: false,
                    attributes: ['id', 'name']
                },
                { 
                    model: RecurrencePattern, 
                    as: 'RecurrencePattern',
                    attributes: ['id', 'frequency', 'interval']
                },
                {
                    model: EventReminderType,
                    as: 'EventReminderTypes'
                }
            ]
        });

        // Combine all events
        const allEvents = [...nonRecurringEvents, ...recurringEvents];

        // Add address and reminder type details for each event
        const eventsWithDetails = await Promise.all(allEvents.map(async (event) => {
            const eventData = event instanceof Event ? event.toJSON() : event;

            let address = null;
            if (eventData.clientId) {
                address = await ClientAddress.findOne({ 
                    where: { id: eventData.addressId },
                    include: [{
                        model: State,
                        as: 'State'
                    }]
                });
            } else if (eventData.addressId) {
                address = await Address.findOne({ 
                    where: { id: eventData.addressId },
                    include: [{
                        model: State,
                        as: 'State'
                    }]
                });
            }

            // Fetch reminder type details for each EventReminderType
            const reminderTypes = [];
            if (eventData.EventReminderTypes && Array.isArray(eventData.EventReminderTypes)) {
                for (const ert of eventData.EventReminderTypes) {
                    try {
                        const reminderType = await ReminderType.findByPk(ert.reminderTypeId);
                        if (reminderType) {
                            reminderTypes.push({
                                id: reminderType.id,
                                name: reminderType.name,
                                minutesBefore: 15 // Default value since ReminderType doesn't have this field
                            });
                        }
                    } catch (error) {
                        console.error('Error fetching reminder type:', error);
                    }
                }
            }

            return {
                ...eventData,
                Address: address ? address.toJSON() : null,
                reminderTypes: reminderTypes
            };
        }));

        return res.status(200).json({
            err: false,
            msg: `${eventsWithDetails.length} events found for calendar sync`,
            events: eventsWithDetails,
            syncInfo: {
                userId: userId,
                dateRange: {
                    startDate: syncStartDate.toISOString(),
                    endDate: syncEndDate.toISOString()
                },
                eventCount: eventsWithDetails.length
            }
        });

    } catch (error) {
        console.error('Error getting events for calendar sync:', error);
        return res.status(500).json({ 
            err: true, 
            msg: 'Failed to get events for calendar sync', 
            error: error.message 
        });
    }
};
const list = async (req, res) => {
    try {
        const centerDate = req.body.date ? new Date(req.body.date) : new Date();
        let startDate, endDate;

        if (req.body.startDate && req.body.endDate) {
            startDate = new Date(req.body.startDate);
            endDate = new Date(req.body.endDate);
        } else if (req.body.month) {
            // get 90 days from the center date before and after
            const rangeDays = 90;
            ({ startDate, endDate } = dateRange(rangeDays, rangeDays, centerDate));
        } else {
            const rangeDays = 30;
            ({ startDate, endDate } = dateRange(rangeDays, rangeDays, centerDate));
        }

        // Fetch user and their groups
        const user = await User.findByPk(req.userId, {
            include: [
                { model: Role, as: 'Role' },
                { model: Group, as: 'Groups' }
            ],
        });

        const userGroupIds = user.Groups.map(group => group.id);

        // Fetch groups associated with the user's role
        const roleGroups = await RoleGroup.findAll({
            where: { roleId: user.roleId },
            attributes: ['groupId']
        });
        const roleGroupIds = roleGroups.map(roleGroup => roleGroup.groupId);

        // Combine user and role group IDs
        const combinedGroupIds = [...new Set([...userGroupIds, ...roleGroupIds])];

        if (combinedGroupIds.length === 0) {
            return res.json({
                err: true,
                msg: 'You are not in any groups to see the events',
            });
        }

        // Fetch event types associated with the combined groups
        const groupEventTypeRecords = await GroupEventType.findAll({
            where: { groupId: combinedGroupIds },
            attributes: ['eventTypeId']
        });
        const eventTypeIds = groupEventTypeRecords.map(record => record.eventTypeId);

        // Fetch non-recurring events within the time frame, filtered by groups and event types
        const nonRecurringEvents = await Event.findAll({
            where: {
                groupId: combinedGroupIds,
                eventTypeId: eventTypeIds,
                startDate: { [Op.between]: [startDate, endDate] },
                isActive: true,
                recurring: false
            },
            include: [
                { model: EventType, as: 'EventType' },
                { model: Group, as: 'Group' },
                { model: RecurrencePattern, as: 'RecurrencePattern' }
            ]
        });

        // Fetch recurring events and compute instances within the time frame
        const recurringEvents = await Event.findAll({
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            { groupId: combinedGroupIds },
                            { groupId: null } // Include events with no groupId
                        ]
                    },
                    {
                        eventTypeId: eventTypeIds,
                        isActive: true,
                        recurring: true
                    }
                ]
            },
            include: [
                { model: EventType, as: 'EventType' },
                { model: Group, as: 'Group', required: false },
                { model: RecurrencePattern, as: 'RecurrencePattern' }
            ]
        });
        // Combine non-recurring events with computed recurring instances
        const allEvents = [...nonRecurringEvents, ...recurringEvents];
        // Map through the events to include the address details
        const eventsWithAddress = await Promise.all(allEvents.map(async (event) => {
            const eventData = event instanceof Event ? event.toJSON() : event;

            let address = null;
            if (eventData.clientId) {
                address = await ClientAddress.findOne({ where: { id: eventData.addressId } });
            } else {
                address = await Address.findOne({ where: { id: eventData.addressId } });
            }

            return {
                ...eventData,
                Address: address ? address.toJSON() : null
            };
        }));

        console.log('All events fetched:', eventsWithAddress.length);
        return res.status(201).json({
            err: false,
            msg: 'Events successfully retrieved',
            events: eventsWithAddress
        });
    } catch (err) {
        return res.json({
            err: true,
            msg: err.message
        });
    }
};
const listTypes = async (req, res) => {
    try {
        const eventTypes = await EventType.findAll();
        if (eventTypes) {
            res.status(201)
                .json({
                    err: false,
                    msg: 'Event Types successfully retrieved',
                    eventTypes: eventTypes
                });
        }
        else {
            res.json({
                err: true,
                msg: 'Event Types not found'
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
const listCategories = async (req, res) => {
    try {
        const categories = await EventCategory.findAll();
        if (categories) {
            res.status(201)
                .json({
                    err: false,
                    msg: 'Categories successfully retrieved',
                    categories: categories
                });
        }
        else {
            res.json({
                err: true,
                msg: 'Categories not found'
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
const listPhotos = async (req, res) => {
    const {
        id
    } = req.body;

    if (!id) {
        return res.send({
            err: true,
            msg: 'eventId is required'
        });
    }

    try {

        const images = await Image.findAll({
            where: {
                eventId: id
            }
        });
        res.status(201).send({
            err: false,
            msg: 'Event Images successfully retrieved',
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
const listToDos = async (req, res) => {
    try {
        const { eventId } = req.body;
        if (!eventId) {
            return res.status(400).json({
                err: true,
                msg: 'eventId is required',
            });
        }
        const toDos = await ToDo.findAll({
            where: {
                eventId,
                isActive: true
            },
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
                {
                    model: Client,
                    as: 'Client',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
        });

        if (toDos.length === 0) {
            return res.status(200).json({
                err: false,
                msg: 'No ToDos found for this event',
            });
        }
        return res.status(200).json({
            err: false,
            msg: 'ToDos successfully retrieved',
            toDos
        });
    } catch (error) {
        console.error('Error retrieving ToDos:', error);
        return res.status(500).json({
            err: true,
            msg: 'An error occurred while retrieving ToDos.',
            details: error.message,
        });
    }
};
const listDocuments = async (req, res) => {
    const {
        id
    } = req.body;

    if (!id) {
        return res.send({
            err: true,
            msg: 'eventId is required'
        });
    }

    try {

        const documents = await Document.findAll({
            where: {
                eventId: id
            }
        });
        res.status(201).send({
            err: false,
            msg: 'Event Documents successfully retrieved',
            documents: documents
        });
    }
    catch (err) {
        res.send({
            err: true,
            msg: 'Error finding Document',
            details: err
        });
    }
};
const listVideos = async (req, res) => {
    const {
        id
    } = req.body;

    if (!id) {
        return res.send({
            err: true,
            msg: 'eventId is required'
        });
    }

    try {

        const videos = await Video.findAll({
            where: {
                eventId: id
            }
        });
        res.status(201).send({
            err: false,
            msg: 'Event Videos successfully retrieved',
            videos: videos
        });
    }
    catch (err) {
        res.send({
            err: true,
            msg: 'Err finding videos',
            details: err
        });
    }
};
const listEstimates = async (req, res) => {
    const {
        id
    } = req.body;

    if (!id) {
        return res.send({
            err: true,
            msg: 'eventId is required'
        });
    }

    try {

        // Get all active estimates for the event that are by the id and the parentEventId 

        const estimates = await Estimate.findAll({
            where: {
                [Op.or]: [
                    { eventId: id },
                    { parentEventId: id }
                ],
                isActive: true
            },
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
            ]
        });
        res.status(201).send({
            err: false,
            msg: 'Event Estimates successfully retrieved',
            estimates
        });
    }
    catch (err) {
        res.send({
            err: true,
            msg: 'Error processing Estimates',
            details: err
        });
    }
};
const listChecklist = async (req, res) => {
    try {
        const { eventId } = req.body;
        const company = await Company.findByPk(res.companyId);

        if (!company) {
            return res.status(404).json({
                err: true,
                msg: 'Company not found'
            });
        }
        const folderId = company.eventChecklistFolderId;

        if (!folderId) {
            return res.status(404).json({
                err: true,
                msg: 'Event checklist folder not found in company settings'
            });
        }
        const checklist = await Form.findAll({
            where: { folderId, isActive: true },
            include: [
                {
                    model: FormSubmission,
                    as: 'FormSubmissions',
                    where: { userId: req.userId, eventId },
                    required: false,
                },
            ],
        });
        res.status(200).json({
            err: false,
            msg: 'Checklist Forms successfully retrieved',
            checklist,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            err: true,
            msg: 'Error retrieving checklist forms',
            details: err,
        });
    }
};
const listChecklistSubmissions = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ err: true, msg: 'Form ID is required' });
        }
        const submissions = await FormSubmission.findAll({
            where: { eventId: id },
            include: [
                {
                    model: Form,
                    as: 'Form',
                },
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [{
                        model: UserPreference,
                        as: 'Preferences',
                        attributes: ['backgroundColor']
                    }]
                },
            ],
        });
        res.status(200).json({
            err: false,
            msg: 'Checklist Form Submissions successfully retrieved',
            submissions,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            err: true,
            msg: 'Error retrieving checklist forms submissions',
            details: err,
        });
    }
};
const listEventCheckIns = async (req, res) => {
    try {
        const eventId = req.body.id;

        if (!eventId) {
            return res.status(400).json({ err: true, msg: 'Event ID is required' });
        }

        // Fetch check-ins for the event
        const checkIns = await EventCheckin.findAll({
            where: { eventId, isActive: true },
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [{
                        model: UserPreference,
                        as: 'Preferences',
                        attributes: ['backgroundColor']
                    }]
                }
            ]
        });

        return res.status(200).json({
            err: false,
            msg: 'Check-ins successfully retrieved',
            checkIns
        });
    } catch (error) {
        console.error('Error fetching check-ins:', error);
        return res.status(500).json({ err: true, msg: 'Failed to retrieve check-ins', error: error.message });
    }
};
const create = async (req, res) => {
    try {
        const {
            title,
            details,
            startDate,
            endDate,
            recurrenceEndDate,
            eventTypeId,
            recurring,
            categoryId,
            eventCategoryId,
            statusId,
            userId,
            targetUserId,
            priorityId,
            clientId,
            addressId,
            phoneNumberId,
            emailId,
            groupId,
            frequency,
            interval,
            reminderTypes // Array of reminder types with `selected` property
        } = req.body;

        // Validate event data
        validateEventData(req.body);

        if (!title || !startDate || !endDate || !eventTypeId || !priorityId) {
            return res.status(400).send({ err: true, msg: 'Missing required fields' });
        }

        // Apply default status if not provided
        let defaultStatusId = statusId;
        if (!statusId) {
            const scheduledStatus = await EventStatus.findOne({ where: { name: 'Scheduled' } });
            if (scheduledStatus) {
                defaultStatusId = scheduledStatus.id;
            } else {
                return res.status(500).send({ err: true, msg: 'Default "scheduled" status not found' });
            }
        }

        // Replace placeholders in the title with actual values or a "Not Found" statement
        let parsedTitle = title;
        const placeholderMappings = {
            clientId: async () => {
                if (clientId) {
                    const client = await Client.findByPk(clientId);
                    return client ? `${client.firstName} ${client.lastName}` : 'Client Not Found';
                }
                return 'Client Not Found';
            },
            targetUserId: async () => {
                if (targetUserId) {
                    const user = await User.findByPk(targetUserId);
                    return user ? `${user.firstName} ${user.lastName}` : 'User Not Found';
                }
                return 'User Not Found';
            },
            userId: async () => {
                if (userId) {
                    const user = await User.findByPk(userId);
                    return user ? `${user.firstName} ${user.lastName}` : 'User Not Found';
                }
                return 'User Not Found';
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
                    const status = await EventStatus.findByPk(statusId);
                    return status ? status.name : 'Status Not Found';
                }
                return 'Status Not Found';
            },
            groupId: async () => {
                if (groupId) {
                    const group = await Group.findByPk(groupId);
                    return group ? group.name : 'Group Not Found';
                }
                return 'Group Not Found';
            },
            creatorId: async () => {
                if (req.userId) {
                    const creator = await User.findByPk(req.userId);
                    return creator ? `${creator.firstName} ${creator.lastName}` : 'Creator Not Found';
                }
                return 'Creator Not Found';
            },
            createdDate: async () => new Date().toLocaleDateString(),
            eventTypeId: async () => {
                if (eventTypeId) {
                    const eventType = await EventType.findByPk(eventTypeId);
                    return eventType ? eventType.name : 'Event Type Not Found';
                }
                return 'Event Type Not Found';
            },
            addressId: async () => {
                if (addressId) {
                    const address = clientId
                        ? await ClientAddress.findByPk(addressId)
                        : await Address.findByPk(addressId);
                    return address ? `${address.street1} ${address.street2 || ''}, ${address.city}, ${address.zipCode}` : 'Address Not Found';
                }
                return 'Address Not Found';
            },
            phoneNumberId: async () => {
                if (phoneNumberId) {
                    const phoneNumber = clientId
                        ? await ClientPhoneNumber.findByPk(phoneNumberId)
                        : await PhoneNumber.findByPk(phoneNumberId);
                    return phoneNumber ? phoneNumber.number : 'Phone Number Not Found';
                }
                return 'Phone Number Not Found';
            },
            emailId: async () => {
                if (emailId) {
                    const email = clientId
                        ? await ClientEmail.findByPk(emailId)
                        : await Email.findByPk(emailId);
                    return email ? email.email : 'Email Not Found';
                }
                return 'Email Not Found';
            },
        };

        const matches = parsedTitle.match(/\[\[{.*?\"value\":\"(.*?)\".*?}\]\]/g);
        if (matches) {
            for (const match of matches) {
                const key = JSON.parse(match.replace(/^\[\[/, '').replace(/\]\]$/, '')).value;
                if (placeholderMappings[key]) {
                    const replacement = await placeholderMappings[key]();
                    parsedTitle = parsedTitle.replace(match, replacement || `${key} Not Found`);
                }
            }
        }

        // Event creation payload
        const eventPayload = {
            title: parsedTitle,
            details,
            startDate,
            endDate,
            recurring,
            eventTypeId,
            priorityId,
            categoryId,
            eventCategoryId,
            statusId: defaultStatusId,
            targetUserId,
            userId,
            clientId,
            addressId,
            phoneNumberId,
            emailId,
            groupId,
            creatorId: req.userId,
        };

        if (recurring) {
            const recurrencePayload = {
                frequency,
                interval: interval || 1,
                startDate,
                endDate: recurrenceEndDate,
                isActive: true,
            };
            const createdRecurrence = await RecurrencePattern.create(recurrencePayload);
            eventPayload.recurrencePatternId = createdRecurrence.id;
        }

        const newEvent = await Event.create(
            eventPayload,
            {
                userId: req.userId, // Pass the userId here
            }
        );

        // Fetch group users and create event participants
        let participants = [];
        if (groupId) {
            const groupUsers = await UserGroup.findAll({ where: { groupId } });
            participants = groupUsers.map(user => ({
                userId: user.userId,
                clientId: clientId, // Include clientId
                eventId: newEvent.id,
            }));
            await EventParticipant.bulkCreate(participants);
        }

        // Filter selected reminder types
        const selectedReminderTypes = reminderTypes.filter(rt => rt.selected);

        // Save selected reminder types into EventReminderTypeModel
        const reminderTypeEntries = selectedReminderTypes.map(rt => ({
            eventId: newEvent.id,
            reminderTypeId: rt.id,
        }));
        await EventReminderType.bulkCreate(reminderTypeEntries);

        // Create reminders for each participant and selected reminder type
        for (const participant of participants) {
            let emailId = participant.userId ? null : req.body.emailId;
            let phoneNumberId = participant.userId ? null : req.body.phoneNumberId;
            let clientId = participant.userId ? null : req.body.clientId;

            for (const reminderType of selectedReminderTypes) {
                await Reminder.create({
                    reminderTypeId: reminderType.id,
                    eventId: newEvent.id,
                    userId: participant.userId,
                    addressId: addressId,
                    clientId,
                    emailId,
                    phoneNumberId,
                    completedAt: null,
                });
            }

            // Send event creation email to the participant
            await sendEventCreationEmail(participant, newEvent);
        }

        // Create notifications for event creation
        try {
            const participantIds = participants.map(p => p.userId).filter(id => id);
            const assignedUserIds = [targetUserId, userId].filter(id => id);
            const usersToNotify = await getEventNotificationUsers(
                res.companyId, 
                participantIds, 
                assignedUserIds, 
                clientId
            );
            
            const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
            const creator = await User.findByPk(req.userId);
            const eventDate = new Date(startDate).toLocaleDateString();
            const eventTime = new Date(startDate).toLocaleTimeString();
            
            const message = `New event scheduled: "${parsedTitle}" on ${eventDate} at ${eventTime}`;
            
            await sendNotificationsToUsers(
                usersToNotify,
                {
                    userId: req.userId,
                    relatedModel: 'events',
                    relatedModelId: newEvent.id,
                    priorityId: priority.id,
                    title: 'New Event Scheduled',
                    message: message,
                    type: 'general'
                },
                req.userId // Don't notify the creator
            );
        } catch (notificationError) {
            console.error('Error creating event creation notifications:', notificationError);
        }

        return res.status(201).send({
            err: false,
            msg: 'Event, participants, reminders, and reminder types created successfully',
            event: newEvent
        });
    } catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).send({
            err: true,
            msg: 'Failed to create event'
        });
    }
};
const update = async (req, res) => {
    try {
        const {
            id,
            title,
            details,
            startDate,
            endDate,
            recurrenceEndDate,
            checkInDate,
            checkOutDate,
            eventTypeId,
            statusId,
            priorityId,
            clientId,
            addressId,
            emailId,
            phoneNumberId,
            groupId,
            eventCategoryId,
            recurring,
            frequency,
            userId,
            targetUserId,
            interval,
            reminderTypes,
        } = req.body;

        if (!id) {
            return res.status(400).json({ err: true, msg: "Event ID is required." });
        }

        const event = await Event.findOne({ where: { id } });
        if (!event) {
            return res.status(404).json({ err: true, msg: "Event not found." });
        }

        const oldEventData = event.toJSON();
        const changes = {};

        if (!event.checkInDate && checkInDate) {
            event.checkInDate = checkInDate;
            // look for follow-ups that  are within the same hour of the startDate of the event
            const followUpStartDate = new Date(startDate);
            followUpStartDate.setHours(followUpStartDate.getHours() - 1);
            const followUpEndDate = new Date(startDate);
            followUpEndDate.setHours(followUpEndDate.getHours() + 1);
            const followUps = await EstimateFollowUp.findAll({
                where: {
                    eventId: event.id,
                    scheduledDate: {
                        [Op.between]: [followUpStartDate, followUpEndDate]
                    },
                    completedAt: null
                }
            });

            for (const followUp of followUps) {
                const now = new Date();
                followUp.completedAt = new Date(now);
                followUp.completedBy = req.userId;
                followUp.notes = `Follow-up completed on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;

                followUp.save({
                    individualHooks: true,
                    context: {
                        changes: {
                            completedAt: {
                                oldValue: null,
                                newValue: followUp.completedAt,
                                description: `Follow-up completed at ${followUp.completedAt.toLocaleString()}`
                            },
                            completedBy: {
                                oldValue: null,
                                newValue: req.userId,
                                description: `Follow-up completed by user ID ${req.userId}`
                            },
                            notes: {
                                oldValue: followUp.notes,
                                newValue: followUp.notes,
                                description: `Follow-up notes updated to "${followUp.notes}"`
                            }
                        },
                        changedBy: req.userId
                    }
                });
                await EstimateActivity.create({
                    estimateId: followUp.estimateId,
                    relatedModel: 'EstimateFollowUp',
                    relatedModelId: followUp.id,
                    action: 'CREATE',
                    description: `Follow-up completed on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
                    fieldName: null,
                    oldValue: null,
                    newValue: followUp.completedAt,
                    changedBy: req.userId,
                    timestamp: new Date()
                });
            }
        };
        const formatValueForDescription = async (field, value, clientId = null) => {
            if (!value) return null;
            switch (field) {
                case 'addressId':
                    const address = clientId
                        ? await ClientAddress.findByPk(value, { include: [{ model: State, as: 'State' }] })
                        : await Address.findByPk(value, { include: [{ model: State, as: 'State' }] });
                    return address
                        ? `${address.street1} ${address.street2 || ''}, ${address.city}, ${address.State.abbreviation} ${address.zipCode}`
                        : 'Address Not Found';
                case 'emailId':
                    const email = clientId ? await ClientEmail.findByPk(value) : await Email.findByPk(value);
                    return email ? email.email : 'Email Not Found';
                case 'phoneNumberId':
                    const phoneNumber = clientId ? await ClientPhoneNumber.findByPk(value) : await PhoneNumber.findByPk(value);
                    return phoneNumber ? phoneNumber.number : 'Phone Number Not Found';
                case 'priorityId':
                    const priority = await Priority.findByPk(value);
                    return priority ? priority.level : 'Priority Not Found';
                case 'statusId':
                    const status = await EventStatus.findByPk(value);
                    return status ? status.name : 'Status Not Found';
                case 'eventTypeId':
                    const eventType = await EventType.findByPk(value);
                    return eventType ? eventType.name : 'Event Type Not Found';
                case 'eventCategoryId':
                    const eventCategory = await EventCategory.findByPk(value);
                    return eventCategory ? eventCategory.name : 'Event Category Not Found';
                case 'groupId':
                    const group = await Group.findByPk(value);
                    return group ? group.name : 'Group Not Found';
                default:
                    return value;
            }
        };

        const compareAndUpdate = async (field, newValue) => {
            const oldValue = oldEventData[field];
            if (newValue !== oldValue) {
                const formattedOldValue = await formatValueForDescription(field, oldValue, event.clientId);
                const formattedNewValue = await formatValueForDescription(field, newValue, event.clientId);

                changes[field] = {
                    oldValue: oldValue || null,
                    newValue: newValue || null,
                    description: `${formattedOldValue || oldValue} was changed to ${formattedNewValue || newValue}`,
                };

                return newValue;
            }
            return oldValue;
        };

        // Replace placeholders in the title with actual values or a "Not Found" statement
        let parsedTitle = title;
        let matches = null;
        const placeholderMappings = {
            clientId: async () => {
                if (clientId) {
                    const client = await Client.findByPk(clientId);
                    return client ? `${client.firstName} ${client.lastName}` : 'Client Not Found';
                }
                return 'Client Not Found';
            },
            userId: async () => {
                if (userId) {
                    const user = await User.findByPk(userId);
                    return user ? `${user.firstName} ${user.lastName}` : 'User Not Found';
                }
                return 'User Not Found';
            },
            targetUserId: async () => {
                if (targetUserId) {
                    const user = await User.findByPk(targetUserId);
                    return user ? `${user.firstName} ${user.lastName}` : 'User Not Found';
                }
                return 'User Not Found';
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
                    const status = await EventStatus.findByPk(statusId);
                    return status ? status.name : 'Status Not Found';
                }
                return 'Status Not Found';
            },
            groupId: async () => {
                if (groupId) {
                    const group = await Group.findByPk(groupId);
                    return group ? group.name : 'Group Not Found';
                }
                return 'Group Not Found';
            },
            creatorId: async () => {
                if (req.userId) {
                    const creator = await User.findByPk(req.userId);
                    return creator ? `${creator.firstName} ${creator.lastName}` : 'Creator Not Found';
                }
                return 'Creator Not Found';
            },
            createdDate: async () => new Date().toLocaleDateString(),
            eventTypeId: async () => {
                if (eventTypeId) {
                    const eventType = await EventType.findByPk(eventTypeId);
                    return eventType ? eventType.name : 'Event Type Not Found';
                }
                return 'Event Type Not Found';
            },
            addressId: async () => {
                if (addressId) {
                    const address = clientId
                        ? await ClientAddress.findByPk(addressId)
                        : await Address.findByPk(addressId);
                    return address ? `${address.street1} ${address.street2 || ''}, ${address.city}, ${address.zipCode}` : 'Address Not Found';
                }
                return 'Address Not Found';
            },
            phoneNumberId: async () => {
                if (phoneNumberId) {
                    const phoneNumber = clientId
                        ? await ClientPhoneNumber.findByPk(phoneNumberId)
                        : await PhoneNumber.findByPk(phoneNumberId);
                    return phoneNumber ? phoneNumber.number : 'Phone Number Not Found';
                }
                return 'Phone Number Not Found';
            },
            emailId: async () => {
                if (emailId) {
                    const email = clientId
                        ? await ClientEmail.findByPk(emailId)
                        : await Email.findByPk(emailId);
                    return email ? email.email : 'Email Not Found';
                }
                return 'Email Not Found';
            },
        };

        if (parsedTitle) {
            matches = parsedTitle.match(/\[\[{.*?\"value\":\"(.*?)\".*?}\]\]/g);
        }
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
        event.title = await compareAndUpdate('title', parsedTitle);
        event.details = await compareAndUpdate('details', details);
        event.startDate = await compareAndUpdate('startDate', startDate);
        event.endDate = await compareAndUpdate('endDate', endDate);
        event.eventTypeId = await compareAndUpdate('eventTypeId', eventTypeId);
        event.statusId = await compareAndUpdate('statusId', statusId);
        event.priorityId = await compareAndUpdate('priorityId', priorityId);
        event.clientId = await compareAndUpdate('clientId', clientId);
        event.addressId = await compareAndUpdate('addressId', addressId);
        event.emailId = await compareAndUpdate('emailId', emailId);
        event.targetUserId = await compareAndUpdate('targetUserId', targetUserId);
        event.userId = await compareAndUpdate('userId', userId);
        event.phoneNumberId = await compareAndUpdate('phoneNumberId', phoneNumberId);
        event.groupId = await compareAndUpdate('groupId', groupId);
        event.eventCategoryId = await compareAndUpdate('eventCategoryId', eventCategoryId);
        event.checkInDate = await compareAndUpdate('checkInDate', checkInDate);
        event.checkOutDate = await compareAndUpdate('checkOutDate', checkOutDate);
        event.recurring = await compareAndUpdate('recurring', recurring);

        if (!recurring) {
            event.recurrencePatternId = null;
        }

        // Handle recurrence pattern
        if (recurring) {
            let recurrencePattern = await RecurrencePattern.findOne({ where: { id: event.recurrencePatternId } });
            if (recurrencePattern) {
                await recurrencePattern.update({
                    frequency,
                    interval: interval || 1,
                    startDate,
                    endDate: recurrenceEndDate,
                    isActive: true,
                });
            } else {
                recurrencePattern = await RecurrencePattern.create({
                    frequency,
                    interval: interval || 1,
                    startDate,
                    endDate: recurrenceEndDate,
                    isActive: true,
                });
                event.recurrencePatternId = recurrencePattern.id;
            }
        } else if (event.recurrencePatternId) {
            await RecurrencePattern.destroy({ where: { id: event.recurrencePatternId } });
            event.recurrencePatternId = null;
        }
        // Save changes with the context for afterUpdate hook
        await event.save({
            individualHooks: true,
            context: {
                changes,
                changedBy: req.userId,
            },
        });

        // Notify participants if recurrence patterns or start/end date changes
        if (changes.recurrencePattern || changes.startDate || changes.endDate) {
            const participants = await EventParticipant.findAll({
                where: { eventId: event.id },
                include: [{ model: User, as: 'User' }]
            });

            // Enhanced notification logic
            try {
                const allUsersToNotify = [];
                const participantIds = participants.map(p => p.userId).filter(id => id);
                const assignedUserIds = [event.targetUserId, event.userId].filter(id => id);
                
                // Get all relevant users including participants and managers
                const eventUsers = await getEventNotificationUsers(
                    res.companyId, 
                    participantIds, 
                    assignedUserIds, 
                    event.clientId
                );
                
                allUsersToNotify.push(...eventUsers);
                
                // Add direct participants
                participants.forEach(p => {
                    if (p.User && !allUsersToNotify.some(u => u.id === p.User.id)) {
                        allUsersToNotify.push(p.User);
                    }
                });
                
                const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
                const changesList = [];
                
                if (changes.startDate) changesList.push(`Start: ${new Date(changes.startDate.newValue).toLocaleDateString()}`);
                if (changes.endDate) changesList.push(`End: ${new Date(changes.endDate.newValue).toLocaleDateString()}`);
                if (changes.recurrencePattern) changesList.push('Recurrence pattern updated');
                
                const changesText = changesList.length > 0 ? ` (${changesList.join(', ')})` : '';
                const message = `Event "${event.title}" has been updated${changesText}`;
                
                await sendNotificationsToUsers(
                    allUsersToNotify,
                    {
                        userId: req.userId,
                        relatedModel: 'events',
                        relatedModelId: event.id,
                        priorityId: priority.id,
                        title: 'Event Updated',
                        message: message,
                        type: 'general'
                    },
                    req.userId // Don't notify the person who updated it
                );
            } catch (notificationError) {
                console.error('Error creating event update notifications:', notificationError);
                
                // Fallback to original notification logic
                const notificationMessage = `Event "${event.name}" has been updated. Changes include: ` +
                    (changes.recurrencePattern ? `Recurrence pattern changed.` : '') +
                    (changes.startDate ? ` Start date changed to ${changes.startDate.newValue}.` : '') +
                    (changes.endDate ? ` End date changed to ${changes.endDate.newValue}.` : '');

                for (const participant of participants) {
                    if (participant.User) {
                        await createNotification({
                            body: {
                                userId: req.userId,
                                targetUserId: participant.User.id,
                                relatedModel: 'Event',
                                relatedModelId: event.id,
                                priorityId: 1, // Default priority
                                title: 'Event Updated',
                                type: 'general',
                                message: notificationMessage,
                            },
                        });
                    }
                }
            }
        }

        return res.status(200).json({
            err: false,
            msg: "Event updated successfully."
        });
    } catch (error) {
        console.error("Error updating event:", error);
        return res.status(500).json({
            err: true,
            msg: "Failed to update event.",
            error: error.message,
        });
    }
};
const updateEventReminders = async (req, res) => {
    try {
        const { eventId, reminders } = req.body;

        if (!eventId || !Array.isArray(reminders)) {
            return res.status(400).json({
                err: true,
                msg: 'Invalid data. eventId and reminders are required.',
            });
        }

        // Fetch existing EventReminderTypes for the event
        const existingEventReminderTypes = await EventReminderType.findAll({
            where: { eventId },
        });

        // Extract existing and new reminder type IDs
        const existingReminderTypeIds = existingEventReminderTypes.map(r => r.reminderTypeId);
        const newReminderTypeIds = reminders
            .filter(reminder => reminder.selected)
            .map(reminder => reminder.id);

        // Identify reminder types to add and remove
        const reminderTypesToAdd = newReminderTypeIds.filter(id => !existingReminderTypeIds.includes(id));
        const reminderTypesToRemove = existingReminderTypeIds.filter(id => !newReminderTypeIds.includes(id));

        // Add new EventReminderTypes
        for (const reminderTypeId of reminderTypesToAdd) {
            await EventReminderType.create({
                eventId,
                reminderTypeId,
            });
        }

        // Remove EventReminderTypes for reminders no longer selected
        if (reminderTypesToRemove.length > 0) {
            await EventReminderType.destroy({
                where: {
                    eventId,
                    reminderTypeId: reminderTypesToRemove,
                },
            });
        }

        // Fetch all participants
        const participants = await EventParticipant.findAll({ where: { eventId } });

        // Manage actual reminders based on participants
        const existingReminders = await Reminder.findAll({ where: { eventId } });
        const currentReminderTypeIds = existingReminders.map(reminder => reminder.reminderTypeId);

        // Add reminders for new reminder types
        for (const participant of participants) {
            const emailId = participant.userId ? null : req.body.emailId;
            const phoneNumberId = participant.userId ? null : req.body.phoneNumberId;
            const clientId = participant.userId ? null : participant.clientId;

            for (const reminderTypeId of reminderTypesToAdd) {
                await Reminder.create({
                    reminderTypeId,
                    eventId,
                    userId: participant.userId,
                    clientId,
                    addressId: req.body.addressId,
                    emailId,
                    phoneNumberId,
                    completedAt: null,
                });
            }
        }

        // Remove reminders for unselected reminder types
        if (reminderTypesToRemove.length > 0) {
            await Reminder.destroy({
                where: {
                    eventId,
                    reminderTypeId: reminderTypesToRemove,
                },
            });
        }

        return res.status(200).json({
            err: false,
            msg: 'Event reminders updated successfully',
        });
    } catch (error) {
        console.error('Error updating event reminders:', error);
        return res.status(500).json({
            err: true,
            msg: 'Failed to update event reminders',
            error: error.message,
        });
    }
};
const updateCheckIns = async (req, res) => {
    try {
        const { eventId, userId, checkIns, checkOut  } = req.body;

        if (!eventId || !userId) {
            return res.status(400).json({ 
                err: true, 
                msg: 'Invalid data. eventId and userId are required.' 
            });
        }
        if (!Array.isArray(checkIns.checkInTimes) || !Array.isArray(checkIns.checkOutTimes)) {
            return res.status(400).json({ 
                err: true, 
                msg: 'Check-ins must be an array.' 
            });
        }
        // Fetch the event
        const event = await Event.findOne({ where: { id: eventId } });
        if (!event) {
            return res.status(404).json({ 
                err: true, 
                msg: 'Event not found.' 
            });
        }
        // Fetch existing check-ins for the event and user
        const existingCheckIns = await EventCheckin.findAll({
            where: { eventId, userId },
        });
        // Create a map of existing check-ins by their ID
        const existingCheckInMap = {};
        existingCheckIns.forEach(checkIn => {
            existingCheckInMap[checkIn.id] = checkIn;
        });
        // Process checkInTimes and checkOutTimes
        const updatedCheckIns = [];
        for (let i = 0; i < checkIns.checkInTimes.length; i++) {
            const checkInTime = checkIns.checkInTimes[i];
            const checkOutTime = checkIns.checkOutTimes[i];

            // Check if this check-in already exists
            let checkInRecord = existingCheckInMap[checkInTime.id];
            if (!checkInRecord) {
                // Create a new check-in record if it doesn't exist
                checkInRecord = await EventCheckin.create({
                    eventId,
                    userId,
                    checkInTime: new Date(checkInTime.checkInTime),
                    checkOutTime: checkOutTime ? new Date(checkOutTime.checkOutTime) : null,
                });
            } else {
                // Update the existing check-in record
                checkInRecord.checkInTime = new Date(checkInTime.checkInTime);
                if (!checkInTime && checkOutTime) {
                    checkInRecord.checkOutTime = new Date(checkOutTime.checkOutTime);
                } else {
                    checkInRecord.checkOutTime = null;
                }
                await checkInRecord.save();
            }
            updatedCheckIns.push(checkInRecord);
        }
        // Handle checkOut
        if (checkOut) {

            const newCheckOut = await EventCheckin.create({
                eventId,
                userId,
                checkInTime: null, // No check-in time for check-out
                checkOutTime: new Date(),
            });
            updatedCheckIns.push(newCheckOut);
        }
        return res.status(200).json({
            err: false,
            msg: 'Check-in records updated successfully',
            checkIns: updatedCheckIns,
        });

    } catch (error) {
        console.error('Error updating check-in record:', error);
        return res.status(500).json({ 
            err: true, 
            msg: 'Failed to update check-in record', 
            error: error.message 
        });
    }
}
const addEventParticipant = async (req, res) => {
    try {
        const { eventId, userId, clientId } = req.body;

        if (!eventId || (!userId && !clientId)) {
            return res.status(400).json({ 
                err: true, 
                msg: 'Invalid data. eventId and either userId or clientId are required.' 
            });
        };

        // Create the participant entry
        const participant = await EventParticipant.create({
            eventId,
            userId: userId || null,
            clientId: clientId || null,
        });

        // Fetch the event details
        const newEvent = await Event.findByPk(eventId);

        // Send add participant email to the participant
        await sendAddParticipantEmail(participant, newEvent);

        // Create notifications for new participant added
        try {
            if (userId) {
                const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
                const newParticipant = await User.findByPk(userId);
                const eventDate = new Date(newEvent.startDate).toLocaleDateString();
                const eventTime = new Date(newEvent.startDate).toLocaleTimeString();
                
                if (newParticipant) {
                    await sendNotificationsToUsers(
                        [newParticipant],
                        {
                            userId: req.userId,
                            relatedModel: 'events',
                            relatedModelId: eventId,
                            priorityId: priority.id,
                            title: 'Added to Event',
                            message: `You've been added to event: "${newEvent.title}" on ${eventDate} at ${eventTime}`,
                            type: 'general'
                        },
                        req.userId // Don't notify the person who added them
                    );
                }
            }
        } catch (notificationError) {
            console.error('Error creating add participant notifications:', notificationError);
        }

        return res.status(201).json({
            err: false,
            msg: 'Event participant added successfully',
            participant,
        });
    } catch (error) {
        console.error('Error adding event participant:', error);
        return res.status(500).json({ 
            err: true, 
            msg: 'Failed to add event participant', 
            error: error.message 
        });
    }
};
const removeEventParticipant = async (req, res) => {
    try {
        const { eventId, userId, clientId } = req.body;

        if (!eventId || (!userId && !clientId)) {
            return res.status(400).json({ 
                err: true, 
                msg: 'Invalid data. eventId and either userId or clientId are required.' 
            });
        }

        // Build the query conditions for removal
        const conditions = { eventId };
        if (userId) {
            conditions.userId = userId;
        }
        if (clientId) {
            conditions.clientId = clientId;
        }

        // Remove the participant
        const deletedCount = await EventParticipant.destroy({ where: conditions });

        if (deletedCount === 0) {
            return res.status(404).json({
                err: true,
                msg: 'Event participant not found or already removed.',
            });
        }

        // Create notifications for participant removal
        try {
            if (userId) {
                const priority = await Priority.findOne({ where: { name: 'medium' } }) || { id: 2 };
                const removedParticipant = await User.findByPk(userId);
                const event = await Event.findByPk(eventId);
                
                if (removedParticipant && event) {
                    await sendNotificationsToUsers(
                        [removedParticipant],
                        {
                            userId: req.userId,
                            relatedModel: 'events',
                            relatedModelId: eventId,
                            priorityId: priority.id,
                            title: 'Removed from Event',
                            message: `You've been removed from event: "${event.title}"`,
                            type: 'general'
                        },
                        req.userId // Don't notify the person who removed them
                    );
                }
            }
        } catch (notificationError) {
            console.error('Error creating remove participant notifications:', notificationError);
        }

        return res.status(200).json({
            err: false,
            msg: 'Event participant removed successfully',
        });
    } catch (error) {
        console.error('Error removing event participant:', error);
        return res.status(500).json({ 
            err: true, 
            msg: 'Failed to remove event participant', 
            error: error.message 
        });
    }
};
const complete = async (req, res) => {
    try {
        const event = await Event.findOne({ where: { id: req.body.id } });
        const completedStatus = await EventStatus.findOne({ where: { name: 'Completed' } });
        if (!completedStatus) {
            return res.status(500).json({
                err: true,
                msg: 'Completed status not found'
            });
        }    
        if (!event) {
            return res.status(404).json({
                err: true,
                msg: 'Event not found'
            });
        }
        event.completedDate = new Date();
        event.completedBy = req.userId;
        event.completed = true; 
        event.statusId = completedStatus.id;

        await event.save({
            individualHooks: true,
            context: {
                changes: {
                    completedAt: {
                        oldValue: null,
                        newValue: event.completedDate,
                        description: `Event marked as completed at ${event.completedDate.toLocaleString()}`
                    },
                    completedBy: {
                        oldValue: null,
                        newValue: req.userId,
                        description: `Event completed by user ID ${req.userId}`
                    },
                    statusId: {
                        oldValue: event.statusId,
                        newValue: completedStatus.id,
                        description: `Event status changed to ${completedStatus.name}`
                    }
                },
                changedBy: req.userId
            }
        });
        const eventCheckins = await EventCheckin.findAll({
            where: { eventId: event.id, isActive: true }
        });
        const participants = await EventParticipant.findAll({
            where: { eventId: event.id }
        });
        for (const participant of participants) {
            const lastCheckin = eventCheckins.find(checkin => checkin.userId === participant.userId && !checkin.checkOutTime);
            if (lastCheckin) {
                await EventCheckin.create({
                    eventId: event.id,
                    userId: participant.userId,
                    checkOutTime: new Date(), // Set current time as check-out time

                });
            }
        }

        // Create notifications for event completion
        try {
            const participants = await EventParticipant.findAll({
                where: { eventId: event.id },
                include: [{ model: User, as: 'User' }]
            });
            
            const participantIds = participants.map(p => p.userId).filter(id => id);
            const assignedUserIds = [event.targetUserId, event.userId].filter(id => id);
            
            // Get all relevant users for notification
            const usersToNotify = await getEventNotificationUsers(
                res.companyId, 
                participantIds, 
                assignedUserIds, 
                event.clientId
            );
            
            const priority = await Priority.findOne({ where: { name: 'medium' } }) || { id: 2 };
            const completer = await User.findByPk(req.userId);
            
            const message = `Event "${event.title}" has been completed by ${completer ? completer.firstName + ' ' + completer.lastName : 'Administrator'}`;
            
            await sendNotificationsToUsers(
                usersToNotify,
                {
                    userId: req.userId,
                    relatedModel: 'events',
                    relatedModelId: event.id,
                    priorityId: priority.id,
                    title: 'Event Completed',
                    message: message,
                    type: 'general'
                },
                req.userId // Don't notify the person who completed it
            );
        } catch (notificationError) {
            console.error('Error creating event completion notifications:', notificationError);
        }

        return res.status(200).json({
            err: false,
            msg: 'Event completed successfully',
            event
        });
    } catch (error) {
        console.error('Error completing event:', error);
        return res.status(500).json({
            err: true,
            msg: 'Failed to complete event',
            error: error.message
        });
    }
};
const expirePast = async () => {
    try {
        const currentDate = new Date();
        const companies = await Company.findAll({ where: { isActive: true } });
        
        if (!companies || companies.length === 0) {
            console.error('No active companies found. Cannot expire past events.');
            return {
                err: true,
                msg: 'No active companies found. Cannot expire past events.'
            };
        }

        let totalExpiredEvents = 0;
        const results = [];

        for (const company of companies) {
            if (company.expirePastEvents) {
                const events = await Event.findAll({
                    where: {
                        endDate: {
                            [Op.lt]: currentDate
                        },
                        completed: false,
                        isActive: true,
                        companyId: company.id
                    },
                });

                if (events.length > 0) {
                    for (const event of events) {
                        await event.update(
                            { isActive: false },
                        );
                    }
                    totalExpiredEvents += events.length;
                    results.push({
                        companyId: company.id,
                        companyName: company.name,
                        expiredEvents: events.length
                    });
                }
            }
        }

        if (totalExpiredEvents === 0) {
            return {
                err: false,
                msg: 'No past events found to expire across all companies.',
                results: []
            };
        }

        return { 
            err: false, 
            msg: `Expired ${totalExpiredEvents} past events across ${results.length} companies successfully`,
            results: results
        };
    } catch (error) {
        console.error('Error expiring past events:', error);
        return {
            err: true,
            msg: 'Error occurred while expiring past events',
            error: error.message
        };
    }
}
const archive = async (req, res) => {
    try {
        const event = await Event.findOne({ where: { id: req.body.id } });

        if (!event) {
            return res.status(404).json({
                err: true,
                msg: 'Event not found'
            });
        }

        await event.update(
            { isActive: false },
            {
                userId: req.userId, // Pass the userId here
            }
        );
        return res.status(200).json(
            { 
                message: 'Event archived successfully', 
                event 
            }
        );
      } catch (error) {
        return res.status(500).json(
            { 
                message: 'Error archiving event', 
                error: error.message 
            }
        );
    }
};
const archiveCheckIns = async (req, res) => {
    try {
        const checkIns = req.body;
        if (!Array.isArray(checkIns) || checkIns.length === 0) {
            return res.status(400).json({ 
                err: true, 
                msg: 'Invalid data. checkIns must be a non-empty array.' 
            });
        }
        // Delete check-ins
        const deletedCount = await EventCheckin.update({
            isActive: false,
        }, {
            where: {
                id: checkIns.map(checkIn => checkIn.id),
            },
        });
        if (deletedCount === 0) {
            return res.status(404).json({ 
                err: true, 
                msg: 'No check-ins found to delete.' 
            });
        }
        return res.status(200).json({
            err: false,
            msg: 'Check-ins deleted successfully',
            deletedCount,
        });
    } catch (error) {
        console.error('Error deleting check-ins:', error);
        return res.status(500).json({ 
            err: true, 
            msg: 'Failed to delete check-ins', 
            error: error.message 
        });
    }
};
const unArchive = async (req, res) => {
    try {
        const event = await Event.findOne({ where: { id: req.body.id } });

        if (!event) {
            return res.status(404).json({
                err: true,
                msg: 'Event not found'
            });
        }

        await event.update(
            { isActive: true },
            {
                userId: req.userId, // Pass the userId here
            }
        );
        return res.status(200).json(
            { 
                message: 'Event unarchived successfully', 
                event 
            }
        );
      } catch (error) {
        return res.status(500).json(
            { 
                message: 'Error unarchiving event', 
                error: error.message 
            }
        );
    }
};
const checkIn = async (req, res) => {
    try {
        const { id } = req.body;
        const userId = req.userId;

        if (!id || !userId) {
            return res.status(400).json({ 
                err: true, 
                msg: 'Invalid data. eventId and userId are required.' 
            });
        }
        // Check if the event exists
        const event = await Event.findOne({ where: { id } });
        if (!event) {
            return res.status(404).json({ 
                err: true, 
                msg: 'Event not found.' 
            });
        }
        // Check if the user has already checked in without checking out for their last check-in
        const lastCheckin = await EventCheckin.findOne({
            where: {
                eventId: id,
                userId,
            },
            order: [['createdAt', 'DESC']],
        });
        if (lastCheckin && !lastCheckin.checkOutTime) {
            return res.status(400).json({ 
                err: true, 
                msg: 'You have already checked in to this event without checking out.' 
            });
        }
        const eventCheckin = await EventCheckin.create({
            eventId: id,
            userId,
            checkInTime: new Date(),
        });

        return res.status(201).json({
            err: false,
            msg: 'You successfully checked in to the event.',
            eventCheckin,
        });
    } catch (error) {
        console.error('Error creating event check-in:', error);
        return res.status(500).json({ 
            err: true, 
            msg: 'Failed to check in to event', 
            error: error.message 
        });
    }
};
const checkOut = async (req, res) => {
    try {
        const { id } = req.body;
        const userId = req.userId;

        if (!id || !userId) {
            return res.status(400).json({ 
                err: true, 
                msg: 'Invalid data. eventId and userId are required.' 
            });
        }
        // Check if the event exists
        const event = await Event.findOne({ where: { id } });

        if (!event) {
            return res.status(404).json({ 
                err: true, 
                msg: 'Event not found.' 
            });
        }
        // Check if the user has checked in to the event
        const lastCheckOut = await EventCheckIn.findOne({
            where: {
                eventId: id,
                userId,
            },
            order: [['createdAt', 'DESC']],
        });
        if (!lastCheckOut || !lastCheckOut.checkInTime || lastCheckOut.checkOutTime) {
            return res.status(400).json({ 
                err: true, 
                msg: 'You have not checked in to this event or you have already checked out.' 
            });
        }
        const eventCheckOut = await EventCheckin.create({
            eventId: id,
            userId,
            checkOutTime: new Date(),
        });

        return res.status(200).json({
            err: false,
            msg: `You successfully checked out of the event.`,
            eventCheckOut,
        });
    } catch (error) {
        console.error('Error completing event check-out:', error);
        return res.status(500).json({ 
            err: true, 
            msg: 'Failed to checkout of event', 
            error: error.message 
        });
    }
};

module.exports = {
    create, 
    get,
    getWorkOrder,
    list,
    listTypes,
    listCategories,
    listToDos,
    listPhotos,
    listDocuments,
    listVideos,
    listEstimates,
    listChecklist,
    listChecklistSubmissions,
    listEventCheckIns,
    update,
    updateEventReminders,
    updateCheckIns,
    addEventParticipant,
    removeEventParticipant,
    complete,
    expirePast,
    archive,
    archiveCheckIns,
    unArchive,
    checkIn,
    checkOut,
    getEventsForCalendarSync
};