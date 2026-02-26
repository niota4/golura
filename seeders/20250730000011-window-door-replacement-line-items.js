"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Window Removal & Disposal",
        description: "Remove and dispose of existing windows.",
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
        name: "Window Installation (Energy-Efficient)",
        description: "Install new energy-efficient windows, including trim and caulking.",
        rate: 6800.00,
        unit: "job",
        subTotal: 6800.00,
        total: 6800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Door Removal & Disposal",
        description: "Remove and dispose of existing exterior doors.",
        rate: 900.00,
        unit: "job",
        subTotal: 900.00,
        total: 900.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Exterior Door Installation",
        description: "Install new exterior doors, including weatherstripping and hardware.",
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
        name: "Sliding Glass Door Installation",
        description: "Install new sliding glass door, including trim and lockset.",
        rate: 2800.00,
        unit: "job",
        subTotal: 2800.00,
        total: 2800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Window & Door Trim Installation",
        description: "Install new trim around windows and doors for a finished look.",
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
        name: "Weatherproofing & Caulking (Windows/Doors)",
        description: "Apply weatherproofing and caulking to all new windows and doors.",
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
        name: "Window & Door Painting & Finishing",
        description: "Paint and finish new windows and doors for a complete look.",
        rate: 900.00,
        unit: "job",
        subTotal: 900.00,
        total: 900.00,
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
