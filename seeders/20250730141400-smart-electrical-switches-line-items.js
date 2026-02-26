"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Smart Light Switch - WiFi",
        description: "WiFi-enabled smart light switch with app control.",
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
        name: "Smart Dimmer Switch",
        description: "Smart dimmer switch with voice control compatibility.",
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
        name: "Smart Switch Installation",
        description: "Installation and configuration of smart switches.",
        rate: 75.00,
        unit: "each",
        subTotal: 75.00,
        total: 75.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Smart Outlet - WiFi",
        description: "WiFi-enabled smart outlet with USB charging ports.",
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
        name: "Smart Motion Sensor Switch",
        description: "Motion-activated smart switch with scheduling.",
        rate: 95.00,
        unit: "each",
        subTotal: 95.00,
        total: 95.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Network Configuration",
        description: "WiFi network setup and smart home app configuration.",
        rate: 100.00,
        unit: "job",
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
        name: "Smart Home Integration",
        description: "Integration with Alexa, Google Home, or Apple HomeKit.",
        rate: 75.00,
        unit: "job",
        subTotal: 75.00,
        total: 75.00,
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
