'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const groups = [
      {
        name: 'Warehouse Workers',
        description: 'Group for all warehouse workers',
        calendar: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Maintenance Crew',
        description: 'Group for all maintenance crew members',
        calendar: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Logistics Team',
        description: 'Group for all logistics team members',
        calendar: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Safety Inspectors',
        description: 'Group for all safety inspectors',
        calendar: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Administrative Staff',
        description: 'Group for all administrative staff',
        calendar: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('groups', groups, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('groups', null, {});
  }
};