"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Garbage Disposal Unit (3/4 HP)",
        description: "3/4 horsepower garbage disposal with stainless steel grinding chamber.",
        rate: 280.00,
        unit: "each",
        subTotal: 280.00,
        total: 280.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Garbage Disposal Installation",
        description: "Complete garbage disposal installation and connection.",
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
        name: "Electrical Connection",
        description: "Electrical wiring and switch installation for disposal.",
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
        name: "Dishwasher Connection Kit",
        description: "Dishwasher connection kit and hose for disposal.",
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
        name: "Drain Pipe & Fittings",
        description: "Drain pipe connections and P-trap fittings.",
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
        name: "Wall Switch Installation",
        description: "Disposal wall switch and electrical box installation.",
        rate: 80.00,
        unit: "job",
        subTotal: 80.00,
        total: 80.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Testing & Cleanup",
        description: "System testing and cleanup of installation area.",
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
