const { 
    Estimator, 
    User, 
    UserPreference,
    LineItem, 
    Item, 
    Labor, 
    Variable,
    QuestionContainer, 
    Question, 
    Formula, 
    EstimateAdjustment, 
    EstimateVersioning, 
    EstimatorUser,
    EventType,
    Form,
    Estimate,
    Priority
} = require('../models');
const { Op, where } = require('sequelize');
const { getEstimatorNotificationUsers, sendNotificationsToUsers } = require('../helpers/notificationHelpers');

const getEstimator = async (req, res) => {
    const { id } = req.body;

    try {
        const estimator = await Estimator.findByPk(id, {
            where: {
                isActive: true
            },
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: [
                        'id',
                        'firstName',
                        'lastName',
                        'lastSeen',
                        'profilePictureUrl',
                    ],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ]
                },
                {
                    model: EventType,
                    as: 'EventType',
                    attributes: ['id', 'name']
                },
                {
                    model: EstimateAdjustment,
                    as: 'EstimateAdjustments',
                    attributes: ['id', 'adjustmentType', 'percentage', 'flatAmount']
                },
                {
                    model: QuestionContainer,
                    as: 'QuestionContainers',
                    where: { isActive: true },
                    required: false,
                    include: [
                        {
                            model: Question,
                            as: 'Questions',
                            attributes: [
                                'id', 
                                'questionText', 
                                'inputType', 
                                'options', 
                                'formulaReference', 
                                'defaultValue', 
                                'validationRules',
                                'isRequired'
                            ]
                        }
                    ]
                }
            ]
        });

        if (!estimator) {
            return res.status(404).json({
                err: true,
                msg: 'Estimator not found'
            });
        }

        res.status(200).json({
            err: false,
            msg: 'Estimator successfully retrieved',
            estimator
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const getEstimateVersion = async (req, res) => {
    const { versionId } = req.body;

    try {
        const version = await EstimateVersioning.findByPk(versionId);

        if (!version) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate version not found'
            });
        }

        res.status(200).json({
            err: false,
            msg: 'Estimate version successfully retrieved',
            version
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const getQuestionContainer = async (req, res) => {
    const { id } = req.body;

    try {
        const questionContainer = await QuestionContainer.findByPk(id, {
            where: {
                isActive: true
            },
            include: [
                {
                    model: Question,
                    as: 'Questions',
                }, 
                {
                    model: Estimator,
                    as: 'Estimator',
                    attributes: ['id', 'title']
                },
                {
                    model: Formula,
                    as: 'Formulas',
                }
            ]
        });
        let LineItems = [];
        // Get line items from the lineItemIds 
        if (questionContainer.lineItemIds && questionContainer.lineItemIds.length > 0) {
            const lineItems = await LineItem.findAll({
                where: {
                    id: {
                        [Op.in]: questionContainer.lineItemIds
                    }
                },
            });
            LineItems = lineItems;
        };
        if (!questionContainer) {
            return res.status(404).json({
                err: true,
                msg: 'Question container not found'
            });
        }

        res.status(200).json({
            err: false,
            msg: 'Question container successfully retrieved',
            questionContainer,
            lineItems: LineItems
        }); 
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const getFinalEstimateCost = async (req, res) => {
    const { estimateId } = req.body;

    try {
        const lineItems = await LineItem.findAll({
            where: { estimateId },
            attributes: ['quantity', 'unitPrice']
        });

        const adjustments = await EstimateAdjustment.findAll({
            where: { estimateId }
        });

        let total = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

        adjustments.forEach(adjustment => {
            if (adjustment.percentage) {
                total += total * (adjustment.percentage / 100);
            } else if (adjustment.flatAmount) {
                total += adjustment.flatAmount;
            }
        });

        res.status(200).json({
            err: false,
            msg: 'Final estimate cost successfully retrieved',
            total
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const getFormula = async (req, res) => {
    const { containerId } = req.body;

    try {
        const formula = await Formula.findByPk(containerId,{
            where: { isActive: true }
        });
        if (!formula) {
            return res.status(200).json({
                err: false,
                msg: 'Formula not found'
            });
        }
        res.status(200).json({
            err: false,
            msg: 'Formulas successfully retrieved',
            formula
        });
    }
    catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listEstimators = async (req, res) => {

    try {
        const estimators = await Estimator.findAll({
            where: {
                isActive: true
            },
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ]
        });

        res.status(200).json({
            err: false,
            msg: 'Estimators successfully retrieved',
            estimators
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const listLineItems = async (req, res) => {
    const { estimateId } = req.body;

    try {
        const lineItems = await LineItem.findAll({
            where: { estimateId },
            include: [
                { model: Item, as: 'Item' },
                { model: Labor, as: 'Labor' },
                {
                    model: Formula,
                    as: 'Formula',
                },
                {
                    model: Question,
                    as: 'Question',
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
const listEstimateVersions = async (req, res) => {
    const { estimateId } = req.body;

    try {
        const versions = await EstimateVersioning.findAll({
            where: { estimateId },
            order: [['versionNumber', 'ASC']]
        });

        res.status(200).json({
            err: false,
            msg: 'Estimate versions successfully retrieved',
            versions
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createEstimator = async (req, res) => {
    const { title, description, eventTypeId } = req.body;
    const userId = req.userId;

    try {
        const estimator = await Estimator.create({
            title,
            description,
            createdBy: userId,
            eventTypeId,
            status: 'Draft',
            isActive: true
        });

        // Create notifications for new estimator creation
        try {
            const usersToNotify = await getEstimatorNotificationUsers(req.companyId);
            const priority = await Priority.findOne({ where: { name: 'low' } }) || { id: 3 };
            const creator = await User.findByPk(userId);
            
            const message = `New estimator "${title}" created by ${creator ? creator.firstName + ' ' + creator.lastName : 'Administrator'}`;
            
            await sendNotificationsToUsers(
                usersToNotify,
                {
                    userId: userId,
                    relatedModel: 'estimators',
                    relatedModelId: estimator.id,
                    priorityId: priority.id,
                    title: 'New Estimator Created',
                    message: message,
                    type: 'general'
                },
                userId // Don't notify the creator
            );
        } catch (notificationError) {
            console.error('Error creating estimator creation notifications:', notificationError);
        }

        res.status(201).json({
            err: false,
            msg: 'Estimator successfully created',
            estimator: estimator
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createQuestionContainer = async (req, res) => {
    const { estimatorId, name, displayOrder } = req.body;

    if (!estimatorId || !name) {
        return res.status(400).json({
            err: true,
            msg: 'Estimator ID and name are required'
        });
    }
    const estimator = await Estimator.findByPk(estimatorId, {
        where: {
            isActive: true
        },
        include: [
            {
                model: QuestionContainer,
                as: 'QuestionContainers',
                where: {
                    isActive: true
                }
            }
        ]
    });
    if (!estimator) {
        return res.status(404).json({
            err: true,
            msg: 'Estimator not found'
        });
    };
    try {
        const questionContainer = await QuestionContainer.create({
            estimatorId,
            name,
            displayOrder: estimator.QuestionContainers.length + 1,
            isActive: true
        });

        res.status(201).json({
            err: false,
            msg: 'Question container successfully created',
            container: questionContainer
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createQuestion = async (req, res) => {

    const { 
        containerId, 
        questionText, 
        inputType, 
        options,
        defaultValue, 
        validationRules, 
        formulaReference,
        helpText,
        isRequired, 
        isVisible, 
        isEditable 
    } = req.body;

    const questionContainer = await QuestionContainer.findByPk(containerId, {
        where: {
            isActive: true
        },
        include: [
            {
                model: Question,
                as: 'Questions',
            }
        ]
    });

    if (!questionContainer) {
        return res.status(404).json({
            err: true,
            msg: 'Question container not found'
        });
    }
    try {
        const variable = await Variable.findOne({
            where: {
                name: formulaReference
            }
        });
        if (variable) {
            return res.status(400).json({
                err: true,
                msg: 'The Formula Reference already cannot match with any variable'
            });
        };
        const question = await Question.create({
            containerId,
            questionText,
            inputType,
            options,
            defaultValue,
            validationRules,
            formulaReference,
            helpText,
            displayOrder: questionContainer.Questions.length + 1,
            isRequired,
            isVisible,
            isEditable,
            isActive: true,
            createdBy: req.userId
        });

        res.status(201).json({
            err: false,
            msg: 'Question successfully created',
            question
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
}
const createFormula = async (req, res) => {
    const { containerId, name, expression } = req.body;

    try {
        const newFormula = await Formula.create({
            containerId,
            name,
            expression,
            createdBy: req.userId,
        });

        res.status(201).json({
            err: false,
            msg: 'Formula successfully created',
            formula: newFormula
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createEstimateVersion = async (req, res) => {
    const { estimateId } = req.body;

    try {
        const estimate = await Estimator.findByPk(estimateId, {
            include: [
                { model: LineItem, as: 'EstimateLineItems' },
                { model: EstimateAdjustment, as: 'EstimateAdjustments' }
            ]
        });

        if (!estimate) {
            return res.status(404).json({
                err: true,
                msg: 'Estimate not found'
            });
        }

        const versionNumber = await EstimateVersioning.count({ where: { estimateId } }) + 1;

        const newVersion = await EstimateVersioning.create({
            estimateId,
            versionNumber,
            estimateSnapshot: estimate.toJSON()
        });

        res.status(201).json({
            err: false,
            msg: 'Estimate version successfully saved',
            version: newVersion
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const updateEstimator = async (req, res) => {
    const {
        id,
        title,
        description,
        eventTypeId
    } = req.body;

    try {
        const estimator = await Estimator.findByPk(id);

        if (!estimator) {
            return res.status(404).json({
                err: true,
                msg: 'Estimator not found'
            });
        }

        await estimator.update({ title, description, eventTypeId });

        res.status(200).json({
            err: false,
            msg: 'Estimator successfully updated',
            estimator
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const updateQuestionContainer = async (req, res) => {
    const {
        id,
        name,
        lineItemIds,
        displayOrder
    } = req.body;

    try {
        const questionContainer = await QuestionContainer.findByPk(id);
        
        if (!questionContainer) {
            return res.status(404).json({
                err: true,
                msg: 'Question container not found'
            });
        }

        if (questionContainer.displayOrder !== displayOrder) {
            const questionContainers = await QuestionContainer.findAll({
                where: {
                    estimatorId: questionContainer.estimatorId
                }
            });
            // Update display order of other questions
            questionContainers.forEach(async (q) => {
                if (q.id !== id) {
                    if (q.displayOrder > displayOrder) {
                        await q.update({
                            displayOrder: q.displayOrder + 1
                        });
                    } else if (q.displayOrder == displayOrder && q.displayOrder === 1) {
                        await q.update({
                            displayOrder: q.displayOrder + 1
                        });
                    } else if (q.displayOrder == displayOrder) {
                        await q.update({
                            displayOrder: displayOrder - 1
                        });
                    }
                }
            });
        }
        await questionContainer.update({ name, displayOrder, lineItemIds, });

        res.status(200).json({
            err: false,
            msg: 'Question container successfully updated',
            container: questionContainer
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const updateQuestion = async (req, res) => {
    const {
        id,
        questionText, 
        inputType, 
        options,
        defaultValue, 
        validationRules, 
        formulaReference,
        displayOrder,
        helpText,
        isRequired, 
        isVisible, 
        isEditable 
    } = req.body;

    try {
        const question = await Question.findByPk(id);

        if (!question) {
            return res.status(404).json({
                err: true,
                msg: 'Question not found'
            });
        };
        const variable = await Variable.findOne({
            where: {
                name: formulaReference
            }
        });
        if (variable) {
            return res.status(400).json({
                err: true,
                msg: 'The Formula Reference already cannot match with any variable'
            });
        };
        if (question.displayOrder !== displayOrder) {
            const questions = await Question.findAll({
                where: {
                    containerId: question.containerId
                }
            });
            // Update display order of other questions
            questions.forEach(async (q) => {
                if (q.id !== id) {
                    if (q.displayOrder > displayOrder) {
                        await q.update({
                            displayOrder: q.displayOrder + 1
                        });
                    } else if (q.displayOrder == displayOrder && q.displayOrder === 1) {
                        await q.update({
                            displayOrder: q.displayOrder + 1
                        });
                    } else if (q.displayOrder == displayOrder) {
                        await q.update({
                            displayOrder: displayOrder - 1
                        });
                    }
                }
            });
        }
        await question.update({
            questionText,
            inputType,
            options,
            defaultValue,
            helpText,
            validationRules,
            formulaReference,
            displayOrder,
            isRequired,
            isVisible,
            isEditable
        });
        
        res.status(200).json({
            err: false,
            msg: 'Question successfully updated',
            question
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const updateLineItem = async (req, res) => {
    const {
        id,
        estimateId,
        itemId,
        laborId,
        description,
        questionId,
        formulaId,
        pricedBy,
        quantity,
        unitPrice,
        totalPrice,
        category
    } = req.body;

    try {
        const lineItem = await LineItem.findByPk(id);

        if (!lineItem) {
            return res.status(404).json({
                err: true,
                msg: 'Line item not found'
            });
        }

        await lineItem.update({
            estimateId,
            itemId,
            laborId,
            description,
            quantity,
            unitPrice,
            totalPrice,
            category,
            questionId,
            formulaId,
            pricedBy,
        });

        res.status(200).json({
            err: false,
            msg: 'Line item successfully updated',
            lineItem
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const updateFormula = async (req, res) => {
    const {
        id,
        name,
        expression
    } = req.body;

    try {
        const formula = await Formula.findByPk(id);

        if (!formula) {
            return res.status(404).json({
                err: true,
                msg: 'Formula not found'
            });
        }

        await formula.update({
            name,
            expression
        });

        res.status(200).json({
            err: false,
            msg: 'Formula successfully updated',
            formula
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const updateUserPermission = async (req, res) => {
    const { userId, estimateId, newPermissionLevel } = req.body;

    try {
        const estimatorUser = await EstimatorUser.findOne({
            where: { userId, estimateId }
        });

        if (!estimatorUser) {
            return res.status(404).json({
                err: true,
                msg: 'User permission not found'
            });
        }

        await estimatorUser.update({ permissionLevel: newPermissionLevel });

        res.status(200).json({
            err: false,
            msg: 'User permission successfully updated',
            estimatorUser
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const archiveEstimator = async (req, res) => {
    const { id } = req.body;

    try {
        const estimator = await Estimator.findByPk(id);

        if (!estimator) {
            return res.status(404).json({
                err: true,
                msg: 'Estimator not found'
            });
        }

        await estimator.update({ isActive: false });

        // Create notifications for estimator archival
        try {
            // Find users who have used this estimator
            const estimatesUsingEstimator = await Estimate.findAll({
                where: { estimatorId: id },
                attributes: ['assignedUserId'],
                distinct: true
            });
            
            const estimatorUserIds = [...new Set(estimatesUsingEstimator.map(e => e.assignedUserId).filter(id => id))];
            
            // Get general estimator notification users as well
            const generalUsers = await getEstimatorNotificationUsers(req.companyId);
            
            // Get specific users who have used this estimator
            const specificUsers = [];
            if (estimatorUserIds.length > 0) {
                const estimatorUsers = await User.findAll({
                    where: { id: { [Op.in]: estimatorUserIds } }
                });
                specificUsers.push(...estimatorUsers);
            }
            
            // Combine and deduplicate users
            const allUsers = [...generalUsers, ...specificUsers];
            const uniqueUsers = allUsers.filter((user, index, self) => 
                index === self.findIndex(u => u.id === user.id)
            );
            
            if (uniqueUsers.length > 0) {
                const priority = await Priority.findOne({ where: { name: 'medium' } }) || { id: 2 };
                const archiver = await User.findByPk(req.userId);
                
                const message = `Estimator "${estimator.title}" has been archived by ${archiver ? archiver.firstName + ' ' + archiver.lastName : 'Administrator'}`;
                
                await sendNotificationsToUsers(
                    uniqueUsers,
                    {
                        userId: req.userId,
                        relatedModel: 'estimators',
                        relatedModelId: estimator.id,
                        priorityId: priority.id,
                        title: 'Estimator Archived',
                        message: message,
                        type: 'general'
                    },
                    req.userId // Don't notify the person who archived it
                );
            }
        } catch (notificationError) {
            console.error('Error creating estimator archive notifications:', notificationError);
        }

        res.status(200).json({
            err: false,
            msg: 'Estimator successfully deleted'
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const archiveQuestionContainer = async (req, res) => {
    const { id } = req.body;

    try {
        const questionContainer = await QuestionContainer.findByPk(id);

        if (!questionContainer) {
            return res.status(404).json({
                err: true,
                msg: 'Question container not found'
            });
        };

        await questionContainer.update({ isActive: false });

        res.status(200).json({
            err: false,
            msg: 'Question container successfully deleted'
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};       
const archiveQuestion = async (req, res) => {
    const { id } = req.body;

    try {
        const question = await Question.findByPk(id);

        if (!question) {
            return res.status(404).json({
                err: true,
                msg: 'Question not found'
            });
        }

        await question.destroy();

        res.status(200).json({
            err: false,
            msg: 'Question successfully deleted'
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const addLineItem = async (req, res) => {
    const { estimateId, type, itemId, laborId, description, quantity, unitPrice } = req.body;

    try {
        const newLineItem = await LineItem.create({
            estimateId,
            type,
            itemId,
            laborId,
            description,
            quantity,
            unitPrice,
            totalPrice: quantity * unitPrice
        });

        res.status(201).json({
            err: false,
            msg: 'Line item successfully added',
            lineItem: newLineItem
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const addQuestion = async (req, res) => {
    const { containerId, questionText, inputType, defaultValue, validationRules } = req.body;

    try {
        const newQuestion = await Question.create({
            containerId,
            questionText,
            inputType,
            defaultValue,
            validationRules
        });

        res.status(201).json({
            err: false,
            msg: 'Question successfully added',
            question: newQuestion
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const addAdjustment = async (req, res) => {
    const { estimateId, type, percentage, flatAmount } = req.body;

    try {
        const newAdjustment = await EstimateAdjustment.create({
            estimateId,
            adjustmentType: type,
            percentage,
            flatAmount
        });

        res.status(201).json({
            err: false,
            msg: 'Adjustment successfully applied',
            adjustment: newAdjustment
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const addUserToEstimator = async (req, res) => {
    const { userId, estimateId, permissionLevel } = req.body;

    try {
        const estimator = await Estimator.findByPk(estimateId);
        const user = await User.findByPk(userId);

        if (!estimator || !user) {
            return res.status(404).json({
                err: true,
                msg: 'Estimator or User not found'
            });
        }

        const newEstimatorUser = await EstimatorUser.create({
            userId,
            estimateId,
            permissionLevel
        });

        res.status(201).json({
            err: false,
            msg: 'User successfully added to estimator',
            estimatorUser: newEstimatorUser
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const removeLineItem = async (req, res) => {
    const { id } = req.body;

    try {
        const lineItem = await LineItem.findByPk(id);

        if (!lineItem) {
            return res.status(404).json({
                err: true,
                msg: 'Line item not found'
            });
        }

        await lineItem.destroy();

        res.status(200).json({
            err: false,
            msg: 'Line item successfully removed'
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const removeAdjustment = async (req, res) => {
    const { adjustmentId } = req.body;

    try {
        const adjustment = await EstimateAdjustment.findByPk(adjustmentId);

        if (!adjustment) {
            return res.status(404).json({
                err: true,
                msg: 'Adjustment not found'
            });
        }

        await adjustment.destroy();

        res.status(200).json({
            err: false,
            msg: 'Adjustment successfully removed'
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const removeUserFromEstimator = async (req, res) => {
    const { userId, estimateId } = req.body;

    try {
        const estimatorUser = await EstimatorUser.findOne({
            where: { userId, estimateId }
        });

        if (!estimatorUser) {
            return res.status(404).json({
                err: true,
                msg: 'User permission not found'
            });
        }

        await estimatorUser.destroy();

        res.status(200).json({
            err: false,
            msg: 'User successfully removed from estimator'
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const calculateLineItemTotal = async (req, res) => {
    const { id } = req.body;

    try {
        const lineItem = await LineItem.findByPk(id);

        if (!lineItem) {
            return res.status(404).json({
                err: true,
                msg: 'Line item not found'
            });
        }

        const totalPrice = lineItem.quantity * lineItem.unitPrice;

        res.status(200).json({
            err: false,
            msg: 'Line item total successfully calculated',
            totalPrice
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const evaluateFormula = async (req, res) => {
    const { id, inputValues } = req.body;

    try {
        const formula = await Formula.findByPk(id);

        if (!formula) {
            return res.status(404).json({
                err: true,
                msg: 'Formula not found'
            });
        }

        // Assuming evaluateFormula is a helper function that evaluates the formula
        const result = evaluateFormula(formula.formulaExpression, inputValues);

        res.status(200).json({
            err: false,
            msg: 'Formula successfully evaluated',
            result
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const calculateEstimateTotal = async (req, res) => {
    const { estimateId } = req.body;

    try {
        const lineItems = await LineItem.findAll({
            where: { estimateId },
            attributes: ['quantity', 'unitPrice']
        });

        let total = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

        res.status(200).json({
            err: false,
            msg: 'Estimate total successfully calculated',
            total
        });
    } catch (err) {
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const createEstimateFromEstimator = async (req, res) => {
    const { estimatorId, questionAnswers, clientId, eventId, title, description } = req.body;
    const userId = req.userId;

    try {
        // Import the comprehensive estimate generation function
        const { generateEstimateFromEstimator } = require('./estimates');

        // Use the comprehensive function that creates estimate with line items
        const result = await generateEstimateFromEstimator(
            estimatorId,
            questionAnswers,
            clientId,
            eventId,
            userId
        );

        res.status(201).json({
            err: false,
            msg: 'Estimate successfully created from estimator with line items',
            estimate: result.estimate,
            lineItems: result.lineItems,
            calculatedTotals: result.calculatedTotals,
            totalLineItems: result.totalLineItems
        });

    } catch (err) {
        console.error('Error creating estimate from estimator:', err.message);
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
const generateEstimator = async (req, res) => {
    const { 
        title, 
        description, 
        eventTypeId, 
        aiData 
    } = req.body;
    const userId = req.userId;

    if (!title || !description || !aiData) {
        return res.status(400).json({
            err: true,
            msg: 'Title, description, and AI data are required'
        });
    }

    try {
        // Create the main estimator
        const estimator = await Estimator.create({
            title,
            description: description || '',
            eventTypeId: eventTypeId || null,
            status: 'Draft',
            isActive: true,
            createdBy: userId
        });

        // Create question containers and questions
        const createdContainers = [];
        if (aiData.questionContainers && Array.isArray(aiData.questionContainers)) {
            for (const containerData of aiData.questionContainers) {
                const questionContainer = await QuestionContainer.create({
                    estimatorId: estimator.id,
                    name: containerData.title,
                    description: containerData.description || '',
                    displayOrder: containerData.orderIndex + 1 || 0 + 1, 
                    isActive: true
                });

                // Create questions for this container
                const createdQuestions = [];
                if (containerData.questions && Array.isArray(containerData.questions)) {
                    for (let i = 0; i < containerData.questions.length; i++) {
                        const questionData = containerData.questions[i];
                        
                        // Skip incomplete questions
                        if (!questionData.text || !questionData.type) {
                            continue;
                        }

                        // Validate and sanitize input type
                        const validInputTypes = ['text', 'number', 'select', 'checkbox', 'radio', 'textarea', 'date', 'time', 'email', 'tel', 'url', 'range', 'file'];
                        const inputType = validInputTypes.includes(questionData.type) ? questionData.type : 'text';

                        const question = await Question.create({
                            containerId: questionContainer.id,
                            questionText: questionData.text,
                            inputType: inputType,
                            options: questionData.options ? JSON.stringify(questionData.options) : null,
                            defaultValue: questionData.defaultValue || null,
                            validationRules: null,
                            formulaReference: questionData.variable || null,
                            helpText: questionData.helpText || '',
                            displayOrder: questionData.displayOrder || i,
                            isRequired: questionData.required || false,
                            isVisible: true,
                            isEditable: true,
                            isActive: true,
                            createdBy: userId
                        });

                        createdQuestions.push(question);
                    }
                }

                createdContainers.push({
                    container: questionContainer,
                    questions: createdQuestions
                });
            }
        }

        // Create formulas
        const createdFormulas = [];
        if (aiData.formulas && Array.isArray(aiData.formulas)) {
            for (const formulaData of aiData.formulas) {
                // Find a suitable container (use first one or create a default one)
                let containerId = null;
                if (createdContainers.length > 0) {
                    containerId = createdContainers[0].container.id;
                } else {
                    // Create a default container for formulas
                    const defaultContainer = await QuestionContainer.create({
                        estimatorId: estimator.id,
                        name: 'Calculations',
                        description: 'Formula calculations for this estimator',
                        displayOrder: 999,
                        isActive: true
                    });
                    containerId = defaultContainer.id;
                    createdContainers.push({
                        container: defaultContainer,
                        questions: []
                    });
                }

                const formula = await Formula.create({
                    containerId: containerId,
                    name: formulaData.title,
                    expression: formulaData.formula,
                    description: formulaData.description || '',
                    category: formulaData.category || 'general',
                    isActive: true,
                    createdBy: userId
                });

                createdFormulas.push(formula);
            }
        }

        // Create line items template data (stored as JSON for later use)
        let lineItemsTemplate = null;
        if (aiData.lineItems && Array.isArray(aiData.lineItems)) {
            lineItemsTemplate = aiData.lineItems.map(item => ({
                title: item.title,
                description: item.description,
                unit: item.unit || 'Each',
                category: item.category || 'Material',
                orderIndex: item.orderIndex || 0
            }));
        }

        // Update estimator with line items template if available
        if (lineItemsTemplate) {
            await estimator.update({
                description: `${description}\n\nLine Items Template: ${JSON.stringify(lineItemsTemplate)}`
            });
        }

        // Get the complete estimator with all relations
        const completeEstimator = await Estimator.findByPk(estimator.id, {
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                },
                {
                    model: EventType,
                    as: 'EventType',
                    attributes: ['id', 'name']
                },
                {
                    model: QuestionContainer,
                    as: 'QuestionContainers',
                    where: { isActive: true },
                    required: false,
                    include: [
                        {
                            model: Question,
                            as: 'Questions',
                            where: { isActive: true },
                            required: false
                        },
                        {
                            model: Formula,
                            as: 'Formulas',
                            where: { isActive: true },
                            required: false
                        }
                    ]
                }
            ]
        });

        res.status(201).json({
            err: false,
            msg: 'Estimator successfully generated from AI data',
            estimator: completeEstimator,
            summary: {
                totalContainers: createdContainers.length,
                totalQuestions: createdContainers.reduce((sum, c) => sum + c.questions.length, 0),
                totalFormulas: createdFormulas.length,
                lineItemsTemplateCount: lineItemsTemplate ? lineItemsTemplate.length : 0
            }
        });

    } catch (err) {
        console.error('Error generating estimator:', err);
        res.status(400).json({
            err: true,
            msg: err.message
        });
    }
};
module.exports = {
    getEstimator,
    getFinalEstimateCost,
    getEstimateVersion,
    getQuestionContainer,
    getFormula,
    createEstimator,
    createFormula,
    createEstimateVersion,
    calculateLineItemTotal,
    createQuestionContainer,
    createQuestion,
    listEstimators,
    listLineItems,
    listEstimateVersions,
    updateEstimator,
    updateLineItem,
    updateQuestionContainer,
    updateUserPermission,
    updateFormula,
    updateQuestion,
    archiveQuestionContainer,
    archiveQuestion,
    archiveEstimator,
    addLineItem,
    addUserToEstimator,
    addAdjustment,
    addQuestion,
    removeAdjustment,
    removeLineItem,
    removeUserFromEstimator,
    evaluateFormula,
    calculateEstimateTotal,
    createEstimateFromEstimator,
    generateEstimator
};
