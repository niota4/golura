'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("inventoryAreaTypes", [
      { name: "Receiving Area", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Storage Area", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Picking Area", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Packing Area", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Shipping Area", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Returns Area", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Quality Control Area", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Maintenance Area", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Safety Area", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "General Storage", isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ], {});
 },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("inventoryAreaTypes", null, {});
  }
};
