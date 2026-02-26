/**
 * Activity Logging Helper
 * 
 * This helper provides convenient methods to log activities throughout the application.
 * It centralizes activity logging and ensures consistent formatting.
 */

// Direct model import to avoid circular dependencies
const { Activity, User } = require('../models');
const { MeiliSearch } = require('meilisearch');
const { updateActivities } = require('../sockets'); // Import socket update function

const env = process.env;
const meiliClient = new MeiliSearch({
  host: env.MEILI_HOST || 'http://localhost:7700',
  apiKey: env.MEILI_API_KEY
});

// Create an activity record and optionally index it in MeiliSearch
const logActivity = async (userId, activityType, entityId, action, description, metadata = {}, options = {}) => {
  try {
    const activity = await Activity.create({
      userId,
      activityType,
      entityId,
      action,
      description,
      metadata,
      severity: options.severity || 'low',
      tags: options.tags || null,
      isSystemGenerated: options.isSystemGenerated || false,
      ipAddress: options.ipAddress || null,
      userAgent: options.userAgent || null
    });

    // Try to index in MeiliSearch (fail silently if not configured)
    try {
      const user = await User.findByPk(activity.userId, {
        attributes: ['firstName', 'lastName', 'email']
      });

      const searchableActivity = {
        id: activity.id,
        userId: activity.userId,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        userEmail: user ? user.email : '',
        activityType: activity.activityType,
        entityId: activity.entityId,
        action: activity.action,
        description: activity.description,
        severity: activity.severity,
        tags: activity.tags || [],
        isSystemGenerated: activity.isSystemGenerated,
        isVisible: activity.isVisible,
        createdAt: activity.createdAt.getTime(),
        searchText: `${activity.activityType} ${activity.action} ${activity.description || ''} ${user ? user.firstName + ' ' + user.lastName : ''}`.toLowerCase()
      };

      await meiliClient.index('activities').addDocuments([searchableActivity]);
    } catch (meiliErr) {
      // Silently fail if MeiliSearch is not available
      // MeiliSearch indexing skipped (not available)
    }

    updateActivities(userId, searchableActivity);
    
    return activity;
    
  } catch (err) {
    console.error('Error logging activity:', err);
    return null;
  }
};

class ActivityLogger {
  
  // Client-related activities
  static async logClientActivity(userId, clientId, action, description = null, metadata = {}, options = {}) {
    return await logActivity(
      userId,
      'client',
      clientId,
      action,
      description || `Client ${action}`,
      { ...metadata, clientId },
      { severity: 'low', ...options }
    );
  }

  static async logClientCreated(userId, clientId, clientData) {
    return await this.logClientActivity(
      userId,
      clientId,
      'created',
      `Created new client: ${clientData.firstName} ${clientData.lastName}`,
      { clientData: { firstName: clientData.firstName, lastName: clientData.lastName, email: clientData.email } }
    );
  }

  static async logClientUpdated(userId, clientId, oldData, newData) {
    const changes = this._getChanges(oldData, newData);
    return await this.logClientActivity(
      userId,
      clientId,
      'updated',
      `Updated client: ${Object.keys(changes).join(', ')}`,
      { changes, oldData, newData },
      { severity: 'medium' }
    );
  }

  // Estimate-related activities
  static async logEstimateActivity(userId, estimateId, action, description = null, metadata = {}, options = {}) {
    return await logActivity(
      userId,
      'estimate',
      estimateId,
      action,
      description || `Estimate ${action}`,
      { ...metadata, estimateId },
      { severity: 'medium', ...options }
    );
  }

  static async logEstimateCreated(userId, estimateId, estimateData) {
    return await this.logEstimateActivity(
      userId,
      estimateId,
      'created',
      `Created estimate #${estimateData.estimateNumber} for ${estimateData.clientName}`,
      { estimateNumber: estimateData.estimateNumber, clientName: estimateData.clientName, amount: estimateData.amount }
    );
  }

  static async logEstimateStatusChanged(userId, estimateId, oldStatus, newStatus, estimateNumber) {
    return await this.logEstimateActivity(
      userId,
      estimateId,
      'status_changed',
      `Changed estimate #${estimateNumber} status from ${oldStatus} to ${newStatus}`,
      { oldStatus, newStatus, estimateNumber },
      { severity: 'high' }
    );
  }

  static async logEstimateSent(userId, estimateId, recipientEmail, estimateNumber) {
    return await this.logEstimateActivity(
      userId,
      estimateId,
      'sent',
      `Sent estimate #${estimateNumber} to ${recipientEmail}`,
      { recipientEmail, estimateNumber, sentAt: new Date().toISOString() },
      { severity: 'medium' }
    );
  }

  // Event-related activities
  static async logEventActivity(userId, eventId, action, description = null, metadata = {}, options = {}) {
    return await logActivity(
      userId,
      'event',
      eventId,
      action,
      description || `Event ${action}`,
      { ...metadata, eventId },
      { severity: 'medium', ...options }
    );
  }

  static async logEventCreated(userId, eventId, eventData) {
    return await this.logEventActivity(
      userId,
      eventId,
      'created',
      `Created event: ${eventData.title} on ${eventData.scheduledDate}`,
      { title: eventData.title, scheduledDate: eventData.scheduledDate, eventType: eventData.eventType }
    );
  }

  static async logEventScheduled(userId, eventId, eventTitle, scheduledDate) {
    return await this.logEventActivity(
      userId,
      eventId,
      'scheduled',
      `Scheduled event: ${eventTitle} for ${scheduledDate}`,
      { eventTitle, scheduledDate },
      { severity: 'high' }
    );
  }

