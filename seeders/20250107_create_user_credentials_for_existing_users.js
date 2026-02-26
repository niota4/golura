'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, get all existing users who don't have UserCredentials records
    const [users] = await queryInterface.sequelize.query(`
      SELECT u.id, u.firstName, u.lastName, u.email, u.createdAt, u.updatedAt
      FROM users u
      LEFT JOIN userCredentials uc ON u.id = uc.userId
      WHERE uc.userId IS NULL AND u.isActive = 1
    `);

    if (users.length === 0) {
      console.log('No users found without UserCredentials records');
      return;
    }

    console.log(`Creating UserCredentials for ${users.length} existing users`);

    // Create UserCredentials records for users who don't have them
    const userCredentialsData = users.map(user => ({
      userId: user.id,
      ssn: null,
      birthDate: null,
      street1: null,
      street2: null,
      city: null,
      stateId: null,
      zipCode: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      emergencyContactRelationship: null,
      hireDate: null,
      terminationDate: null,
      employmentStatus: 'active',
      taxFilingStatus: null,
      federalAllowances: null,
      stateAllowances: null,
      additionalFederalWithholding: null,
      additionalStateWithholding: null,
      bankName: null,
      bankAccountType: null,
      routingNumber: null,
      accountNumber: null,
      driverLicenseNumber: null,
      driverLicenseStateId: null,
      driverLicenseExpiration: null,
      w4OnFile: null,
      i9OnFile: null,
      notes: null,
      createdBy: null,
      updatedBy: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('userCredentials', userCredentialsData, {});
    console.log(`Successfully created UserCredentials for ${userCredentialsData.length} users`);
  },

  async down(queryInterface, Sequelize) {
    // Remove UserCredentials records that were created by this seeder
    // We'll identify them by having all null values except employmentStatus = 'active'
    await queryInterface.bulkDelete('userCredentials', {
      ssn: null,
      birthDate: null,
      street1: null,
      street2: null,
      city: null,
      stateId: null,
      zipCode: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
      emergencyContactRelationship: null,
      hireDate: null,
      terminationDate: null,
      employmentStatus: 'active',
      taxFilingStatus: null,
      federalAllowances: null,
      stateAllowances: null,
      additionalFederalWithholding: null,
      additionalStateWithholding: null,
      bankName: null,
      bankAccountType: null,
      routingNumber: null,
      accountNumber: null,
      driverLicenseNumber: null,
      driverLicenseStateId: null,
      driverLicenseExpiration: null,
      w4OnFile: null,
      i9OnFile: null,
      notes: null,
      createdBy: null,
      updatedBy: null
    }, {});
  }
};
