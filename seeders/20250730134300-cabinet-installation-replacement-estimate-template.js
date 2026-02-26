"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Cabinet Installation & Replacement",
        description: "Install or replace kitchen and bath cabinets, including removal, stock/custom install, refacing, hardware, lighting, and finishing.",
        category: "Remodeling",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          951, 952, 953, 954, 955, 956, 957, 958
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major cabinet installation and replacement tasks, ensuring a custom look and lasting quality. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["cabinet", "installation", "replacement", "kitchen", "bath", "remodeling"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Cabinet Installation & Replacement" }, {});
  }
};
