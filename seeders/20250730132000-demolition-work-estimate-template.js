"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Demolition Work",
        description: "Comprehensive demolition services, including interior, exterior, selective demolition, debris removal, and asbestos abatement. Ideal for remodels, site clearing, and safe project starts.",
        category: "General Contracting",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          888, 889, 890, 891, 892
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major demolition tasks, ensuring safe and efficient site preparation. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["demolition", "debris removal", "asbestos", "remodel", "site prep", "general contracting"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Demolition Work" }, {});
  }
};
