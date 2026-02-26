"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Whole Home Renovation",
        description: "Comprehensive whole-home renovation services, including demolition, drywall, electrical, plumbing, HVAC, painting, flooring, windows, and doors. Ideal for transforming your entire home.",
        category: "Remodeling",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          920, 921, 922, 923, 924, 925, 926, 927
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major whole-home renovation tasks, ensuring a cohesive, modern, and high-quality result. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["whole home", "renovation", "demolition", "drywall", "electrical", "plumbing", "hvac", "painting", "flooring", "windows", "doors"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Whole Home Renovation" }, {});
  }
};
