const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  
  const WorkOrderLineItems = sequelize.define('WorkOrderLineItems', {
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
    lineItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lineItems',
        key: 'id'
      },
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    unit: {
      type: DataTypes.ENUM('hour', 'foot', 'each', 'portion'),
      allowNull: false
    },
    subTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    taxable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    markup: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null temporarily
      references: {
        model: 'users',
        key: 'id'
      }
    },
    salesTaxRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    salesTaxTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    moduleDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    tableName: 'workOrderLineItems',
    timestamps: true,
    hooks: {
      afterCreate: async (lineItem, options) => {
        const WorkOrderActivity = sequelize.models.WorkOrderActivity;

        await WorkOrderActivity.create({
          workOrderId: lineItem.workOrderId,
          relatedModel: 'WorkOrderLineItems',
          relatedModelId: lineItem.id,
          action: 'CREATE',
          description: `Line Item ${lineItem.name} added to WorkOrder.`,
          changedBy: lineItem.userId || null,
        });
      },
      afterDestroy: async (lineItem, options) => {
        const WorkOrderActivity = sequelize.models.WorkOrderActivity;

        await WorkOrderActivity.create({
          workOrderId: lineItem.workOrderId,
          relatedModel: 'WorkOrderLineItems',
          relatedModelId: lineItem.id,
          action: 'DELETE',
          description: `Line Item ${lineItem.name} removed from WorkOrder.`,
          changedBy: lineItem.userId || null,
        });
      },
    },
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" }
        ]
      },
    ]
  });

  WorkOrderLineItems.associate = models => {
    WorkOrderLineItems.belongsTo(models.WorkOrder, { foreignKey: 'workOrderId', as: 'WorkOrder' });
    WorkOrderLineItems.belongsTo(models.LineItem, { foreignKey: 'lineItemId', as: 'LineItem' });
  };

  return WorkOrderLineItems;
};
