const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const PurchaseOrder = sequelize.define('PurchaseOrder', {
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
    workOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'workOrders',
        key: 'id'
      },
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'vendors',
        key: 'id'
      },
    },
    purchaseOrderNumber: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'purchaseOrderStatuses',
        key: 'id'
      },
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    totalCost: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    adHocReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    tableName: 'purchaseOrders',
    timestamps: true
  });

  PurchaseOrder.associate = function(models) {
    PurchaseOrder.belongsTo(models.WorkOrder, { foreignKey: 'workOrderId', as: 'WorkOrder' });
    PurchaseOrder.belongsTo(models.Vendor, { foreignKey: 'vendorId', as: 'Vendor' });
    PurchaseOrder.belongsTo(models.User, { foreignKey: 'createdBy', as: 'Creator' });
    PurchaseOrder.hasMany(models.PurchaseOrderItem, { foreignKey: 'purchaseOrderId', as: 'PurchaseOrderItems' });
  };

  return PurchaseOrder;
};
