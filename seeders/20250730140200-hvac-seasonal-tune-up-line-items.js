"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "System Diagnostic & Inspection",
        description: "Complete visual and operational inspection of HVAC system.",
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
        name: "Air Filter Replacement",
        description: "Replace standard or pleated air filter with new high-efficiency filter.",
        rate: 35.00,
        unit: "each",
        subTotal: 35.00,
        total: 35.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Condenser Coil Cleaning",
        description: "Clean outdoor condenser coils and remove debris.",
        rate: 95.00,
        unit: "job",
        subTotal: 95.00,
        total: 95.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Evaporator Coil Cleaning",
        description: "Clean indoor evaporator coils and drain pan.",
        rate: 125.00,
        unit: "job",
        subTotal: 125.00,
        total: 125.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Refrigerant Level Check",
        description: "Check and adjust refrigerant levels if needed.",
        rate: 75.00,
        unit: "job",
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
        name: "Electrical Connection Inspection",
        description: "Inspect and tighten all electrical connections.",
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
      },
      {
        name: "Thermostat Calibration",
        description: "Test and calibrate thermostat operation.",
        rate: 45.00,
        unit: "job",
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
        name: "System Performance Test",
        description: "Complete system performance and efficiency testing.",
        rate: 85.00,
        unit: "job",
        subTotal: 85.00,
        total: 85.00,
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
