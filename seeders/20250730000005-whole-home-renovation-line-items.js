"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Full Interior Demolition",
        description: "Complete removal of interior finishes, fixtures, and non-load-bearing walls.",
        rate: 12000.00,
        unit: "job",
        subTotal: 12000.00,
        total: 12000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Whole-Home Drywall Installation",
        description: "Install and finish drywall throughout the entire home.",
        rate: 18000.00,
        unit: "job",
        subTotal: 18000.00,
        total: 18000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Electrical System Upgrade",
        description: "Upgrade electrical panel, wiring, and install new outlets and fixtures.",
        rate: 14500.00,
        unit: "job",
        subTotal: 14500.00,
        total: 14500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Plumbing System Upgrade",
        description: "Replace all supply and drain lines, install new fixtures throughout home.",
        rate: 13500.00,
        unit: "job",
        subTotal: 13500.00,
        total: 13500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "HVAC System Replacement",
        description: "Install new high-efficiency furnace, AC, and ductwork for entire home.",
        rate: 17000.00,
        unit: "job",
        subTotal: 17000.00,
        total: 17000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Whole-Home Interior Painting",
        description: "Paint all walls, ceilings, and trim throughout the home.",
        rate: 9500.00,
        unit: "job",
        subTotal: 9500.00,
        total: 9500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Flooring Installation (Whole Home)",
        description: "Install new hardwood, tile, or luxury vinyl plank flooring throughout home.",
        rate: 22000.00,
        unit: "job",
        subTotal: 22000.00,
        total: 22000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Window & Door Replacement (Whole Home)",
        description: "Replace all windows and exterior doors with energy-efficient models.",
        rate: 18500.00,
        unit: "job",
        subTotal: 18500.00,
        total: 18500.00,
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
