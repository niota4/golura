module.exports = function (sequelize, DataTypes) {
  const EventComment = sequelize.define(
    'eventComments',
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
      eventId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'events', // Ensure 'events' matches the table name
          key: 'id',
        }
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users', // Ensure 'users' matches the table name
          key: 'id',
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
        charset: 'utf8mb4', // Support emojis
        collate: 'utf8mb4_unicode_ci', // Support emojis
      },
      parentCommentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'eventComments', // Ensure 'eventComments' matches the table name
          key: 'id',
        },
        onDelete: 'SET NULL',
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
      tableName: 'eventComments',
      timestamps: true,
      indexes: [
        {
          name: 'PRIMARY',
          unique: true,
          using: 'BTREE',
          fields: [{ name: 'id' }],
        },
        {
          name: 'eventId',
          using: 'BTREE',
          fields: [{ name: 'eventId' }],
        },
        {
          name: 'parentCommentId',
          using: 'BTREE',
          fields: [{ name: 'parentCommentId' }],
        },
      ],
    }
  );

  return EventComment;
};
