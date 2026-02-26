"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("invoiceLineItems", "lineItemId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: "lineItems",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("invoiceLineItems", "lineItemId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: undefined, // Remove default
      references: {
        model: "lineItems",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });
  }
};
