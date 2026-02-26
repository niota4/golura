const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const SubscriptionPlan = sequelize.define('subscriptionPlan', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    displayName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    monthlyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    yearlyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    features: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of available features for this plan',
      get() {
        const value = this.getDataValue('features');
        return typeof value === 'string' ? JSON.parse(value) : value || [];
      },
      set(value) {
        this.setDataValue('features', Array.isArray(value) ? value : []);
      }
    },
    limits: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'JSON object containing usage limits (users, storage, etc.)',
      get() {
        const value = this.getDataValue('limits');
        return typeof value === 'string' ? JSON.parse(value) : value || {};
      },
      set(value) {
        this.setDataValue('limits', typeof value === 'object' ? value : {});
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    stripeProductId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    stripePriceId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    trialDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 14
    }
  }, {
    sequelize,
    tableName: 'subscriptionPlans',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "name_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "is_active_sort",
        using: "BTREE",
        fields: [
          { name: "isActive" },
          { name: "sortOrder" },
        ]
      }
    ]
  });

  // Class methods for checking features
  SubscriptionPlan.prototype.hasFeature = function(featureName) {
    return this.features && this.features.includes(featureName);
  };

  SubscriptionPlan.prototype.getLimit = function(limitName) {
    return this.limits && this.limits[limitName] ? this.limits[limitName] : null;
  };

  SubscriptionPlan.prototype.getUserLimit = function() {
    return this.getLimit('maxUsers') || 1;
  };

  SubscriptionPlan.prototype.getStorageLimit = function() {
    return this.getLimit('storageGB') || 1;
  };

  return SubscriptionPlan;
};
