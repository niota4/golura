"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Copper Pipe (3/4 inch)",
        description: "Type L copper pipe for water supply lines.",
        rate: 8.50,
        unit: "linear ft",
        subTotal: 8.50,
        total: 8.50,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "PEX Pipe (1/2 inch)",
        description: "Cross-linked polyethylene pipe for water supply.",
        rate: 2.50,
        unit: "linear ft",
        subTotal: 2.50,
        total: 2.50,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Re-Piping Installation Labor",
        description: "Labor for complete home re-piping installation.",
        rate: 15.00,
        unit: "linear ft",
        subTotal: 15.00,
        total: 15.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Pipe Fittings & Connectors",
        description: "Copper or PEX fittings and connectors per joint.",
        rate: 12.00,
        unit: "each",
        subTotal: 12.00,
        total: 12.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Shut-off Valves",
        description: "Ball valves for fixture shut-offs and main lines.",
        rate: 35.00,
        unit: "each",
        subTotal: 35.00,
        total: 35.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Wall & Ceiling Access",
        description: "Drywall cutting and access for pipe installation.",
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
        name: "Pressure Testing & Inspection",
        description: "System pressure testing and plumbing inspection.",
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
