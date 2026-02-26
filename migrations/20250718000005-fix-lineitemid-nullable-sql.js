'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Modifying lineItemId column to allow NULL values...');
    
    // Use raw SQL to modify the column
    await queryInterface.sequelize.query(`
      ALTER TABLE estimateLineItems 
      MODIFY COLUMN lineItemId INT NULL
    `);
    
    console.log('lineItemId column successfully modified to allow NULL values');
  },

  async down(queryInterface, Sequelize) {
    console.log('Reverting lineItemId to NOT NULL...');
    
    // First update any NULL values
    await queryInterface.sequelize.query(`
      UPDATE estimateLineItems 
      SET lineItemId = 1 
      WHERE lineItemId IS NULL
    `);
    
    // Then change column back to NOT NULL
    await queryInterface.sequelize.query(`
      ALTER TABLE estimateLineItems 
      MODIFY COLUMN lineItemId INT NOT NULL
    `);
  }
};
