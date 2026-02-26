'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("formFolders", [
      { name: "Events", description: "", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Projects", description: "", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Clients", description: "", isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ], {});
 },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("formFolders", null, {});
  }
};
