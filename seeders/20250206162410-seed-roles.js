'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("roles", [
      { name: "representative", userId: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "technician", userId: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "customer support", userId: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "manager", userId: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "hr", userId: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "administrator", userId: null, isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roles", null, {});
  }
};
