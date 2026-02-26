'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename the table from 'company' to 'companies' to follow plural naming convention
    try {
      console.log('Renaming table from company to companies...');
      await queryInterface.renameTable('company', 'companies');
      console.log('Successfully renamed table to companies');
    } catch (error) {
      console.log(`Warning: Could not rename table from company to companies: ${error.message}`);
      // If table doesn't exist or rename fails, continue
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rename the table back from 'companies' to 'company'
    try {
      console.log('Renaming table from companies to company...');
      await queryInterface.renameTable('companies', 'company');
      console.log('Successfully renamed table back to company');
    } catch (error) {
      console.log(`Warning: Could not rename table from companies to company: ${error.message}`);
    }
  }
};
