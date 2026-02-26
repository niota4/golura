const env = process.env;
const { Sequelize, Op, where } = require('sequelize');
const { Form, FormFolder, FormSubmission, EventActivity, User, Priority } = require('../models');
const eventActivities = require('../models/eventActivities');
const { re } = require('mathjs');
const { getFormNotificationUsers, sendNotificationsToUsers } = require('../helpers/notificationHelpers');

const get = async (req, res) => {
    try {
        const { id } = req.body;
        const form = await Form.findOne({ 
            where: { id },
            include: [
                {
                    model: FormSubmission,
                    where: {
                        userId: req.userId
                    },
                    as: 'FormSubmissions',
                    separate: true,
                    order: [['createdAt', 'DESC']],
                    required: false,
                }
            ]
        });

        if (!form) {
            return res.status(404).json({
                err: true,
                msg: 'Form not found',
            });
        }

        res.status(200).json({
            err: false,
            msg: 'Form successfully retrieved',
            form,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: 'Error retrieving form',
            details: err,
        });
    }
};
const getFolder = async (req, res) => {
    try {
        const { id } = req.body;
        const folder = await FormFolder.findOne({
            where: { id },
            include: [
                {
                    model: FormFolder,
                    as: 'ChildFolders',
                    separate: true, // Ensures ordering is applied correctly
                    order: [['createdAt', 'DESC']],
                },
            ]
        });
        if (!folder) {
            return res.status(404).json({
                err: true,
                msg: 'Folder not found',
            });
        }

        res.status(201).json({
            err: false,
            msg: 'Folder successfully retrieved',
            folder,
        });
    } catch (err) {
        res.send({
            err: true,
            msg: 'Error retreiving folder',
            details: err
        });
    }
};
const list = async (req, res) => {
    try {
        const forms = await Form.findAll({
            where: { isActive: true },
        });
        res.status(200).json({
            err: false,
            msg: 'Forms successfully retrieved',
            forms,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: 'Error retrieving forms',
            details: err,
        });
    }
};
const listFolders = async (req, res) => {
    try {
        // Retrieve all folders from the database with their children
        const folders = await FormFolder.findAll({
            where: { isActive: true },
            include: [
                {
                    model: FormFolder,
                    as: 'ChildFolders',
                    separate: true, // Ensures proper ordering of child folders
                    order: [['createdAt', 'ASC']],
                },
            ],
            order: [['createdAt', 'ASC']], // Ensures proper ordering of parent folders
        });

        const buildFolderHierarchy = (folders, parentId = null) => {
            return folders
                .filter(folder => folder.parentFolderId === parentId)
                .map(folder => ({
                    ...folder.dataValues,
                    ChildFolders: buildFolderHierarchy(folders, folder.id),
                }));
        };

        // Build the nested folder structure
        const nestedFolders = buildFolderHierarchy(folders);

        // Respond with both flat and nested folder structures
        res.status(201).json({
            err: false,
            msg: 'Folders successfully retrieved',
            folders: folders, // Flat structure
            nestedFolders: nestedFolders, // Nested structure
        });
    } catch (err) {
        // Error handling
        res.status(500).json({
            err: true,
            msg: 'Error retrieving folders',
            details: err.message || err,
        });
    }
};
const create = async (req, res) => {
    try {
        const { name, description, data, folderId, userId } = req.body;
        const form = await Form.create({
            name,
            description,
            data,
            folderId,
            userId,
        });

        // Create notifications for new form creation
        try {
            const usersToNotify = await getFormNotificationUsers(req.companyId);
            const priority = await Priority.findOne({ where: { name: 'low' } }) || { id: 3 };
            const creator = await User.findByPk(userId || req.userId);
            
            const message = `New form "${name}" created by ${creator ? creator.firstName + ' ' + creator.lastName : 'Administrator'}`;
            
            await sendNotificationsToUsers(
                usersToNotify,
                {
                    userId: userId || req.userId,
                    relatedModel: 'forms',
                    relatedModelId: form.id,
                    priorityId: priority.id,
                    title: 'New Form Created',
                    message: message,
                    type: 'general'
                },
                userId || req.userId // Don't notify the creator
            );
        } catch (notificationError) {
            console.error('Error creating form creation notifications:', notificationError);
        }

        res.status(201).json({
            err: false,
            msg: 'Form successfully created',
            form,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: 'Error creating form',
            details: err,
        });
    }
};
const createFolder = async (req, res) => {
    try {
        const { name, description, parentFolderId } = req.body;
        const folder = await FormFolder.create({
            name,
            description,
            parentFolderId
        });
        res.status(201).send({
            err: false,
            msg: 'Folder successfully created',
            folder
        });
    } catch (err) {
        res.send({
            err: true,
            msg: 'Error creating folder',
            details: err
        });
    }
};
const submitForm = async (req, res) => {
    try {
        // Extract required data from the request
        const { 
            formId, 
            eventId, 
            data,
            estimateId,
            workOrderId,
            invoiceId,
            marketingId
        } = req.body;
        console.log('Form submission data:', req.body, req.userId);
        const userId = req.userId;

        // Validate formId and userId
        if (!formId) {
            console.error('Form ID is missing');
            return res.status(400).json({
                err: true,
                msg: 'formId and userId are required',
            });
        }

        // Fetch the form to ensure it exists
        const form = await Form.findOne({ where: { id: formId } });
        if (!form) {
            return res.status(404).json({
                err: true,
                msg: 'Form not found',
            });
        }

        // Accept the data as-is (array of fields with values/selected)
        const sanitizedData = Array.isArray(data) ? data : [];

        // Validation: check required fields
        const missingRequired = sanitizedData.find(field => {
            if (field.required) {
                if (field.type === 'select' || field.type === 'radio-group') {
                    // Must have a value selected
                    return !Array.isArray(field.values) || !field.values.some(v => v.selected);
                }
                if (field.type === 'text' || field.type === 'textarea') {
                    // Must have a non-empty value
                    return !field.value || String(field.value).trim() === '';
                }
            }
            return false;
        });

        if (missingRequired) {
            console.error('Missing required field:', missingRequired);
            return res.status(400).json({
                err: true,
                msg: `Required field missing: ${missingRequired.label ? missingRequired.label.replace(/<[^>]+>/g, '') : missingRequired.name}`,
            });
        }

        // Ensure there is data to save
        if (sanitizedData.length === 0) {
            console.error('No valid data provided in the form submission');
            return res.status(400).json({
                err: true,
                msg: 'No valid data provided in the form submission',
            });
        }

        // Create a new form submission record
        const submission = await FormSubmission.create({
            title: `Form #${formId} Submission`,
            formId,
            userId,
            data: sanitizedData,
            eventId: eventId || null,
            estimateId: estimateId || null,
            marketingId: marketingId || null,
            workOrderId: workOrderId || null,
            invoiceId: invoiceId || null,
        });

        // Logs an activity only for events with relevant form data
        if (eventId) {
            try {
                await EventActivity.create({
                    eventId: eventId,
                    relatedModel: 'Form',
                    relatedModelId: formId,
                    action: 'CREATE',
                    description: `Form submission linked to event ${eventId}`,
                    fieldName: null,
                    oldValue: null,
                    newValue: null,
                    changedBy: req.userId,
                    timestamp: new Date(),
                });
            } catch (error) {
                console.error('Error logging EventActivity:', error);
            }
        }

        // Create notifications for form submission
        try {
            const usersToNotify = await getFormNotificationUsers(req.companyId, formId);
            const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
            const submitter = await User.findByPk(userId);
            
            const message = `Form "${form.name}" submitted by ${submitter ? submitter.firstName + ' ' + submitter.lastName : 'User'}`;
            
            await sendNotificationsToUsers(
                usersToNotify,
                {
                    userId: userId,
                    relatedModel: 'formSubmissions',
                    relatedModelId: submission.id,
                    priorityId: priority.id,
                    title: 'Form Submitted',
                    message: message,
                    type: 'general'
                },
                userId // Don't notify the submitter
            );
        } catch (notificationError) {
            console.error('Error creating form submission notifications:', notificationError);
        }

        // Respond with success
        return res.status(201).json({
            err: false,
            msg: 'Form successfully submitted',
            submission,
        });
    } catch (err) {
        console.error('Error submitting form:', err);
        return res.status(500).json({
            err: true,
            msg: 'An error occurred while submitting the form',
            details: err.message || err,
        });
    }
};
const update = async (req, res) => {
    try {
        const { id, name, description, data, folderId, userId } = req.body;
        const form = await Form.findByPk(id);

        if (!form) {
            return res.status(404).json({
                err: true,
                msg: 'Form not found',
            });
        }

        await form.update({
            name,
            description,
            data,
            folderId,
            userId,
        });

        res.status(200).json({
            err: false,
            msg: 'Form successfully updated',
            form,
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: 'Error updating form',
            details: err,
        });
    }
};
const updateFolder = async (req, res) => {
    try {
        const { id } = req.body;
        const { name, description } = req.body;

        const folder = await FormFolder.findByPk(id);

        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }
        await folder.update({ name, description });

        res.status(201).send({
            err: false,
            msg: 'Folder successfully update',
            folder
        });
    } catch (error) {
        res.send({
            err: true,
            msg: 'Error updating folder',
            details: err
        });
    }
};
const archive = async (req, res) => {
    try {
        const { id } = req.body;
        const form = await Form.findByPk(id);

        if (!form) {
            return res.status(404).json({
                err: true,
                msg: 'Form not found',
            });
        }

        await form.update({ isActive: false });

        res.status(200).json({
            err: false,
            msg: 'Form archived successfully',
        });
    } catch (err) {
        res.status(500).json({
            err: true,
            msg: 'Error archiving form',
            details: err,
        });
    }
};
const archiveFolder = async (req, res) => {
    try {
        const { id } = req.body;
        const folder = await FormFolder.findByPk(id);
        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }
        await folder.update({ isActive: false });

        res.status(200).json(
            {
                err: false, 
                msg: 'Folder archived successfully' 
            }
        );
    } catch (error) {
        res.send({
            err: true,
            msg: 'Error archiving folder',
            details: err
        });
    }
};

module.exports = {
    get,
    getFolder,
    list,
    listFolders,
    create,
    createFolder,
    submitForm,
    update,
    updateFolder,
    archive,
    archiveFolder
};
