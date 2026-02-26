"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("invoiceLineItems", "lineItemId", {
      type: Sequelize.INTEGER,
      allowNull: true,
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
      allowNull: false,
      references: {
        model: "lineItems",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });
  }
};
