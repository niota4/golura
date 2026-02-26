const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const VendorItem = sequelize.define('VendorItem', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vendors',
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
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    reorderPoint: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    minimumOrderQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    leadTime: {
      type: DataTypes.INTEGER,
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
    tableName: 'vendorItems',
    timestamps: true
  });

  VendorItem.associate = function(models) {
    VendorItem.belongsTo(models.Vendor, { foreignKey: 'vendorId', as: 'Vendor' });
    VendorItem.belongsTo(models.Item, { foreignKey: 'itemId', as: 'Item' });
  };

  return VendorItem;
};
