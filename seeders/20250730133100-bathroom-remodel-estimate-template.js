"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Bathroom Remodel",
        description: "Complete bathroom remodeling services, including demolition, tile, vanity, toilet, tub, shower, plumbing, lighting, exhaust, and painting. Ideal for updating and refreshing your bathroom.",
        category: "Remodeling",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          901, 902, 903, 904, 905, 906, 907, 908, 909, 910
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major bathroom remodeling tasks, ensuring a modern, comfortable, and functional bathroom. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["bathroom", "remodel", "tile", "vanity", "toilet", "tub", "shower", "plumbing", "lighting", "painting"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Bathroom Remodel" }, {});
  }
};
