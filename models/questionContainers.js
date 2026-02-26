const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const QuestionContainer = sequelize.define('QuestionContainer', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    estimatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'estimators',
        key: 'id',
      },
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lineItemIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'questionContainers',
    timestamps: true,
  });

  QuestionContainer.associate = models => {
    QuestionContainer.belongsTo(models.Estimator, { foreignKey: 'estimatorId', as: 'Estimator' });
    QuestionContainer.hasMany(models.Question, { foreignKey: 'containerId', as: 'Questions' });
    QuestionContainer.hasMany(models.Formula, { foreignKey: 'containerId', as: 'Formulas' });
  };

  return QuestionContainer;
};
