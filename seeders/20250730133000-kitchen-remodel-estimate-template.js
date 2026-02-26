"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Kitchen Remodel",
        description: "Complete kitchen remodeling services, including cabinets, countertops, appliances, flooring, plumbing, backsplash, lighting, and painting. Ideal for modernizing and upgrading your kitchen space.",
        category: "Remodeling",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          893, 894, 895, 896, 897, 898, 899, 900, 945
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major kitchen remodeling tasks, ensuring a beautiful, functional, and modern kitchen. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["kitchen", "remodel", "cabinets", "countertops", "appliances", "flooring", "lighting", "painting"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Kitchen Remodel" }, {});
  }
};
