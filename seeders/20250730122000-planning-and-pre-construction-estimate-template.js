"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Planning & Pre-Construction",
        description: "Covers all essential planning, permitting, and site setup tasks to ensure your project starts smoothly and meets all requirements.",
        category: "General Contracting",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,817,818,819,820,821,822,823,824]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all the planning and preparation needed before construction begins, including drawings, permits, surveys, site setup, and everything required to get your project ready for a smooth and successful build.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["planning", "pre-construction", "site setup", "permitting"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", {
      name: "Planning & Pre-Construction"
    });
  }
};
