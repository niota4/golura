'use strict';
module.exports = (sequelize, DataTypes) => {
    const InventoryRack = sequelize.define('InventoryRack', {
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'companies',
                key: 'id',
            },
        },
        inventoryShelfId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'inventoryShelves',
                key: 'id'
            }
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
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'inventoryRacks',
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
                name: "inventoryShelfId",
                using: "BTREE",
                fields: [
                    { name: "inventoryShelfId" }
                ]
            }
        ]
    });

    InventoryRack.associate = function(models) {
        InventoryRack.belongsTo(models.InventoryShelf, { foreignKey: 'inventoryShelfId', as: 'Shelf' });
        InventoryRack.hasMany(models.InventorySection, { foreignKey: 'inventoryRackId', as: 'Sections' });
    };

    InventoryRack.addHook('beforeCreate', async (rack, options) => {
        const maxStep = await InventoryRack.max('step', { where: { inventoryShelfId: rack.inventoryShelfId } }) || 0;
        rack.step = maxStep + 1;
    });

    InventoryRack.addHook('beforeUpdate', async (rack, options) => {
        const relatedRacks = await InventoryRack.findAll({ where: { inventoryShelfId: rack.inventoryShelfId } });
        const sortedRacks = relatedRacks.sort((a, b) => a.step - b.step);
        let currentStep = 1;
        for (const relatedRack of sortedRacks) {
            if (relatedRack.id === rack.id) {
                relatedRack.step = rack.step;
            } else {
                if (currentStep === rack.step) {
                    currentStep++;
                }
                relatedRack.step = currentStep;
                currentStep++;
            }
            await relatedRack.save({ hooks: false });
        }
    });

    return InventoryRack;
};
