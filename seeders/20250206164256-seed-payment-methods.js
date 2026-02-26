'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("paymentMethods", [
      { name: "Credit Card", description: "Payment via credit card", createdAt: new Date(), updatedAt: new Date() },
      { name: "PayPal", description: "Payment via PayPal", createdAt: new Date(), updatedAt: new Date() },
      { name: "Bank Transfer", description: "Payment via bank transfer", createdAt: new Date(), updatedAt: new Date() },
      { name: "Cash", description: "Payment via cash", createdAt: new Date(), updatedAt: new Date() }
    ], {});
 },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("paymentMethods", null, {});
  }
};
