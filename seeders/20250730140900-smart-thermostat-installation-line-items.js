"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Smart Thermostat - WiFi Enabled",
        description: "Programmable smart thermostat with WiFi and app control.",
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
        name: "Smart Thermostat Installation",
        description: "Professional installation and setup of smart thermostat.",
        rate: 180.00,
        unit: "job",
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
        name: "C-Wire Installation",
        description: "Common wire installation for smart thermostat compatibility.",
        rate: 120.00,
        unit: "job",
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
        name: "WiFi Configuration & Setup",
        description: "Network configuration and mobile app setup.",
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
      },
      {
        name: "System Compatibility Check",
        description: "HVAC system compatibility testing and verification.",
        rate: 60.00,
        unit: "job",
        subTotal: 60.00,
        total: 60.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Smart Features Training",
        description: "Customer training on smart thermostat features and programming.",
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
