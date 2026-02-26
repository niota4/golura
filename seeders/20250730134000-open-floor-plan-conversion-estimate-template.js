"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Open Floor Plan Conversion",
        description: "Convert traditional layouts to open floor plans, including wall demolition, beam installation, electrical, HVAC, flooring, drywall, lighting, and permitting.",
        category: "Remodeling",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          928, 929, 930, 931, 932, 933, 934, 935
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major open floor plan conversion tasks, ensuring a modern, spacious, and functional living area. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["open floor plan", "conversion", "wall removal", "beam installation", "remodeling"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Open Floor Plan Conversion" }, {});
  }
};
