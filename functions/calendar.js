/**
 * Calendar Sync API Functions
 * 
 * These functions provide API endpoints for mobile apps to coordinate
 * calendar synchronization with the server.
 */

const { getUserSyncData, logSync } = require('../helpers/calendar');

/**
 * API endpoint to get calendar sync data for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserCalendarSyncData = async (req, res) => {
  try {
    const userId = req.userId;
    
    logSync(`API request for sync data from user ${userId}`);
    
    const syncData = await getUserSyncData(userId);
    
    if (!syncData) {
      return res.status(404).json({
        err: true,
        msg: 'User not found or calendar sync not enabled'
      });
    }
    
    res.status(200).json({
      err: false,
      msg: 'Calendar sync data retrieved successfully',
      syncData: syncData
    });
    
  } catch (error) {
    logSync(`API error for user sync data: ${error.message}`, 'ERROR');
    res.status(500).json({
      err: true,
      msg: 'Failed to retrieve calendar sync data',
      error: error.message
    });
  }
};

/**
 * API endpoint for mobile apps to report sync status
 * @param {Object} req - Express request object  
 * @param {Object} res - Express response object
 */
const reportSyncStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      syncedEventCount, 
      errorCount, 
      lastSyncTime, 
      syncVersion,
      deviceInfo 
    } = req.body;
    
    logSync(`Sync status report from user ${userId}: ${syncedEventCount} synced, ${errorCount} errors`);
    
    // Here you could store sync status in a database table for monitoring
    // For now, just log it
    
    res.status(200).json({
      err: false,
      msg: 'Sync status recorded successfully'
    });
    
  } catch (error) {
    logSync(`API error for sync status report: ${error.message}`, 'ERROR');
    res.status(500).json({
      err: true,
      msg: 'Failed to record sync status'
    });
  }
};

/**
 * API endpoint to manually trigger sync preparation for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 */
const triggerUserSync = async (req, res) => {
  try {
    const userId = req.userId;
    
    logSync(`Manual sync trigger requested by user ${userId}`);
    
    const syncData = await getUserSyncData(userId);
    
    if (!syncData) {
      return res.status(404).json({
        err: true,
        msg: 'User not found or calendar sync not enabled'
      });
    }
    
    res.status(200).json({
      err: false,
      msg: 'Sync data prepared for manual sync',
      syncData: syncData,
      triggerTime: new Date().toISOString()
    });
    
  } catch (error) {
    logSync(`Manual sync trigger error: ${error.message}`, 'ERROR');
    res.status(500).json({
      err: true,
      msg: 'Failed to trigger sync'
    });
  }
};

module.exports = {
  getUserCalendarSyncData,
  reportSyncStatus,
  triggerUserSync
};
