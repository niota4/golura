const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const CompanySubscription = sequelize.define('companySubscription', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    subscriptionPlanId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subscriptionPlans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'canceled', 'past_due', 'trialing'),
      allowNull: false,
      defaultValue: 'trialing'
    },
    pageAccess: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    billingCycle: {
      type: DataTypes.ENUM('monthly', 'yearly'),
      allowNull: false,
      defaultValue: 'monthly'
    },
    currentPeriodStart: {
      type: DataTypes.DATE,
      allowNull: false
    },
    currentPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: false
    },
    trialStart: {
      type: DataTypes.DATE,
      allowNull: true
    },
    trialEnd: {
      type: DataTypes.DATE,
      allowNull: true
    },
    canceledAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelAtPeriodEnd: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    stripeCustomerId: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lastPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const value = this.getDataValue('metadata');
        return typeof value === 'string' ? JSON.parse(value) : value || {};
      },
      set(value) {
        this.setDataValue('metadata', typeof value === 'object' ? value : {});
      }
    }
  }, {
    sequelize,
    tableName: 'companySubscriptions',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      }
    ]
  });

  // Instance methods
  CompanySubscription.prototype.isActive = function() {
    const now = new Date();
    return ['active', 'trialing'].includes(this.status) && 
           this.currentPeriodEnd > now &&
           (!this.cancelAtPeriodEnd || this.currentPeriodEnd > now);
  };

  CompanySubscription.prototype.isTrialing = function() {
    const now = new Date();
    return this.status === 'trialing' && 
           this.trialEnd && 
           this.trialEnd > now;
  };

  CompanySubscription.prototype.hasAccess = function(featureName) {
    if (!this.isActive()) return false;
    return this.subscriptionPlan ? this.subscriptionPlan.hasFeature(featureName) : false;
  };

  CompanySubscription.prototype.daysUntilExpiration = function() {
    const now = new Date();
    const diffTime = this.currentPeriodEnd - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  CompanySubscription.prototype.isNearExpiration = function(daysThreshold = 7) {
    return this.daysUntilExpiration() <= daysThreshold;
  };

  CompanySubscription.prototype.canUpgrade = function(newPlanId) {
    if (!this.subscriptionPlan) return false;
    return newPlanId > this.subscriptionPlanId;
  };

  CompanySubscription.prototype.canDowngrade = function(newPlanId) {
    if (!this.subscriptionPlan) return false;
    return newPlanId < this.subscriptionPlanId;
  };

  return CompanySubscription;
};
