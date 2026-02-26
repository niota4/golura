'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const timestamp = new Date();

    // Add event categories
    await queryInterface.bulkInsert('eventCategories', [
      { name: 'client', createdAt: timestamp, updatedAt: timestamp },
      { name: 'group', createdAt: timestamp, updatedAt: timestamp },
      { name: 'user', createdAt: timestamp, updatedAt: timestamp },
      { name: 'company', createdAt: timestamp, updatedAt: timestamp }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('eventCategories', null, {});
  }
};
