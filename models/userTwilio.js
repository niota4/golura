const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('UserTwilio', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        workerSid: {
            type: DataTypes.STRING,
            allowNull: true
        },
        workspaceSid: {
            type: DataTypes.STRING,
            allowNull: true
        },
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'companies',
                key: 'id',
            },
        }
    }, {
        sequelize,
        tableName: 'userTwilio',
        timestamps: true,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "id" },
                ]
            },
        ]
    });
};