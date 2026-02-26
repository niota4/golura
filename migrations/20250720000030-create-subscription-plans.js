'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subscription_plans', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Plan name (Starter, Business, Growth, Enterprise)'
      },
      displayName: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: 'User-friendly display name'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Plan description'
      },
      monthlyPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Monthly subscription price in dollars'
      },
      yearlyPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Yearly subscription price in dollars'
      },
      features: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array of available features for this plan'
      },
      limits: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'JSON object containing usage limits (users, storage, etc.)'
      },
      stripePriceIdMonthly: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Stripe price ID for monthly billing'
      },
      stripePriceIdYearly: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Stripe price ID for yearly billing'
      },
      stripeProductId: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Stripe product ID'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this plan is available for new subscriptions'
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Display order for plan listing'
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
    await queryInterface.addIndex('subscription_plans', ['name'], {
      name: 'idx_subscription_plans_name'
    });
    
    await queryInterface.addIndex('subscription_plans', ['isActive'], {
      name: 'idx_subscription_plans_is_active'
    });
    
    await queryInterface.addIndex('subscription_plans', ['sortOrder'], {
      name: 'idx_subscription_plans_sort_order'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('subscription_plans');
  }
};
