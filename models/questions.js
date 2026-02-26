const { create } = require('browser-sync');
const Sequelize = require('sequelize');
const { help } = require('yargs');

module.exports = function(sequelize, DataTypes) {
    const Question = sequelize.define('Question', {
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
        questionText: {
        type: DataTypes.TEXT,
        allowNull: false,
        },
        inputType: {
        type: DataTypes.ENUM(
            'text',
            'number',
            'select',
            'checkbox',
            'radio',
            'textarea',
            'date',
            'time',
            'email',
            'tel',
            'url',
            'range',
            'file'
        ),
        allowNull: false,
        },
        options: {
        type: DataTypes.JSON,
        allowNull: true,
        },
        defaultValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        },
        validationRules: {
        type: DataTypes.JSON,
        allowNull: true,
        },
        formulaReference: {
        type: DataTypes.STRING,
        allowNull: true,
        },
        helpText: {
        type: DataTypes.TEXT,
        allowNull: true,
        },
        displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        },
        isRequired: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        },
        isVisible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        },
        isEditable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
        tableName: 'questions',
        timestamps: true,
    });

    Question.associate = models => {
        Question.belongsTo(models.QuestionContainer, { foreignKey: 'containerId', as: 'Container' });
        Question.belongsTo(models.User, { foreignKey: 'createdBy', as: 'Creator' });
        Question.hasMany(models.LineItem, { foreignKey: 'questionId', as: 'LineItems' });
    };

return Question;
};
