module.exports = function (sequelize, DataTypes) {
  const socket = require('../sockets');

  const Notification = sequelize.define(
    'notifications',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        defaultValue: null,
      },
      targetUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      relatedModel: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      relatedModelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subRelatedModel: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      subRelatedModelId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      priorityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'priorities',
          key: 'id',
        },
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      type: {
        type: DataTypes.ENUM('mention', 'like', 'reply', 'comment', 'reminder', 'general'),
        allowNull: false,
        defaultValue: 'general',
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'notifications',
      timestamps: true,
      hooks: {
        afterCreate: async (notification, options) => {
          const { targetUserId } = notification;

          try {
            const notificationCount = await Notification.count({
              where: { targetUserId, read: false },
            });

            console.log(targetUserId, 'notification', notificationCount)
            // Emit a socket event to update the notification count for the user
            socket.updateCount(targetUserId, 'notification', notificationCount);
          } catch (error) {
            console.error('Error emitting notification count update:', error);
          }
        },
      },
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'id' }],
        },
        {
          name: 'userId',
          using: 'BTREE',
          fields: [{ name: 'userId' }],
        },
        {
          name: 'priorityId',
          using: 'BTREE',
          fields: [{ name: 'priorityId' }],
        },
      ],
    }
  );

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      as: 'User',
      foreignKey: 'userId',
    });

    Notification.belongsTo(models.Priorities, {
      as: 'Priority',
      foreignKey: 'priorityId',
    });
  };

  return Notification;
};
