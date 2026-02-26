/**
 * Activity Hooks Helper
 * 
 * This helper provides standardized activity logging hooks that can be
 * added to any Sequelize model to automatically track changes.
 */

/**
 * Creates standardized activity hooks for a model
 * @param {string} activityType - The activity type (client, estimate, event, etc.)
 * @param {Object} options - Configuration options
 * @returns {Object} - Sequelize hooks object
 */
const createActivityHooks = (activityType, options = {}) => {
  const {
    getEntityId = (instance) => instance.id,
    getDescription = {
      created: (instance) => `${activityType} was created`,
      updated: (instance, changes) => `${activityType} was updated`,
      deleted: (instance) => `${activityType} was deleted`
    },
    includeMetadata = true,
    trackFields = [] // Specific fields to track, empty array means track all
  } = options;

  return {
    afterCreate: async (instance, options) => {
      try {
        // Skip activity logging if explicitly requested
        if (options.skipActivityLogging) {
          return;
        }

        // Lazy-load to avoid circular dependency
        const { logActivity } = require('../functions/activities');
        const userId = options.userId || options.context?.userId || options.context?.changedBy || null;
        const entityId = getEntityId(instance);
        const description = typeof getDescription.created === 'function' 
          ? getDescription.created(instance) 
          : getDescription.created;

        const metadata = includeMetadata ? {
          newValues: instance.toJSON(),
          ipAddress: options.context?.ipAddress || null,
          userAgent: options.context?.userAgent || null
        } : {};

        // Skip activity logging if userId is required but not available and no system context
        if (!userId) {
          console.warn(`Skipping activity logging for ${activityType} creation - no user context available`);
          return;
        }

        await logActivity(
          userId,
          activityType,
          entityId,
          'created',
          description,
          metadata,
          {
            severity: 'low',
            isSystemGenerated: !userId,
            ipAddress: options.context?.ipAddress,
            userAgent: options.context?.userAgent
          }
        );
      } catch (error) {
        console.error(`Error logging ${activityType} creation activity:`, error);
      }
    },

    afterUpdate: async (instance, options) => {
      try {
        // Skip activity logging if explicitly requested
        if (options.skipActivityLogging) {
          return;
        }

        // Lazy-load to avoid circular dependency
        const { logActivity } = require('../functions/activities');
        
        const userId = options.userId || options.context?.userId || options.context?.changedBy || null;
        const entityId = getEntityId(instance);
        
        // Get changed fields from context.changes if available, otherwise from instance
        let changes = options.context?.changes || {};
        
        // If no context changes, build from instance changes
        if (Object.keys(changes).length === 0) {
          const changed = instance.changed() || [];
          changed.forEach(field => {
            if (trackFields.length === 0 || trackFields.includes(field)) {
              changes[field] = {
                oldValue: instance._previousDataValues[field],
                newValue: instance.dataValues[field]
              };
            }
          });
        }

        // Only log if there are actual changes
        if (Object.keys(changes).length === 0) return;

        // Skip activity logging if userId is required but not available
        if (!userId) {
          console.warn(`Skipping activity logging for ${activityType} update - no user context available`);
          return;
        }

        const description = typeof getDescription.updated === 'function' 
          ? getDescription.updated(instance, changes) 
          : getDescription.updated;
        const metadata = includeMetadata ? {
          changes,
          previousValues: instance._previousDataValues,
          newValues: instance.dataValues,
          ipAddress: options.context?.ipAddress || null,
          userAgent: options.context?.userAgent || null
        } : { changes };

        await logActivity(
          userId,
          activityType,
          entityId,
          'updated',
          description,
          metadata,
          {
            severity: 'low',
            isSystemGenerated: !userId,
            ipAddress: options.context?.ipAddress,
            userAgent: options.context?.userAgent
          }
        );
      } catch (error) {
        console.error(`Error logging ${activityType} update activity:`, error);
      }
    },

    afterDestroy: async (instance, options) => {
      try {
        // Skip activity logging if explicitly requested
        if (options.skipActivityLogging) {
          return;
        }

        // Lazy-load to avoid circular dependency
        const { logActivity } = require('../functions/activities');
        
        const userId = options.userId || options.context?.userId || options.context?.changedBy || null;
        const entityId = getEntityId(instance);
        const description = typeof getDescription.deleted === 'function' 
          ? getDescription.deleted(instance) 
          : getDescription.deleted;

        const metadata = includeMetadata ? {
          deletedValues: instance.toJSON(),
          ipAddress: options.context?.ipAddress || null,
          userAgent: options.context?.userAgent || null
        } : {};

        // Skip activity logging if userId is required but not available
        if (!userId) {
          console.warn(`Skipping activity logging for ${activityType} deletion - no user context available`);
          return;
        }

        await logActivity(
          userId,
          activityType,
          entityId,
          'deleted',
          description,
          metadata,
          {
            severity: 'medium',
            isSystemGenerated: !userId,
            ipAddress: options.context?.ipAddress,
            userAgent: options.context?.userAgent
          }
        );
      } catch (error) {
        console.error(`Error logging ${activityType} deletion activity:`, error);
      }
    }
  };
};

/**
 * Creates custom activity hooks for complex scenarios
 * @param {string} activityType - The activity type
 * @param {Object} customHooks - Custom hook implementations
 * @returns {Object} - Sequelize hooks object
 */
const createCustomActivityHooks = (activityType, customHooks) => {
  return customHooks;
};

/**
 * Log a custom activity entry
 * @param {string} activityType - The activity type
 * @param {number} entityId - The entity ID
 * @param {string} action - The action performed
 * @param {string} description - Description of the activity
 * @param {Object} metadata - Additional metadata
 * @param {Object} options - Additional options
 */
const logCustomActivity = async (activityType, entityId, action, description, metadata = {}, options = {}) => {
  try {
    // Lazy-load to avoid circular dependency
    const { logActivity } = require('../functions/activities');
    
    await logActivity(
      options.userId || null,
      activityType,
      entityId,
      action,
      description,
      metadata,
      {
        severity: options.severity || 'low',
        isSystemGenerated: options.isSystemGenerated || !options.userId,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        tags: options.tags
      }
    );
  } catch (error) {
    console.error(`Error logging custom ${activityType} activity:`, error);
  }
};

module.exports = {
  createActivityHooks,
  createCustomActivityHooks,
  logCustomActivity
};
