'use strict';
module.exports = (sequelize, DataTypes) => {
    const WarehouseType = sequelize.define('WarehouseType', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
    }, {
        tableName: 'warehouseTypes',
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

    WarehouseType.associate = function(models) {
        WarehouseType.hasMany(models.Warehouse, { foreignKey: 'warehouseTypeId', as: 'Warehouses' });
    };

    return WarehouseType;
};
