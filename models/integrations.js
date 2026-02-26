const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Integration', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false, // Type of integration (e.g., 'Twilio', 'Slack')
    },
    description: {
      type: DataTypes.STRING(1024),
      allowNull: true, // JSON object containing integration-specific details
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    altIcon: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Indicates if the integration is active
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW, // Time of creation
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW, // Time of last update
    },
  }, {
    sequelize,
    tableName: 'integrations',
    timestamps: true, // Enable Sequelize auto timestamps
  });
};
