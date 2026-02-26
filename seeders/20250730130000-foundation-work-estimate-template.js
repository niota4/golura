"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Foundation Work",
        description: "Complete foundation work services, including concrete pouring, repairs, rebar installation, waterproofing, and excavation. Ideal for new builds, additions, and repairs requiring a solid foundation.",
        category: "General Contracting",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          758, 873, 874, 875, 876, 877
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major foundation work tasks, ensuring your project starts with a strong, stable base. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["foundation", "concrete", "rebar", "waterproofing", "excavation", "general contracting"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Foundation Work" }, {});
  }
};
