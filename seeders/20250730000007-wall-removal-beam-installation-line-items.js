"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Wall Demolition (Structural)",
        description: "Demolish load-bearing wall and prepare for beam installation.",
        rate: 5200.00,
        unit: "job",
        subTotal: 5200.00,
        total: 5200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Beam Installation (Structural)",
        description: "Install engineered beam to support structure after wall removal.",
        rate: 9200.00,
        unit: "job",
        subTotal: 9200.00,
        total: 9200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Temporary Shoring Installation",
        description: "Install temporary shoring to support structure during wall removal.",
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
        name: "Engineering & Permitting (Structural)",
        description: "Obtain engineering and permits for structural modifications.",
        rate: 2500.00,
        unit: "job",
        subTotal: 2500.00,
        total: 2500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Drywall & Paint Repair (Structural)",
        description: "Repair drywall and paint after wall removal and beam installation.",
        rate: 2100.00,
        unit: "job",
        subTotal: 2100.00,
        total: 2100.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Flooring Patch & Repair (Structural)",
        description: "Patch and repair flooring where wall was removed and beam installed.",
        rate: 1700.00,
        unit: "job",
        subTotal: 1700.00,
        total: 1700.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Electrical Rewiring (Structural)",
        description: "Rewire electrical circuits and relocate outlets/switches after wall removal.",
        rate: 2100.00,
        unit: "job",
        subTotal: 2100.00,
        total: 2100.00,
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
