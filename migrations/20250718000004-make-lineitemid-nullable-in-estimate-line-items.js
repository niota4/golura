'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Making lineItemId nullable in estimateLineItems...');
    
    // Change lineItemId to allow NULL values
    await queryInterface.changeColumn('estimateLineItems', 'lineItemId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'lineItems',
        key: 'id'
      }
    });
    
    console.log('lineItemId is now nullable - this allows direct EstimateLineItem creation without LineItem association');
  },

  async down(queryInterface, Sequelize) {
    // Note: We can't easily revert this without checking for NULL values first
    console.log('Reverting lineItemId to NOT NULL - this may fail if there are NULL values');
    
    // First, update any NULL values to a default (this is dangerous in production)
    await queryInterface.sequelize.query(`
      UPDATE estimateLineItems 
      SET lineItemId = 1 
      WHERE lineItemId IS NULL
    `);
    
    await queryInterface.changeColumn('estimateLineItems', 'lineItemId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'lineItems',
        key: 'id'
      }
    });
  }
};
