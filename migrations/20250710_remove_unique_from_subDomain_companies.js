'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove unique index from subDomain if it exists
    // The index name is usually 'companies_subDomain_unique' or similar
    // We'll use raw SQL to drop any unique index on subDomain
    await queryInterface.removeIndex('companies', ['subDomain']).catch(() => {});
  },

  down: async (queryInterface, Sequelize) => {
    // Add unique index back if needed
    await queryInterface.addIndex('companies', ['subDomain'], {
      unique: true
    });
  }
};
