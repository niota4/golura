'use strict';
module.exports = (sequelize, DataTypes) => {
    const Warehouse = sequelize.define('Warehouse', {
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
            allowNull: false
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        warehouseTypeId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'warehouseTypes',
                key: 'id'
            },
        }
    }, {
        tableName: 'warehouses',
        timestamps: true,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "id" }
                ]
            },
            {
                name: "warehouseTypeId",
                using: "BTREE",
                fields: [
                    { name: "warehouseTypeId" }
                ]
            }
        ]
    });

    Warehouse.associate = function(models) {
        Warehouse.belongsTo(models.WarehouseType, { foreignKey: 'warehouseTypeId', as: 'Type' });
    };

    return Warehouse;
};
