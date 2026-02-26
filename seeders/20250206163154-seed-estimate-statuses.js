'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("estimateStatuses", [
      { name: "active", createdAt: new Date(), updatedAt: new Date() },
      { name: "inactive", createdAt: new Date(), updatedAt: new Date() },
      { name: "won", createdAt: new Date(), updatedAt: new Date() },
      { name: "lost", createdAt: new Date(), updatedAt: new Date() },
      { name: "advance", createdAt: new Date(), updatedAt: new Date() },
      { name: "expired", createdAt: new Date(), updatedAt: new Date() },
      { name: "signed", createdAt: new Date(), updatedAt: new Date() },
      { name: "pending", createdAt: new Date(), updatedAt: new Date() },
      { name: "reactivated", createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("estimateStatuses", null, {});
  }
};
