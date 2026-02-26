module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('reportTypes', [
      // KPI
      { name: 'KPI', description: 'Key Performance Indicator', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      // Analytics
      { name: 'Analytics', description: 'Analytical and trend reports', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      // Summary
      { name: 'Summary', description: 'Summary and overview reports', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      // Financial
      { name: 'Financial', description: 'Financial and revenue reports', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      // Operations
      { name: 'Operations', description: 'Operational and job reports', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      // Client
      { name: 'Client', description: 'Client and retention reports', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      // Communication
      { name: 'Communication', description: 'Notification and communication reports', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      // HR/Payroll
      { name: 'HR/Payroll', description: 'Payroll and employee reports', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      // Inventory
      { name: 'Inventory', description: 'Inventory and vendor reports', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('reportTypes', null, {});
  }
};
