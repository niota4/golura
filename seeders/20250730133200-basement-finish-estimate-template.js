"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Basement Finish",
        description: "Complete basement finishing services, including framing, drywall, electrical, flooring, egress, HVAC, doors, waterproofing, and painting. Ideal for creating a comfortable, livable basement space.",
        category: "Remodeling",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          911, 912, 913, 914, 915, 916, 917, 918, 919
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major basement finishing tasks, ensuring a functional, comfortable, and attractive basement. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["basement", "finish", "framing", "drywall", "electrical", "flooring", "egress", "hvac", "doors", "waterproofing", "painting"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Basement Finish" }, {});
  }
};
