'use strict';
module.exports = (sequelize, DataTypes) => {
    const InventoryRow = sequelize.define('InventoryRow', {
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'companies',
                key: 'id',
            },
        },
        inventoryAisleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'inventoryAisles',
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
        tableName: 'inventoryRows',
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
                name: "inventoryAisleId",
                using: "BTREE",
                fields: [
                    { name: "inventoryAisleId" }
                ]
            }
        ]
    });

    InventoryRow.associate = function(models) {
        InventoryRow.belongsTo(models.InventoryAisle, { foreignKey: 'inventoryAisleId', as: 'Aisle' });
        InventoryRow.hasMany(models.InventoryShelf, { foreignKey: 'inventoryRowId', as: 'Shelves' });
    };

    InventoryRow.addHook('beforeCreate', async (row, options) => {
        const maxStep = await InventoryRow.max('step', { where: { inventoryAisleId: row.inventoryAisleId } }) || 0;
        row.step = maxStep + 1;
    });

    InventoryRow.addHook('beforeUpdate', async (row, options) => {
        const relatedRows = await InventoryRow.findAll({ where: { inventoryAisleId: row.inventoryAisleId } });
        const sortedRows = relatedRows.sort((a, b) => a.step - b.step);
        let currentStep = 1;
        for (const relatedRow of sortedRows) {
            if (relatedRow.id === row.id) {
                relatedRow.step = row.step;
            } else {
                if (currentStep === row.step) {
                    currentStep++;
                }
                relatedRow.step = currentStep;
                currentStep++;
            }
            await relatedRow.save({ hooks: false });
        }
    });

    return InventoryRow;
};
