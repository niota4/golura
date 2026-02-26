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
        name: "Manifold & Distribution System",
        description: "Radiant heating manifold and distribution assembly.",
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
        name: "Boiler or Heat Source",
        description: "High-efficiency boiler or heat pump for radiant system.",
        rate: 3500.00,
        unit: "each",
        subTotal: 3500.00,
        total: 3500.00,
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
        name: "Controls & Thermostats",
        description: "Zone controls and programmable thermostats for radiant heating.",
        rate: 300.00,
        unit: "each",
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
        name: "System Testing & Commissioning",
        description: "Pressure testing, balancing, and system commissioning.",
        rate: 500.00,
        unit: "job",
        subTotal: 500.00,
        total: 500.00,
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
