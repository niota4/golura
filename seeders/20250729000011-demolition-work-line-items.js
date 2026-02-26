"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      // Demolition Work
      {
        name: "Interior Demolition",
        description: "Removal of interior walls, fixtures, and finishes to prepare for renovation.",
        rate: 2000.00,
        unit: "each",
        subTotal: 2000.00,
        total: 2000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Exterior Demolition",
        description: "Demolition of exterior structures such as decks, sheds, or garages.",
        rate: 3000.00,
        unit: "each",
        subTotal: 3000.00,
        total: 3000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Selective Demolition",
        description: "Targeted demolition of specific areas while preserving surrounding structures.",
        rate: 2500.00,
        unit: "each",
        subTotal: 2500.00,
        total: 2500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Debris Removal",
        description: "Removal and disposal of demolition debris to maintain a clean worksite.",
        rate: 1000.00,
        unit: "each",
        subTotal: 1000.00,
        total: 1000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Asbestos Abatement (if needed)",
        description: "Safe removal and disposal of asbestos-containing materials.",
        rate: 4000.00,
        unit: "each",
        subTotal: 4000.00,
        total: 4000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("lineItems", null, {});
  }
};
