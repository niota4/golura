const { use } = require('browser-sync');
const { ToDo, Client, Event, WorkOrder, User, UserPreference, Priority } = require('../models');
const { to } = require('mathjs');
const { getTaskNotificationUsers, sendNotificationsToUsers } = require('../helpers/notificationHelpers');

const deepClone = obj => JSON.parse(JSON.stringify(obj));

const get = async (req, res) => {
    try {
        const { id } = req.body;
        const toDo = await ToDo.findOne({
            where: { id },
            include: [
                { model: Client, as: 'Client' },
                { model: Event, as: 'Event' },
                { model: WorkOrder, as: 'WorkOrder' },
                { 
                    model: User, 
                    as: 'User', 
                    attributes: [
                        'id',
                        'email',
                        'firstName',
                        'lastName',
                        'roleId',
                        'lastSeen',
                        'profilePictureUrl',
                        'online',
                        'createdAt'
                    ],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
            ]
        });
        if (!toDo) {
            return res.status(404).json({ err: true, msg: 'ToDo not found' });
        }
        res.status(200).json({ err: false, msg: 'ToDo successfully retrieved', toDo });
    } catch (err) {
        res.status(500).json({ err: true, msg: 'Error retrieving ToDo', details: err });
    }
};

const list = async (req, res) => {
    try {
        const toDos = await ToDo.findAll({ where: { isActive: true } });
        res.status(200).json({ err: false, msg: 'ToDos successfully retrieved', toDos });
    } catch (err) {
        res.status(500).json({ err: true, msg: 'Error retrieving ToDos', details: err });
    }
};

const create = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            data, 
            clientId, 
            eventId, 
            workOrderId, 
            assignedUserId,
            dueDate
        } = req.body;
        const userId = req.userId;
        if (!name || !userId) {
            return res.status(400).json({ err: true, msg: 'Name and userId are required' });
        }
        const assignedUser = await User.findByPk(assignedUserId);
        if (assignedUserId && !assignedUser) {
            return res.status(404).json({ err: true, msg: 'Assigned user not found' });
        }
        if (clientId) {
            const client = await Client.findByPk(clientId);
            if (!client) {
                return res.status(404).json({ err: true, msg: 'Client not found' });
            }
        }
        if (eventId) {
            const event = await Event.findByPk(eventId);
            if (!event) {
                return res.status(404).json({ err: true, msg: 'Event not found' });
            }
        }
        if (workOrderId) {
            const workOrder = await WorkOrder.findByPk(workOrderId);
            if (!workOrder) {
                return res.status(404).json({ err: true, msg: 'Work Order not found' });
            }
        }
        // check if data is a valid JSON object and if each one have length of the title in its objects
        if (data && typeof data !== 'object') {
            return res.status(400).json({ err: true, msg: 'Data must be a valid JSON object' });
        }
        if (data && Object.keys(data).length > 0) {
            for (const key in data) {
                if (data[key].title && data[key].title.length < 3) {
                    return res.status(400).json({ err: true, msg: 'Each item in data must have a title with at least 3 characters' });
                }
            }
        };

        const toDo = await ToDo.create({ name, description, data, clientId, eventId, workOrderId, userId, assignedUserId, dueDate });

        // Create notifications for task assignment
        try {
            if (assignedUserId && assignedUserId !== userId) {
                // Notify the assigned user about the new task
                const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
                const creator = await User.findByPk(userId);
                const dueDateStr = dueDate ? ` (Due: ${new Date(dueDate).toLocaleDateString()})` : '';
                
                await sendNotificationsToUsers(
                    [assignedUser], // Already fetched above
                    {
                        userId: userId,
                        relatedModel: 'toDos',
                        relatedModelId: toDo.id,
                        priorityId: priority.id,
                        title: 'New Task Assigned',
                        message: `New task assigned: "${name}"${dueDateStr} by ${creator ? creator.firstName + ' ' + creator.lastName : 'Administrator'}`,
                        type: 'general'
                    },
                    userId // Don't notify the creator
                );
            }
        } catch (notificationError) {
            console.error('Error creating task assignment notifications:', notificationError);
        }

        res.status(201).json({ err: false, msg: 'ToDo successfully created', toDo });
    } catch (err) {
        res.status(500).json({ err: true, msg: 'Error creating ToDo', details: err });
    }
};

