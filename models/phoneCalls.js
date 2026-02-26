const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const PhoneCall = sequelize.define('PhoneCall', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    conferenceSid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    conferenceName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    recordingSid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    recordingUrl: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'In Progress'
    },
    userPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    phoneNumberId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endedAt: {
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
    tableName: 'phoneCalls',
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
        name: 'createdBy',
        using: 'BTREE',
        fields: [{ name: 'createdBy' }]
      }
    ]
  });

  PhoneCall.associate = models => {
    PhoneCall.belongsTo(models.Client, {
      foreignKey: 'clientId',
      as: 'Client'
    });
    PhoneCall.belongsTo(models.Estimate, {
      foreignKey: 'estimateId',
      as: 'Estimate'
    });
    PhoneCall.belongsTo(models.Event, {
      foreignKey: 'eventId',
      as: 'Event'
    });
    PhoneCall.belongsTo(models.WorkOrder, {
      foreignKey: 'workOrderId',
      as: 'WorkOrder'
    });
    PhoneCall.belongsTo(models.Invoice, {
      foreignKey: 'invoiceId',
      as: 'Invoice'
    });
    PhoneCall.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'Creator'
    });
  };

  return PhoneCall;
};
