"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Framing & Insulation (Basement)",
        description: "Frame basement walls and install R-13 insulation for energy efficiency.",
        rate: 5200.00,
        unit: "job",
        subTotal: 5200.00,
        total: 5200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Drywall Installation & Finishing (Basement)",
        description: "Install and finish drywall on all basement walls and ceilings.",
        rate: 4100.00,
        unit: "job",
        subTotal: 4100.00,
        total: 4100.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Electrical Wiring & Lighting (Basement)",
        description: "Install new electrical wiring, outlets, and LED recessed lighting.",
        rate: 3500.00,
        unit: "job",
        subTotal: 3500.00,
        total: 3500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Luxury Vinyl Plank Flooring Installation (Basement)",
        description: "Install luxury vinyl plank flooring throughout finished basement area.",
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
        name: "Egress Window Installation",
        description: "Install code-compliant egress window for safety and natural light.",
        rate: 3200.00,
        unit: "each",
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
        name: "HVAC Extension (Basement)",
        description: "Extend HVAC system to provide heating and cooling to finished basement.",
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
        name: "Interior Doors & Trim Installation (Basement)",
        description: "Install new interior doors and baseboard/trim throughout basement.",
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
        name: "Sump Pump & Waterproofing (Basement)",
        description: "Install sump pump and waterproofing system to prevent basement flooding.",
        rate: 3400.00,
        unit: "job",
        subTotal: 3400.00,
        total: 3400.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Basement Painting & Finishing",
        description: "Paint basement walls, ceiling, and trim with high-quality paint.",
        rate: 1600.00,
        unit: "job",
        subTotal: 1600.00,
        total: 1600.00,
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
