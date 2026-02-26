'use strict';
module.exports = (sequelize, DataTypes) => {
    const InventoryShelf = sequelize.define('InventoryShelf', {
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'companies',
                key: 'id',
            },
        },
        inventoryRowId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'inventoryRows',
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
        tableName: 'inventoryShelves',
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
                name: "inventoryRowId",
                using: "BTREE",
                fields: [
                    { name: "inventoryRowId" }
                ]
            }
        ]
    });

    InventoryShelf.associate = function(models) {
        InventoryShelf.belongsTo(models.InventoryRow, { foreignKey: 'inventoryRowId', as: 'Row' });
        InventoryShelf.hasMany(models.InventoryRack, { foreignKey: 'inventoryShelfId', as: 'Racks' });
    };

    InventoryShelf.addHook('beforeCreate', async (shelf, options) => {
        const maxStep = await InventoryShelf.max('step', { where: { inventoryRowId: shelf.inventoryRowId } }) || 0;
        shelf.step = maxStep + 1;
    });

    InventoryShelf.addHook('beforeUpdate', async (shelf, options) => {
        const relatedShelves = await InventoryShelf.findAll({ where: { inventoryRowId: shelf.inventoryRowId } });
        const sortedShelves = relatedShelves.sort((a, b) => a.step - b.step);
        let currentStep = 1;
        for (const relatedShelf of sortedShelves) {
            if (relatedShelf.id === shelf.id) {
                relatedShelf.step = shelf.step;
            } else {
                if (currentStep === shelf.step) {
                    currentStep++;
                }
                relatedShelf.step = currentStep;
                currentStep++;
            }
            await relatedShelf.save({ hooks: false });
        }
    });

    return InventoryShelf;
};
