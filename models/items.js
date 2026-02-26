const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const Item = sequelize.define('Item', {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    partNumber: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    manufacturerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rate: {
      type: DataTypes.DECIMAL(11, 2),
      allowNull: true
    },
    unitId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    taxable: {
      type: DataTypes.TINYINT(1),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    itemTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    markUpRate: {
      type: DataTypes.FLOAT(20, 4),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    salesTaxRateId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    businessUnitId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    modified: {
      type: DataTypes.DATE,
      allowNull: true
    },
    minimumOrderAmount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    parentManufacturerPartNumber: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    adHocEstimates: {
      type: DataTypes.TINYINT(1),
      allowNull: true
    },
    discountItem: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0
    },
    isPercent: {
      type: DataTypes.TINYINT(1),
      allowNull: true,
      defaultValue: 0
    },
    imgUrl: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    manufacturerPartNumber: {
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
    tableName: 'items',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" }
        ]
      }
    ]
  });

  Item.associate = function(models) {
    Item.belongsTo(models.Vendor, { foreignKey: 'vendorId', as: 'Vendor' });
    Item.belongsToMany(models.Estimate, { through: models.EstimateLineItem, as: 'Estimates', foreignKey: 'itemId' });
    Item.belongsToMany(models.WorkOrder, { through: models.WorkOrderLineItem, as: 'WorkOrders', foreignKey: 'itemId' });
    Item.hasMany(models.InventoryItem, { foreignKey: 'itemId', as: 'InventoryItems' });
    Item.hasMany(models.VendorItem, { foreignKey: 'itemId', as: 'VendorItems' });
    Item.belongsTo(models.Variable, {
        foreignKey: 'variableId',
        as: 'variable',
    });
  };

  return Item;
};