  static async logEventCompleted(userId, eventId, eventTitle) {
    return await this.logEventActivity(
      userId,
      eventId,
      'completed',
      `Completed event: ${eventTitle}`,
      { eventTitle, completedAt: new Date().toISOString() },
      { severity: 'high' }
    );
  }

  // Work Order activities
  static async logWorkOrderActivity(userId, workOrderId, action, description = null, metadata = {}, options = {}) {
    return await logActivity(
      userId,
      'workOrder',
      workOrderId,
      action,
      description || `Work order ${action}`,
      { ...metadata, workOrderId },
      { severity: 'medium', ...options }
    );
  }

  static async logWorkOrderCreated(userId, workOrderId, workOrderData) {
    return await this.logWorkOrderActivity(
      userId,
      workOrderId,
      'created',
      `Created work order #${workOrderData.workOrderNumber} for ${workOrderData.clientName}`,
      { workOrderNumber: workOrderData.workOrderNumber, clientName: workOrderData.clientName }
    );
  }

  // Invoice activities
  static async logInvoiceActivity(userId, invoiceId, action, description = null, metadata = {}, options = {}) {
    return await logActivity(
      userId,
      'invoice',
      invoiceId,
      action,
      description || `Invoice ${action}`,
      { ...metadata, invoiceId },
      { severity: 'high', ...options }
    );
  }

  static async logInvoiceCreated(userId, invoiceId, invoiceData) {
    return await this.logInvoiceActivity(
      userId,
      invoiceId,
      'created',
      `Created invoice #${invoiceData.invoiceNumber} for ${invoiceData.clientName} - $${invoiceData.amount}`,
      { invoiceNumber: invoiceData.invoiceNumber, clientName: invoiceData.clientName, amount: invoiceData.amount }
    );
  }

  static async logPaymentReceived(userId, invoiceId, paymentAmount, invoiceNumber) {
    return await this.logInvoiceActivity(
      userId,
      invoiceId,
      'payment_received',
      `Received payment of $${paymentAmount} for invoice #${invoiceNumber}`,
      { paymentAmount, invoiceNumber, receivedAt: new Date().toISOString() },
      { severity: 'high' }
    );
  }

  // Communication activities
  static async logCommunicationActivity(userId, entityType, entityId, action, description = null, metadata = {}, options = {}) {
    return await logActivity(
      userId,
      'communication',
      entityId,
      action,
      description || `Communication ${action}`,
      { ...metadata, originalEntityType: entityType },
      { severity: 'medium', ...options }
    );
  }

  static async logEmailSent(userId, entityType, entityId, recipientEmail, subject) {
    return await this.logCommunicationActivity(
      userId,
      entityType,
      entityId,
      'email_sent',
      `Sent email to ${recipientEmail}: ${subject}`,
      { recipientEmail, subject, originalEntityType: entityType, sentAt: new Date().toISOString() }
    );
  }

  static async logSMSSent(userId, entityType, entityId, phoneNumber, message) {
    return await this.logCommunicationActivity(
      userId,
      entityType,
      entityId,
      'sms_sent',
      `Sent SMS to ${phoneNumber}`,
      { phoneNumber, message: message.substring(0, 100), originalEntityType: entityType, sentAt: new Date().toISOString() }
    );
  }

  // System activities
  static async logSystemActivity(action, description, metadata = {}, options = {}) {
    return await logActivity(
      1, // System user ID
      'system',
      null,
      action,
      description,
      metadata,
      { isSystemGenerated: true, severity: 'low', ...options }
    );
  }

  static async logUserLogin(userId, ipAddress, userAgent) {
    return await logActivity(
      userId,
      'user',
      userId,
      'logged_in',
      'User logged in',
      { loginTime: new Date().toISOString() },
      { ipAddress, userAgent, severity: 'low' }
    );
  }

  static async logUserLogout(userId, ipAddress) {
    return await logActivity(
      userId,
      'user',
      userId,
      'logged_out',
      'User logged out',
      { logoutTime: new Date().toISOString() },
      { ipAddress, severity: 'low' }
    );
  }

  // File/Document activities
  static async logFileUploaded(userId, entityType, entityId, fileName, fileSize) {
    return await logActivity(
      userId,
      'document',
      entityId,
      'file_uploaded',
      `Uploaded file: ${fileName}`,
      { fileName, fileSize, originalEntityType: entityType, uploadedAt: new Date().toISOString() },
      { severity: 'medium' }
    );
  }

  static async logFileDeleted(userId, entityType, entityId, fileName) {
    return await logActivity(
      userId,
      'document',
      entityId,
      'file_deleted',
      `Deleted file: ${fileName}`,
      { fileName, originalEntityType: entityType, deletedAt: new Date().toISOString() },
      { severity: 'medium' }
    );
  }

  // Utility method to detect changes between objects
  static _getChanges(oldData, newData) {
    const changes = {};
    
    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          from: oldData[key],
          to: newData[key]
        };
      }
    }
    
    return changes;
  }

  // Method to log custom activities with tags
  static async logCustomActivity(userId, activityType, entityId, action, description, options = {}) {
    return await logActivity(
      userId,
      activityType,
      entityId,
      action,
      description,
      options.metadata || {},
      {
        severity: options.severity || 'low',
        tags: options.tags || [],
        isSystemGenerated: options.isSystemGenerated || false,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent
      }
    );
  }
}

module.exports = ActivityLogger;
