"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "LED Recessed Light Fixture",
        description: "Energy-efficient LED recessed light with trim and housing.",
        rate: 85.00,
        unit: "each",
        subTotal: 85.00,
        total: 85.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Recessed Lighting Installation",
        description: "Installation labor for recessed lighting fixtures.",
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
        name: "Electrical Wire (12 AWG)",
        description: "12 AWG Romex electrical wire for lighting circuits.",
        rate: 1.50,
        unit: "linear ft",
        subTotal: 1.50,
        total: 1.50,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Light Switch - Standard",
        description: "Standard single pole light switch.",
        rate: 15.00,
        unit: "each",
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
        name: "Light Switch - Dimmer",
        description: "LED-compatible dimmer switch.",
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
        name: "Ceiling Cut-out & Patching",
        description: "Drywall cutting and patching for recessed light installation.",
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
        name: "Circuit Connection & Testing",
        description: "Circuit connection and electrical testing.",
        rate: 50.00,
        unit: "job",
        subTotal: 50.00,
        total: 50.00,
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
