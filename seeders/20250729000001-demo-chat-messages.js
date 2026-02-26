'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert demo chat messages for a realistic conversation about a demo job
    await queryInterface.bulkInsert('chatMessages', [
      {
        chatRoomId: 1,
        userId: 1,
        message: "Hey team! Just wanted to give everyone a heads up about the demo job we have scheduled for this week. The client wants to see our kitchen renovation process.",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 09:15:00'),
        updatedAt: new Date('2025-07-28 09:15:00')
      },
      {
        chatRoomId: 1,
        userId: 1,
        message: "Got it! What's the timeline looking like? Do we have all the materials ready?",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 09:18:30'),
        updatedAt: new Date('2025-07-28 09:18:30')
      },
      {
        chatRoomId: 1,
        userId: 1,
        message: "I checked our inventory yesterday. We have everything except the cabinet hardware. Should I place an order today?",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 09:22:15'),
        updatedAt: new Date('2025-07-28 09:22:15')
      },
      {
        chatRoomId: 1,
        userId: 1,
        message: "Yes, please do! The demo is scheduled for Thursday at 2 PM. The client specifically mentioned they want to see the cabinet installation process.",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 09:25:45'),
        updatedAt: new Date('2025-07-28 09:25:45')
      },
      {
        chatRoomId: 1,
        userId: 1,
        message: "Perfect! I'll make sure to bring the level and all measuring tools. Should we prepare a small presentation about our process?",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 09:28:20'),
        updatedAt: new Date('2025-07-28 09:28:20')
      },
      {
        chatRoomId: 1,
        userId: 1,
        message: "Hardware order placed! ETA is Wednesday morning. We should be all set. 📦",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 09:35:10'),
        updatedAt: new Date('2025-07-28 09:35:10')
      },
      {
        chatRoomId: 1,
        userId: 1,
        message: "Great thinking! A quick 5-minute overview would be helpful. I'll prepare some before/after photos from our recent projects to show quality.",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: JSON.stringify(['https://example.com/kitchen1.jpg', 'https://example.com/kitchen2.jpg']),
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 09:42:00'),
        updatedAt: new Date('2025-07-28 09:42:00')
      },
      {
        chatRoomId: 1,
        userId: 1,
        message: "Awesome! Those photos from the Johnson project would be perfect to show. The client will love seeing the transformation.",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 09:45:30'),
        updatedAt: new Date('2025-07-28 09:45:30')
      },
      {
        chatRoomId: 1,
        userId: 1,
        message: "Should we also bring some material samples? The client might want to feel the quality of our cabinet doors and countertop options.",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 10:15:45'),
        updatedAt: new Date('2025-07-28 10:15:45')
      },
      {
        chatRoomId: 1,
        userId: 1,
        message: "Excellent idea! I'll grab the sample case from the office. Let's meet at the jobsite 30 minutes early to set up everything properly.",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 10:18:20'),
        updatedAt: new Date('2025-07-28 10:18:20')
      },
      {
        chatRoomId: 1,
        userId: 1,
        message: "Sounds like a plan! I'll bring the tablet with our portfolio app so we can show more projects digitally too. This is going to be a great demo! 💪",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 10:22:00'),
        updatedAt: new Date('2025-07-28 10:22:00')
      },
      {
        chatRoomId: 1,
        userId: 1,
        message: "Just confirmed with the supplier - hardware will arrive Wednesday at 10 AM. I'll swing by the warehouse to pick it up. Everything's on track! ✅",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 14:30:15'),
        updatedAt: new Date('2025-07-28 14:30:15')
      },
      {
        chatRoomId: 1,
        userId: 1,
        message: "Perfect team coordination! This is exactly why we get such great results. The client is going to be impressed with our professionalism and attention to detail.",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 14:35:45'),
        updatedAt: new Date('2025-07-28 14:35:45')
      },
      {
        chatRoomId: 1,
        userId: 1,
        message: "One more thing - should we prepare an estimate template to show them how we price our work? Transparency often helps close deals.",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 15:10:30'),
        updatedAt: new Date('2025-07-28 15:10:30')
      },
      {
        chatRoomId: 1,
        userId: 1,
        message: "Great suggestion! I'll put together a sample estimate showing our transparent pricing structure. It really does help build trust with potential clients.",
        parentMessageId: null,
        visibility: 'public',
        isActive: true,
        edited: false,
        imageUrls: null,
        likeUserIds: JSON.stringify([]),
        companyId: 1,
        createdAt: new Date('2025-07-28 15:15:00'),
        updatedAt: new Date('2025-07-28 15:15:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Remove the demo chat messages by chatRoomId and message content pattern
    await queryInterface.bulkDelete('chatMessages', {
      chatRoomId: 1,
      message: {
        [Sequelize.Op.like]: '%demo%'
      }
    }, {});
  }
};
