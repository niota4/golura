'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("reminderTypes", [
      { id: 1, name: "email", createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: "text", createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: "call", createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: "calendar", createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("reminderTypes", null, {});
  }
};
