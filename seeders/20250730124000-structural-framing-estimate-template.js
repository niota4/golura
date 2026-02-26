"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Structural Framing",
        description: "Comprehensive structural framing services, including inspection, engineering, demolition, load-bearing elements, hardware installation, and finalization. Ideal for remodels, additions, or repairs requiring expert framing solutions.",
        category: "General Contracting",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          825, 826, 827, 828, 829, 830, 831, 832, 833, 834,
          835, 836, 837, 838, 839, 840, 841, 842, 843, 844
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers every step of structural framing, from initial inspection to final cleanup. All line items are transparent and tailored for your project's safety and quality.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["framing", "structural", "remodel", "addition", "engineering", "construction"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Structural Framing" }, {});
  }
};
