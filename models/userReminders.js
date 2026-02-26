'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserReminder = sequelize.define(
    'UserReminder',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
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
      completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
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
    },
    {
      tableName: 'userReminders',
      timestamps: true,
    }
  );

  UserReminder.associate = (models) => {
    UserReminder.hasMany(models.Reminder, {
      foreignKey: 'userReminderId',
      as: 'UserReminders', // Changed alias to avoid conflict
    });
    UserReminder.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'User',
    });
    UserReminder.belongsTo(models.User, {
      foreignKey: 'creatorId',
      as: 'Creator',
    });
    UserReminder.belongsTo(models.Address, {
      foreignKey: 'addressId',
      as: 'Address',
    });
    UserReminder.belongsTo(models.Email, {
      foreignKey: 'emailId',
      as: 'Email',
    });
    UserReminder.belongsTo(models.PhoneNumber, {
      foreignKey: 'phoneNumberId',
      as: 'PhoneNumber',
    });
  };

  return UserReminder;
};
