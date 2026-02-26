'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const timestamp = new Date();
    await queryInterface.bulkInsert('shortCodes', [
      { name: 'Company Logo', code: '{{CompanyLogo}}', description: 'URL of the company logo', createdAt: timestamp, updatedAt: timestamp },
      { name: 'Company Website', code: '{{CompanyWebsite}}', description: 'URL of the company website', createdAt: timestamp, updatedAt: timestamp },
      { name: 'Company Address', code: '{{CompanyAddress}}', description: 'Full address of the company', createdAt: timestamp, updatedAt: timestamp },
      { name: 'Company City', code: '{{CompanyCity}}', description: 'City where the company is located', createdAt: timestamp, updatedAt: timestamp },
      { name: 'Company Phone', code: '{{CompanyPhone}}', description: 'Phone number of the company', createdAt: timestamp, updatedAt: timestamp },
      { name: 'Company Email', code: '{{CompanyEmail}}', description: 'Email address of the company', createdAt: timestamp, updatedAt: timestamp },
      { name: 'Support Email', code: '{{SupportEmail}}', description: 'Support email address of the company', createdAt: timestamp, updatedAt: timestamp },
      { name: 'Company Facebook', code: '{{CompanyFacebook}}', description: 'Facebook URL of the company', createdAt: timestamp, updatedAt: timestamp },
      { name: 'Company Twitter', code: '{{CompanyTwitter}}', description: 'Twitter URL of the company', createdAt: timestamp, updatedAt: timestamp },
      { name: 'Company Instagram', code: '{{CompanyInstagram}}', description: 'Instagram URL of the company', createdAt: timestamp, updatedAt: timestamp },
      { name: 'Company YouTube', code: '{{CompanyYouTube}}', description: 'YouTube URL of the company', createdAt: timestamp, updatedAt: timestamp },
      { name: 'Company LinkedIn', code: '{{CompanyLinkedIn}}', description: 'LinkedIn URL of the company', createdAt: timestamp, updatedAt: timestamp },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('shortCodes', {
      code: {
        [Sequelize.Op.in]: [
          '{{CompanyLogo}}',
          '{{CompanyWebsite}}',
          '{{CompanyAddress}}',
          '{{CompanyCity}}',
          '{{CompanyPhone}}',
          '{{CompanyEmail}}',
          '{{SupportEmail}}',
          '{{CompanyFacebook}}',
          '{{CompanyTwitter}}',
          '{{CompanyInstagram}}',
          '{{CompanyYouTube}}',
          '{{CompanyLinkedIn}}'
        ]
      }
    }, {});
  }
};
