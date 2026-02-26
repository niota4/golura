"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Kitchen Sink - Undermount Stainless",
        description: "Stainless steel undermount kitchen sink with accessories.",
        rate: 350.00,
        unit: "each",
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
        name: "Kitchen Faucet - Pull-Down Spray",
        description: "Single handle pull-down spray kitchen faucet.",
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
        name: "Bathroom Vanity Sink",
        description: "Porcelain undermount bathroom vanity sink.",
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
        name: "Bathroom Faucet - Single Handle",
        description: "Single handle bathroom faucet with pop-up drain.",
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
        name: "Sink Installation Labor",
        description: "Complete sink installation including plumbing connections.",
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
        name: "Faucet Installation Labor",
        description: "Faucet installation including water line connections.",
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
        name: "Shutoff Valves & Supply Lines",
        description: "New shutoff valves and braided supply lines.",
        rate: 80.00,
        unit: "set",
        subTotal: 80.00,
        total: 80.00,
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
