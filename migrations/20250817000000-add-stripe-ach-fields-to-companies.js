'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'stripeAccountId', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Stripe Connect account ID'
    });

    await queryInterface.addColumn('companies', 'achPaymentsEnabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether ACH payments are enabled for this company'
    });

    await queryInterface.addColumn('companies', 'achProcessingFee', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.80,
      comment: 'ACH processing fee percentage'
    });

    await queryInterface.addColumn('companies', 'achRequireVerification', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether bank account verification is required for ACH payments'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('companies', 'stripeAccountId');
    await queryInterface.removeColumn('companies', 'achPaymentsEnabled');
    await queryInterface.removeColumn('companies', 'achProcessingFee');
    await queryInterface.removeColumn('companies', 'achRequireVerification');
  }
};
