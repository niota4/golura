"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Radiant Floor Heating System",
        description: "Electric or hydronic radiant floor heating system.",
        rate: 12.00,
        unit: "sqft",
        subTotal: 12.00,
        total: 12.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Insulation & Vapor Barrier",
        description: "Specialized insulation and vapor barrier for radiant systems.",
        rate: 3.50,
        unit: "sqft",
        subTotal: 3.50,
        total: 3.50,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Radiant System Installation Labor",
        description: "Complete installation of radiant heating system.",
        rate: 8.00,
        unit: "sqft",
        subTotal: 8.00,
        total: 8.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Sheet Metal Duct (Galvanized, Custom Fabricated)",
        description: "Custom sheet metal ductwork for main trunk or branch lines.",
        rate: 35.00,
        unit: "linear ft",
        subTotal: 35.00,
        total: 35.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Duct Insulation Wrap (R6)",
        description: "Insulation wrap for exposed ductwork to meet code and efficiency.",
        rate: 2.50,
        unit: "sqft",
        subTotal: 2.50,
        total: 2.50,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("lineItems", null, {});
  }
};
