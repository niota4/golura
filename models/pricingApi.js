const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const PricingAPI = sequelize.define('PricingAPI', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'items',
        key: 'id',
      },
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vendors',
        key: 'id',
      },
    },
    apiUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  }, {
    tableName: 'pricingApi',
    timestamps: true,
  });

  PricingAPI.associate = models => {
    PricingAPI.belongsTo(models.Item, { foreignKey: 'itemId', as: 'Item' });
    PricingAPI.belongsTo(models.Vendor, { foreignKey: 'vendorId', as: 'Supplier' });
  };

  return PricingAPI;
};
