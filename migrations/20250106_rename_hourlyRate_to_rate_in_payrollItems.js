'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename hourlyRate column to rate in payrollItems table
    await queryInterface.renameColumn('payrollItems', 'hourlyRate', 'rate');
  },

  async down(queryInterface, Sequelize) {
    // Revert: rename rate column back to hourlyRate in payrollItems table
    await queryInterface.renameColumn('payrollItems', 'rate', 'hourlyRate');
  }
};
