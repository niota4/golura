const company = require("./companies");

module.exports = function (sequelize, DataTypes) {
  const ChatMessage = sequelize.define(
    'chatMessages',
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
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
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
        charset: 'utf8mb4', // Support emojis
        collate: 'utf8mb4_unicode_ci', // Support emojis
      },
      parentMessageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'chatMessages', // Ensure 'chatMessages' matches the table name
          key: 'id',
        },
        onDelete: 'SET NULL', // Ensure parentMessageId is set to NULL if the parent is deleted
        onUpdate: 'CASCADE',
      },
      visibility: {
        type: DataTypes.ENUM('public', 'private'),
        allowNull: false,
        defaultValue: 'public',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      edited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      imageUrls: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      likeUserIds: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'companies',
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
      tableName: 'chatMessages',
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
          name: 'parentMessageId',
          using: 'BTREE',
          fields: [{ name: 'parentMessageId' }],
        },
      ],
    }
  );

  ChatMessage.associate = function (models) {
    ChatMessage.belongsTo(models.chatMessages, {
      as: 'ParentMessage',
      foreignKey: 'parentMessageId',
    });
    ChatMessage.hasMany(models.chatMessages, {
      as: 'Replies',
      foreignKey: 'parentMessageId',
    });
  };

  return ChatMessage;
};
