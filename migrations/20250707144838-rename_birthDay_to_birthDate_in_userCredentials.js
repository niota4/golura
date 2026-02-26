'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('userCredentials', 'birthDay', 'birthDate');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('userCredentials', 'birthDate', 'birthDay');
  }
};
