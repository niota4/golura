"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Heat Pump Unit (3-Ton)",
        description: "High-efficiency heat pump system with inverter technology.",
        rate: 4200.00,
        unit: "each",
        subTotal: 4200.00,
        total: 4200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Indoor Air Handler",
        description: "Variable speed air handler with coil and cabinet.",
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
        name: "Heat Pump Installation Labor",
        description: "Complete installation including refrigerant lines and electrical.",
        rate: 2400.00,
        unit: "job",
        subTotal: 2400.00,
        total: 2400.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Refrigerant Line Set (30ft)",
        description: "Insulated copper refrigerant lines with fittings.",
        rate: 180.00,
        unit: "set",
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
        name: "Electrical Disconnect & Wiring",
        description: "Electrical connections and disconnect switch installation.",
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
        name: "Thermostat - Programmable Heat Pump",
        description: "Digital programmable thermostat designed for heat pump systems.",
        rate: 225.00,
        unit: "each",
        subTotal: 225.00,
        total: 225.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "System Startup & Commissioning",
        description: "Complete system startup, testing, and performance verification.",
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
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("lineItems", null, {});
  }
};
