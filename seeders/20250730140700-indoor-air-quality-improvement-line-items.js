"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Indoor Air Quality Assessment",
        description: "Comprehensive air quality testing and evaluation.",
        rate: 350.00,
        unit: "job",
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
        name: "HEPA Air Filtration System",
        description: "Whole-house HEPA air filtration system installation.",
        rate: 1200.00,
        unit: "each",
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
        name: "UV Light Air Purifier",
        description: "In-duct UV light air purification system.",
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
        name: "Whole House Humidifier",
        description: "Steam or evaporative whole house humidification system.",
        rate: 800.00,
        unit: "each",
        subTotal: 800.00,
        total: 800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Air Quality System Installation",
        description: "Installation labor for air quality improvement systems.",
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
        name: "Duct Sealing & Cleaning",
        description: "Professional duct sealing and cleaning service.",
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
        name: "System Monitoring & Controls",
        description: "Air quality monitoring system with smart controls.",
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
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("lineItems", null, {});
  }
};
