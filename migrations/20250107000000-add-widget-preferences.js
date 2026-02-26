'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('userPreferences', 'upcomingEventsIncludeAllUsers', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn('userPreferences', 'salesOverviewPeriod', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: '30d'
    });

    await queryInterface.addColumn('userPreferences', 'salesOverviewIncludeAllUsers', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn('userPreferences', 'workOrdersSummaryPeriod', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: '30d'
    });

    await queryInterface.addColumn('userPreferences', 'workOrdersSummaryIncludeAllUsers', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn('userPreferences', 'clientInsightsPeriod', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: '30d'
    });

    await queryInterface.addColumn('userPreferences', 'clientInsightsLimit', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 10
    });

    await queryInterface.addColumn('userPreferences', 'invoiceStatusPeriod', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: '30d'
    });

    await queryInterface.addColumn('userPreferences', 'invoiceStatusIncludeAllUsers', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn('userPreferences', 'estimateAnalyticsPeriod', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: '30d'
    });

    await queryInterface.addColumn('userPreferences', 'estimateAnalyticsIncludeAllUsers', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('userPreferences', 'upcomingEventsIncludeAllUsers');
    await queryInterface.removeColumn('userPreferences', 'salesOverviewPeriod');
    await queryInterface.removeColumn('userPreferences', 'salesOverviewIncludeAllUsers');
    await queryInterface.removeColumn('userPreferences', 'workOrdersSummaryPeriod');
    await queryInterface.removeColumn('userPreferences', 'workOrdersSummaryIncludeAllUsers');
    await queryInterface.removeColumn('userPreferences', 'clientInsightsPeriod');
    await queryInterface.removeColumn('userPreferences', 'clientInsightsLimit');
    await queryInterface.removeColumn('userPreferences', 'invoiceStatusPeriod');
    await queryInterface.removeColumn('userPreferences', 'invoiceStatusIncludeAllUsers');
    await queryInterface.removeColumn('userPreferences', 'estimateAnalyticsPeriod');
    await queryInterface.removeColumn('userPreferences', 'estimateAnalyticsIncludeAllUsers');
  }
};
