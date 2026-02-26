"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Furnace Replacement",
        description: "Complete furnace replacement services, including high-efficiency furnace unit, installation labor, gas line connection, flue pipe and venting, electrical connections, thermostat installation, and system testing/startup. Perfect for upgrading or replacing existing heating systems.",
        category: "HVAC",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          1036, 1037, 1038, 1039, 1041, 1042, 1055
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major furnace replacement tasks, ensuring safe, efficient, and code-compliant heating for your property. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["furnace", "replacement", "hvac", "heating", "installation"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Furnace Replacement" }, {});
  }
};
