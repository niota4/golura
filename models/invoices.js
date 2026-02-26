const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  // Lazy-load to avoid circular dependency
  const { createActivityHooks } = require('../helpers/activityHooks');
  const Invoice = sequelize.define('Invoice', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'id'
      },
      onUpdate: 'NO ACTION',
      onDelete: 'NO ACTION'
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
    workOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'workOrders',
        key: 'id'
      },
      onUpdate: 'NO ACTION',
      onDelete: 'NO ACTION'
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invoicePreferenceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'invoicePreferences',
        key: 'id'
      },
    },
    clientPhoneNumberId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clientPhoneNumbers',
        key: 'id',
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION'
      }
    },
    clientEmailId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clientEmails',
        key: 'id',
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION'
      }
    },
    clientAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clientAddresses',
        key: 'id',
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION'
      }
    },
    billingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clientAddresses',
        key: 'id',
        onUpdate: 'NO ACTION',
        onDelete: 'NO ACTION'
      }
    },
    markUp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: {
          args: 0,
          msg: 'Markup cannot be negative'
        },
        max: {
          args: 1000,
          msg: 'Markup cannot exceed 1000%'
        }
      }
    },
    salesTaxRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      defaultValue: 0.0000,
      validate: {
        min: {
          args: 0,
          msg: 'Sales tax rate cannot be negative'
        },
        max: {
          args: 1,
          msg: 'Sales tax rate cannot exceed 100%'
        }
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
    salesTaxTotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0.00,
      validate: {
        min: {
          args: 0,
          msg: 'Sales tax total cannot be negative'
        }
      }
    },
    subTotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0.00,
      validate: {
        min: {
          args: 0,
          msg: 'Subtotal cannot be negative'
        }
      }
    },
    total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0.00,
      validate: {
        min: {
          args: 0,
          msg: 'Total cannot be negative'
        }
      }
    },
    memo: {
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'NO ACTION',
      onDelete: 'NO ACTION'
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    // Audit and soft delete fields
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who last updated this invoice'
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
      comment: 'User who deleted this invoice'
    },
    // Financial audit fields
    isLocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Prevents modification for compliance'
    },
    lockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when invoice was locked'
    },
    lockedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who locked this invoice'
    }
  }, {
    sequelize,
    tableName: 'invoices',
    timestamps: true,
    hooks: {
      // Use new unified activity hooks
      ...createActivityHooks('invoice', {
        getDescription: {
          created: (invoice) => `Invoice #${invoice.invoiceNumber || invoice.id} was created`,
          updated: (invoice, changes) => {
            const fieldDescriptions = {
              invoiceNumber: 'invoice number',
              total: 'total amount',
              clientId: 'client',
              userId: 'assigned user',
              estimateId: 'estimate',
              workOrderId: 'work order',
              dueDate: 'due date'
            };
            
            const changedFields = Object.keys(changes)
              .map(field => fieldDescriptions[field] || field)
              .join(', ');
            
            return `Invoice #${invoice.invoiceNumber || invoice.id} ${changedFields} was updated`;
          },
          deleted: (invoice) => `Invoice #${invoice.invoiceNumber || invoice.id} was deleted`
        },
        trackFields: ['invoiceNumber', 'total', 'clientId', 'userId', 'estimateId', 'workOrderId', 'dueDate']
      })
    }
  });

  Invoice.associate = models => {
    // Add new unified Activity association
    Invoice.hasMany(models.Activity, {
      as: 'UnifiedActivities',
      foreignKey: 'entityId',
      scope: {
        activityType: 'invoice'
      }
    });
  };

  return Invoice;
};
