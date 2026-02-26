"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Gas Water Heater (40-Gallon)",
        description: "40-gallon gas water heater with 6-year warranty.",
        rate: 950.00,
        unit: "each",
        subTotal: 950.00,
        total: 950.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Electric Water Heater (50-Gallon)",
        description: "50-gallon electric water heater with heating elements.",
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
        name: "Hybrid Heat Pump Water Heater",
        description: "Energy-efficient hybrid heat pump water heater.",
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
        name: "Water Heater Service & Maintenance",
        description: "Annual service including anode rod and element check.",
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
        name: "Anode Rod Replacement",
        description: "Magnesium or aluminum anode rod replacement.",
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
        name: "Heating Element Replacement",
        description: "Electric water heater heating element replacement.",
        rate: 180.00,
        unit: "job",
        subTotal: 180.00,
        total: 180.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Thermostat Replacement",
        description: "Water heater thermostat replacement and calibration.",
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
