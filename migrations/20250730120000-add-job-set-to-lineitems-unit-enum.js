"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // For MySQL: alter ENUM to add 'job' and 'set' if not present
    await queryInterface.sequelize.query(`
      ALTER TABLE lineItems 
      MODIFY COLUMN unit ENUM('job','set','hour','foot','each','portion','gallon') NOT NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revert to previous ENUM (remove 'job' and 'set')
    await queryInterface.sequelize.query(`
      ALTER TABLE lineItems 
      MODIFY COLUMN unit ENUM('hour','foot','each','portion','gallon') NOT NULL;
    `);
  }
};
