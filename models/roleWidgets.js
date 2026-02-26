const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const RoleWidgets = sequelize.define('roleWidgets', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
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
    tableName: 'roleWidgets',
    timestamps: true,
  });

  RoleWidgets.associate = function(models) {
    RoleWidgets.belongsTo(models.Roles, { foreignKey: 'roleId', as: 'Role' });
    RoleWidgets.belongsTo(models.Widgets, { foreignKey: 'widgetId', as: 'Widget' });
  };

  return RoleWidgets;
};
