"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "EV Charging Station (Level 2)",
        description: "240V Level 2 electric vehicle charging station with WiFi.",
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
        name: "EV Charger Installation Labor",
        description: "Complete installation of EV charging station.",
        rate: 600.00,
        unit: "job",
        subTotal: 600.00,
        total: 600.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "240V Circuit Installation",
        description: "Dedicated 240V circuit from panel to charging location.",
        rate: 450.00,
        unit: "job",
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
        name: "NEMA 14-50 Outlet",
        description: "50-amp NEMA 14-50 outlet for EV charging.",
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
        name: "Conduit & Wire (50-amp)",
        description: "Electrical conduit and 50-amp wire for charging circuit.",
        rate: 12.00,
        unit: "linear ft",
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
        name: "Circuit Breaker (50-amp)",
        description: "50-amp double pole circuit breaker for EV charging.",
        rate: 65.00,
        unit: "each",
        subTotal: 65.00,
        total: 65.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "WiFi Setup & Configuration",
        description: "Network configuration and mobile app setup for smart charging.",
        rate: 100.00,
        unit: "job",
        subTotal: 100.00,
        total: 100.00,
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
