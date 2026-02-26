'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add requiredFeature column to pages table
    await queryInterface.addColumn('pages', 'requiredFeature', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'The subscription feature required to access this page'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the column
    await queryInterface.removeColumn('pages', 'requiredFeature');
  }
};
