/**
 * Calendar Sync Helper for Golura Server
 * 
 * This module handles synchronization of events to users' device calendars
 * for users who have enabled the syncCalendar preference.
 * 
 * Note: This is server-side calendar sync coordination. The actual device 
 * calendar integration happens on the mobile app side via expo-calendar.
 * 
 * The server's role is to:
 * - Identify users with sync enabled
 * - Prepare event data for synchronization
 * - Track sync status and history
 * - Coordinate sync requests with mobile apps
 */

const { User, Event, UserPreference } = require('../models');
const { Op } = require('sequelize');

/**
 * Gets all users who have calendar sync enabled
 * @returns {Promise<Array>} Array of users with syncCalendar enabled
 */
async function getUsersWithCalendarSync() {
  try {
    const users = await User.findAll({
      include: [{
        model: UserPreference,
        as: 'Preferences',
        where: {
          syncCalendar: true
        },
        required: true
      }],
      where: {
        isActive: true
      }
    });

    return users;
  } catch (error) {
    console.error('Error fetching users with calendar sync:', error);
    return [];
  }
}

/**
 * Gets events for a specific user within a date range
 * Uses the dedicated calendar sync events function for consistency
 * @param {number} userId - User ID
 * @param {Date} startDate - Start date for event range
 * @param {Date} endDate - End date for event range
 * @returns {Promise<Array>} Array of user events with all associations
 */
async function getUserEvents(userId, startDate = null, endDate = null) {
  try {
    // Default to next 3 months if no date range provided
    if (!startDate) {
      startDate = new Date();
    }
    if (!endDate) {
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);
    }

    // Use the dedicated events function
    const { getEventsForCalendarSync } = require('../functions/events');
    
    // Create a mock request/response to use the existing function
    const mockReq = {
      userId: userId, // Set in the request object, not body
      body: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    };

    let events = [];
    const mockRes = {
      status: () => mockRes,
      json: (data) => {
        if (!data.err && data.events) {
          events = data.events;
        }
        return mockRes;
      }
    };

    await getEventsForCalendarSync(mockReq, mockRes);

    return events;
  } catch (error) {
    console.error(`Error fetching events for user ${userId}:`, error);
    return [];
  }
}

/**
 * Formats event data for calendar sync
 * @param {Object} event - Event object with all associations
 * @returns {Object} Formatted event for sync
 */
function formatEventForSync(event) {
  const eventData = typeof event.toJSON === 'function' ? event.toJSON() : event;
  
  // Format reminder types for mobile app
  const reminderTypes = eventData.reminderTypes || [];

  // Format location from address
  let location = '';
  if (eventData.Address) {
    const addr = eventData.Address;
    const parts = [
      addr.street1,
      addr.street2,
      addr.city,
      addr.State?.abbreviation || addr.state,
      addr.zipCode
    ].filter(Boolean);
    location = parts.join(', ');
  }
  
  return {
    id: eventData.id,
    title: eventData.title || 'Untitled Event',
    details: eventData.details || '',
    description: eventData.details || '',
    startDate: eventData.startDate,
    endDate: eventData.endDate,
    location: location,
    isRecurring: !!eventData.recurring,
    recurring: !!eventData.recurring,
    recurrencePattern: eventData.RecurrencePattern || null,
    RecurrencePattern: eventData.RecurrencePattern || null,
    eventType: eventData.EventType || null,
    EventType: eventData.EventType || null,
    group: eventData.Group || null,
    Group: eventData.Group || null,
    reminderTypes: reminderTypes,
    Address: eventData.Address || null,
    createdAt: eventData.createdAt,
    updatedAt: eventData.updatedAt,
    // Include original event data for compatibility
    ...eventData
  };
}

/**
 * Prepares sync data for all users with calendar sync enabled
 * @returns {Promise<Object>} Sync data organized by user
 */
async function prepareSyncData() {
  try {
    
    const users = await getUsersWithCalendarSync();
    const syncData = {};

    for (const user of users) {
      const events = await getUserEvents(user.id);
      const formattedEvents = events.map(formatEventForSync);
      
      syncData[user.id] = {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        events: formattedEvents,
        syncPreferences: user.Preferences
      };
    }

    return syncData;
  } catch (error) {
    console.error('❌ Error preparing sync data:', error);
    return {};
  }
}

/**
 * Logs calendar sync activity
 * @param {string} message - Log message
 * @param {string} level - Log level (INFO, WARN, ERROR)
 */
function logSync(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [CALENDAR-SYNC] [${level}] ${message}`);
}

/**
 * Main calendar sync coordination function
 */
async function performCalendarSync() {
  try {
    logSync('Starting calendar sync process...');
    
    const syncData = await prepareSyncData();
    const userCount = Object.keys(syncData).length;
    
    if (userCount === 0) {
      logSync('No users with calendar sync enabled found');
      return { success: true, message: 'No sync needed', userCount: 0 };
    }

    // In a real implementation, this is where you would:
    // - Send push notifications to mobile apps to trigger sync
    // - Use a queue system to process sync requests
    // - Store sync data in a temporary table for mobile apps to fetch
    
    // For now, we'll just log the sync data preparation
    logSync(`Prepared sync data for ${userCount} users`);
    
    for (const [userId, userData] of Object.entries(syncData)) {
      logSync(`User ${userId} (${userData.user.firstName} ${userData.user.lastName}): ${userData.events.length} events to sync`);
    }

    // Here you could implement:
    // - Store sync requests in a queue table
    // - Send push notifications to trigger app-side sync
    // - Use WebSocket to notify connected clients
    // - Store sync data in Redis for mobile apps to fetch

    logSync('Calendar sync coordination completed successfully');
    return { 
      success: true, 
      message: 'Sync data prepared successfully', 
      userCount,
      totalEvents: Object.values(syncData).reduce((sum, data) => sum + data.events.length, 0)
    };
    
  } catch (error) {
    logSync(`Calendar sync failed: ${error.message}`, 'ERROR');
    return { err: true, message: error.message, userCount: 0 };
  }
}

/**
 * Gets sync data for a specific user (API endpoint helper)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User's sync data
 */
async function getUserSyncData(userId) {
  try {
    const user = await User.findOne({
      where: { id: userId, isActive: true },
      include: [{
        model: UserPreference,
        as: 'Preferences',
        where: { syncCalendar: true },
        required: true
      }]
    });

    if (!user) {
      return null;
    }

    const events = await getUserEvents(userId);
    const formattedEvents = events.map(formatEventForSync);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      events: formattedEvents,
      syncPreferences: user.Preferences,
      lastSyncCheck: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error getting sync data for user ${userId}:`, error);
    return null;
  }
}

module.exports = {
  getUsersWithCalendarSync,
  getUserEvents,
  formatEventForSync,
  prepareSyncData,
  performCalendarSync,
  getUserSyncData,
  logSync
};
