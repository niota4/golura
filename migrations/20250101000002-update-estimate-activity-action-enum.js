'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update the action enum to include new client action types
    await queryInterface.changeColumn('estimateActivities', 'action', {
      type: Sequelize.ENUM(
        'CREATE', 
        'UPDATE', 
        'DELETE', 
        'VIEW', 
        'APPROVE', 
        'REJECT', 
        'REQUEST_CHANGES', 
        'FEEDBACK',
        'TERMS_ACCEPTED'
      ),
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to original enum values
    await queryInterface.changeColumn('estimateActivities', 'action', {
      type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE'),
      allowNull: false
    });
  }
};
