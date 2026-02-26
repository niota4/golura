module.exports = function (sequelize, DataTypes) {
  const UserLastReadChat = sequelize.define(
    'userLastReadChats',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id',
        },
      },
      chatRoomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'chatRooms', // Ensure 'chatRooms' matches the table name
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Ensure 'users' matches the table name
          key: 'id',
        },
      },
      lastReadMessageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'chatMessages', // Ensure 'chatMessages' matches the table name
          key: 'id',
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('now'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'userLastReadChats',
      timestamps: true,
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'id' }],
        },
        {
          name: 'chatRoomId',
          using: 'BTREE',
          fields: [{ name: 'chatRoomId' }],
        },
        {
          name: 'userId',
          using: 'BTREE',
          fields: [{ name: 'userId' }],
        },
        {
          name: 'lastReadMessageId',
          using: 'BTREE',
          fields: [{ name: 'lastReadMessageId' }],
        },
      ],
    }
  );

  return UserLastReadChat;
};
