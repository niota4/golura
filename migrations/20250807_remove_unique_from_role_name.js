"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove both possible unique indexes from 'name' column in 'roles' table
    try {
      await queryInterface.removeIndex('roles', 'name_21');
    } catch (e) {}
    try {
      await queryInterface.removeIndex('roles', 'name');
    } catch (e) {}
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add non-unique index to 'name' column in 'roles' table
    await queryInterface.addIndex('roles', ['name'], {
      name: 'name',
      unique: false
    });
  }
};
