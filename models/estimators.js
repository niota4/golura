const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const Estimator = sequelize.define('Estimator', {
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Draft', 'Published'),
      allowNull: false,
    },
    eventTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'eventTypes',
        key: 'id',
      },
      defaultValue: null,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'estimators',
    timestamps: true,
  });

  Estimator.associate = models => {
    Estimator.belongsTo(models.User, { foreignKey: 'createdBy', as: 'Creator' });
    Estimator.belongsTo(models.EventType, { foreignKey: 'eventTypeId', as: 'EventType' });
    Estimator.hasMany(models.QuestionContainer, { foreignKey: 'estimatorId', as: 'QuestionContainers' });
    Estimator.hasMany(models.EstimateAdjustment, { foreignKey: 'estimatorId', as: 'EstimateAdjustments' });
    Estimator.hasMany(models.EstimateVersioning, { foreignKey: 'estimatorId', as: 'EstimateVersionings' });
    Estimator.hasMany(models.EstimatorUser, { foreignKey: 'estimatorId', as: 'EstimatorUsers' });
  };

  return Estimator;
};
