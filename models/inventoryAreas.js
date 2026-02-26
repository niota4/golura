'use strict';
module.exports = (sequelize, DataTypes) => {
    const InventoryArea = sequelize.define('InventoryArea', {
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
        typeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'inventoryAreaTypes',
                key: 'id'
            }
        },
        warehouseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'warehouses',
                key: 'id'
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        step: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'inventoryAreas',
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
                name: "typeId",
                using: "BTREE",
                fields: [
                    { name: "typeId" }
                ]
            },
            {
                name: "warehouseId",
                using: "BTREE",
                fields: [
                    { name: "warehouseId" }
                ]
            }
        ]
    });

    InventoryArea.associate = function(models) {
        InventoryArea.belongsTo(models.InventoryAreaType, { foreignKey: 'typeId', as: 'Type' });
        InventoryArea.belongsTo(models.Warehouse, { foreignKey: 'warehouseId', as: 'Warehouse' });
        InventoryArea.hasMany(models.InventoryAisle, { foreignKey: 'inventoryAreaId', as: 'Aisles' });
    };

    InventoryArea.addHook('beforeCreate', async (area, options) => {
        const maxStep = await InventoryArea.max('step') || 0;
        area.step = maxStep + 1;
    });

    InventoryArea.addHook('beforeUpdate', async (area, options) => {
        const relatedAreas = await InventoryArea.findAll({ where: { warehouseId: area.warehouseId } });
        const sortedAreas = relatedAreas.sort((a, b) => a.step - b.step);
        let currentStep = 1;
        for (const relatedArea of sortedAreas) {
            if (relatedArea.id === area.id) {
                relatedArea.step = area.step;
            } else {
                if (currentStep === area.step) {
                    currentStep++;
                }
                relatedArea.step = currentStep;
                currentStep++;
            }
            await relatedArea.save({ hooks: false });
        }
    });

    return InventoryArea;
};
