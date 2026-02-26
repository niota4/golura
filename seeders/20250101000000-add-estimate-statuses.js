'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new statuses for client actions - only id, name, and timestamps
    await queryInterface.bulkInsert("estimateStatuses", [
      { 
        name: "viewed", 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: "approved", 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: "rejected", 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: "changesRequested", 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("estimateStatuses", {
      name: ["viewed", "approved", "rejected", "changesRequested"]
    }, {});
  }
};
