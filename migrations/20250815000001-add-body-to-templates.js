'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('templates', 'body', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      after: 'data' // Add the column after the 'data' column
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('templates', 'body');
  }
};
