"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Security Camera System (8-Channel)",
        description: "8-channel NVR security camera system with 4TB storage.",
        rate: 1200.00,
        unit: "each",
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
        name: "IP Security Camera (4K)",
        description: "4K resolution IP security camera with night vision.",
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
        name: "Camera Installation Labor",
        description: "Installation labor per camera including mounting and wiring.",
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
        name: "CAT6 Ethernet Cable",
        description: "CAT6 ethernet cable for IP camera connections.",
        rate: 1.50,
        unit: "linear ft",
        subTotal: 1.50,
        total: 1.50,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Power Over Ethernet (PoE) Switch",
        description: "8-port PoE switch for camera power and data.",
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
        name: "System Configuration & Setup",
        description: "Complete system configuration and mobile app setup.",
        rate: 300.00,
        unit: "job",
        subTotal: 300.00,
        total: 300.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Network Integration",
        description: "Network integration and remote access configuration.",
        rate: 200.00,
        unit: "job",
        subTotal: 200.00,
        total: 200.00,
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
