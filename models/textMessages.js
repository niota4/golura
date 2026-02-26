const { event } = require('jquery');
const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const TextMessage = sequelize.define('TextMessage', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clients',
        key: 'id'
      },
    },
    estimateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'estimates',
        key: 'id'
      },
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'events',
        key: 'id'
      },
    },
    workOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'workOrders',
        key: 'id'
      },
    },
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'invoices',
        key: 'id'
      },
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    phoneNumberId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    media: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Sent', 'Failed'),
      allowNull: false,
      defaultValue: 'Pending'
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    tableName: 'textMessages',
    timestamps: true,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'id' }]
      },
      {
        name: 'clientId',
        using: 'BTREE',
        fields: [{ name: 'clientId' }]
      },
      {
        name: 'estimateId',
        using: 'BTREE',
        fields: [{ name: 'estimateId' }]
      },
      {
        name: 'createdBy',
        using: 'BTREE',
        fields: [{ name: 'createdBy' }]
      }
    ]
  });

  TextMessage.associate = models => {
    TextMessage.belongsTo(models.Client, {
      foreignKey: 'clientId',
      as: 'Client'
    });
    TextMessage.belongsTo(models.Estimate, {
      foreignKey: 'estimateId',
      as: 'Estimate'
    });
    TextMessage.belongsTo(models.Event, {
      foreignKey: 'eventId',
      as: 'Event'
    });
    TextMessage.belongsTo(models.WorkOrder, {
      foreignKey: 'workOrderId',
      as: 'WorkOrder'
    });
    TextMessage.belongsTo(models.Invoice, {
      foreignKey: 'invoiceId',
      as: 'Invoice'
    });
    TextMessage.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'Creator'
    });
    TextMessage.belongsTo(models.PhoneNumber, {
      foreignKey: 'phoneNumberId',
      as: 'GlobalPhoneNumber'
    });
  };

  return TextMessage;
};
