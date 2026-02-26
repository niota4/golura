"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Water Heater (50-Gallon Gas)",
        description: "50-gallon gas water heater with 6-year warranty.",
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
        name: "Water Heater Installation Labor",
        description: "Complete water heater installation including connections.",
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
        name: "Gas Line Connection",
        description: "Gas line installation and connection to water heater.",
        rate: 250.00,
        unit: "job",
        subTotal: 250.00,
        total: 250.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Water Line Connections",
        description: "Hot and cold water line connections with shutoff valves.",
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
      },
      {
        name: "Venting & Flue Installation",
        description: "Proper venting and flue pipe installation.",
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
        name: "Drain Pan & Safety Valves",
        description: "Drain pan installation and temperature/pressure relief valve.",
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
      },
      {
        name: "Old Unit Removal & Disposal",
        description: "Removal and proper disposal of old water heater.",
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
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("lineItems", null, {});
  }
};
