const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Store only Stripe Payment Method ID - let Stripe handle sensitive data
    await queryInterface.addColumn('payments', 'stripePaymentMethodId', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Stripe Payment Method ID (for both card and ACH)'
    });

    // Display information only - no sensitive data
    await queryInterface.addColumn('payments', 'achBankName', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Name of the bank for ACH transfer (display only)'
    });

    await queryInterface.addColumn('payments', 'achAccountNumberLast4', {
      type: DataTypes.STRING(4),
      allowNull: true,
      comment: 'Last 4 digits of account number for display'
    });

    await queryInterface.addColumn('payments', 'achAccountType', {
      type: DataTypes.ENUM('checking', 'savings'),
      allowNull: true,
      comment: 'Type of bank account (checking or savings)'
    });

    await queryInterface.addColumn('payments', 'paymentType', {
      type: DataTypes.ENUM('card', 'ach', 'wire'),
      allowNull: false,
      defaultValue: 'card',
      comment: 'Type of payment method used'
    });

    await queryInterface.addColumn('payments', 'achStatus', {
      type: DataTypes.ENUM('pending', 'processing', 'succeeded', 'failed', 'canceled'),
      allowNull: true,
      comment: 'Status of ACH payment'
    });

    await queryInterface.addColumn('payments', 'achFailureReason', {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Reason for ACH payment failure'
    });

    await queryInterface.addColumn('payments', 'expectedSettlementDate', {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expected settlement date for ACH payments'
    });

    // Add index for Stripe Payment Method ID
    await queryInterface.addIndex('payments', ['stripePaymentMethodId'], {
      name: 'idx_payments_stripe_payment_method_id'
    });

    // Add index for payment type
    await queryInterface.addIndex('payments', ['paymentType'], {
      name: 'idx_payments_payment_type'
    });

    // Add index for ACH status
    await queryInterface.addIndex('payments', ['achStatus'], {
      name: 'idx_payments_ach_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('payments', 'idx_payments_stripe_payment_method_id');
    await queryInterface.removeIndex('payments', 'idx_payments_payment_type');
    await queryInterface.removeIndex('payments', 'idx_payments_ach_status');

    // Remove columns
    await queryInterface.removeColumn('payments', 'stripePaymentMethodId');
    await queryInterface.removeColumn('payments', 'achBankName');
    await queryInterface.removeColumn('payments', 'achAccountNumberLast4');
    await queryInterface.removeColumn('payments', 'achAccountType');
    await queryInterface.removeColumn('payments', 'paymentType');
    await queryInterface.removeColumn('payments', 'achStatus');
    await queryInterface.removeColumn('payments', 'achFailureReason');
    await queryInterface.removeColumn('payments', 'expectedSettlementDate');
  }
};
