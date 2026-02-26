"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Tile Removal & Surface Prep",
        description: "Remove old tile and prep surface for new installation.",
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
        name: "Floor Tile Installation",
        description: "Install new floor tile, including layout and setting.",
        rate: 4200.00,
        unit: "job",
        subTotal: 4200.00,
        total: 4200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Wall Tile Installation",
        description: "Install new wall tile (shower, backsplash, etc.).",
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
        name: "Tile Grouting & Sealing",
        description: "Grout and seal all new tile installations.",
        rate: 1200.00,
        unit: "job",
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
        name: "Heated Floor System Installation (Tile)",
        description: "Install electric heated floor system under tile.",
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
        name: "Custom Tile Patterns & Borders",
        description: "Install custom tile patterns, borders, or mosaics.",
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
        name: "Tile Baseboard Installation",
        description: "Install tile baseboards for a finished look.",
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
      },
      {
        name: "Tile Installation Cleanup",
        description: "Clean up all debris and materials after tile installation.",
        rate: 700.00,
        unit: "job",
        subTotal: 700.00,
        total: 700.00,
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
