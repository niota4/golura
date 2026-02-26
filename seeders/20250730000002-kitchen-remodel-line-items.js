"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Cabinet Installation (Stock)",
        description: "Install new stock kitchen cabinets, including hardware and adjustments.",
        rate: 6500.00,
        unit: "job",
        subTotal: 6500.00,
        total: 6500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Quartz Countertop Installation",
        description: "Install new quartz countertops, including cutouts and edge finishing.",
        rate: 4200.00,
        unit: "job",
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
        name: "Appliance Installation (Set of 3)",
        description: "Install range, refrigerator, and dishwasher, including hookups.",
        rate: 2100.00,
        unit: "set",
        subTotal: 2100.00,
        total: 2100.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Tile Flooring Installation",
        description: "Install ceramic or porcelain tile flooring, including underlayment.",
        rate: 3200.00,
        unit: "job",
        subTotal: 3200.00,
        total: 3200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Plumbing Upgrades (Kitchen)",
        description: "Upgrade water lines, install new sink and faucet, and ensure code compliance.",
        rate: 1800.00,
        unit: "job",
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
        name: "Backsplash Installation",
        description: "Install tile backsplash, including grout and sealing.",
        rate: 1200.00,
        unit: "job",
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
        name: "Lighting Fixture Installation (Recessed & Pendant)",
        description: "Install recessed and pendant lighting fixtures, including wiring and switches.",
        rate: 950.00,
        unit: "job",
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
        name: "Kitchen Painting & Finishing",
        description: "Paint kitchen walls, ceiling, and trim with high-quality paint.",
        rate: 1100.00,
        unit: "job",
        subTotal: 1100.00,
        total: 1100.00,
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
