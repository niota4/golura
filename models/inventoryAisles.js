'use strict';
module.exports = (sequelize, DataTypes) => {
    const InventoryAisle = sequelize.define('InventoryAisle', {
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
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        step: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        inventoryAreaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'inventoryAreas',
                key: 'id'
            }
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
    }, {
        tableName: 'inventoryAisles',
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

    InventoryAisle.associate = function(models) {
        InventoryAisle.belongsTo(models.InventoryArea, { foreignKey: 'inventoryAreaId', as: 'Area' });
        InventoryAisle.hasMany(models.InventoryRow, { foreignKey: 'inventoryAisleId', as: 'Rows' });
    };

    InventoryAisle.addHook('beforeCreate', async (aisle, options) => {
        const maxStep = await InventoryAisle.max('step', { where: { inventoryAreaId: aisle.inventoryAreaId } }) || 0;
        aisle.step = maxStep + 1;
    });

    InventoryAisle.addHook('beforeUpdate', async (aisle, options) => {
        const relatedAisles = await InventoryAisle.findAll({ where: { inventoryAreaId: aisle.inventoryAreaId } });
        const sortedAisles = relatedAisles.sort((a, b) => a.step - b.step);
        let currentStep = 1;
        for (const relatedAisle of sortedAisles) {
            if (relatedAisle.id === aisle.id) {
                relatedAisle.step = aisle.step;
            } else {
                if (currentStep === aisle.step) {
                    currentStep++;
                }
                relatedAisle.step = currentStep;
                currentStep++;
            }
            await relatedAisle.save({ hooks: false });
        }
    });

    return InventoryAisle;
};
