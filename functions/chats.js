const { 
  ChatRoom, 
  ChatParticipant, 
  ChatPermission,
  ChatMessage, 
  ChatType,
  User, 
  UserLastReadChat,
  Role,
  Image,
  Notification,
  Video,
  Document,
  Priority
} = require('../models');
const _ = require('lodash');
const { validateText } = require('../helpers/validate');
const { createNotification, updateNotification } = require('./notifications');
const { getChatNotificationUsers, sendNotificationsToUsers } = require('../helpers/notificationHelpers');
const { create } = require('lodash');
const socket = require('../sockets');
const chatMessage = require('../models/chatMessage');
const { sendPushNotificationIfNeeded } = require('../functions/notifications');

const processMentions = async (message, userId, relatedModel, relatedModelId) => {
  const mentionPattern = /\[\[{"id":(\d+),"value":"([^"]+)","display":"([^"]+)","prefix":"@"}\]\]/g;
  const matches = message.matchAll(mentionPattern);

  for (const match of matches) {
    const targetUserId = parseInt(match[1], 10);
    const user = await User.findOne({ where: { id: userId } });

    if (!targetUserId || targetUserId === userId) continue;

    const notificationPayload = {
      userId,
      targetUserId,
      relatedModel,
      relatedModelId,
      type: 'mention',
      priorityId: 1,
      title: 'You were mentioned in a message',
      message: `${user.firstName} ${user.lastName} mentioned you in a message.`,
    };

    await createNotification({ body: notificationPayload });
  }
};
const isAdmin = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [{ model: Role, as: 'Role' }]
  });
  return user && user.Role && user.Role.name === 'administrator';
};
const isUserInChat = async (chatRoomId, userId) => {
  const chatUser = await ChatParticipant.findOne({
    where: { chatRoomId, userId }
  });
  return !!chatUser;
};
const createChatRoom = async (req, res) => {
  try {
    const { 
        name, 
        description,
        ChatParticipants
    } = req.body;

    if (!name) {
      return res.status(400).json({ err: true, msg: 'Name and createdBy are required.' });
    }
    if (ChatParticipants.length <= 0) {
      return res.status(400).json({ err: true, msg: 'At least one user is required.' });
    }
    let chatType = await ChatType.findOne({ where: { name: 'private' } });
    if (ChatParticipants.length > 1) {
      chatType = await ChatType.findOne({ where: { name: 'group' } });
      if (!chatType) {
        return res.status(500).json({ err: true, msg: 'Chat type not found.' });
      }
    }
    const chatRoom = await ChatRoom.create(
      { 
        name, 
        description, 
        typeId: chatType.id,
        createdBy: req.userId,
        isActive: true
      }
    );
    await ChatParticipant.create({ chatRoomId: chatRoom.id, userId: req.userId });

    // Add permissions for the creator
    await ChatPermission.create({ chatRoomId: chatRoom.id, userId: req.userId, permission: 'read' });
    await ChatPermission.create({ chatRoomId: chatRoom.id, userId: req.userId, permission: 'write' });
    await ChatPermission.create({ chatRoomId: chatRoom.id, userId: req.userId, permission: 'delete' });

    
    await ChatParticipant.bulkCreate(
      ChatParticipants.map(participant => ({ chatRoomId: chatRoom.id, userId: participant }))
    );

    // Create notifications for all participants added to the chat room
    try {
      const usersToNotify = await getChatNotificationUsers(req.companyId, ChatParticipants);
      const priority = await Priority.findOne({ where: { name: 'high' } }) || { id: 1 };
      const creator = await User.findByPk(req.userId);
      
      const message = `You've been added to chat room: "${name}" by ${creator ? creator.firstName + ' ' + creator.lastName : 'Administrator'}`;
      
      await sendNotificationsToUsers(
        usersToNotify,
        {
          userId: req.userId,
          relatedModel: 'chatRooms',
          relatedModelId: chatRoom.id,
          priorityId: priority.id,
          title: 'Added to Chat Room',
          message: message,
          type: 'general'
        },
        req.userId // Don't notify the creator
      );
    } catch (notificationError) {
      console.error('Error creating chat room notifications:', notificationError);
    }

    res.status(201).json({ err: false, msg: 'Chat room created successfully', chatRoom });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ err: true, msg: 'Failed to create chat room.', error: error.message });
  }
};
const createChatMessage = async (req, res) => {
  try {
    const { chatRoomId, message, parentMessageId, imageUrls, visibility } = req.body;
    const userId = req.userId;

    if (!userId || !chatRoomId) {
      return res.status(400).json({ err: true, msg: 'chatRoomId, userId, and message are required.' });
    }
    if (!message && (!imageUrls || imageUrls.length === 0)) {
      return res.status(400).json({ err: true, msg: 'Message content or imageUrls must be provided.' });
    }

    const chatRoom = await ChatRoom.findByPk(chatRoomId, {
      where: { isActive: true },
      include: [
        {
          model: ChatParticipant,
          as: 'ChatParticipants',
          attributes: ['userId'],
        },
      ],
    });

    if (!chatRoom) {
      return res.status(404).json({ err: true, msg: 'Chat room not found or archived.' });
    }

    const userIsAdmin = await isAdmin(req.userId);
    const userInChat = await isUserInChat(chatRoomId, req.userId);

    if (!userIsAdmin && !userInChat) {
      return res.status(403).json({ err: true, msg: 'User not authorized to create a message in this chat room.' });
    }

    const validationResult = validateText(message);
    if (!validationResult.isValid) {
      return res.status(400).json({ err: true, msg: validationResult.msg });
    }

    const createdChatMessage = await ChatMessage.create({
      chatRoomId,
      userId,
      message: validationResult.comment || ' ', // Use the validated comment or fallback to empty string if no message provided
      parentMessageId,
      imageUrls,
      visibility,
    });

    const chatMessage = await ChatMessage.findByPk(createdChatMessage.id, {
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profilePictureUrl'],
        },
        {
          model: ChatMessage,
          as: 'ParentMessage', // Include ParentMessage
        },
      ],
    });

    await ChatRoom.update(
      { lastMessageId: chatMessage.id },
      { where: { id: chatRoomId } }
    );

    await processMentions(validationResult.comment, userId, 'Chat', chatRoomId);

    _.each(chatRoom.ChatParticipants, async (participant) => {
      socket.sendToSpecific(participant.userId, 'updateChatRoomCount', { chatMessage });
      
      if (participant.userId === userId) return; // Skip sending notification to the sender

      socket.sendToSpecific(participant.userId, 'newMessage', { chatMessage });

      await sendPushNotificationIfNeeded(
        participant.userId,
        'newMessage',
        {
          title: 'New Message',
          body: `${chatMessage.User.firstName} sent a message in ${chatRoom.name}`,
          message: chatMessage.message,
          roomId: chatRoomId,
        }
      );
    });

    res.status(201).json({ err: false, msg: 'Chat message created successfully', chatMessage });
  } catch (error) {
    console.error('Error creating chat message:', error);
    res.status(500).json({ err: true, msg: 'Failed to create chat message.', error: error.message });
  }
};
const listChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.findAll({ include: [{ model: User, as: 'Creator' }] });

    res.status(200).json({ err: false, chatRooms });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ err: true, msg: 'Failed to fetch chat rooms.', error: error.message });
  }
};
const listChatMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.body;

    if (!chatRoomId) {
      return res.status(400).json({ err: true, msg: 'Chat room ID is required.' });
    }

    const chatRoom = await ChatRoom.findByPk(chatRoomId, {
      where: { isActive: true },
    });

    if (!chatRoom) {
      return res.status(404).json({ err: true, msg: 'Chat room not found or archived.' });
    }

    const allMessages = await ChatMessage.findAll({
      where: { chatRoomId, isActive: true },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profilePictureUrl'],
        },
        {
          model: ChatMessage,
          as: 'ParentMessage', // Include ParentMessage
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['id', 'firstName', 'lastName', 'email', 'profilePictureUrl'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Parse likeUserIds and organize messages into a tree structure
    const messageMap = new Map();

    allMessages.forEach(message => {
      // Parse likeUserIds if it's a string
      if (typeof message.likeUserIds === 'string') {
        message.likeUserIds = JSON.parse(message.likeUserIds);
      }

      message.dataValues.replies = []; // Initialize replies array
      messageMap.set(message.id, message);
    });
    // Sort replies recursively by createdAt in descending order
    const sortMessagesByDate = messages => {
      return messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(message => {
        message.dataValues.replies = sortMessagesByDate(message.dataValues.replies);
        return message;
      });
    };

    const sortedMessages = sortMessagesByDate(allMessages);

    // Include liked user details
    const userIdsToFetch = [
      ...new Set(allMessages.flatMap(message => message.likeUserIds || []))
    ];

    const likedUsers = await User.findAll({
      where: { id: userIdsToFetch },
      attributes: ['id', 'firstName', 'lastName', 'email'],
    });

    const likedUserMap = likedUsers.reduce((map, user) => {
      map[user.id] = user;
      return map;
    }, {});

    // Attach liked user details
    allMessages.forEach(message => {
      message.dataValues.likedUsers = (message.likeUserIds || []).map(userId => likedUserMap[userId]);
    });

    // Update UserLastReadChat
    const userLastReadChat = await UserLastReadChat.findOne({ where: { chatRoomId, userId: req.userId } });
    if (userLastReadChat) {
      await userLastReadChat.update({ lastReadMessageId: sortedMessages[0]?.id });
    } else {
      await UserLastReadChat.create({ chatRoomId, userId: req.userId, lastReadMessageId: sortedMessages[0]?.id });
    }
    await socket.sendToSpecific(req.userId, 'chatRoomSelected', {chatRoomId});

    return res.status(200).json({
      err: false,
      msg: 'Chat messages retrieved successfully',
      chatMessages: sortedMessages,
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return res.status(500).json({ err: true, msg: 'Failed to fetch messages' });
  }
};
const updateChatRoom = async (req, res) => {
  try {
    const { id } = req.body;
    const { name, description, isActive } = req.body;

    if (!id) {
      return res.status(400).json({ err: true, msg: 'Chat room ID is required.' });
    }

    const chatRoom = await ChatRoom.findByPk(
      id,
      { 
        where: {
          isActive: true // Ensure we only fetch active chat rooms
        }
      });

    if (!chatRoom) {
      return res.status(404).json({ err: true, msg: 'Chat room not found. Or it was archived.' });
    }

    const userIsAdmin = await isAdmin(req.userId);
    const userInChat = await isUserInChat(id, req.userId);

    if (!userIsAdmin && !userInChat) {
      return res.status(403).json({ err: true, msg: 'User not authorized to update this chat room.' });
    }

    await chatRoom.update({ name, description, isActive });

    res.status(200).json({ err: false, msg: 'Chat room updated successfully', chatRoom });
  } catch (error) {
    console.error('Error updating chat room:', error);
    res.status(500).json({ err: true, msg: 'Failed to update chat room.', error: error.message });
  }
};
const updateChatMessage = async (req, res) => {
  try {
    const { id } = req.body;
    const { message, chatRoomId, visibility, isActive, edited, imageUrls, likeUserIds } = req.body;

    if (!id) {
      return res.status(400).json({ err: true, msg: 'Chat message ID is required.' });
    }
    const chatRoom = await ChatRoom.findByPk(
      chatRoomId,
      { 
        where: {
          isActive: true // Ensure we only fetch active chat rooms
        }
      }
    );
    if (!chatRoom) {
      // Chat room not found or was archived
      return res.status(404).json({ err: true, msg: 'Chat room not found. Or it was archived.' });
    }
    const chatMessage = await ChatMessage.findByPk(id);

    if (!chatMessage) {
      return res.status(404).json({ err: true, msg: 'Chat message not found.' });
    }

    const userIsAdmin = await isAdmin(req.userId);
    const userInChat = await isUserInChat(chatMessage.chatRoomId, req.userId);

    if (!userIsAdmin && !userInChat) {
      return res.status(403).json({ err: true, msg: 'User not authorized to update this message.' });
    }

    const validationResult = validateText(message || chatMessage.message);
    if (!validationResult.isValid) {
      return res.status(400).json({ err: true, msg: validationResult.msg });
    }

    await chatMessage.update({ message: validationResult.comment || ' ', visibility, isActive, edited, imageUrls, likeUserIds });

    await processMentions(validationResult.comment, req.userId, 'ChatRoom', chatMessage.chatRoomId);

    // --- SOCKET: Notify all participants of the update ---
    const chatRoomParticipants = await ChatParticipant.findAll({ where: { chatRoomId: chatMessage.chatRoomId } });
    for (const participant of chatRoomParticipants) {
      socket.sendToSpecific(participant.userId, 'updateChatRoomCount', { chatMessage });
      socket.sendToSpecific(participant.userId, 'newMessage', { chatMessage });
    }

    res.status(200).json({ err: false, msg: 'Chat message updated successfully', chatMessage });
  } catch (error) {
    console.error('Error updating chat message:', error);
    res.status(500).json({ err: true, msg: 'Failed to update chat message.', error: error.message });
  }
};

const updateChatMessageLike = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.userId;

    if (!id) {
      return res.status(400).json({ err: true, msg: 'Chat message ID is required.' });
    }

    const chatMessage = await ChatMessage.findByPk(id);

    if (!chatMessage) {
      return res.status(404).json({ err: true, msg: 'Chat message not found.' });
    }
    // Ensure the chat message belongs to an active chat room
    const chatRoom = await ChatRoom.findByPk(chatMessage.chatRoomId, {
      where: {
        isActive: true // Ensure we only fetch active chat rooms
      }
    });
    if (!chatRoom) {
      // Chat room not found or was archived
      return res.status(404).json({ err: true, msg: 'Chat room not found. Or it was archived.' });
    }
    const userIsAdmin = await isAdmin(req.userId);
    const userInChat = await isUserInChat(chatMessage.chatRoomId, req.userId);

    if (!userIsAdmin && !userInChat) {
      return res.status(403).json({ err: true, msg: 'User not authorized to update this message.' });
    }

    let likeUserIds = chatMessage.likeUserIds || [];
    if (!Array.isArray(likeUserIds)) {
      likeUserIds = []; // Ensure it's an array if stored incorrectly
    }

    if (likeUserIds.includes(userId)) {
      // If the user already liked, remove their ID
      likeUserIds = likeUserIds.filter((id) => id !== userId);
    } else {
      // Otherwise, add their ID
      likeUserIds.push(userId);
    }

    // Update the likeUserIds field and save it to the database
    chatMessage.likeUserIds = JSON.stringify(likeUserIds); // Ensure proper serialization
    await chatMessage.save();

    // --- SOCKET: Notify all participants of the like update ---
    const chatRoomParticipants = await ChatParticipant.findAll({ where: { chatRoomId: chatMessage.chatRoomId } });
    for (const participant of chatRoomParticipants) {
      socket.sendToSpecific(participant.userId, 'updateChatRoomCount', { chatMessage });
      socket.sendToSpecific(participant.userId, 'newMessage', { chatMessage });
    }

    return res.status(200).json({
      err: false,
      msg: 'Like status updated successfully',
      chatMessage,
    });
  } catch (error) {
    console.error('Error updating chat message like:', error);
    res.status(500).json({ err: true, msg: 'Failed to update chat message like.', error: error.message });
  }
};
const deleteChatRoom = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ err: true, msg: 'Chat room ID is required.' });
    }

    const chatRoom = await ChatRoom.findByPk(id);

    if (!chatRoom) {
      return res.status(404).json({ err: true, msg: 'Chat room not found.' });
    }

    const userIsAdmin = await isAdmin(req.userId);
    const userInChat = await isUserInChat(id, req.userId);

    if (!userIsAdmin && !userInChat) {
      return res.status(403).json({ err: true, msg: 'User not authorized to delete this chat room.' });
    }

    await chatRoom.destroy();

    res.status(200).json({ err: false, msg: 'Chat room deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat room:', error);
    res.status(500).json({ err: true, msg: 'Failed to delete chat room.', error: error.message });
  }
};
const deleteChatMessage = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ err: true, msg: 'Chat message ID is required.' });
    }

    const chatMessage = await ChatMessage.findByPk(id);

    if (!chatMessage) {
      return res.status(404).json({ err: true, msg: 'Chat message not found.' });
    }

    const userIsAdmin = await isAdmin(req.userId);
    const userInChat = await isUserInChat(chatMessage.chatRoomId, req.userId);

    if (!userIsAdmin && !userInChat) {
      return res.status(403).json({ err: true, msg: 'User not authorized to delete this message.' });
    }

    await chatMessage.destroy();

    res.status(200).json({ err: false, msg: 'Chat message deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat message:', error);
    res.status(500).json({ err: true, msg: 'Failed to delete chat message.', error: error.message });
  }
};

module.exports = {
  createChatRoom,
  createChatMessage,
  listChatRooms,
  listChatMessages,
  updateChatRoom,
  updateChatMessage,
  updateChatMessageLike,
  deleteChatRoom,
  deleteChatMessage,
};
