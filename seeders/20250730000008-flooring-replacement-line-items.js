"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Hardwood Flooring Installation",
        description: "Install new prefinished hardwood flooring, including underlayment.",
        rate: 7800.00,
        unit: "job",
        subTotal: 7800.00,
        total: 7800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Luxury Vinyl Plank Flooring Installation",
        description: "Install luxury vinyl plank flooring, including moisture barrier.",
        rate: 5200.00,
        unit: "job",
        subTotal: 5200.00,
        total: 5200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Tile Flooring Installation",
        description: "Install ceramic or porcelain tile flooring, including grout and underlayment.",
        rate: 6100.00,
        unit: "job",
        subTotal: 6100.00,
        total: 6100.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Carpet Installation",
        description: "Install new carpet, including padding and removal of old flooring.",
        rate: 4300.00,
        unit: "job",
        subTotal: 4300.00,
        total: 4300.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Subfloor Repair & Leveling",
        description: "Repair and level subfloor prior to new flooring installation.",
        rate: 2100.00,
        unit: "job",
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
        name: "Baseboard & Trim Installation (Flooring)",
        description: "Install new baseboards and trim after flooring replacement.",
        rate: 1700.00,
        unit: "job",
        subTotal: 1700.00,
        total: 1700.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Flooring Demolition & Haul Away",
        description: "Remove and dispose of old flooring materials prior to new installation.",
        rate: 2500.00,
        unit: "job",
        subTotal: 2500.00,
        total: 2500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Moisture Barrier Installation (Flooring)",
        description: "Install moisture barrier to protect new flooring from subfloor moisture.",
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
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("lineItems", null, {});
  }
};
