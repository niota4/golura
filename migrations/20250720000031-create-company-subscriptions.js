'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('company_subscriptions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Reference to the company that owns this subscription'
      },
      subscriptionPlanId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'subscription_plans',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Reference to the subscription plan'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'canceled', 'past_due', 'trialing'),
        allowNull: false,
        defaultValue: 'trialing',
        comment: 'Current subscription status'
      },
      billingCycle: {
        type: Sequelize.ENUM('monthly', 'yearly'),
        allowNull: false,
        defaultValue: 'monthly',
        comment: 'Billing frequency'
      },
      currentPeriodStart: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Start date of current billing period'
      },
      currentPeriodEnd: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'End date of current billing period'
      },
      trialStart: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Start date of trial period'
      },
      trialEnd: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'End date of trial period'
      },
      canceledAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date when subscription was canceled'
      },
      cancelAtPeriodEnd: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether to cancel at end of current period'
      },
      stripeSubscriptionId: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        comment: 'Stripe subscription ID for billing integration'
      },
      stripeCustomerId: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Stripe customer ID'
      },
      lastPaymentDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date of last successful payment'
      },
      nextPaymentDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date of next scheduled payment'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Current subscription amount'
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
        comment: 'Currency code for billing'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional subscription metadata'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('company_subscriptions', ['companyId'], {
      name: 'idx_company_subscriptions_company_id'
    });
    
    await queryInterface.addIndex('company_subscriptions', ['subscriptionPlanId'], {
      name: 'idx_company_subscriptions_plan_id'
    });
    
    await queryInterface.addIndex('company_subscriptions', ['status'], {
      name: 'idx_company_subscriptions_status'
    });
    
    await queryInterface.addIndex('company_subscriptions', ['stripeSubscriptionId'], {
      name: 'idx_company_subscriptions_stripe_subscription_id'
    });
    
    await queryInterface.addIndex('company_subscriptions', ['currentPeriodEnd'], {
      name: 'idx_company_subscriptions_period_end'
    });
    
    await queryInterface.addIndex('company_subscriptions', ['nextPaymentDate'], {
      name: 'idx_company_subscriptions_next_payment'
    });

    // Note: MySQL doesn't support partial unique constraints like PostgreSQL
    // We'll handle the unique active subscription per company logic in the application layer
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('company_subscriptions');
  }
};
