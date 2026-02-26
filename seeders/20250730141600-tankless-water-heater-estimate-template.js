"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Tankless Water Heater Installation",
        description: "Professional installation of high-efficiency tankless water heater systems, including unit supply, installation labor, gas line upgrade, venting system, water line connections, electrical connections, and system testing/commissioning. Ideal for energy-efficient, on-demand hot water solutions.",
        category: "Plumbing",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          1050, 1051, 1052, 1053, 1054, 1055, 1088
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major tankless water heater installation tasks, ensuring reliable, efficient, and code-compliant hot water for your property. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["tankless", "water heater", "installation", "plumbing", "hot water"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Tankless Water Heater Installation" }, {});
  }
};
