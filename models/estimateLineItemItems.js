const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const EstimateActivity = sequelize.models.EstimateActivity;
  
  const EstimateLineItemItems = sequelize.define('estimateLineItemItems', {
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
    estimateLineItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'estimateLineItems',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'items',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
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
    salesTaxRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    salesTaxTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    tableName: 'estimateLineItemItems',
    timestamps: true,
    hooks: {
      afterCreate: async (item, options) => {
        await EstimateActivity.create({
          estimateId: item.estimateId,
          relatedModel: 'EstimateLineItemItems',
          relatedModelId: item.id,
          action: 'CREATE',
          description: `Item added to Estimate Line Item ${item.estimateLineItemId}.`,
          changedBy: options.userId || null,
        });
      },
      afterDestroy: async (item, options) => {
        await EstimateActivity.create({
          estimateId: lineItem.estimateId,
          relatedModel: 'EstimateLineItemItems',
          relatedModelId: item.id,
          action: 'DELETE',
          description: `Item removed from Estimate Line Item ${item.estimateLineItemId}.`,
          changedBy: options.userId || null,
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

  EstimateLineItemItems.associate = models => {
    EstimateLineItemItems.belongsTo(models.EstimateLineItem, { foreignKey: 'estimateLineItemId', as: 'EstimateLineItem' });
    EstimateLineItemItems.belongsTo(models.Item, { foreignKey: 'itemId', as: 'Item' });
  };

  return EstimateLineItemItems;
};
