"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'linear ft' and 'sqft' to lineItems.unit ENUM
    await queryInterface.changeColumn("lineItems", "unit", {
      type: Sequelize.ENUM('linear ft', 'sqft', 'job', 'set', 'hour', 'foot', 'each', 'portion', 'gallon'),
      allowNull: false
    });
    // Add 'linear ft' and 'sqft' to estimateLineItems.unit ENUM
    await queryInterface.changeColumn("estimateLineItems", "unit", {
      type: Sequelize.ENUM('linear ft', 'sqft', 'job', 'set', 'hour', 'foot', 'each', 'portion', 'gallon'),
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove 'linear ft' and 'sqft' from lineItems.unit ENUM
    await queryInterface.changeColumn("lineItems", "unit", {
      type: Sequelize.ENUM('job', 'set', 'hour', 'foot', 'each', 'portion', 'gallon'),
      allowNull: false
    });
    // Remove 'linear ft' and 'sqft' from estimateLineItems.unit ENUM
    await queryInterface.changeColumn("estimateLineItems", "unit", {
      type: Sequelize.ENUM('job', 'set', 'hour', 'foot', 'each', 'portion', 'gallon'),
      allowNull: false
    });
  }
};
