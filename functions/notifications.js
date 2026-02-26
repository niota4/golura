const { Notification, User, Priority, UserDevice } = require('../models');
const {
    Sequelize,
    Op
} = require('sequelize');

const createNotification = async ({ body }) => {
    try {
        const { userId, targetUserId, relatedModel, relatedModelId, priorityId, title, type, message } = body;

        if (!userId || !targetUserId || !relatedModel || !relatedModelId || !priorityId || !title || !message) {
            throw new Error('Missing required fields.');
        }

        const newNotification = await Notification.create({
            userId,
            targetUserId,
            relatedModel,
            relatedModelId,
            priorityId,
            title,
            type,
            message,
        });

        return {
            err: false,
            msg: 'Notification created successfully',
            notification: newNotification,
        };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { err: true, msg: 'Failed to create notification.', error: error.message };
    }
};
const updateNotification = async ({ id, body }) => {
    try {
        const { read, message } = body;

        if (!id) {
            throw new Error('Notification ID is required.');
        }

        const notification = await Notification.findByPk(id);

        if (!notification) {
            throw new Error('Notification not found.');
        }

        await notification.update({ ...(read !== undefined && { read }), ...(message && { message }) });
        
        return {
            err: false,
            msg: 'Notification updated successfully',
            notification,
        };
    } catch (error) {
        console.error('Error updating notification:', error);
        return { err: true, msg: 'Failed to update notification.', error: error.message };
    }
};
const readNotification = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            throw new Error('Notification ID is required.');
        }

        const notification = await Notification.findByPk(id);

        await notification.update(
            {
                read: true,
                readAt: new Date()
            }
        );

        res.status(200).json({
            err: false,
            msg: 'Notification read',
        });
    } catch (err) {
        console.error('Error reading notification:', err);
        res.status(500).json({ err: true, msg: 'Failed to reading notification.', err: err.message });
    }
};
const archiveNotification = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ err: true, msg: 'Notification ID is required.' });
        }

        const notification = await Notification.findByPk(id);

        if (!notification) {
            return res.status(404).json({ err: true, msg: 'Notification not found.' });
        }

        await notification.destroy();

        res.status(200).json({
            err: false,
            msg: 'Notification deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting notification:', err);
        res.status(500).json({ err: true, msg: 'Failed to delete notification.', err: err.message });
    }
};
async function sendExpoPushNotification(expoPushToken, { title, body, data }) {
  if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken')) {
    throw new Error('Invalid Expo push token');
  }
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  console.log('Push notification response:', response);
  const result = await response.json();
  if (result.errors) {
    throw new Error(JSON.stringify(result.errors));
  }
  return result;
};
async function sendPushNotificationIfNeeded(userId, message, data) {
  try {
    // Only send for certain message types, e.g. 'newMessage' or 'notification'
    if (message === 'newMessage' || message === 'notification') {
      const userDevices = await UserDevice.findAll({
        where: {
          userId,
          pushToken: { [Sequelize.Op.ne]: null }
        }
      });
      if (userDevices && userDevices.length > 0) {
        const title = data.title || 'New Notification';
        const body = data.body || data.message || '';
        for (const device of userDevices) {
          if (device.pushToken && device.pushToken.startsWith('ExponentPushToken')) {
            try {
              await sendExpoPushNotification(device.pushToken, {
                title,
                body,
                data,
              });
            } catch (err) {
              console.error('Push notification error (device):', err.message);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Push notification error:', err.message);
  }
};

module.exports = {
    createNotification,
    updateNotification,
    readNotification,
    archiveNotification,
    sendExpoPushNotification,
    sendPushNotificationIfNeeded
};
