const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const LineItemItem = sequelize.define('LineItemItem', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    lineItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lineItems',
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
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    tableName: 'lineItemItem',
    timestamps: true,
    indexes: [
      {
        name: "lineItemItem_unique_constraint",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "lineItemId" },
          { name: "itemId" }
        ]
      }
    ]
  });

  LineItemItem.associate = function(models) {
    LineItemItem.belongsTo(models.LineItem, { foreignKey: 'lineItemId', as: 'AssociatedLineItem' });
    LineItemItem.belongsTo(models.Item, { foreignKey: 'itemId', as: 'AssociatedItem' });
  };

  return LineItemItem;
};
