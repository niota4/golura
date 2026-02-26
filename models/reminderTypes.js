'use strict';
module.exports = (sequelize, DataTypes) => {
  const ReminderType = sequelize.define(
    'ReminderType',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'reminderTypes',
      timestamps: true,
    }
  );

  ReminderType.associate = (models) => {
    ReminderType.hasMany(models.Event, {
      foreignKey: 'reminderTypes',
      as: 'Events',
    });
  };

  return ReminderType;
};
