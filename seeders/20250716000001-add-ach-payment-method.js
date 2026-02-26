const { PaymentMethod } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if ACH payment method already exists
    const existingACH = await PaymentMethod.findOne({
      where: { name: 'ACH Bank Transfer' }
    });

    if (!existingACH) {
      await PaymentMethod.create({
        name: 'ACH Bank Transfer',
        description: 'Bank-to-bank transfer via ACH network (3-5 business days)',
        removable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await PaymentMethod.destroy({
      where: { name: 'ACH Bank Transfer' }
    });
  }
};
