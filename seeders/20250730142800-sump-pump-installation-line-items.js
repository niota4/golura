"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Sump Pump System (1/2 HP)",
        description: "Submersible sump pump with 1/2 horsepower motor.",
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
        name: "Sump Pit & Basin",
        description: "Pre-cast concrete or plastic sump pit basin.",
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
        name: "Sump Pump Installation Labor",
        description: "Complete sump pump system installation.",
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
        name: "Discharge Pipe & Fittings",
        description: "PVC discharge pipe and check valve installation.",
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
        name: "Electrical Connections",
        description: "GFCI electrical connections and float switch wiring.",
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
        name: "Backup Battery System",
        description: "Battery backup system for power outage protection.",
        rate: 400.00,
        unit: "each",
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
        name: "System Testing & Calibration",
        description: "Complete system testing and float switch calibration.",
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
