const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
    const WorkOrderActivity = sequelize.define('WorkOrderActivity', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'companies',
                key: 'id',
            },
        },
        workOrderId: {
            type: DataTypes.INTEGER,
            allowNull: true, // Nullable for changes not tied directly to a work order
            references: {
                model: 'workOrders',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        },
        relatedModel: {
            type: DataTypes.STRING,
            allowNull: true, // Name of the related model (e.g., PurchaseOrder)
        },
        relatedModelId: {
            type: DataTypes.INTEGER,
            allowNull: true, // ID of the related record in the related model
        },
        action: {
            type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
            allowNull: false, // Action performed on the record
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false, // Human-readable description of the change
        },
        fieldName: {
            type: DataTypes.STRING,
            allowNull: true, // Field that was updated, null for CREATE/DELETE
        },
        oldValue: {
            type: DataTypes.JSON,
            allowNull: true, // Previous value for the field
        },
        newValue: {
            type: DataTypes.JSON,
            allowNull: true, // New value for the field
        },
        changedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW, // Time of the action
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true, // IP address of the user
        },
        sessionId: {
            type: DataTypes.STRING,
            allowNull: true, // Unique identifier for the user's session/request
        },
        scope: {
            type: DataTypes.ENUM('SYSTEM', 'USER_ACTION', 'ADMIN_OVERRIDE'),
            allowNull: false,
            defaultValue: 'USER_ACTION', // Classifies the type of action
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
            allowNull: false,
            defaultValue: 'COMPLETED', // Status of the activity
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true, // Additional context for the change
        },
    }, {
        sequelize,
        tableName: 'workOrderActivities',
        timestamps: false, // Explicitly disable Sequelize auto timestamps
        indexes: [
            {
                name: "workOrderId_idx",
                using: "BTREE",
                fields: [
                    { name: "workOrderId" },
                ],
            },
            {
                name: "relatedModel_idx",
                using: "BTREE",
                fields: [
                    { name: "relatedModel" },
                ],
            },
            {
                name: "changedBy_idx",
                using: "BTREE",
                fields: [
                    { name: "changedBy" },
                ],
            },
            {
                name: "timestamp_idx",
                using: "BTREE",
                fields: [
                    { name: "timestamp" },
                ],
            },
        ],
    });
    return WorkOrderActivity;
};
