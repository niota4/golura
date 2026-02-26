'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up (queryInterface, Sequelize) {
    const eventTypes = [
      { name: 'Safety Training', backgroundColor: '#FF5733', tags: JSON.stringify(['training', 'safety']), map: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Equipment Maintenance', backgroundColor: '#33FF57', tags: JSON.stringify(['maintenance', 'equipment']), map: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Team Meeting', backgroundColor: '#3357FF', tags: JSON.stringify(['meeting', 'team']), map: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Shift Handover', backgroundColor: '#FF33A1', tags: JSON.stringify(['shift', 'handover']), map: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Inventory Check', backgroundColor: '#FF8C33', tags: JSON.stringify(['inventory', 'check']), map: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Emergency Drill', backgroundColor: '#33FFF5', tags: JSON.stringify(['emergency', 'drill']), map: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Quality Inspection', backgroundColor: '#FF3333', tags: JSON.stringify(['quality', 'inspection']), map: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Workplace Cleanup', backgroundColor: '#33FF8C', tags: JSON.stringify(['cleanup', 'workplace']), map: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Client Visit', backgroundColor: '#8C33FF', tags: JSON.stringify(['client', 'visit']), map: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Annual Review', backgroundColor: '#FF338C', tags: JSON.stringify(['review', 'annual']), map: true, isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ];

    await queryInterface.bulkInsert('eventTypes', eventTypes, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('eventTypes', null, {});
  }
};