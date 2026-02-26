"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "GFCI Outlet - Tamper Resistant",
        description: "20-amp GFCI outlet with tamper-resistant shutters.",
        rate: 45.00,
        unit: "each",
        subTotal: 45.00,
        total: 45.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "GFCI Outlet Installation",
        description: "Installation labor for GFCI outlet replacement.",
        rate: 85.00,
        unit: "each",
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
        name: "Standard Outlet - Tamper Resistant",
        description: "20-amp tamper-resistant outlet (non-GFCI).",
        rate: 15.00,
        unit: "each",
        subTotal: 15.00,
        total: 15.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "USB Outlet with Charging Ports",
        description: "Outlet with built-in USB charging ports.",
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
        name: "Outlet Installation Labor",
        description: "Standard outlet installation or replacement labor.",
        rate: 65.00,
        unit: "each",
        subTotal: 65.00,
        total: 65.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Circuit Testing & Verification",
        description: "Electrical circuit testing and GFCI function verification.",
        rate: 40.00,
        unit: "job",
        subTotal: 40.00,
        total: 40.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Wall Plate & Trim",
        description: "Decorative wall plate and trim installation.",
        rate: 12.00,
        unit: "each",
        subTotal: 12.00,
        total: 12.00,
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
