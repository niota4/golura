const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  // Lazy-load to avoid circular dependency
  const { createActivityHooks } = require('../helpers/activityHooks');
  const EstimateActivity = sequelize.models.EstimateActivity; // Ensure the EstimateActivity model is loaded

  const Estimate = sequelize.define('Estimate', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id'
      }
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'events',
        key: 'id'
      }
    },
    parentEventId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'events',
        key: 'id'
      }
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'estimateStatuses',
        key: 'id'
      }
    },
    estimatePreferenceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'estimatePreferences',
        key: 'id'
      }
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    assignedUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    clientPhoneNumberId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clientPhoneNumbers',
        key: 'id'
      }
    },
    clientEmailId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clientEmails',
        key: 'id'
      }
    },
    clientAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clientAddresses',
        key: 'id'
      }
    },
    billingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clientAddresses',
        key: 'id'
      }
    },
    estimateNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estimateSignatureId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'estimateSignatures',
        key: 'id'
      }
    },
    markUp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    salesTaxRate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    salesTaxTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    subTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    discountTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    won: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0
    },
    lost: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0
    },
    converted: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    conversionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    adHocReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    itemize: {
      type: DataTypes.BOOLEAN,
      defaultValue: 1
    },
    estimateNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    originalEstimateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    estimateUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    parentEstimateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'estimates',
        key: 'id'
      }
    },
    estimatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'estimators',
        key: 'id'
      }
    },
    estimatorData: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    lineItemPrice: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Terms acceptance tracking fields
    termsAccepted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: 'Whether the client has accepted the terms and conditions'
    },
    termsAcceptedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when terms were accepted'
    },
    termsAcceptedByIp: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'IP address of the client who accepted terms'
    },
    // View tracking fields
    firstViewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when the estimate was first viewed by the client'
    },
    lastViewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when the estimate was last viewed by the client'
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of times the estimate has been viewed by the client'
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  },
  {
    sequelize,
    tableName: 'estimates',
    timestamps: true,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'id' }],
      },
    ],
    hooks: {
      // Use new unified activity hooks
      ...createActivityHooks('estimate', {
        getDescription: {
          created: (estimate) => `Estimate #${estimate.estimateNumber || estimate.id} was created`,
          updated: (estimate, changes) => {
            const fieldDescriptions = {
              estimateNumber: 'estimate number',
              total: 'total amount',
              userId: 'assigned user',
              eventId: 'event',
              clientId: 'client',
              isActive: 'status'
            };
            
            const changedFields = Object.keys(changes)
              .map(field => fieldDescriptions[field] || field)
              .join(', ');
            
            return `Estimate #${estimate.estimateNumber || estimate.id} ${changedFields} was updated`;
          },
          deleted: (estimate) => `Estimate #${estimate.estimateNumber || estimate.id} was deleted`
        },
        trackFields: ['estimateNumber', 'total', 'userId', 'eventId', 'clientId', 'isActive']
      }),
      
      // Keep existing EstimateActivity hooks for backward compatibility
      afterCreate: async (estimate, options) => {
        const changedBy = options.context?.changedBy || null;
        try {
          const EstimateActivity = sequelize.models.EstimateActivity;
          if (EstimateActivity) {
            await EstimateActivity.create({
              estimateId: estimate.id,
              relatedModel: 'Estimate',
              relatedModelId: estimate.id,
              action: 'CREATE',
              description: `Estimate was created.`,
              changedBy: changedBy || options.userId || null,
              stateAfter: estimate.toJSON(),
            });
          }
        } catch (error) {
          console.error('Error creating EstimateActivity:', error);
        }
      },
      afterUpdate: async (estimate, options) => {
        const changes = options.context?.changes || {};
        const changedBy = options.context?.changedBy || null;

        try {
          const EstimateActivity = sequelize.models.EstimateActivity;
          if (EstimateActivity) {
            await EstimateActivity.create({
              estimateId: estimate.id,
              relatedModel: 'Estimate',
              relatedModelId: estimate.id,
              action: 'UPDATE',
              description: `Estimate was updated.`,
              changedBy: changedBy || options.userId || null,
              stateAfter: estimate.toJSON(),
            });
          }

          // Create notification if the statusId field is changed
          if (changes.statusId) {
            const newStatus = await sequelize.models.EstimateStatus.findByPk(changes.statusId.newValue);
            const oldStatus = await sequelize.models.EstimateStatus.findByPk(changes.statusId.oldValue);

            const notificationMessage = `Estimate #${estimate.estimateNumber || estimate.id} status changed from ${oldStatus?.name || 'Unknown'} to ${newStatus?.name || 'Unknown'}`;

            const notificationTargetUserId = estimate.assignedUserId || estimate.creatorId;
            if (notificationTargetUserId) {
              await sequelize.models.Notification.create({
                userId: changedBy || options.userId || null,
                targetUserId: notificationTargetUserId,
                relatedModel: 'Estimate',
                relatedModelId: estimate.id,
                priorityId: 1, // Default priority
                title: 'Estimate Status Changed',
                type: 'general',
                message: notificationMessage,
              });
            }
          }
        } catch (error) {
          console.error('Error creating EstimateActivity or Notification:', error);
        }
      },
    },
  });

  Estimate.associate = models => {
    Estimate.belongsToMany(models.LineItem, {
      through: models.EstimateLineItems,
      as: 'AssociatedLineItems',
      foreignKey: 'estimateId'
    });
    Estimate.belongsTo(models.User, {
      as: 'AssignedUser',
      foreignKey: 'assignedUserId'
    });
    Estimate.belongsTo(models.EstimateSignature, {
      as: 'EstimateSignature',
      foreignKey: 'estimateSignatureId'
    });
    Estimate.hasMany(models.Invoice, { foreignKey: 'estimateId', as: 'Invoices' });
    
    // Add new unified Activity association
    Estimate.hasMany(models.Activity, {
      as: 'UnifiedActivities',
      foreignKey: 'entityId',
      scope: {
        activityType: 'estimate'
      }
    });
  };

  return Estimate;
};
