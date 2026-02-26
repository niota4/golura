'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add emailId column to emails table
    await queryInterface.addColumn('emails', 'emailId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'companyId'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove emailId column from emails table
    await queryInterface.removeColumn('emails', 'emailId');
  }
};
