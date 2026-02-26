'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert new dashboard widgets
    await queryInterface.bulkInsert('widgets', [
      {
        name: 'Sales Overview',
        description: 'Comprehensive sales analytics showing revenue breakdown from estimates, invoices, and payments with time period filtering.',
        type: 'chart',
        placement: 'dashboard',
        isVisible: true,
        minWidth: 4,
        minHeight: 3,
        maxWidth: 12,
        maxHeight: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Work Orders Summary',
        description: 'Work order metrics with status breakdown, priority analysis, due date tracking, and efficiency ratios.',
        type: 'summary',
        placement: 'dashboard',
        isVisible: true,
        minWidth: 4,
        minHeight: 3,
        maxWidth: 8,
        maxHeight: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Client Insights',
        description: 'Client engagement analytics showing top clients by value, activity metrics, and business relationship insights.',
        type: 'analytics',
        placement: 'dashboard',
        isVisible: true,
        minWidth: 4,
        minHeight: 4,
        maxWidth: 8,
        maxHeight: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Upcoming Events',
        description: 'Event scheduling and deadline tracking with urgency classification and status monitoring.',
        type: 'calendar',
        placement: 'dashboard',
        isVisible: true,
        minWidth: 3,
        minHeight: 3,
        maxWidth: 6,
        maxHeight: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Invoice Status',
        description: 'Invoice payment status tracking with aging analysis, overdue detection, and payment percentage calculations.',
        type: 'financial',
        placement: 'dashboard',
        isVisible: true,
        minWidth: 4,
        minHeight: 3,
        maxWidth: 8,
        maxHeight: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Activity Timeline',
        description: 'Real-time activity feed showing system activities across all modules with filtering and timeline visualization.',
        type: 'feed',
        placement: 'dashboard',
        isVisible: true,
        minWidth: 4,
        minHeight: 4,
        maxWidth: 12,
        maxHeight: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Activity Summary',
        description: 'Quick overview of recent activities with severity indicators, type breakdown, and activity counts.',
        type: 'summary',
        placement: 'dashboard',
        isVisible: true,
        minWidth: 3,
        minHeight: 2,
        maxWidth: 6,
        maxHeight: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Estimate Analytics',
        description: 'Detailed estimate analytics with totals, profit calculations, and historical data for comprehensive business insights.',
        type: 'analytics',
        placement: 'dashboard',
        isVisible: true,
        minWidth: 4,
        minHeight: 3,
        maxWidth: 8,
        maxHeight: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the added widgets
    await queryInterface.bulkDelete('widgets', {
      name: {
        [Sequelize.Op.in]: [
          'Sales Overview',
          'Work Orders Summary', 
          'Client Insights',
          'Upcoming Events',
          'Invoice Status',
          'Activity Timeline',
          'Activity Summary',
          'Estimate Analytics'
        ]
      }
    }, {});
  }
};
