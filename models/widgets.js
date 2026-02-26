const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const Widgets = sequelize.define('widgets', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'standard'
    },
    placement: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'dashboard'
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    minWidth: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    minHeight: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    maxWidth: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    maxHeight: {
      type: DataTypes.INTEGER,
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
    tableName: 'widgets',
    timestamps: true,
  });

  Widgets.associate = function(models) {
    Widgets.hasMany(models.UserWidgets, { foreignKey: 'widgetId', as: 'UserWidgets' });
    Widgets.hasMany(models.RoleWidgets, { foreignKey: 'widgetId', as: 'RoleWidgets' });
  };

  return Widgets;
};
