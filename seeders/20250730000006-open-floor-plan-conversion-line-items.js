"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Wall Demolition (Open Floor Plan)",
        description: "Remove non-load-bearing walls to create open living space.",
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
        name: "Beam Installation (Open Floor Plan)",
        description: "Install structural beam to support open floor plan conversion.",
        rate: 8500.00,
        unit: "job",
        subTotal: 8500.00,
        total: 8500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Electrical Rewiring (Open Floor Plan)",
        description: "Rewire electrical circuits and relocate outlets/switches for new layout.",
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
        name: "HVAC Ductwork Modification (Open Floor Plan)",
        description: "Modify HVAC ductwork to ensure proper airflow in new open space.",
        rate: 2700.00,
        unit: "job",
        subTotal: 2700.00,
        total: 2700.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Flooring Patch & Repair (Open Floor Plan)",
        description: "Patch and repair flooring where walls were removed for seamless look.",
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
        name: "Drywall & Paint (Open Floor Plan)",
        description: "Install new drywall and paint to finish open concept area.",
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
        name: "Lighting Upgrade (Open Floor Plan)",
        description: "Install new lighting fixtures to enhance open concept living space.",
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
        name: "Permitting & Engineering (Open Floor Plan)",
        description: "Obtain permits and engineering for structural changes to home.",
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
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("lineItems", null, {});
  }
};
