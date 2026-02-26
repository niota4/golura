const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    const CompanyType = sequelize.define('CompanyType', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        tableName: 'companyTypes',
        timestamps: true,
        indexes: [
            {
                fields: ['isActive']
            }
        ]
    });

    CompanyType.associate = function(models) {
        // Association with Company model
        CompanyType.hasMany(models.Company, {
            foreignKey: 'companyTypeId',
            as: 'Companies'
        });
    };

    return CompanyType;
};
