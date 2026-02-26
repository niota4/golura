'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if columns exist before adding them
      const tableDescription = await queryInterface.describeTable('phoneCalls');
      
      // Add conferenceName if it doesn't exist
      if (!tableDescription.conferenceName) {
        await queryInterface.addColumn('phoneCalls', 'conferenceName', {
          type: Sequelize.STRING,
          allowNull: true
        }, { transaction });
      }
      
      // Add recordingSid if it doesn't exist
      if (!tableDescription.recordingSid) {
        await queryInterface.addColumn('phoneCalls', 'recordingSid', {
          type: Sequelize.STRING,
          allowNull: true
        }, { transaction });
      }
      
      // Add recordingUrl if it doesn't exist
      if (!tableDescription.recordingUrl) {
        await queryInterface.addColumn('phoneCalls', 'recordingUrl', {
          type: Sequelize.TEXT,
          allowNull: true
        }, { transaction });
      }
      
      // Add status if it doesn't exist
      if (!tableDescription.status) {
        await queryInterface.addColumn('phoneCalls', 'status', {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: 'In Progress'
        }, { transaction });
      }
      
      // Add userPhoneNumber if it doesn't exist
      if (!tableDescription.userPhoneNumber) {
        await queryInterface.addColumn('phoneCalls', 'userPhoneNumber', {
          type: Sequelize.STRING,
          allowNull: true
        }, { transaction });
      }

      await transaction.commit();
      console.log('Successfully added phone call fields');
    } catch (error) {
      await transaction.rollback();
      console.error('Error adding phone call fields:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove the columns in reverse order
      await queryInterface.removeColumn('phoneCalls', 'userPhoneNumber', { transaction });
      await queryInterface.removeColumn('phoneCalls', 'status', { transaction });
      await queryInterface.removeColumn('phoneCalls', 'recordingUrl', { transaction });
      await queryInterface.removeColumn('phoneCalls', 'recordingSid', { transaction });
      await queryInterface.removeColumn('phoneCalls', 'conferenceName', { transaction });
      
      await transaction.commit();
      console.log('Successfully removed phone call fields');
    } catch (error) {
      await transaction.rollback();
      console.error('Error removing phone call fields:', error);
      throw error;
    }
  }
};
