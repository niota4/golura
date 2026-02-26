const env = process.env;
const _ = require('lodash');
const { Sequelize, Op } = require('sequelize');
const { 
    Event, 
    EventType, 
    EventStatus, 
    EventParticipant,
    EventCategory,
    EventActivity,
    EventComment,
    RecurrencePattern,
    EventReminderType,
    Reminder,
    Address,
    User, 
    UserPreference,
    Client,
    ClientAddress,
    ClientEmail,
    ClientPhoneNumber,
    State,
    ReminderType,
    Notification,
    Priority,
    Role, 
    Group,
    UserGroup,
    Image, 
    Video 
} = require('../models');
const { validateText } = require('../helpers/validate');
const { createNotification, updateNotification } = require('./notifications');
const { getEventNotificationUsers, sendNotificationsToUsers } = require('../helpers/notificationHelpers');

function capitalizeName(name) {
    return name.replace(/\b\w/g, char => char.toUpperCase());
}
const processMentions = async (comment, userId, relatedModel, relatedModelId) => {
    if (typeof comment !== 'string') return; // Safeguard for undefined/null
    const mentionPattern = /\[\[{"id":(\d+),"value":"([^"]+)","display":"([^"]+)","prefix":"@"}\]\]/g;
    const matches = comment.matchAll(mentionPattern);

    for (const match of matches) {
        const targetUserId = parseInt(match[1], 10);
        const user = await User.findOne({ where: { id:userId} });

        // Skip if targetUserId is invalid or the same as the current user
        if (!targetUserId || targetUserId === userId) continue;

        // Construct the notification payload
        const notificationPayload = {
            userId, // The user who mentioned
            targetUserId, // The user being mentioned
            relatedModel,
            relatedModelId,
            type: 'mention',
            priorityId: 1, // Assuming 1 is the default priority
            title: 'You were mentioned in a comment',
            message: capitalizeName(user.firstName) + ' ' + capitalizeName(user.lastName) + ` mentioned you in a comment.`,
        };
        // Use the createNotification function
        await createNotification({
            body: notificationPayload,
        });
    }
};
const getEventComments = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ err: true, msg: 'Event ID is required' });
        }

        // Fetch all comments for the event, sorted by DESC
        const allComments = await EventComment.findAll({
            where: { eventId: id, isActive: true },
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'profilePictureUrl'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ],
                },
            ],
            order: [['createdAt', 'DESC']], // Fetch newest first
        });

        // Organize comments into a tree structure
        const commentMap = new Map();
        const rootComments = [];

        // First pass: Create map entries for all comments
        allComments.forEach(comment => {
            comment.dataValues.replies = []; // Initialize replies array
            commentMap.set(comment.id, comment);
        });

        // Second pass: Populate replies and root comments
        allComments.forEach(comment => {
            if (comment.parentCommentId) {
                const parent = commentMap.get(comment.parentCommentId);
                if (parent) {
                    parent.dataValues.replies.push(comment); // Push replies to their parent
                } else {
                    console.warn(`Parent comment not found for comment ID: ${comment.id}`);
                }
            } else {
                rootComments.push(comment); // Add root comments
            }
        });

        // Sort replies recursively by createdAt in descending order
        const sortCommentsByDate = comments => {
            return comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(comment => {
                comment.dataValues.replies = sortCommentsByDate(comment.dataValues.replies);
                return comment;
            });
        };

        const sortedRootComments = sortCommentsByDate(rootComments);

        // Include like user details
        const userIdsToFetch = [
            ...new Set(allComments.flatMap(comment => comment.likeUserIds || []))
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
        allComments.forEach(comment => {
            comment.dataValues.likedUsers = (comment.likeUserIds || []).map(userId => likedUserMap[userId]);
        });

        return res.status(200).json({
            err: false,
            msg: 'Event comments retrieved successfully',
            comments: sortedRootComments, // Return only root-level comments with sorted nested replies
        });
    } catch (error) {
        console.error('Error fetching event comments:', error);
        return res.status(500).json({ err: true, msg: 'Failed to fetch comments' });
    }
};
const createEventComment = async (req, res) => {
    try {
        const userId = req.userId;
        const { eventId, comment, parentCommentId, visibility, imageUrls } = req.body;

        if (!comment && !imageUrls) {
            return res.status(400).json({ err: true, msg: 'Missing a comment' });
        }

        // Validate and reformat the comment
        const validationResult = validateText(comment);
        if (!validationResult.isValid) {
            return res.status(400).json({ err: true, msg: validationResult.msg });
        }

        const newComment = await EventComment.create({
            eventId,
            userId,
            comment: validationResult.comment || ' ',
            parentCommentId: parentCommentId || null,
            visibility: visibility || 'public',
            imageUrls: imageUrls || null,
            isActive: true,
        });

        // Process mentions to create notifications
        await processMentions(validationResult.comment, userId, 'Event', eventId);

        // Notify all event participants about the new comment
        try {
            const event = await Event.findByPk(eventId);
            if (event) {
                const participants = await EventParticipant.findAll({
                    where: { eventId: eventId },
                    include: [{ model: User, as: 'User' }]
                });
                
                const participantIds = participants.map(p => p.userId).filter(id => id);
                const assignedUserIds = [event.targetUserId, event.userId].filter(id => id);
                
                const usersToNotify = await getEventNotificationUsers(
                    req.companyId,
                    participantIds,
                    assignedUserIds,
                    event.clientId
                );
                
                const priority = await Priority.findOne({ where: { name: 'medium' } }) || { id: 2 };
                const commenter = await User.findByPk(userId);
                
                const message = `${commenter ? commenter.firstName + ' ' + commenter.lastName : 'Someone'} commented on event "${event.title}"`;
                
                await sendNotificationsToUsers(
                    usersToNotify,
                    {
                        userId: userId,
                        relatedModel: 'events',
                        relatedModelId: eventId,
                        priorityId: priority.id,
                        title: 'New Event Comment',
                        message: message,
                        type: 'general'
                    },
                    userId // Don't notify the commenter
                );
            }
        } catch (notificationError) {
            console.error('Error creating event comment notifications:', notificationError);
        }

        const createdComment = await EventComment.findByPk(newComment.id, {
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'profilePictureUrl'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ],
                },
            ],
        });

        return res.status(201).json({
            err: false,
            msg: 'Comment created successfully',
            comment: createdComment,
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        return res.status(500).json({ err: true, msg: 'Failed to create comment' });
    }
};
const updateEventComment = async (req, res) => {
    try {
        const { id, comment, visibility, isActive, imageUrls, edited } = req.body;
        const userId = req.userId;

        if (!id) {
            return res.status(400).json({ err: true, msg: 'Comment ID is required' });
        }

        // Find the existing comment
        const existingComment = await EventComment.findByPk(id);
        if (!existingComment) {
            return res.status(404).json({ err: true, msg: 'Comment not found' });
        }

        // Validate and reformat the updated comment
        const validationResult = validateText(comment || existingComment.comment);
        if (!validationResult.isValid) {
            return res.status(400).json({ err: true, msg: validationResult.msg });
        }

        // Extract existing mentions from the current comment
        const existingMentions = [];
        const mentionPattern = /\[\[{"id":(\d+),"value":"([^"]+)","display":"([^"]+)","prefix":"@"}\]\]/g;
        let match;
        while ((match = mentionPattern.exec(existingComment.comment)) !== null) {
            existingMentions.push(parseInt(match[1], 10));
        }

        // Extract new mentions from the updated comment
        const newMentions = [];
        mentionPattern.lastIndex = 0; // Reset regex position for new comment
        while ((match = mentionPattern.exec(validationResult.comment)) !== null) {
            const targetUserId = parseInt(match[1], 10);
            if (!existingMentions.includes(targetUserId)) {
                newMentions.push(targetUserId);
            }
        }

        // Process only new mentions
        for (const targetUserId of newMentions) {
            if (targetUserId !== userId) { // Skip if the mention is the same as the user updating the comment
                const user = await User.findOne({ where: { id: userId } });

                const notificationPayload = {
                    userId,
                    targetUserId,
                    relatedModel: 'Event',
                    relatedModelId: existingComment.eventId,
                    type: 'mention',
                    priorityId: 1,
                    title: 'You were mentioned in a comment',
                    message: `${user.firstName} ${user.lastName} mentioned you in a comment.`,
                };

                await createNotification({ body: notificationPayload });
            }
        }

        // Update the comment
        existingComment.comment = validationResult.comment;
        existingComment.visibility = visibility !== undefined ? visibility : existingComment.visibility;
        existingComment.isActive = isActive !== undefined ? isActive : existingComment.isActive;
        existingComment.imageUrls = imageUrls !== undefined ? imageUrls : existingComment.imageUrls;
        existingComment.edited = edited !== undefined ? edited : true;
        await existingComment.save();

        // Fetch the updated comment with related data
        const updatedComment = await EventComment.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'profilePictureUrl'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ],
                },
            ],
        });

        return res.status(200).json({
            err: false,
            msg: 'Comment updated successfully',
            comment: updatedComment,
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        return res.status(500).json({ err: true, msg: 'Failed to update comment' });
    }
};
const updateEventCommentLike = async (req, res) => {
    try {
        const { id } = req.body; // Comment ID
        const userId = req.userId; // Assume `userId` comes from middleware

        if (!id) {
            return res.status(400).json({ err: true, msg: 'Comment ID is required' });
        }

        const comment = await EventComment.findByPk(id);

        if (!comment) {
            return res.status(404).json({ err: true, msg: 'Comment not found' });
        }

        let likeUserIds = comment.likeUserIds || [];
        if (!Array.isArray(likeUserIds)) {
            likeUserIds = []; // Ensure it's an array if stored incorrectly
        }

        if (likeUserIds.includes(userId)) {
            // If the user already liked, remove their ID
            likeUserIds = likeUserIds.filter((id) => id !== userId);

            await comment.update({ likeUserIds });

            return res.status(200).json({
                err: false,
                msg: 'Like removed successfully',
                comment,
            });
        } else {
            // Otherwise, add their ID
            likeUserIds.push(userId);

            await comment.update({ likeUserIds });

            // Do not create a notification if the liker is the author
            if (userId !== comment.userId) {
                const likeMessage = `[${likeUserIds.join(', ')}] liked your comment.`;

                // Check if a notification exists
                const notification = await Notification.findOne({
                    where: {
                        relatedModel: 'Event',
                        relatedModelId: comment.eventId, // Assuming eventId is a field in the comment
                        userId: comment.userId, // User who owns the comment
                    },
                });

                if (likeUserIds.length === 1) {
                    // Create a new notification if only one user liked
                    await createNotification({
                        body: {
                            userId,
                            targetUserId: comment.userId, // Assuming `comment.userId` is the author of the comment
                            relatedModel: 'Event',
                            relatedModelId: comment.eventId,
                            type: 'like',
                            priorityId: 1, // Default priority
                            title: 'Your comment was liked',
                            message: likeMessage,
                        },
                    });
                } else {
                    // Update existing notification or create a new one
                    if (notification) {
                        await updateNotification({
                            id: notification.id,
                            body: {
                                message: likeMessage,
                                read: false, // Mark as unread
                            },
                        });
                    } else {
                        await createNotification({
                            body: {
                                userId,
                                targetUserId: comment.userId,
                                relatedModel: 'Event',
                                relatedModelId: comment.eventId,
                                type: 'like',
                                priorityId: 1,
                                title: 'Your comment was liked',
                                message: likeMessage,
                            },
                        });
                    }
                }
            }

            return res.status(200).json({
                err: false,
                msg: 'Like added successfully',
                comment,
            });
        }
    } catch (error) {
        return res.status(500).json({ err: true, msg: 'Failed to update comment like' });
    }
};
const archiveEventComment = async (req, res) => {
    try {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ err: true, msg: 'Comment ID is required' });
    }

    const comment = await EventComment.findByPk(id);

    if (!comment) {
        return res.status(404).json({ err: true, msg: 'Comment not found' });
    }

    if (!comment.isActive) {
        return res.status(400).json({ err: true, msg: 'Comment is already archived' });
    }

    comment.isActive = false; // Archive the comment
    await comment.save();

    return res.status(200).json({
        err: false,
        msg: 'Comment archived successfully',
    });
    } catch (error) {
        console.error('Error archiving comment:', error);
        return res.status(500).json({
            err: true,
            msg: 'Failed to archive comment',
        });
    }
};

  module.exports = {
    getEventComments,
    createEventComment,
    updateEventComment,
    updateEventCommentLike,
    archiveEventComment
};

