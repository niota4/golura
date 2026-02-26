"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Garage Conversion",
        description: "Complete garage conversion, including design, permitting, framing, doors, windows, HVAC, electrical, bathroom, and finishing touches.",
        category: "General Contracting",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
           lineItemIds: JSON.stringify([845,846,847,848,849,850,851,852,853,854,855,856,857,858,859,860,861,862]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers every step of converting your garage into a comfortable, finished living space—including design, permits, construction, utilities, and final cleaning.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["garage conversion", "remodel", "living space", "design", "construction"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", {
      name: "Garage Conversion"
    });
  }
};
