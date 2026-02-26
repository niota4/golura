'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get all users
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users',
      { type: Sequelize.QueryTypes.SELECT }
    );
    // Define subPages for each page
    const subPages = [
        'dashboard',
        'estimators',
    ]

    // Build onboarding records with pageId always null
    const onboardingRecords = [];
    users.forEach(user => {
      subPages.forEach(subPage => {
        onboardingRecords.push({
          userId: user.id,
          pageId: null,
          subPage: subPage,
          skip: false,
          completed: false,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    });
    if (onboardingRecords.length > 0) {
      await queryInterface.bulkInsert('userOnboards', onboardingRecords);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove only the records created by this seeder
    await queryInterface.bulkDelete('userOnboards', {
      subPage: ['main'],
    });
  }
};
