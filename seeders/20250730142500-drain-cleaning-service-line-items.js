"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Drain Pipe Cleaning - Main Line",
        description: "Professional hydro-jetting of main sewer line.",
        rate: 350.00,
        unit: "job",
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
        name: "Kitchen Drain Cleaning",
        description: "Kitchen sink and disposal drain line cleaning.",
        rate: 150.00,
        unit: "job",
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
        name: "Bathroom Drain Cleaning",
        description: "Bathroom sink, tub, and shower drain cleaning.",
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
        name: "Toilet Drain Cleaning",
        description: "Toilet drain line augering and cleaning.",
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
        name: "Video Inspection",
        description: "Camera inspection of drain line to identify issues.",
        rate: 250.00,
        unit: "job",
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
        name: "Drain Treatment & Maintenance",
        description: "Bio-enzymatic treatment and preventive maintenance.",
        rate: 80.00,
        unit: "job",
        subTotal: 80.00,
        total: 80.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Root Removal Service",
        description: "Root cutting and removal from sewer lines.",
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
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("lineItems", null, {});
  }
};
