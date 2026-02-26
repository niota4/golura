const { 
  Reminder, 
  User, 
  Email,
  PhoneNumber,
  Client,
  ClientPhoneNumber, 
  ClientEmail, 
  ReminderType, 
  UserReminder,
  Estimate,
  EstimateStatus,
} = require('../models');
const { sendTextMessage } = require('./twilio');
const { sendEmail } = require('./emails');
const { Sequelize, Op } = require('sequelize');
const { sendInternalEmail } = require('./mailGun');

const checkAndSendReminders = async () => {
  try {
    const reminders = await Reminder.findAll({
      where: {
        completedAt: null,
        date: {
          [Op.lte]: new Date()
        }
      },
      include: [
        { model: User, as: 'User' },
        { model: UserReminder, as: 'UserReminder' },
        { model: ReminderType, as: 'ReminderType' },
        { model: Client, as: 'Client',
            include: [
                { model: ClientPhoneNumber, as: 'ClientPhoneNumbers' },
                { model: ClientEmail, as: 'ClientEmails' }
            ]
         },
      ]
    });

    for (const reminder of reminders) {
      const { User, ReminderType, Client, UserReminder } = reminder;

      // Skip reminders with inactive UserReminder
      if (UserReminder && !UserReminder.isActive) {
        continue;
      }

      if (ReminderType.name.toLowerCase() === 'email') {
        if (User && User.email) {
          await sendInternalEmail(User.email, 'Reminder: Your Scheduled Event is Coming Up!', 'userReminder', {
            userName: User.firstName,
            reminderTitle: reminder.title,
            reminderDate: reminder.date,
            reminderDescription: reminder.description || '',
          });
        } else if (Client) {
          const clientEmail = await ClientEmail.findByPk(reminder.emailId);
          if (clientEmail) {
            await sendEmail(clientEmail.email, 'Reminder', reminder.description);
          }
        } else if (reminder.emailId && !Client && !User) {
          const email = await Email.findByPk(reminder.emailId);
          if (email) {
            await sendEmail(email.email, 'Reminder', reminder.description);
          }
        }
      }

      // Mark the reminder as completed
      reminder.completedAt = new Date();
      // complete the user reminder
      if (UserReminder) {
        UserReminder.completedAt = new Date();
        await UserReminder.save();
      }
      await reminder.save();
    }
  } catch (error) {
    console.error('Error checking and sending reminders:', error);
  }
};

// Check for overdue or unviewed estimates and send reminders
const checkEstimateReminders = async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find estimates that need reminders
    const estimatesNeedingReminders = await Estimate.findAll({
      where: {
        isActive: true,
        createdAt: {
          [Op.lte]: threeDaysAgo
        },
        [Op.or]: [
          // Unviewed estimates after 3 days
          {
            firstViewedAt: null,
            createdAt: {
              [Op.lte]: threeDaysAgo
            }
          },
          // Viewed but no response after 7 days
          {
            firstViewedAt: {
              [Op.ne]: null,
              [Op.lte]: sevenDaysAgo
            }
          }
        ]
      },
      include: [
        { 
          model: EstimateStatus, 
          as: 'EstimateStatus',
          where: {
            name: {
              [Op.in]: ['active', 'pending', 'viewed'] // Only active estimates
            }
          }
        },
        {
          model: Client,
          as: 'Client',
          include: [
            { model: ClientEmail, as: 'ClientEmails' },
            { model: ClientPhoneNumber, as: 'ClientPhoneNumbers' }
          ]
        },
        {
          model: User,
          as: 'AssignedUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    for (const estimate of estimatesNeedingReminders) {
      const { Client, AssignedUser } = estimate;
      
      // Determine reminder type based on estimate status
      let reminderType = 'follow_up';
      let reminderMessage = '';
      
      if (!estimate.firstViewedAt) {
        reminderType = 'unviewed_estimate';
        reminderMessage = `Estimate ${estimate.estimateNumber} has not been viewed by the client yet. Consider following up.`;
      } else {
        reminderType = 'pending_response';
        reminderMessage = `Estimate ${estimate.estimateNumber} was viewed by the client but no response has been received. Consider following up.`;
      }

      // Send notification to assigned user
      if (AssignedUser) {
        const { createNotification } = require('../functions/notifications');
        await createNotification({
          body: {
            userId: null,
            targetUserId: AssignedUser.id,
            relatedModel: 'Estimate',
            relatedModelId: estimate.id,
            priorityId: 1,
            title: 'Estimate Follow-up Reminder',
            type: reminderType,
            message: reminderMessage,
          },
        });
      }

      // Optionally send email reminder to assigned user
      if (AssignedUser && AssignedUser.email) {
        await sendInternalEmail(
          AssignedUser.email,
          'Estimate Follow-up Reminder',
          'estimateReminder',
          {
            userName: AssignedUser.firstName,
            estimateNumber: estimate.estimateNumber,
            clientName: Client ? `${Client.firstName} ${Client.lastName}` : 'Unknown Client',
            reminderMessage,
            estimateUrl: estimate.estimateUrl || '#'
          }
        );
      }
    }

    console.log(`Processed ${estimatesNeedingReminders.length} estimates for reminders`);
  } catch (error) {
    console.error('Error checking estimate reminders:', error);
  }
};

module.exports = {
  checkAndSendReminders,
  checkEstimateReminders
};
