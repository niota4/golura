"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("estimateTemplates", [
      {
        companyId: null,
        creatorId: null,
        name: "HVAC Seasonal Tune-Up",
        description: "Comprehensive seasonal tune-up for HVAC systems, including diagnostic inspection, air filter replacement, coil cleaning, refrigerant check, electrical inspection, thermostat calibration, and performance testing. Ideal for maintaining system efficiency, reliability, and indoor air quality.",
        category: "HVAC",
        markUp: 15,
        salesTaxRate: 8,
        itemize: true,
        lineItemPrice: true,
        lineItemIds: JSON.stringify([
          1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028
        ]),
        imageIds: JSON.stringify([]),
        videoIds: JSON.stringify([]),
        documentIds: JSON.stringify([]),
        memo: "This estimate covers all major HVAC tune-up tasks, ensuring your system runs efficiently, safely, and reliably throughout the year. All line items are transparent and tailored for your maintenance needs.",
        usageCount: 0,
        isActive: true,
        tags: JSON.stringify(["hvac", "tune-up", "maintenance", "inspection", "filter", "cleaning"]),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("estimateTemplates", { name: "HVAC Seasonal Tune-Up" }, {});
  }
};
