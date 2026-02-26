"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Central Air Conditioning Installation",
        description: "Full central air conditioning installation, including high-efficiency A/C unit, evaporator coil, installation labor, refrigerant line set, electrical disconnect and wiring, condensate drain line, and system startup/testing. Ideal for new or replacement central cooling systems.",
        category: "HVAC",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          1043, 1044, 1045, 1046, 1047, 1048, 1049
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major central air conditioning installation tasks, ensuring reliable, efficient, and code-compliant cooling for your property. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["central air", "air conditioning", "installation", "hvac", "cooling"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Central Air Conditioning Installation" }, {});
  }
};
