"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Ceiling Fan with Light Kit",
        description: "52-inch ceiling fan with integrated LED light kit and remote.",
        rate: 250.00,
        unit: "each",
        subTotal: 250.00,
        total: 250.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Ceiling Fan Installation Labor",
        description: "Complete ceiling fan installation including electrical connections.",
        rate: 180.00,
        unit: "each",
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
        name: "Ceiling Fan Box - Rated",
        description: "Fan-rated electrical box for ceiling mounting.",
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
        name: "Wall Control Switch",
        description: "Wall-mounted fan and light control switch.",
        rate: 55.00,
        unit: "each",
        subTotal: 55.00,
        total: 55.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Electrical Wire (14 AWG)",
        description: "14 AWG Romex wire for fan circuit installation.",
        rate: 1.25,
        unit: "linear ft",
        subTotal: 1.25,
        total: 1.25,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Ceiling Patching & Paint",
        description: "Drywall patching and touch-up painting around installation.",
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
      },
      {
        name: "Fan Balancing & Testing",
        description: "Fan balancing and electrical testing for proper operation.",
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
