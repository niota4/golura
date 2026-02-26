"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "200-Amp Electrical Panel",
        description: "200-amp main breaker panel with 40 circuit spaces.",
        rate: 450.00,
        unit: "each",
        subTotal: 450.00,
        total: 450.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Panel Upgrade Labor",
        description: "Complete electrical panel upgrade and installation.",
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
        name: "Circuit Breakers (20-amp)",
        description: "Standard 20-amp single pole circuit breakers.",
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
        name: "Circuit Breakers (30-amp)",
        description: "30-amp double pole circuit breakers for appliances.",
        rate: 45.00,
        unit: "each",
        subTotal: 45.00,
        total: 45.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Service Entrance Cable",
        description: "Service entrance cable from meter to panel.",
        rate: 8.00,
        unit: "linear ft",
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
        name: "Grounding System",
        description: "Complete grounding electrode system and bonding.",
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
      },
      {
        name: "Electrical Permit & Inspection",
        description: "Electrical permit and required inspections.",
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
