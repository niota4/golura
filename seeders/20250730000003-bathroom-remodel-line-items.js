"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Demolition & Haul Away (Bathroom)",
        description: "Remove old fixtures, tile, and debris from bathroom and haul away.",
        rate: 1500.00,
        unit: "job",
        subTotal: 1500.00,
        total: 1500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Tile Floor Installation (Bathroom)",
        description: "Install ceramic or porcelain tile flooring, including underlayment and grout.",
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
        name: "Vanity & Sink Installation",
        description: "Install new bathroom vanity and sink, including plumbing hookups.",
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
        name: "Toilet Installation",
        description: "Install new water-efficient toilet, including removal of old unit.",
        rate: 700.00,
        unit: "each",
        subTotal: 700.00,
        total: 700.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Bathtub Installation",
        description: "Install new acrylic or fiberglass bathtub, including plumbing and caulking.",
        rate: 2500.00,
        unit: "job",
        subTotal: 2500.00,
        total: 2500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Shower Enclosure Installation",
        description: "Install new glass shower enclosure, including waterproofing and hardware.",
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
        name: "Plumbing Upgrades (Bathroom)",
        description: "Upgrade water lines, install new shutoff valves, and ensure code compliance.",
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
        name: "Lighting Fixture Installation (Bathroom)",
        description: "Install vanity and ceiling lighting fixtures, including wiring and switches.",
        rate: 850.00,
        unit: "job",
        subTotal: 850.00,
        total: 850.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Exhaust Fan Installation",
        description: "Install new bathroom exhaust fan, including venting and wiring.",
        rate: 500.00,
        unit: "each",
        subTotal: 500.00,
        total: 500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Bathroom Painting & Finishing",
        description: "Paint bathroom walls, ceiling, and trim with moisture-resistant paint.",
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
