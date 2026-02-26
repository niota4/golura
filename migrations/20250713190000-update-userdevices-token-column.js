'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change token column from VARCHAR(255) to TEXT to accommodate JWT tokens
    await queryInterface.changeColumn('userDevices', 'token', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Change securityToken column from VARCHAR(255) to TEXT to accommodate JWT tokens
    await queryInterface.changeColumn('users', 'securityToken', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to VARCHAR(255) - note: this may truncate long tokens
    await queryInterface.changeColumn('userDevices', 'token', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.changeColumn('users', 'securityToken', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
  }
};
