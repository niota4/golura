'use strict';
module.exports = (sequelize, DataTypes) => {
  const Reminder = sequelize.define(
    'Reminder',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      userReminderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'userReminders',
          key: 'id',
        },
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id',
        },
      },
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'clients',
          key: 'id'
        }
      },
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'events',
          key: 'id'
        }
      },
      addressId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      emailId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      phoneNumberId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'reminders',
      timestamps: true,
    }
  );

  Reminder.associate = (models) => {
    Reminder.belongsTo(models.ReminderType, {
      foreignKey: 'reminderTypeId',
      as: 'ReminderType',
    });
    Reminder.belongsTo(models.Event, {
      foreignKey: 'eventId',
      as: 'Event',
    });
    Reminder.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'User',
    });
    Reminder.belongsTo(models.UserReminder, {
      foreignKey: 'userReminderId',
      as: 'UserReminder',
    });
    Reminder.belongsTo(models.Client, {
      foreignKey: 'clientId',
      as: 'Client',
    });
    Reminder.belongsTo(models.Address, {
      foreignKey: 'addressId',
      as: 'Address',
    });
    Reminder.belongsTo(models.Email, {
      foreignKey: 'emailId',
      as: 'Email',
    });
    Reminder.belongsTo(models.PhoneNumber, {
      foreignKey: 'phoneNumberId',
      as: 'PhoneNumber',
    });
    Reminder.belongsTo(models.User, {
      foreignKey: 'creatorId',
      as: 'Creator',
    });
  };

  return Reminder;
};
