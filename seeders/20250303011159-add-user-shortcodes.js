'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const timestamp = new Date();
    await queryInterface.bulkInsert('shortCodes', [
      { name: 'User Name', code: '{{UserName}}', description: 'Full name of the user', createdAt: timestamp, updatedAt: timestamp },
      { name: 'User Email', code: '{{UserEmail}}', description: 'Email address of the user', createdAt: timestamp, updatedAt: timestamp },
      { name: 'User PhoneNumber', code: '{{UserPhoneNumber}}', description: 'Phone number of the user', createdAt: timestamp, updatedAt: timestamp },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('shortCodes', {
      code: {
        [Sequelize.Op.in]: [
          '{{UserName}}',
          '{{UserEmail}}',
          '{{UserPhoneNumber}}'
        ]
      }
    }, {});
  }
};
