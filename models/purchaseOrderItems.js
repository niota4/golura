const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
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
    purchaseOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'purchaseOrders',
        key: 'id'
      },
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'items',
        key: 'id'
      },
    },
    lineItemId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'workOrderLineItems',
        key: 'id'
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unitPrice: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    totalCost: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: function() {
        return this.quantity * this.unitPrice;
      }
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
    }
  }, {
    sequelize,
    tableName: 'purchaseOrderItems',
    timestamps: true
  });

  PurchaseOrderItem.associate = models => {
    PurchaseOrderItem.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'PurchaseOrder' });
    PurchaseOrderItem.belongsTo(models.Item, { foreignKey: 'itemId', as: 'Item' });
  };

  return PurchaseOrderItem;
};
