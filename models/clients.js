const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  // Lazy-load to avoid circular dependency
  const { createActivityHooks } = require('../helpers/activityHooks');
  const { addPIIMetadata, PII_FIELD_TYPES } = require('../helpers/piiHelper');
  const company = require('./companies');
  const Client = sequelize.define('Client', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: addPIIMetadata({
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: 'First name is required'
        }
      }
    }, PII_FIELD_TYPES.NOTES, { // Names are PII
      retentionPeriod: '7 years',
      auditLevel: 'medium'
    }),
    lastName: addPIIMetadata({
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: 'Last name is required'
        }
      }
    }, PII_FIELD_TYPES.NOTES, { // Names are PII
      retentionPeriod: '7 years',
      auditLevel: 'medium'
    }),
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    parentClientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    priorityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'priorities',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    // Audit and soft delete fields
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who last updated this client'
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Soft delete timestamp'
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who deleted this client'
    }
  }, {
    sequelize,
    tableName: 'clients',
    timestamps: true,
    // Enable soft deletes
    paranoid: true,
    deletedAt: 'deletedAt',
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "idx_clients_company_id",
        using: "BTREE",
        fields: [
          { name: "companyId" },
        ]
      },
      {
        name: "idx_clients_active",
        using: "BTREE",
        fields: [
          { name: "isActive" },
        ]
      },
      {
        name: "idx_clients_parent",
        using: "BTREE",
        fields: [
          { name: "parentClientId" },
        ]
      },
      {
        name: "idx_clients_soft_delete",
        using: "BTREE",
        fields: [
          { name: "deletedAt" },
        ]
      },
      {
        name: "idx_clients_names",
        using: "BTREE",
        fields: [
          { name: "firstName" },
          { name: "lastName" },
        ]
      }
    ],
    hooks: {
      // Use new unified activity hooks
      ...createActivityHooks('client', {
        getDescription: {
          created: (client) => `Client "${client.firstName} ${client.lastName}" was created`,
          updated: (client, changes) => {
            const fieldDescriptions = {
              firstName: 'first name',
              lastName: 'last name',
              isActive: 'status',
              parentClientId: 'parent client',
              priorityId: 'priority',
            };
            
            const changedFields = Object.keys(changes)
              .map(field => fieldDescriptions[field] || field)
              .join(', ');
            
            return `Client "${client.firstName} ${client.lastName}" ${changedFields} was updated`;
          },
          deleted: (client) => `Client "${client.firstName} ${client.lastName}" was deleted`
        },
        trackFields: ['firstName', 'lastName', 'isActive', 'parentClientId', 'priorityId'] // Only track important fields
      })
    },
  });

  Client.associate = (models) => {
    // Keep existing ClientActivity association for backward compatibility
    Client.hasMany(models.ClientActivity, {
      as: 'Activities',
      foreignKey: 'clientId',
    });
    
    // Add new unified Activity association
    Client.hasMany(models.Activity, {
      as: 'UnifiedActivities',
      foreignKey: 'entityId',
      scope: {
        activityType: 'client'
      }
    });
  };

  return Client;
};
