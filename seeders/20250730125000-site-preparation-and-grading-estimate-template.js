"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Site Preparation & Grading",
        description: "Comprehensive site preparation and grading services, including clearing, excavation, grading, compaction, erosion control, utility trenching, and more. Ideal for new builds, additions, and major remodels.",
        category: "General Contracting",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          755, 863, 864, 865, 866, 867, 868, 869, 870, 871, 872
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major site preparation and grading tasks, ensuring your project starts on a solid, well-prepared foundation. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["site prep", "grading", "excavation", "foundation", "construction", "general contracting"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Site Preparation & Grading" }, {});
  }
};
