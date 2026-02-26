"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Indoor Air Quality Improvement",
        description: "Comprehensive indoor air quality improvement services, including air quality assessment, HEPA filtration, UV air purification, humidification, system installation, duct sealing and cleaning, and smart monitoring/controls. Ideal for healthier, cleaner, and more comfortable indoor environments.",
        category: "HVAC",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          1057, 1058, 1059, 1060, 1061, 1062, 1063
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major indoor air quality improvement tasks, ensuring a healthier, safer, and more comfortable indoor environment. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["indoor air quality", "filtration", "purification", "humidification", "monitoring"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Indoor Air Quality Improvement" }, {});
  }
};
