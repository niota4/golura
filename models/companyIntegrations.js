const Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('CompanyIntegration', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    integrationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'integrations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
      allowNull: true, // JSON object containing integration-specific settings
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Indicates if the integration is active for the company
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
    tableName: 'companyIntegrations',
    timestamps: true, // Enable Sequelize auto timestamps
    indexes: [
      {
        name: "companyId_idx",
        using: "BTREE",
        fields: [
          { name: "companyId" },
        ],
      },
      {
        name: "integrationId_idx",
        using: "BTREE",
        fields: [
          { name: "integrationId" },
        ],
      },
    ],
  });
};
