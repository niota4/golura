'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('estimateLineItems');
    
    console.log('Current estimateLineItems columns:', Object.keys(tableInfo));
    
    // The name field appears to be missing from the database even though it's in the model
    // Let's check if we need to add it
    if (!tableInfo.name) {
      console.log('Adding name column to estimateLineItems...');
      await queryInterface.addColumn('estimateLineItems', 'name', {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'Unnamed Item'
      });
      
      // Update existing records to have meaningful names
      await queryInterface.sequelize.query(`
        UPDATE estimateLineItems 
        SET name = CONCAT(category, ' Item') 
        WHERE name = 'Unnamed Item'
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('estimateLineItems');
    
    if (tableInfo.name) {
      await queryInterface.removeColumn('estimateLineItems', 'name');
    }
  }
};
