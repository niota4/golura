"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Structured Wiring Panel",
        description: "28-inch structured wiring enclosure with removable door.",
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
        name: "CAT6 Cable Installation",
        description: "CAT6 ethernet cable installation per drop location.",
        rate: 125.00,
        unit: "each",
        subTotal: 125.00,
        total: 125.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Coaxial Cable Installation",
        description: "RG6 coaxial cable installation per drop location.",
        rate: 100.00,
        unit: "each",
        subTotal: 100.00,
        total: 100.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Wall Outlet - Data/Phone",
        description: "Dual RJ45 data/phone wall outlet with faceplate.",
        rate: 25.00,
        unit: "each",
        subTotal: 25.00,
        total: 25.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Coaxial Wall Outlet",
        description: "Coaxial wall outlet with F-connector and faceplate.",
        rate: 20.00,
        unit: "each",
        subTotal: 20.00,
        total: 20.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Patch Panel (24-Port)",
        description: "24-port CAT6 patch panel for network organization.",
        rate: 120.00,
        unit: "each",
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
        name: "Cable Termination & Testing",
        description: "Cable termination and network testing per drop.",
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
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("lineItems", null, {});
  }
};
