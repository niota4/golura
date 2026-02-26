"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      // Site Preparation & Grading
      {
        name: "Site Clearing",
        description: "Removal of vegetation, debris, and obstacles to prepare the site for construction.",
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
        name: "Excavation",
        description: "Excavation of soil to create a level base or trenches for foundations and utilities.",
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
        name: "Grading",
        description: "Leveling and contouring of the site to ensure proper drainage and foundation stability.",
        rate: 1500.00,
        unit: "each",
        subTotal: 1500.00,
        total: 1500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Soil Compaction",
        description: "Compaction of soil to increase density and provide a stable base for construction.",
        rate: 800.00,
        unit: "each",
        subTotal: 800.00,
        total: 800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Erosion Control Measures",
        description: "Installation of erosion control measures such as silt fences and straw wattles to prevent soil erosion.",
        rate: 600.00,
        unit: "each",
        subTotal: 600.00,
        total: 600.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Utility Trenching",
        description: "Digging trenches for the installation of utilities such as water, gas, and electrical lines.",
        rate: 1200.00,
        unit: "each",
        subTotal: 1200.00,
        total: 1200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Foundation Preparation",
        description: "Preparation of the site for foundation work, including layout and staking.",
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
        name: "Hauling & Disposal",
        description: "Hauling away and proper disposal of excavated materials and debris.",
        rate: 800.00,
        unit: "each",
        subTotal: 800.00,
        total: 800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Temporary Access Road",
        description: "Construction of a temporary access road to facilitate movement of construction vehicles and equipment.",
        rate: 1500.00,
        unit: "each",
        subTotal: 1500.00,
        total: 1500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Surveying & Staking",
        description: "Surveying and staking of the site to mark boundaries and construction zones.",
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
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("lineItems", null, {});
  }
};
