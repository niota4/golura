const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const PurchaseOrderStatus = sequelize.define('PurchaseOrderStatus', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    tableName: 'purchaseOrderStatuses',
    timestamps: true
  });
  return PurchaseOrderStatus;
};
