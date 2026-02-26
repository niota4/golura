'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add companyId column to paymentMethods table
    await queryInterface.addColumn('paymentMethods', 'companyId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Reference to the company that owns this payment method'
    });

    // Add isActive column to paymentMethods table
    await queryInterface.addColumn('paymentMethods', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this payment method is active and available for use'
    });

    // Add index for companyId for better query performance
    await queryInterface.addIndex('paymentMethods', ['companyId'], {
      name: 'idx_paymentMethods_companyId'
    });

    // Add index for isActive for better query performance
    await queryInterface.addIndex('paymentMethods', ['isActive'], {
      name: 'idx_paymentMethods_isActive'
    });

    // Add composite index for companyId and isActive
    await queryInterface.addIndex('paymentMethods', ['companyId', 'isActive'], {
      name: 'idx_paymentMethods_companyId_isActive'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('paymentMethods', 'idx_paymentMethods_companyId_isActive');
    await queryInterface.removeIndex('paymentMethods', 'idx_paymentMethods_isActive');
    await queryInterface.removeIndex('paymentMethods', 'idx_paymentMethods_companyId');
    
    // Remove columns
    await queryInterface.removeColumn('paymentMethods', 'isActive');
    await queryInterface.removeColumn('paymentMethods', 'companyId');
  }
};
