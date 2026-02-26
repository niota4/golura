"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Flooring Replacement",
        description: "Replace flooring throughout the home, including hardwood, vinyl, tile, carpet, subfloor repair, trim, demolition, and moisture barrier installation.",
        category: "Remodeling",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          896, 943, 944, 945, 946, 947, 948, 949, 950
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major flooring replacement tasks, ensuring a beautiful, durable, and professional result. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["flooring", "replacement", "hardwood", "vinyl", "tile", "carpet", "remodeling"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Flooring Replacement" }, {});
  }
};
