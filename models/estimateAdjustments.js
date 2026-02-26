const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const EstimateAdjustment = sequelize.define('EstimateAdjustment', {
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
    estimatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'estimators',
        key: 'id',
      },
    },
    adjustmentType: {
      type: DataTypes.ENUM('Overhead', 'Profit', 'Tax', 'Discount'),
      allowNull: false,
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    flatAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
    tableName: 'estimateAdjustments',
    timestamps: true,
  });

  EstimateAdjustment.associate = models => {
    EstimateAdjustment.belongsTo(models.Estimator, { foreignKey: 'estimatorId', as: 'Estimator' });
    EstimateAdjustment.belongsTo(models.User, { foreignKey: 'createdBy', as: 'User' });
    EstimateAdjustment.belongsTo(models.EstimateVersioning, { foreignKey: 'estimatorId', as: 'EstimateVersioning' });
  };

  return EstimateAdjustment;
};
