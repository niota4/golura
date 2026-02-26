"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Cabinet Removal & Disposal",
        description: "Remove and dispose of existing cabinets and hardware.",
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
        name: "Stock Cabinet Installation",
        description: "Install new stock cabinets, including hardware and adjustments.",
        rate: 4800.00,
        unit: "job",
        subTotal: 4800.00,
        total: 4800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Custom Cabinet Installation",
        description: "Install custom cabinets, including design, build, and installation.",
        rate: 9800.00,
        unit: "job",
        subTotal: 9800.00,
        total: 9800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Cabinet Refacing",
        description: "Reface existing cabinet boxes with new doors, drawer fronts, and veneer.",
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
        name: "Cabinet Hardware Installation",
        description: "Install new cabinet hardware (handles, pulls, knobs).",
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
        name: "Soft-Close Hinge Upgrade",
        description: "Upgrade cabinet doors and drawers to soft-close hinges and slides.",
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
      },
      {
        name: "Cabinet Lighting Installation",
        description: "Install under-cabinet and in-cabinet LED lighting.",
        rate: 1500.00,
        unit: "job",
        subTotal: 1500.00,
        total: 1500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Cabinet Painting & Finishing",
        description: "Paint or finish new or existing cabinets with high-quality paint or stain.",
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
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("lineItems", null, {});
  }
};
