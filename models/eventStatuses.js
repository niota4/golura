'use strict';

module.exports = (sequelize, DataTypes) => {
  const EventStatus = sequelize.define('EventStatus', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'eventStatuses',
    timestamps: true
  });

  // Define associations here
  EventStatus.associate = function(models) {
    EventStatus.hasMany(models.Event, {
      as: 'Events',
      foreignKey: 'statusId'
    });
  };

  return EventStatus;
};
