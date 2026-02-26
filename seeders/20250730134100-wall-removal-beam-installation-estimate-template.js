"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Wall Removal & Beam Installation",
        description: "Remove structural walls and install engineered beams, including shoring, engineering, drywall, flooring, and electrical work.",
        category: "Remodeling",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          936, 937, 938, 939, 940, 941, 942
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major wall removal and beam installation tasks, ensuring structural safety and a seamless finish. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["wall removal", "beam installation", "structural", "remodeling"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Wall Removal & Beam Installation" }, {});
  }
};
