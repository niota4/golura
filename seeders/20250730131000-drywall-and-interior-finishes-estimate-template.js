"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Drywall & Interior Finishes",
        description: "Complete drywall and interior finishing services, including drywall installation, finishing, painting, trim, and flooring. Ideal for remodels, new builds, and interior upgrades.",
        category: "General Contracting",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          779, 878, 879, 880, 881, 882
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major drywall and interior finishing tasks, ensuring a polished, professional result. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["drywall", "interior finishes", "painting", "flooring", "trim", "general contracting"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Drywall & Interior Finishes" }, {});
  }
};
