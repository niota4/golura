const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('formSubmissions', {
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false
    },
    formId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'forms',
          key: 'id',
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        }
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'events',
          key: 'id',
        }
    },
    estimateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'estimates',
          key: 'id',
        }
    },
    workOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'workOrders',
          key: 'id',
        }
    },
    invoiceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'invoices',
          key: 'id',
        }
    },
    marketingId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'marketing',
        key: 'id',
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
    tableName: 'formSubmissions',
    timestamps: true
  });
};
