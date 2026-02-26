'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert demo event comments for a realistic conversation about a home remodel event
    await queryInterface.bulkInsert('eventComments', [
      {
        companyId: 1,
        eventId: 292,
        userId: 58,
        comment: "Just finished the initial walkthrough for the Johnson home remodel. The kitchen needs a complete overhaul - cabinets, countertops, and flooring. Estimated timeline is 3-4 weeks.",
        parentCommentId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: JSON.stringify(['https://example.com/kitchen-before1.jpg', 'https://example.com/kitchen-before2.jpg']),
        likeUserIds: JSON.stringify([59, 60]),
        createdAt: new Date('2025-07-28 10:30:00'),
        updatedAt: new Date('2025-07-28 10:30:00')
      },
      {
        companyId: 1,
        eventId: 292,
        userId: 59,
        comment: "I reviewed the electrical plans. We'll need to add 3 new outlets and upgrade the circuit for the new appliances. Also found some old wiring that needs updating for safety.",
        parentCommentId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([58]),
        createdAt: new Date('2025-07-28 11:15:00'),
        updatedAt: new Date('2025-07-28 11:15:00')
      },
      {
        companyId: 1,
        eventId: 292,
        userId: 60,
        comment: "Great! I've already sourced the materials. The client approved the quartz countertops and the soft-close cabinet hardware. Delivery is scheduled for Monday morning.",
        parentCommentId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: JSON.stringify(['https://example.com/quartz-sample.jpg']),
        likeUserIds: JSON.stringify([58, 59]),
        createdAt: new Date('2025-07-28 11:45:00'),
        updatedAt: new Date('2025-07-28 11:45:00')
      },
      {
        companyId: 1,
        eventId: 292,
        userId: 58,
        comment: "Perfect timing! The demo starts Tuesday. @Mike, can you coordinate with the electrical inspector for Wednesday? We want to get the rough-in approved before drywall.",
        parentCommentId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([59]),
        createdAt: new Date('2025-07-28 12:20:00'),
        updatedAt: new Date('2025-07-28 12:20:00')
      },
      {
        companyId: 1,
        eventId: 292,
        userId: 59,
        comment: "Already on it! Inspector is scheduled for Wednesday at 2 PM. I'll have everything ready for the rough-in inspection. The new panel installation should be completed by Tuesday evening.",
        parentCommentId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([58, 60]),
        createdAt: new Date('2025-07-28 12:35:00'),
        updatedAt: new Date('2025-07-28 12:35:00')
      },
      {
        companyId: 1,
        eventId: 292,
        userId: 60,
        comment: "The client mentioned they want to upgrade the lighting too. I'm thinking pendant lights over the island and under-cabinet LED strips. What do you guys think?",
        parentCommentId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: JSON.stringify(['https://example.com/pendant-lights.jpg', 'https://example.com/led-strips.jpg']),
        likeUserIds: JSON.stringify([58]),
        createdAt: new Date('2025-07-28 14:10:00'),
        updatedAt: new Date('2025-07-28 14:10:00')
      },
      {
        companyId: 1,
        eventId: 292,
        userId: 58,
        comment: "Love the lighting ideas! That'll really modernize the space. The pendant lights will be a great focal point. Let's make sure we account for the additional electrical work in our timeline.",
        parentCommentId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([59, 60]),
        createdAt: new Date('2025-07-28 14:25:00'),
        updatedAt: new Date('2025-07-28 14:25:00')
      },
      {
        companyId: 1,
        eventId: 292,
        userId: 59,
        comment: "Good point about the timeline. The pendant light wiring can be done during the rough-in phase. For the under-cabinet LEDs, I'll run the wiring after drywall but before cabinet installation.",
        parentCommentId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([58, 60]),
        createdAt: new Date('2025-07-28 14:40:00'),
        updatedAt: new Date('2025-07-28 14:40:00')
      },
      {
        companyId: 1,
        eventId: 292,
        userId: 60,
        comment: "The client just called - they're excited about the progress and want to know if we can add a tile backsplash. I told them we can definitely accommodate that. Thoughts on subway tile vs. herringbone pattern?",
        parentCommentId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: JSON.stringify(['https://example.com/subway-tile.jpg', 'https://example.com/herringbone-tile.jpg']),
        likeUserIds: JSON.stringify([58, 59]),
        createdAt: new Date('2025-07-28 16:15:00'),
        updatedAt: new Date('2025-07-28 16:15:00')
      },
      {
        companyId: 1,
        eventId: 292,
        userId: 58,
        comment: "Both options look great! Given their modern appliance choices, I think the herringbone would add a nice sophisticated touch without being too busy. What's the material - ceramic or natural stone?",
        parentCommentId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([60]),
        createdAt: new Date('2025-07-28 16:30:00'),
        updatedAt: new Date('2025-07-28 16:30:00')
      },
      {
        companyId: 1,
        eventId: 292,
        userId: 60,
        comment: "They're leaning toward ceramic for easy maintenance. I'll grab some samples tomorrow and we can present both layout options. The herringbone will add about a day to the tile work, but the result will be worth it! 🏠✨",
        parentCommentId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([58, 59]),
        createdAt: new Date('2025-07-28 16:45:00'),
        updatedAt: new Date('2025-07-28 16:45:00')
      },
      {
        companyId: 1,
        eventId: 292,
        userId: 59,
        comment: "This is shaping up to be an amazing transformation! The Johnsons are going to love their new kitchen. I'll make sure all the electrical rough-in supports the new lighting plan.",
        parentCommentId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([58, 60]),
        createdAt: new Date('2025-07-28 17:00:00'),
        updatedAt: new Date('2025-07-28 17:00:00')
      },
      {
        companyId: 1,
        eventId: 292,
        userId: 58,
        comment: "Team meeting tomorrow at 8 AM to finalize all the details before we start demo. Let's make sure we're all aligned on the schedule and material deliveries. This is going to be one of our showcase projects! 💪",
        parentCommentId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([59, 60]),
        createdAt: new Date('2025-07-28 17:30:00'),
        updatedAt: new Date('2025-07-28 17:30:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Remove the demo event comments
    await queryInterface.bulkDelete('eventComments', {
      eventId: 292,
      userId: {
        [Sequelize.Op.in]: [58, 59, 60]
      }
    }, {});
  }
};
