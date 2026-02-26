const { last } = require("lodash");

module.exports = function (sequelize, DataTypes) {
  const ChatRoom = sequelize.define(
    'chatRooms',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      typeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'chatTypes',
          key: 'id',
        },
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      lastMessageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'chatMessages',
          key: 'id',
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      sequelize,
      tableName: 'chatRooms',
      timestamps: true,
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'id' }],
        },
        {
          name: 'createdBy',
          using: 'BTREE',
          fields: [{ name: 'createdBy' }],
        },
        {
          name: 'lastMessageId',
          using: 'BTREE',
          fields: [{ name: 'lastMessageId' }],
        },
      ],
    }
  );

  return ChatRoom;
};
