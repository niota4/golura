const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    const EstimateVersioning = sequelize.define('EstimateVersioning', {
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
        versionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        },
        estimateSnapshot: {
        type: DataTypes.JSON,
        allowNull: false,
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
        tableName: 'estimateVersioning',
        timestamps: true,
    });

    EstimateVersioning.associate = models => {
        EstimateVersioning.belongsTo(models.Estimator, { foreignKey: 'estimatorId', as: 'Estimator' });
        EstimateVersioning.belongsTo(models.User, { foreignKey: 'createdBy', as: 'Creator' });
    };

    return EstimateVersioning;
};
