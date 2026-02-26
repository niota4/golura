"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Mini-Split Installation",
        description: "Complete mini-split HVAC system installation, including outdoor and indoor units, refrigerant line set, labor, electrical connections, wall penetration and sealing, and system startup/testing. Perfect for energy-efficient zoned heating and cooling in residential or commercial spaces.",
        category: "HVAC",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          1014, 1015, 1017, 1018, 1019, 1046, 1049
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major mini-split installation tasks, ensuring optimal comfort, energy savings, and professional-grade installation. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["mini-split", "installation", "hvac", "zoned", "energy-efficient"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Mini-Split Installation" }, {});
  }
};
