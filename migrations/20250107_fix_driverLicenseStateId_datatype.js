'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, get all existing constraints for the userCredentials table
    const [constraints] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'userCredentials' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    // Remove any existing foreign key constraints related to driverLicenseStateId
    for (const constraint of constraints) {
      if (constraint.COLUMN_NAME === 'driverLicenseStateId') {
        try {
          await queryInterface.removeConstraint('userCredentials', constraint.CONSTRAINT_NAME);
          console.log(`Removed constraint: ${constraint.CONSTRAINT_NAME}`);
        } catch (error) {
          console.log(`Could not remove constraint ${constraint.CONSTRAINT_NAME}: ${error.message}`);
        }
      }
    }

    // Clear any existing data in driverLicenseStateId that might be incompatible
    await queryInterface.sequelize.query(`
      UPDATE userCredentials SET driverLicenseStateId = NULL 
      WHERE driverLicenseStateId IS NOT NULL
    `);

    // Change the column type to INTEGER
    await queryInterface.changeColumn('userCredentials', 'driverLicenseStateId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // Add the foreign key constraint
    await queryInterface.addConstraint('userCredentials', {
      fields: ['driverLicenseStateId'],
      type: 'foreign key',
      name: 'userCredentials_driverLicenseStateId_fkey',
      references: {
        table: 'states',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the foreign key constraint
    try {
      await queryInterface.removeConstraint('userCredentials', 'userCredentials_driverLicenseStateId_fkey');
    } catch (error) {
      console.log('Could not remove foreign key constraint');
    }

    // Change the data type back to STRING
    await queryInterface.changeColumn('userCredentials', 'driverLicenseStateId', {
      type: Sequelize.STRING(50),
      allowNull: true
    });
  }
};
