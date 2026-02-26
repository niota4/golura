'use strict';
module.exports = (sequelize, DataTypes) => {
  const RecurrencePattern = sequelize.define('RecurrencePattern', {
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    frequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly', 'custom'),
      allowNull: false,
    },
    interval: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  }, {
    tableName: 'recurrencePatterns',
    timestamps: true,
  });

  RecurrencePattern.associate = (models) => {
    RecurrencePattern.hasMany(models.Event, {
      foreignKey: 'recurrencePatternId',
      as: 'Events',
    });
  };

  return RecurrencePattern;
};
