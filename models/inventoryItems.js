'use strict';
module.exports = (sequelize, DataTypes) => {
    const InventoryItem = sequelize.define('InventoryItem', {
        inventorySectionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'inventorySections',
                key: 'id'
            }
        },
        itemId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'items',
                key: 'id'
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        unitOfMeasure: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        companyId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'companies',
            key: 'id',
          },
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
        tableName: 'inventoryItems',
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
                name: "inventorySectionId",
                using: "BTREE",
                fields: [
                    { name: "inventorySectionId" }
                ]
            },
            {
                name: "itemId",
                using: "BTREE",
                fields: [
                    { name: "itemId" }
                ]
            }
        ]
    });

    InventoryItem.associate = function(models) {
        InventoryItem.belongsTo(models.InventorySection, { foreignKey: 'inventorySectionId', as: 'Section' });
        InventoryItem.belongsTo(models.Item, { foreignKey: 'itemId', as: 'Item' });
    };

    return InventoryItem;
};
