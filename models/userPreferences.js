const Sequelize = require('sequelize');
const eventTypes = require('./eventTypes');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('userPreferences', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    defaultLocation: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    notifyByEmail: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    notifyByText: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    minimizeSidebar: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    eventSchedulerGroups: {
      type: DataTypes.JSON,
      allowNull: true
    },
    eventTypes: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    eventCategory: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    eventMap: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'unit'
    },
    darkMode: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    backgroundColor: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "#ef94df"
    },
    syncCalendar: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    googleCalendarToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activityPeriod: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '30d'
    },
    activityLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10
    },
    upcomingEventsPeriod: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '7d'
    },
    upcomingEventsLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10
    },
    upcomingEventsIncludeAllUsers: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    salesOverviewPeriod: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '30d'
    },
    salesOverviewLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10
    },
    salesOverviewIncludeAllUsers: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    workOrdersSummaryPeriod: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '30d'
    },
    workOrdersSummaryIncludeAllUsers: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    clientInsightsPeriod: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '30d'
    },
    clientInsightsLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10
    },
    invoiceStatusPeriod: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '30d'
    },
    invoiceStatusIncludeAllUsers: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    estimateAnalyticsPeriod: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '30d'
    },
    estimateAnalyticsIncludeAllUsers: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    activitySummaryPeriod: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '24h'
    },
    activitySummaryLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10
    },
    realTimeActivityUpdates: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      },
    }
  }, {
    sequelize,
    tableName: 'userPreferences',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "userId",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userId" },
        ]
      },
    ]
  });
};
