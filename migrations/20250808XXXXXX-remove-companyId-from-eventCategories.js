'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('eventCategories', 'companyId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('eventCategories', 'companyId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      }
    });
  }
};
