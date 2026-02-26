'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Insert pages first
      await queryInterface.bulkInsert("pages", [
        { name: "notifications", icon: "fa-bell", url: "notifications", order: 1, createdAt: new Date(), updatedAt: new Date()},
        { name: "chats", icon: "fa-comments", url: "chats", order: 2, createdAt: new Date(), updatedAt: new Date() },
        { name: "events", icon: "fa-calendar-alt", url: "events", order: 3, createdAt: new Date(), updatedAt: new Date() },
        { name: "estimates", icon: "fa-tty", url: "estimates", order: 5, createdAt: new Date(), updatedAt: new Date() },
        { name: "users", icon: "fa-users", url: "users", order: 6, createdAt: new Date(), updatedAt: new Date() },
        { name: "reports", icon: "fa-chart-pie", url: "reports", order: 9, createdAt: new Date(), updatedAt: new Date() },
        { name: "payroll", icon: "fa-money-check-dollar-pen", url: "payroll", order: 8, createdAt: new Date(), updatedAt: new Date() },
        { name: "work orders", icon: "fa-file-word", url: "work-orders", order: 10, createdAt: new Date(), updatedAt: new Date() },
        { name: "invoices", icon: "fa-file-invoice-dollar", url: "invoices", order: 11, createdAt: new Date(), updatedAt: new Date() },
        { name: "learning center", icon: "fa-star-shooting", url: "learning-center", order: 12, createdAt: new Date(), updatedAt: new Date() },
        { name: "admin settings", icon: "fa-cogs", url: "admin-settings", order: 13, createdAt: new Date(), updatedAt: new Date() },
        { name: "clients", icon: "fal fa-people-group", url: "clients", order: 4, createdAt: new Date(), updatedAt: new Date() },
        { name: "inventory", icon: "fa-shelves", url: "inventory", order: 7, createdAt: new Date(), updatedAt: new Date() }
      ]);

      // Fetch the inserted pages
      const pages = await queryInterface.sequelize.query(
        `SELECT id FROM pages WHERE url IN ('notifications', 'chats', 'events', 'estimates', 'users', 'reports', 'payroll', 'work-orders', 'invoices', 'learning-center', 'admin-settings', 'clients', 'inventory')`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      // Map permissions to the created pages
      const permissions = [];
      for (const page of pages) {
        permissions.push(
          { action: "create", pageId: page.id, createdAt: new Date(), updatedAt: new Date() },
          { action: "view", pageId: page.id, createdAt: new Date(), updatedAt: new Date() },
          { action: "edit", pageId: page.id, createdAt: new Date(), updatedAt: new Date() },
          { action: "archive", pageId: page.id, createdAt: new Date(), updatedAt: new Date() }
        );
      }

      // Insert permissions
      await queryInterface.bulkInsert("permissions", permissions, {});
    } catch (error) {
      console.error("Error during migration:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("permissions", null, {});
    await queryInterface.bulkDelete("pages", null, {});
  }
};
