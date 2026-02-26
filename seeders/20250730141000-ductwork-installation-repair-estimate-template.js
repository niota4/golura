"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "Ductwork Installation & Repair",
        description: "Comprehensive ductwork installation and repair services, including flexible and sheet metal duct supply, insulation, labor for new installations and repairs, sealing materials, and permit fees. Ideal for new HVAC systems or upgrades to existing ductwork for improved efficiency and code compliance.",
        category: "HVAC",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          1075, 1076, 1077, 1078, 1079, 1080, 1081
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major ductwork installation and repair tasks, ensuring your HVAC system operates efficiently and meets all local codes. All line items are transparent and tailored for your project's needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["ductwork", "installation", "repair", "hvac", "insulation", "permit"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "Ductwork Installation & Repair" }, {});
  }
};
