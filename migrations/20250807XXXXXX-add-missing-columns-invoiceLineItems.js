"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing columns
    const table = await queryInterface.describeTable("invoiceLineItems");
    if (!table.itemId) {
      await queryInterface.addColumn("invoiceLineItems", "itemId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "items", key: "id" },
      });
    }
    if (!table.laborId) {
      await queryInterface.addColumn("invoiceLineItems", "laborId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "labor", key: "id" },
      });
    }
    if (!table.unitPrice) {
      await queryInterface.addColumn("invoiceLineItems", "unitPrice", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
    }
    if (!table.totalPrice) {
      await queryInterface.addColumn("invoiceLineItems", "totalPrice", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
    }
    if (!table.lineItemPrice) {
      await queryInterface.addColumn("invoiceLineItems", "lineItemPrice", {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true
      });
    }
    if (!table.category) {
      await queryInterface.addColumn("invoiceLineItems", "category", {
        type: Sequelize.ENUM('Material', 'Labor', 'Equipment', 'Miscellaneous'),
        allowNull: false,
        defaultValue: 'Material'
      });
    }
    if (!table.pricedBy) {
      await queryInterface.addColumn("invoiceLineItems", "pricedBy", {
        type: Sequelize.ENUM('formula', 'question', 'custom'),
        allowNull: false,
        defaultValue: 'custom'
      });
    }
    if (!table.formulaId) {
      await queryInterface.addColumn("invoiceLineItems", "formulaId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "formulas", key: "id" }
      });
    }
    if (!table.questionId) {
      await queryInterface.addColumn("invoiceLineItems", "questionId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "questions", key: "id" }
      });
    }
    if (!table.moduleDescription) {
      await queryInterface.addColumn("invoiceLineItems", "moduleDescription", {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }
    if (!table.instructions) {
      await queryInterface.addColumn("invoiceLineItems", "instructions", {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }
    if (!table.adHoc) {
      await queryInterface.addColumn("invoiceLineItems", "adHoc", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }
    if (!table.isActive) {
      await queryInterface.addColumn("invoiceLineItems", "isActive", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }
    if (!table.hours) {
      await queryInterface.addColumn("invoiceLineItems", "hours", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null
      });
    }
    if (!table.useOvertimeRate) {
      await queryInterface.addColumn("invoiceLineItems", "useOvertimeRate", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }
    if (!table.standardHours) {
      await queryInterface.addColumn("invoiceLineItems", "standardHours", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null
      });
    }
    if (!table.overtimeHours) {
      await queryInterface.addColumn("invoiceLineItems", "overtimeHours", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null
      });
    }
    if (!table.quantity) {
      await queryInterface.addColumn("invoiceLineItems", "quantity", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove columns added in up migration (reverse order)
    const table = await queryInterface.describeTable("invoiceLineItems");
    const columns = [
      "quantity",
      "overtimeHours",
      "standardHours",
      "useOvertimeRate",
      "hours",
      "isActive",
      "adHoc",
      "instructions",
      "moduleDescription",
      "questionId",
      "formulaId",
      "pricedBy",
      "category",
      "lineItemPrice",
      "totalPrice",
      "unitPrice",
      "laborId",
      "itemId"
    ];
    for (const col of columns) {
      if (table[col]) {
        await queryInterface.removeColumn("invoiceLineItems", col);
      }
    }
  }
};
