'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserReminderType = sequelize.define(
    'userReminderType',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
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
      tableName: 'userReminderType',
      timestamps: true,
    }
  );

  return UserReminderType;
};
