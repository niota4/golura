'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("workOrderStatuses", [
      { id: 1, name: "Pending", createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: "In Progress", createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: "Completed", createdAt: new Date(), updatedAt: new Date() }
    ], {});
 },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("workOrderStatuses", null, {});
  }
};
