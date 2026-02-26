'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename driverLicenseState column to driverLicenseStateId
    await queryInterface.renameColumn('userCredentials', 'driverLicenseState', 'driverLicenseStateId');
  },

  async down(queryInterface, Sequelize) {
    // Revert: rename driverLicenseStateId back to driverLicenseState
    await queryInterface.renameColumn('userCredentials', 'driverLicenseStateId', 'driverLicenseState');
  }
};
