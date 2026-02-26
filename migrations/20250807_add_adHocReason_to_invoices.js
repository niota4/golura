'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('invoices', 'adHocReason', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'memo' // Add after memo field to match the model order
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('invoices', 'adHocReason');
  }
};
