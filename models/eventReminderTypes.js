'use strict';
module.exports = (sequelize, DataTypes) => {
  const EventReminderType = sequelize.define(
    'EventReminderType',
    {
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id',
        },
      },
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reminderTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'reminderTypes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'eventReminderTypes',
      timestamps: true,
    }
  );

  return EventReminderType;
};
