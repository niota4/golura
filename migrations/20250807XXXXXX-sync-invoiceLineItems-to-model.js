"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update existing columns
    await queryInterface.changeColumn("invoiceLineItems", "lineItemId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: { model: "lineItems", key: "id" },
    });
    await queryInterface.changeColumn("invoiceLineItems", "itemId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "items", key: "id" },
    });
    await queryInterface.changeColumn("invoiceLineItems", "laborId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "labor", key: "id" },
    });
    await queryInterface.changeColumn("invoiceLineItems", "name", {
      type: Sequelize.STRING(255),
      allowNull: false
    });
    await queryInterface.changeColumn("invoiceLineItems", "description", {
      type: Sequelize.TEXT,
      allowNull: false
    });
    await queryInterface.changeColumn("invoiceLineItems", "quantity", {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    await queryInterface.changeColumn("invoiceLineItems", "taxable", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
    await queryInterface.changeColumn("invoiceLineItems", "markup", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });
    await queryInterface.changeColumn("invoiceLineItems", "rate", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });
    await queryInterface.changeColumn("invoiceLineItems", "unit", {
      type: Sequelize.ENUM('job', 'set', 'hour', 'foot', 'each', 'portion', 'gallon'),
      allowNull: false
    });
    await queryInterface.changeColumn("invoiceLineItems", "subTotal", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });
    await queryInterface.changeColumn("invoiceLineItems", "unitPrice", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });
    await queryInterface.changeColumn("invoiceLineItems", "salesTaxRate", {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true
    });
    await queryInterface.changeColumn("invoiceLineItems", "salesTaxTotal", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
    await queryInterface.changeColumn("invoiceLineItems", "totalPrice", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });
    await queryInterface.changeColumn("invoiceLineItems", "lineItemPrice", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true
    });
    await queryInterface.changeColumn("invoiceLineItems", "category", {
      type: Sequelize.ENUM('Material', 'Labor', 'Equipment', 'Miscellaneous'),
      allowNull: false
    });
    await queryInterface.changeColumn("invoiceLineItems", "pricedBy", {
      type: Sequelize.ENUM('formula', 'question', 'custom'),
      allowNull: false,
      defaultValue: 'custom'
    });
    await queryInterface.changeColumn("invoiceLineItems", "formulaId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "formulas", key: "id" }
    });
    await queryInterface.changeColumn("invoiceLineItems", "questionId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "questions", key: "id" }
    });
    await queryInterface.changeColumn("invoiceLineItems", "moduleDescription", {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.changeColumn("invoiceLineItems", "instructions", {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.changeColumn("invoiceLineItems", "adHoc", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    await queryInterface.changeColumn("invoiceLineItems", "isActive", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
    await queryInterface.changeColumn("invoiceLineItems", "userId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" }
    });
    await queryInterface.changeColumn("invoiceLineItems", "hours", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.changeColumn("invoiceLineItems", "useOvertimeRate", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    await queryInterface.changeColumn("invoiceLineItems", "standardHours", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.changeColumn("invoiceLineItems", "overtimeHours", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    // No-op: Down migration would need to restore previous types/defaults
  }
};
