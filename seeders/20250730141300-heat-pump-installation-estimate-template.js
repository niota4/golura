"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Heat Pump Installation",
        description: "Professional installation of high-efficiency heat pump systems, including unit supply, air handler, installation labor, refrigerant line set, electrical disconnect and wiring, programmable thermostat, and system commissioning. Ideal for energy-efficient heating and cooling solutions.",
        category: "HVAC",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          1029, 1030, 1031, 1032, 1034, 1035, 1047
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major heat pump installation tasks, ensuring optimal comfort, energy savings, and professional-grade installation. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["heat pump", "installation", "hvac", "energy-efficient", "commissioning"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Heat Pump Installation" }, {});
  }
};
