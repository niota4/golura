const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const UserWidgets = sequelize.define('userWidgets', {
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
      }
    },
    widgetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'widgets',
        key: 'id'
      }
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true
    },
    mobileSettings: {
      type: DataTypes.JSON,
      allowNull: true
    },
    tabletSettings: {
      type: DataTypes.JSON,
      allowNull: true
    },
    desktopSettings: {
      type: DataTypes.JSON,
      allowNull: true
    },
    size: {
      type: DataTypes.JSON,
      allowNull: true
    },
    position: {
      type: DataTypes.JSON,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    tableName: 'userWidgets',
    timestamps: true,
  });

  UserWidgets.associate = function(models) {
    UserWidgets.belongsTo(models.Users, { foreignKey: 'userId', as: 'User' });
    UserWidgets.belongsTo(models.Widgets, { foreignKey: 'widgetId', as: 'Widget' });
  };

  return UserWidgets;
};
