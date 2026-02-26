module.exports = function (sequelize, DataTypes) {
  const ChatPermission = sequelize.define(
    'chatPermissions',
    {
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
        primaryKey: true,
        references: {
          model: 'chatRooms', // Ensure 'chatRooms' matches the table name
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'users', // Ensure 'users' matches the table name
          key: 'id',
        },
      },
      permission: {
        type: DataTypes.ENUM('read', 'write', 'delete'),
        allowNull: false,
        defaultValue: 'read',
      },
    },
    {
      sequelize,
      tableName: 'chatPermissions',
      timestamps: true,
      indexes: [
        {
          name: 'chatRoomId',
          using: 'BTREE',
          fields: [{ name: 'chatRoomId' }],
        },
      ],
    }
  );

  return ChatPermission;
};
