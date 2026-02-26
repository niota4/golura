'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('integrations', [
      {
        name: 'Twilio',
        description: 'Twilio provides programmable communication tools for making and receiving phone calls, sending and receiving text messages, and performing other communication functions using its web service APIs.',
        icon: 'twilio/twilio-logo.svg',
        altIcon: 'twilio/twilio-logo-white.svg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Slack',
        description: 'Slack is a messaging app for teams that makes it easy to communicate and collaborate in real-time.',
        icon: 'slack/slack-logo.svg',
        altIcon: 'slack/slack-logo-white.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mailgun',
        description: 'Mailgun is an email automation service that allows you to send, receive, and track emails using its API.',        
        icon: 'mailgun/mailgun-logo.svg',
        altIcon: 'mailgun/mailgun-logo.svg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'SendGrid',
        description: 'SendGrid is a cloud-based email delivery service that provides reliable email delivery, scalability, and real-time analytics.',
        
        icon: null,
        altIcon: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Zoom',
        description: 'Zoom is a video conferencing service that allows you to conduct virtual meetings, webinars, and online events.',
        icon: 'zoom/zoom-logo.svg',
        altIcon: 'zoom/zoom-logo-white.png',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('integrations', null, {});
  }
};