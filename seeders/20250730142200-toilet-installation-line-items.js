"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Toilet - Two-Piece Elongated",
        description: "WaterSense certified elongated two-piece toilet.",
        rate: 350.00,
        unit: "each",
        subTotal: 350.00,
        total: 350.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Toilet Installation Labor",
        description: "Complete toilet installation including wax ring and bolts.",
        rate: 200.00,
        unit: "each",
        subTotal: 200.00,
        total: 200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Wax Ring & Bolts",
        description: "Toilet wax ring and mounting bolts.",
        rate: 15.00,
        unit: "set",
        subTotal: 15.00,
        total: 15.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Water Supply Line",
        description: "Braided stainless steel water supply line.",
        rate: 25.00,
        unit: "each",
        subTotal: 25.00,
        total: 25.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Shutoff Valve Replacement",
        description: "New toilet shutoff valve installation.",
        rate: 75.00,
        unit: "each",
        subTotal: 75.00,
        total: 75.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Old Toilet Removal",
        description: "Removal and disposal of existing toilet.",
        rate: 80.00,
        unit: "each",
        subTotal: 80.00,
        total: 80.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Floor Repair & Caulking",
        description: "Floor repair around toilet base and caulking.",
        rate: 60.00,
        unit: "job",
        subTotal: 60.00,
        total: 60.00,
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
