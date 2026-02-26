"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Radiant Floor Heating Installation",
        description: "Complete radiant floor heating system installation, including electric or hydronic system, manifold and distribution, boiler or heat source, insulation and vapor barrier, installation labor, controls and thermostats, and system testing/commissioning. Ideal for energy-efficient, comfortable floor heating solutions.",
        category: "HVAC",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          1082, 1083, 1084, 1085, 1086, 1087, 1088
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major radiant floor heating installation tasks, ensuring efficient, comfortable, and code-compliant heating for your property. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["radiant floor", "heating", "installation", "hvac", "energy-efficient"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Radiant Floor Heating Installation" }, {});
  }
};
