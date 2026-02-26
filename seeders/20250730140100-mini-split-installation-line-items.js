"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Mini-Split Outdoor Unit (18,000 BTU)",
        description: "High-efficiency outdoor condenser unit for mini-split system.",
        rate: 1800.00,
        unit: "each",
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
        name: "Mini-Split Indoor Head Unit",
        description: "Wall-mounted indoor air handler with remote control.",
        rate: 650.00,
        unit: "each",
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
        name: "Refrigerant Line Set (25ft)",
        description: "Insulated copper line set for refrigerant connection.",
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
        name: "Mini-Split Installation Labor",
        description: "Labor for complete mini-split system installation including mounting and connections.",
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
        name: "Electrical Connection & Wiring",
        description: "Electrical work for power and control wiring to mini-split system.",
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
        name: "Wall Penetration & Sealing",
        description: "Core drilling wall penetration and weatherproof sealing.",
        rate: 150.00,
        unit: "each",
        subTotal: 150.00,
        total: 150.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "System Startup & Testing",
        description: "Complete system startup, testing, and commissioning.",
        rate: 200.00,
        unit: "job",
        subTotal: 200.00,
        total: 200.00,
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
