'use strict';
module.exports = (sequelize, DataTypes) => {
    const InventoryAreaType = sequelize.define('InventoryAreaType', {
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
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
        tableName: 'inventoryAreaTypes',
        timestamps: true,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "id" }
                ]
            }
        ]
    });

    InventoryAreaType.associate = function(models) {
        InventoryAreaType.hasMany(models.InventoryArea, { foreignKey: 'typeId', as: 'InventoryAreas' });
    };

    return InventoryAreaType;
};
