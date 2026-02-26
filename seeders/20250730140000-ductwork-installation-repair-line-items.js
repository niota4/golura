"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Flexible Duct (R8, 8-inch, 25ft)",
        description: "Supply of flexible insulated duct for new or replacement runs.",
        rate: 120.00,
        unit: "each",
        subTotal: 120.00,
        total: 120.00,
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
      },
      {
        name: "Duct Installation Labor",
        description: "Labor for installing new ductwork, including hangers and supports.",
        rate: 1800.00,
        unit: "job",
        subTotal: 1800.00,
        total: 1800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Duct Repair Labor",
        description: "Labor for repairing, sealing, and reconnecting existing ductwork.",
        rate: 650.00,
        unit: "job",
        subTotal: 650.00,
        total: 650.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Duct Sealing Materials (Mastic, Tape, Fasteners)",
        description: "All mastic, tape, and fasteners for code-compliant duct sealing.",
        rate: 120.00,
        unit: "job",
        subTotal: 120.00,
        total: 120.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Permit Fee (Ductwork)",
        description: "Permit fee required by local building department for ductwork installation or repair.",
        rate: 90.00,
        unit: "each",
        subTotal: 90.00,
        total: 90.00,
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
