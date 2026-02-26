'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const priorities = [
      { level: 'normal'},
      { level: 'medium'},
      { level: 'high'},
      { level: 'emergency'}
    ];

    await queryInterface.bulkInsert('priorities', priorities, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('priorities', null, {});
  }
};