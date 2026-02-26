const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    // Lazy-load to avoid circular dependency
    const { createActivityHooks } = require('../helpers/activityHooks');

    const WorkOrder = sequelize.define('WorkOrder', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        estimateId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'estimates',
                key: 'id'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'clients',
                key: 'id'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        eventId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'events',
                key: 'id'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        workOrderNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        priorityId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'priorities',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            defaultValue: 1
        },
        scheduledDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        estimatedHours: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        actualHours: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        cost: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0
        },
        assignedUserId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'SET NULL'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
        },
        completedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'NO ACTION',
            onDelete: 'NO ACTION'
        },
        statusId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'workOrderStatuses',
                key: 'id'
            },
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'companies',
                key: 'id',
            },
        }
    }, {
        sequelize,
        tableName: 'workOrders',
        timestamps: true,
        hooks: {
            // Use new unified activity hooks
            ...createActivityHooks('workOrder', {
                getDescription: {
                    created: (workOrder) => `Work Order #${workOrder.workOrderNumber || workOrder.id} was created`,
                    updated: (workOrder, changes) => {
                        const fieldDescriptions = {
                            workOrderNumber: 'work order number',
                            clientId: 'client',
                            eventId: 'event',
                            assignUserId: 'assigned user',
                            workOrderStatusId: 'status',
                            priorityId: 'priority'
                        };
                        
                        const changedFields = Object.keys(changes)
                            .map(field => fieldDescriptions[field] || field)
                            .join(', ');
                        
                        return `Work Order #${workOrder.workOrderNumber || workOrder.id} ${changedFields} was updated`;
                    },
                    deleted: (workOrder) => `Work Order #${workOrder.workOrderNumber || workOrder.id} was deleted`
                },
                trackFields: ['workOrderNumber', 'clientId', 'eventId', 'assignUserId', 'workOrderStatusId', 'priorityId']
            }),
            
            // Keep existing WorkOrderActivity hooks for backward compatibility
            afterCreate: async (workOrder, options) => {
                const WorkOrderActivity = sequelize.models.WorkOrderActivity;
                try {
                    await WorkOrderActivity.create({
                        workOrderId: workOrder.id,
                        relatedModel: 'WorkOrder',
                        relatedModelId: workOrder.id,
                        action: 'CREATE',
                        description: `${workOrder.workOrderNumber} was created.`,
                        changedBy: options.userId || null,
                        stateAfter: workOrder.toJSON(),
                    });
                } catch (error) {
                    console.error('Error creating WorkOrderActivity:', error);
                }
            },
        },
    });

    WorkOrder.associate = models => {
        WorkOrder.belongsTo(models.Estimate, { foreignKey: 'estimateId', as: 'Estimate' });
        WorkOrder.belongsTo(models.Client, { foreignKey: 'clientId', as: 'Client' });
        WorkOrder.belongsTo(models.Event, { foreignKey: 'eventId', as: 'Event' });
        WorkOrder.belongsTo(models.User, { foreignKey: 'assignUserId', as: 'AssignedUser' });
        WorkOrder.belongsTo(models.User, { foreignKey: 'createdBy', as: 'Creator' });
        WorkOrder.belongsTo(models.User, { foreignKey: 'completedBy', as: 'Completer' });
        WorkOrder.belongsTo(models.WorkOrderStatus, { foreignKey: 'workOrderStatusId', as: 'WorkOrderStatus' });
        WorkOrder.belongsTo(models.Priority, { foreignKey: 'priorityId', as: 'Priority' });
        WorkOrder.hasMany(models.Invoice, { foreignKey: 'workOrderId', as: 'Invoices' });
        WorkOrder.belongsTo(models.Variable, {
            foreignKey: 'variableId',
            as: 'variable',
        });
        
        // Add new unified Activity association
        WorkOrder.hasMany(models.Activity, {
            as: 'UnifiedActivities',
            foreignKey: 'entityId',
            scope: {
                activityType: 'workOrder'
            }
        });
    };

    return WorkOrder;
};
