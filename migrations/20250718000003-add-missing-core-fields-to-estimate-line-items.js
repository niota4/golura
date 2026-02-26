'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('estimateLineItems');
    
    console.log('Checking for missing fields...');
    
    // Add missing core fields that should exist based on the model
    const missingFields = [
      {
        name: 'taxable',
        definition: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        }
      },
      {
        name: 'markup',
        definition: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0
        }
      },
      {
        name: 'rate',
        definition: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0
        }
      },
      {
        name: 'unit',
        definition: {
          type: Sequelize.ENUM('hour', 'foot', 'each', 'portion', 'gallon'),
          allowNull: false,
          defaultValue: 'each'
        }
      },
      {
        name: 'subTotal',
        definition: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0
        }
      },
      {
        name: 'salesTaxRate',
        definition: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true
        }
      },
      {
        name: 'salesTaxTotal',
        definition: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true
        }
      }
    ];
    
    for (const field of missingFields) {
      if (!tableInfo[field.name]) {
        console.log(`Adding ${field.name} column...`);
        await queryInterface.addColumn('estimateLineItems', field.name, field.definition);
      }
    }
    
    console.log('Migration completed: Added missing core fields to estimateLineItems');
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('estimateLineItems');
    
    const fieldsToRemove = ['taxable', 'markup', 'rate', 'unit', 'subTotal', 'salesTaxRate', 'salesTaxTotal'];
    
    for (const fieldName of fieldsToRemove) {
      if (tableInfo[fieldName]) {
        await queryInterface.removeColumn('estimateLineItems', fieldName);
      }
    }
  }
};
