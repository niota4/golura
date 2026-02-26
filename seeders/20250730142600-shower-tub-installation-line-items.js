"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Shower/Tub Combo Unit",
        description: "Fiberglass shower/tub combination unit with surround.",
        rate: 850.00,
        unit: "each",
        subTotal: 850.00,
        total: 850.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Shower Valve & Trim Kit",
        description: "Pressure-balancing shower valve with trim and handles.",
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
        name: "Tub/Shower Installation Labor",
        description: "Complete installation of tub/shower unit with plumbing.",
        rate: 1200.00,
        unit: "job",
        subTotal: 1200.00,
        total: 1200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Plumbing Rough-In",
        description: "Water supply and drain line rough-in plumbing.",
        rate: 400.00,
        unit: "job",
        subTotal: 400.00,
        total: 400.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Drain Assembly & P-Trap",
        description: "Tub drain assembly and P-trap installation.",
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
        name: "Wall Preparation & Framing",
        description: "Wall framing and substrate preparation.",
        rate: 300.00,
        unit: "job",
        subTotal: 300.00,
        total: 300.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Waterproofing & Sealing",
        description: "Waterproof membrane and caulking around unit.",
        rate: 150.00,
        unit: "job",
        subTotal: 150.00,
        total: 150.00,
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
