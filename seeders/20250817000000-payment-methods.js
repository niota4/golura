'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    // Check if payment methods already exist
    const existingPaymentMethods = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM paymentMethods',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingPaymentMethods[0].count > 0) {
      console.log('Payment methods already exist, skipping seed...');
      return;
    }

    await queryInterface.bulkInsert('paymentMethods', [
      {
        name: 'Credit Card',
        description: 'Visa, MasterCard, American Express, Discover',
        removable: false,
        companyId: null, // Global payment method available to all companies
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'ACH Bank Transfer',
        description: 'Electronic bank account transfer',
        removable: false,
        companyId: null, // Global payment method available to all companies
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Cash',
        description: 'Cash payment',
        removable: true,
        companyId: null, // Global payment method available to all companies
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Check',
        description: 'Personal or business check',
        removable: true,
        companyId: null, // Global payment method available to all companies
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Wire Transfer',
        description: 'Bank wire transfer',
        removable: true,
        companyId: null, // Global payment method available to all companies
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('paymentMethods', null, {});
  }
};
