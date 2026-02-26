"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('permissions', 'subAction', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "This is for more granular permissions like for payroll 'approve' and 'process'"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('permissions', 'subAction');
  }
};
