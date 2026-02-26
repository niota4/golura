'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('shortCodes', [
      {
        name: 'Customer Name',
        code: '{{Customer}}',
        description: 'Displays the customer’s full name',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Company Name',
        code: '{{CompanyName}}',
        description: 'Displays the company’s name',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Client Email',
        code: '{{ClientEmail}}',
        description: 'Shows the client’s email address',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Client Phone',
        code: '{{ClientPhone}}',
        description: 'Shows the client’s phone number',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Client Address',
        code: '{{ClientAddress}}',
        description: 'Shows the client’s address',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Event Type',
        code: '{{EventType}}',
        description: 'Displays the type of event',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Event Date',
        code: '{{EventDate}}',
        description: 'Displays the scheduled date of an event',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Event Status',
        code: '{{EventStatus}}',
        description: 'Displays the status of an event (e.g., Pending, Completed)',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Estimate',
        code: '{{Estimate}}',
        description: 'Displays the title or Number of an estimate',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Event',
        code: '{{Event}}',
        description: 'Displays the title or Number of an event',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Estimate Line Items',
        code: '{{EstinateLineItems}}',
        description: 'Displays the line items of an estimate',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Estimate Sub Total',
        code: '{{EstimateSubTotal}}',
        description: 'Displays the sub total of an estimate',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Estimate Total',
        code: '{{EstimateTotal}}',
        description: 'Displays the total of an estimate',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Estimate Discount',
        code: '{{EstimateDiscount}}',
        description: 'Displays the discount applied to an estimate',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Support Email',
        code: '{{SupportEmail}}',
        description: 'Displays the company’s support email address',
        type: 'text',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('shortCodes', null, {});
  }
};
