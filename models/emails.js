const { template, create } = require('lodash');
const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Email = sequelize.define('emails', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    emailId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id'
      }
    },
    estimateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'estimates',
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
    workOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'workOrders',
        key: 'id'
      }
    },
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'invoices',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('External','Internal'),
      allowNull: true,
      defaultValue: "External"
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'emails',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  Email.associate = models => {
    Email.belongsTo(models.Client, {
      foreignKey: 'clientId',
      as: 'Client'
    });
    Email.belongsTo(models.Estimate, {
      foreignKey: 'estimateId',
      as: 'Estimate'
    });
    Email.belongsTo(models.Event, {
      foreignKey: 'eventId',
      as: 'Event'
    });
    Email.belongsTo(models.WorkOrder, {
      foreignKey: 'workOrderId',
      as: 'WorkOrder'
    });
    Email.belongsTo(models.Invoice, {
      foreignKey: 'invoiceId',
      as: 'Invoice'
    });
    Email.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'User'
    });
  };

  return Email;
};
