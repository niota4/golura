const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const UserOnboard = sequelize.define('UserOnboard', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    pageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pages',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    subPage: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    skip: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indicates if the user has skipped this onboarding step'
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'userOnboards',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" }
        ]
      },
      {
        name: "idx_userOnboards_user_page",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userId" },
          { name: "pageId" }
        ]
      }
    ]
  });

  UserOnboard.associate = models => {
    UserOnboard.belongsTo(models.User, {
      as: 'User',
      foreignKey: 'userId'
    });

    UserOnboard.belongsTo(models.Page, {
      as: 'Page',
      foreignKey: 'pageId'
    });
  };

  return UserOnboard;
};
