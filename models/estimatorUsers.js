const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const EstimatorUser = sequelize.define('EstimatorUser', {
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
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
    permissionLevel: {
      type: DataTypes.ENUM('Read', 'Write', 'Admin'),
      allowNull: false,
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
    tableName: 'estimatorUsers',
    timestamps: true,
  });

  EstimatorUser.associate = models => {
    EstimatorUser.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
    EstimatorUser.belongsTo(models.Estimator, { foreignKey: 'estimatorId', as: 'Estimator' });
  };

  return EstimatorUser;
};
