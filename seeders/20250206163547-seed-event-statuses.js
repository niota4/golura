'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("eventStatuses", [
      { name: "Scheduled", description: "The event is planned and scheduled for a specific date and time.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "In Progress", description: "The event is currently taking place.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Completed", description: "The event has been finished successfully.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Cancelled", description: "The event has been canceled and will not take place.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Postponed", description: "The event has been rescheduled to a different date/time.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Pending Approval", description: "The event is awaiting approval before it can be confirmed.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Confirmed", description: "The event is confirmed to occur as planned.", isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: "Rejected", description: "The event request was not approved and will not occur.", isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ], {});
 },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("eventStatuses", null, {});
  }
};