const update = async (req, res) => {
    try {
        const { 
            id, 
            name, 
            description, 
            data, 
            clientId, 
            eventId, 
            workOrderId,
            assignedUserId,
            dueDate
        } = req.body;
        const toDo = await ToDo.findByPk(id);
        if (!toDo) {
            return res.status(404).json({ err: true, msg: 'ToDo not found' });
        }
        if (assignedUserId) {
            const assignedUser = await User.findByPk(assignedUserId);
            if (!assignedUser) {
                return res.status(404).json({ err: true, msg: 'Assigned user not found' });
            }
        }
        if (clientId) {
            const client = await Client.findByPk(clientId);
            if (!client) {
                return res.status(404).json({ err: true, msg: 'Client not found' });
            }
        }
        if (eventId) {
            const event = await Event.findByPk(eventId);
            if (!event) {
                return res.status(404).json({ err: true, msg: 'Event not found' });
            }
        }
        if (workOrderId) {
            const workOrder = await WorkOrder.findByPk(workOrderId);
            if (!workOrder) {
                return res.status(404).json({ err: true, msg: 'Work Order not found' });
            }
        }
        // check if data is a valid JSON object and if each one have length of the title in its objects
        if (data && typeof data !== 'object') {
            return res.status(400).json({ err: true, msg: 'Data must be a valid JSON object' });
        }
        if (data && Object.keys(data).length > 0) {
            for (const key in data) {
                if (data[key].title && data[key].title.length < 3) {
                    return res.status(400).json({ err: true, msg: 'Each item in data must have a title with at least 3 characters' });
                }
            }
        };
        await toDo.update({ 
            name, 
            description, 
            data, 
            clientId, 
            eventId, 
            workOrderId, 
            assignedUserId, 
            dueDate,
            updatedBy: req.userId
        });

        // Create notifications for task updates
        try {
            const usersToNotify = [];
            const priority = await Priority.findOne({ where: { name: 'medium' } }) || { id: 2 };
            const updater = await User.findByPk(req.userId);
            
            // Check if task was reassigned
            if (assignedUserId && assignedUserId !== toDo.assignedUserId) {
                const newAssignedUser = await User.findByPk(assignedUserId);
                if (newAssignedUser) {
                    usersToNotify.push(newAssignedUser);
                }
            }
            
            // Notify the original creator if they're not the one updating
            if (toDo.userId && toDo.userId !== req.userId) {
                const creator = await User.findByPk(toDo.userId);
                if (creator) {
                    usersToNotify.push(creator);
                }
            }
            
            // Notify the currently assigned user if they're not the one updating
            if (toDo.assignedUserId && toDo.assignedUserId !== req.userId) {
                const currentAssigned = await User.findByPk(toDo.assignedUserId);
                if (currentAssigned) {
                    usersToNotify.push(currentAssigned);
                }
            }
            
            if (usersToNotify.length > 0) {
                const message = `Task "${name || toDo.name}" has been updated by ${updater ? updater.firstName + ' ' + updater.lastName : 'Administrator'}`;
                
                await sendNotificationsToUsers(
                    usersToNotify,
                    {
                        userId: req.userId,
                        relatedModel: 'toDos',
                        relatedModelId: id,
                        priorityId: priority.id,
                        title: 'Task Updated',
                        message: message,
                        type: 'general'
                    },
                    req.userId // Don't notify the person who updated it
                );
            }
        } catch (notificationError) {
            console.error('Error creating task update notifications:', notificationError);
        }
        // Re-fetch the updated ToDo to return it in the response
        const updatedToDo = await ToDo.findByPk(id, {
            include: [
                { model: Client, as: 'Client' },
                { model: Event, as: 'Event' },
                { model: WorkOrder, as: 'WorkOrder' },
                { 
                    model: User, 
                    as: 'User', 
                    attributes: [
                        'id',
                        'email',
                        'firstName',
                        'lastName',
                        'roleId',
                        'lastSeen',
                        'profilePictureUrl',
                        'online',
                        'createdAt'
                    ],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
            ]
        });
        if (!updatedToDo) {
            return res.status(404).json({ err: true, msg: 'Updated ToDo not found' });
        }
        res.status(200).json({ err: false, msg: 'ToDo successfully updated', toDo: updatedToDo });
    } catch (err) {
        res.status(500).json({ err: true, msg: 'Error updating ToDo', details: err });
    }
};

const archive = async (req, res) => {
    try {
        const { id } = req.body;
        const toDo = await ToDo.findByPk(id);
        if (!toDo) {
            return res.status(404).json({ err: true, msg: 'ToDo not found' });
        }
        await toDo.update({ isActive: false });
        res.status(200).json({ err: false, msg: 'ToDo archived successfully' });
    } catch (err) {
        res.status(500).json({ err: true, msg: 'Error archiving ToDo', details: err });
    }
};
const complete = async (req, res) => {
    try {
        const { id, } = req.body;
        const toDo = await ToDo.findByPk(id);
        if (!toDo) {
            return res.status(404).json({ err: true, msg: 'ToDo not found' });
        }
        await toDo.update({ completedAt: new Date(), completedBy: req.userId });

        // Create notifications for task completion
        try {
            const usersToNotify = [];
            const priority = await Priority.findOne({ where: { name: 'medium' } }) || { id: 2 };
            const completer = await User.findByPk(req.userId);
            
            // Notify the task creator if they're not the one completing it
            if (toDo.userId && toDo.userId !== req.userId) {
                const creator = await User.findByPk(toDo.userId);
                if (creator) usersToNotify.push(creator);
            }
            
            // Get related managers based on the task context
            if (toDo.clientId || toDo.eventId) {
                // Notify users with management permissions for client/event related tasks
                const managementUsers = await getTaskNotificationUsers(res.companyId);
                usersToNotify.push(...managementUsers.filter(user => 
                    user.id !== req.userId && // Don't notify the completer
                    !usersToNotify.some(existing => existing.id === user.id) // Avoid duplicates
                ));
            }
            
            if (usersToNotify.length > 0) {
                const message = `Task "${toDo.name}" has been completed by ${completer ? completer.firstName + ' ' + completer.lastName : 'Administrator'}`;
                
                await sendNotificationsToUsers(
                    usersToNotify,
                    {
                        userId: req.userId,
                        relatedModel: 'toDos',
                        relatedModelId: id,
                        priorityId: priority.id,
                        title: 'Task Completed',
                        message: message,
                        type: 'general'
                    },
                    req.userId // Don't notify the person who completed it
                );
            }
        } catch (notificationError) {
            console.error('Error creating task completion notifications:', notificationError);
        }

        res.status(200).json({ err: false, msg: 'ToDo marked as complete', toDo });
    } catch (err) {
        res.status(500).json({ err: true, msg: 'Error completing ToDo', details: err });
    }
};
const toggleToDoItem = async (req, res) => {
    try {
        const { id, index } = req.body;
        const toDo = await ToDo.findByPk(id);
        if (!toDo) {
            return res.status(404).json({ err: true, msg: 'ToDo not found' });
        }
        if (!toDo.data || !Array.isArray(toDo.data) || !toDo.data[index]) {
            return res.status(400).json({ err: true, msg: 'Invalid data or index' });
        }
        // Create a new array to avoid in-place mutation
        const newData = toDo.data.map((item, idx) => {
            if (idx !== index) return item;
            // Toggle completed state and related fields
            if (item.completed) {
                return {
                    ...item,
                    completed: false,
                    completedAt: null,
                    completedBy: null
                };
            } else {
                return {
                    ...item,
                    completed: true,
                    completedAt: new Date(),
                    completedBy: req.userId
                };
            }
        });
        // Update using the new array
        await toDo.update({ data: newData });
        // Reload to get the latest data
        const updatedToDo = await ToDo.findByPk(id, {
            include: [
                { model: Client, as: 'Client' },
                { model: Event, as: 'Event' },
                { model: WorkOrder, as: 'WorkOrder' },
                { 
                    model: User, 
                    as: 'User', 
                    attributes: [
                        'id',
                        'email',
                        'firstName',
                        'lastName',
                        'roleId',
                        'lastSeen',
                        'profilePictureUrl',
                        'online',
                        'createdAt'
                    ],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
            ]
        });
        if (!updatedToDo) {
            return res.status(404).json({ err: true, msg: 'Updated ToDo not found' });
        }
        res.status(200).json({ err: false, msg: 'Item updated', toDo: updatedToDo });
    } catch (err) {
        res.status(500).json({ err: true, msg: 'Error completing item in ToDo', details: err });
    }
};

module.exports = {
    get,
    list,
    create,
    update,
    archive,
    complete,
    toggleToDoItem
};
