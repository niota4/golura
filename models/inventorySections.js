'use strict';
module.exports = (sequelize, DataTypes) => {
    const InventorySection = sequelize.define('InventorySection', {
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'companies',
                key: 'id',
            },
        },
        inventoryRackId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'inventoryRacks',
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
        tableName: 'inventorySections',
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
                name: "inventoryRackId",
                using: "BTREE",
                fields: [
                    { name: "inventoryRackId" }
                ]
            }
        ]
    });

    InventorySection.associate = function(models) {
        InventorySection.belongsTo(models.InventoryRack, { foreignKey: 'inventoryRackId', as: 'Rack' });
        InventorySection.hasMany(models.InventoryItem, { foreignKey: 'inventorySectionId', as: 'Items' });
    };

    InventorySection.addHook('beforeCreate', async (section, options) => {
        const maxStep = await InventorySection.max('step', { where: { inventoryRackId: section.inventoryRackId } }) || 0;
        section.step = maxStep + 1;
    });

    InventorySection.addHook('beforeUpdate', async (section, options) => {
        const relatedSections = await InventorySection.findAll({ where: { inventoryRackId: section.inventoryRackId } });
        const sortedSections = relatedSections.sort((a, b) => a.step - b.step);
        let currentStep = 1;
        for (const relatedSection of sortedSections) {
            if (relatedSection.id === section.id) {
                relatedSection.step = section.step;
            } else {
                if (currentStep === section.step) {
                    currentStep++;
                }
                relatedSection.step = currentStep;
                currentStep++;
            }
            await relatedSection.save({ hooks: false });
        }
    });

    return InventorySection;
};
