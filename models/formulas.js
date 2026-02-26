const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    const Formula = sequelize.define('Formula', {
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
        containerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'questionContainers',
                key: 'id',
            },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expression: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'general',
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
        tableName: 'formulas',
        timestamps: true,
    });

    Formula.associate = models => {
        Formula.belongsTo(models.QuestionContainer, { foreignKey: 'containerId', as: 'Container' });
        Formula.belongsTo(models.User, { foreignKey: 'createdBy', as: 'Creator' });
        Formula.hasMany(models.LineItem, { foreignKey: 'formulaId', as: 'LineItems' });
    };

    return Formula;
};
