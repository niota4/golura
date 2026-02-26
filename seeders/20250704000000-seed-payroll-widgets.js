'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Insert payroll widgets
      await queryInterface.bulkInsert("widgets", [
        {
          name: "Payroll Monthly",
          description: "Displays monthly payroll summary with gross pay, deductions, net pay, and recent payroll items",
          type: "analytics",
          placement: "dashboard",
          isVisible: true,
          minWidth: 400,
          minHeight: 300,
          maxWidth: 800,
          maxHeight: 600,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Payroll Monthly Expenses",
          description: "Shows payroll expense analytics with charts, employee breakdowns, and monthly trends",
          type: "analytics",
          placement: "dashboard",
          isVisible: true,
          minWidth: 600,
          minHeight: 400,
          maxWidth: 1200,
          maxHeight: 800,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      console.log("Payroll widgets seeded successfully");
    } catch (error) {
      console.error("Error seeding payroll widgets:", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove payroll widgets
      await queryInterface.bulkDelete("widgets", {
        name: {
          [Sequelize.Op.in]: ["payroll-monthly", "payroll-monthly-expenses"]
        }
      });
      
      console.log("Payroll widgets removed successfully");
    } catch (error) {
      console.error("Error removing payroll widgets:", error);
      throw error;
    }
  }
};
