"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Deck Demolition & Removal",
        description: "Remove and dispose of existing deck or patio structure.",
        rate: 2200.00,
        unit: "job",
        subTotal: 2200.00,
        total: 2200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Deck Framing & Footings Installation",
        description: "Install new deck framing and concrete footings to code.",
        rate: 4800.00,
        unit: "job",
        subTotal: 4800.00,
        total: 4800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Composite Decking Installation",
        description: "Install composite decking boards for low-maintenance surface.",
        rate: 6200.00,
        unit: "job",
        subTotal: 6200.00,
        total: 6200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Railing & Stair Installation (Deck/Patio)",
        description: "Install new railings and stairs for deck or patio.",
        rate: 3200.00,
        unit: "job",
        subTotal: 3200.00,
        total: 3200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Patio Paver Installation",
        description: "Install concrete or stone pavers for patio area.",
        rate: 5400.00,
        unit: "job",
        subTotal: 5400.00,
        total: 5400.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Deck & Patio Lighting Installation",
        description: "Install outdoor lighting for deck or patio area.",
        rate: 1800.00,
        unit: "job",
        subTotal: 1800.00,
        total: 1800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Deck & Patio Staining & Sealing",
        description: "Stain and seal deck or patio for weather protection.",
        rate: 2100.00,
        unit: "job",
        subTotal: 2100.00,
        total: 2100.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Deck & Patio Cleanup",
        description: "Clean up all debris and materials after deck or patio installation.",
        rate: 900.00,
        unit: "job",
        subTotal: 900.00,
        total: 900.00,
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
