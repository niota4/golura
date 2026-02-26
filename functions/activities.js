// Load environment variables
require('dotenv').config();

const env = process.env;
const _ = require('lodash');
const { Sequelize, Op } = require('sequelize');
const { MeiliSearch } = require('meilisearch');
const { indexActivity } = require('../helpers/meili');
const { updateActivities } = require('../sockets');
const { hasPermission } = require('../helpers/permissions');
const { ValidationRunner, VALIDATION_SCHEMAS } = require('../helpers/validationSchemas');
const { authenticate, checkPermission } = require('../helpers/validate');
const { createPIIField } = require('../helpers/piiHelper');

const meiliClient = new MeiliSearch({
  host: env.MEILI_HOST,
  apiKey: env.MEILI_API_KEY
});

const getModels = () => {
    const sequelize = require('../config/database');
    const initModels = require('../models/init-models');
    return initModels(sequelize);
};
const getActivities = async (req, res) => {
  try {
    // Validate input parameters
    const validationResult = await ValidationRunner.validate(req.query, 'ACTIVITY_QUERY');
    if (!validationResult.isValid) {
      return res.status(400).json({
        err: true,
        msg: 'Invalid query parameters',
        errors: validationResult.errors
      });
    }

    const models = getModels();
    const { Activity, User } = models;
    
    const userId = req.userId;
    const {
      query = '',
      page = 1,
      limit = 20,
      activityType,
      action,
      severity,
      userId: filterUserId,
      entityId,
      startDate,
      endDate,
      tags,
      includeSystemGenerated = false
    } = req.query;

    // Check permissions using centralized helper
    const hasViewPermission = await hasPermission(userId, 'activities', 'view');
    if (!hasViewPermission) {
      return res.status(403).json({
        err: true,
        msg: 'Insufficient permissions to view activities'
      });
    }

    // If query is provided, use MeiliSearch
    if (query && query.trim().length > 0) {
      const searchFilters = [];
      
      // Add filters based on permissions and query parameters
      if (activityType) searchFilters.push(`activityType = "${activityType}"`);
      if (action) searchFilters.push(`action = "${action}"`);
      if (severity) searchFilters.push(`severity = "${severity}"`);
      if (filterUserId) searchFilters.push(`userId = ${filterUserId}`);
      if (entityId) searchFilters.push(`entityId = ${entityId}`);
      if (!includeSystemGenerated) searchFilters.push('isSystemGenerated = false');
      searchFilters.push('isVisible = true');

      // Date range filter
      if (startDate && endDate) {
        searchFilters.push(`createdAt >= ${new Date(startDate).getTime()} AND createdAt <= ${new Date(endDate).getTime()}`);
      }

      const searchOptions = {
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        filter: searchFilters.length > 0 ? searchFilters.join(' AND ') : undefined,
        sort: ['createdAt:desc']
      };

      const searchResult = await meiliClient.index('activities').search(query.trim(), searchOptions);
      
      return res.status(200).json({
        err: false,
        msg: 'Activities retrieved successfully',
        activities: searchResult.hits,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: searchResult.estimatedTotalHits,
          totalPages: Math.ceil(searchResult.estimatedTotalHits / parseInt(limit))
        }
      });
    }

    // If no query, use database with includes
    const whereClause = {
      isVisible: true
    };

    if (activityType) whereClause.activityType = activityType;
    if (action) whereClause.action = action;
    if (severity) whereClause.severity = severity;
    if (filterUserId) whereClause.userId = filterUserId;
    if (entityId) whereClause.entityId = entityId;
    if (!includeSystemGenerated) whereClause.isSystemGenerated = false;

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (tags) {
      whereClause.tags = {
        [Op.contains]: Array.isArray(tags) ? tags : [tags]
      };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: activities } = await Activity.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePictureUrl']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Apply PII protection to activities
    const protectedActivities = activities.map(activity => {
      const activityData = activity.toJSON();
      if (activityData.User) {
        activityData.User.firstName = createPIIField(activityData.User.firstName, 'firstName');
        activityData.User.lastName = createPIIField(activityData.User.lastName, 'lastName');
        activityData.User.email = createPIIField(activityData.User.email, 'email');
      }
      activityData.description = createPIIField(activityData.description, 'description');
      return activityData;
    });

    res.status(200).json({
      err: false,
      msg: 'Activities retrieved successfully',
      activities: protectedActivities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const getClientActivities = async (req, res) => {
    try {
        // Validate input parameters
        const validationResult = await ValidationRunner.validate(req.body, 'CLIENT_ACTIVITIES');
        if (!validationResult.isValid) {
            return res.status(400).json({
                err: true,
                msg: 'Invalid request parameters',
                errors: validationResult.errors
            });
        }

        // Check permissions using centralized helper
        const hasClientActivitiesPermission = await hasPermission(req.userId, 'clients', 'activities');
        if (!hasClientActivitiesPermission) {
            return res.status(403).json({
                err: true,
                msg: 'Insufficient permissions to view client activities'
            });
        }

        const models = getModels();
        const { ClientActivity, User, UserPreference } = models;
        
        const { id } = req.body;

        // Query ClientActivity with related models
        const activities = await ClientActivity.findAll({
            where: { clientId: id },
            include: [
                {
                    model: User,
                    as: 'ChangedBy',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ],
                },
            ],
            order: [['timestamp', 'DESC']]
        });

        // Human-readable names for related models
        const humanReadableNames = {
            Client: 'Client',
            Address: 'Address',
            Email: 'Email',
            Note: 'Note',
            PhoneNumber: 'Phone Number',
            User: 'User',
        };

        // Transform activities for the response
        const transformedActivities = activities.map((activity) => {
            const formattedName = humanReadableNames[activity.relatedModel] || 'Client Activity';

            return {
                id: activity.id,
                clientId: activity.clientId,
                action: activity.action,
                description: activity.description,
                fieldName: activity.fieldName,
                oldValue: activity.oldValue,
                newValue: activity.newValue,
                formattedName, // Human-readable name
                changedBy: activity.ChangedBy, // User details
                timestamp: activity.timestamp,
                status: activity.status,
                metadata: activity.metadata,
            };
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.status(200).json({
            err: false,
            msg: 'Client activities retrieved successfully',
            activities: transformedActivities,
        });
    } catch (error) {
        console.error('Error retrieving client activities:', error);
        res.status(500).json({
            err: true,
            msg: 'Failed to retrieve client activities',
            error: error.message,
        });
    }
};
const getEventActivities = async (req, res) => {
    try {
        // Validate input parameters
        const validationResult = await ValidationRunner.validate(req.body, 'EVENT_ACTIVITIES');
        if (!validationResult.isValid) {
            return res.status(400).json({
                err: true,
                msg: 'Invalid request parameters',
                errors: validationResult.errors
            });
        }

        // Check permissions using centralized helper
        const hasEventActivitiesPermission = await hasPermission(req.userId, 'events', 'activities');
        if (!hasEventActivitiesPermission) {
            return res.status(403).json({
                err: true,
                msg: 'Insufficient permissions to view event activities'
            });
        }

        const models = getModels();
        const { EventActivity, User, UserPreference } = models;
        
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Event ID is required to fetch activities',
            });
        }

        // Fetch all activities related to the event
        const activities = await EventActivity.findAll({
            where: { eventId: id },
            include: [
                {
                    model: User,
                    as: 'ChangedBy',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ],
                },
            ],
            order: [['timestamp', 'DESC']], // Order by most recent activities
        });

        if (!activities || activities.length === 0) {
            return res.status(200).json({
                err: false,
                msg: 'No activities found for this event',
            });
        }

        // Human-readable names for related models
        const humanReadableNames = {
            Address: 'Address',
            Client: 'Client',
            Group: 'Group',
            ClientEmail: 'Email',
            ClientPhoneNumber: 'Phone Number',
            EventType: 'Event Type',
            EventCategory: 'Event Category',
            Reminder: 'Reminder',
            User: 'User',
            Priority: 'Priority',
        };

        // Transform activities for the response
        const transformedActivities = activities.map((activity) => {
            const formattedName = humanReadableNames[activity.relatedModel] || 'Event';

            return {
                id: activity.id,
                eventId: activity.eventId,
                action: activity.action,
                description: activity.description,
                fieldName: activity.fieldName,
                oldValue: activity.oldValue,
                newValue: activity.newValue,
                formattedName, // Add the human-readable name
                changedBy: activity.ChangedBy, // User details
                timestamp: activity.timestamp,
                status: activity.status,
                metadata: activity.metadata,
            };
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return res.status(200).json({
            err: false,
            msg: 'Event activities successfully retrieved',
            activities: transformedActivities,
        });
    } catch (error) {
        console.error('Error fetching event activities:', error);
        return res.status(500).json({
            err: true,
            msg: 'Failed to retrieve event activities',
            error: error.message,
        });
    }
};
const getEstimateActivities = async (req, res) => {
    try {
        // Validate input parameters
        const validationResult = await ValidationRunner.validate(req.body, 'ESTIMATE_ACTIVITIES');
        if (!validationResult.isValid) {
            return res.status(400).json({
                err: true,
                msg: 'Invalid request parameters',
                errors: validationResult.errors
            });
        }

        // Check permissions using centralized helper
        const hasEstimateActivitiesPermission = await hasPermission(req.userId, 'estimates', 'activities');
        if (!hasEstimateActivitiesPermission) {
            return res.status(403).json({
                err: true,
                msg: 'Insufficient permissions to view estimate activities'
            });
        }

        const models = getModels();
        const { EstimateActivity, User, UserPreference } = models;
        
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Estimate ID is required to fetch activities',
            });
        }

        // Fetch all activities related to the estimate
        const activities = await EstimateActivity.findAll({
            where: { estimateId: id },
            include: [
                {
                    model: User,
                    as: 'ChangedBy',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ],
                },
            ],
            order: [['timestamp', 'DESC']], // Order by most recent activities
        });

        if (!activities || activities.length === 0) {
            return res.status(200).json({
                err: false,
                msg: 'No activities found for this estimate',
            });
        }

        // Human-readable names for related models
        const humanReadableNames = {
            Estimate: 'Estimate',
            EstimateLineItem: 'Line Item',
            EstimateStatus: 'Status',
            EstimateSetting: 'Setting',
            EstimateSignature: 'Signature',
            EstimateLineItemImage: 'Image',
            EstimateLineItemItem: 'Item',
        };

        // Transform activities for the response
        const transformedActivities = activities.map((activity) => {
            const formattedName = humanReadableNames[activity.relatedModel] || 'Estimate';

            return {
                id: activity.id,
                estimateId: activity.estimateId,
                action: activity.action,
                description: activity.description,
                fieldName: activity.fieldName,
                oldValue: activity.oldValue,
                newValue: activity.newValue,
                formattedName, // Add the human-readable name
                changedBy: activity.ChangedBy, // User details
                timestamp: activity.timestamp,
                status: activity.status,
                metadata: activity.metadata,
            };
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return res.status(200).json({
            err: false,
            msg: 'Estimate activities successfully retrieved',
            activities: transformedActivities,
        });
    } catch (error) {
        console.error('Error fetching estimate activities:', error);
        return res.status(500).json({
            err: true,
            msg: 'Failed to retrieve estimate activities',
            error: error.message,
        });
    }
};
const getWorkOrderActivities = async (req, res) => {
    try {
        // Validate input parameters
        const validationResult = await ValidationRunner.validate(req.body, 'WORKORDER_ACTIVITIES');
        if (!validationResult.isValid) {
            return res.status(400).json({
                err: true,
                msg: 'Invalid request parameters',
                errors: validationResult.errors
            });
        }

        // Check permissions using centralized helper
        const hasWorkOrderActivitiesPermission = await hasPermission(req.userId, 'workorders', 'activities');
        if (!hasWorkOrderActivitiesPermission) {
            return res.status(403).json({
                err: true,
                msg: 'Insufficient permissions to view work order activities'
            });
        }

        const models = getModels();
        const { WorkOrderActivity, User, UserPreference } = models;
        
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Work Order ID is required to fetch activities',
            });
        }

        // Fetch all activities related to the work order
        const activities = await WorkOrderActivity.findAll({
            where: { workOrderId: id },
            include: [
                {
                    model: User,
                    as: 'ChangedBy',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ],
                },
            ],
            order: [['timestamp', 'DESC']], // Order by most recent activities
        });

        if (!activities || activities.length === 0) {
            return res.status(200).json({
                err: false,
                msg: 'No activities found for this work order',
            });
        }

        // Human-readable names for related models
        const humanReadableNames = {
            Address: 'Address',
            Client: 'Client',
            Group: 'Group',
            WorkOrder: 'Work Order',
            PurchaseOrder: 'Purchase Order',
            WorkOrderLineItem: 'Work Order Item',
            WorkOrderStatus: 'Work Order Status',
            User: 'User',
            Priority: 'Priority',
        };

        // Transform activities for the response
        const transformedActivities = activities.map((activity) => {
            const formattedName = humanReadableNames[activity.relatedModel] || 'Work Order';

            return {
                id: activity.id,
                workOrderId: activity.workOrderId,
                action: activity.action,
                description: activity.description,
                fieldName: activity.fieldName,
                oldValue: activity.oldValue,
                newValue: activity.newValue,
                formattedName, // Add the human-readable name
                changedBy: activity.ChangedBy, // User details
                timestamp: activity.timestamp,
                status: activity.status,
                metadata: activity.metadata,
            };
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return res.status(200).json({
            err: false,
            msg: 'Work Order activities successfully retrieved',
            activities: transformedActivities,
        });
    } catch (error) {
        console.error('Error fetching work order activities:', error);
        return res.status(500).json({
            err: true,
            msg: 'Failed to retrieve work order activities',
            error: error.message,
        });
    }
};

const getInvoiceActivities = async (req, res) => {
    try {
        // Validate input parameters
        const validationResult = await ValidationRunner.validate(req.body, 'INVOICE_ACTIVITIES');
        if (!validationResult.isValid) {
            return res.status(400).json({
                err: true,
                msg: 'Invalid request parameters',
                errors: validationResult.errors
            });
        }

        // Check permissions using centralized helper
        const hasInvoiceActivitiesPermission = await hasPermission(req.userId, 'invoices', 'activities');
        if (!hasInvoiceActivitiesPermission) {
            return res.status(403).json({
                err: true,
                msg: 'Insufficient permissions to view invoice activities'
            });
        }

        const models = getModels();
        const { Activity, User, UserPreference } = models;
        
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                err: true,
                msg: 'Invoice ID is required to fetch activities',
            });
        }

        // Fetch all activities related to the invoice using the new unified Activity model
        const activities = await Activity.findAll({
            where: { 
                entityId: id,
                activityType: 'invoice'
            },
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                    include: [
                        { model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] },
                    ],
                },
            ],
            order: [['createdAt', 'DESC']], // Order by most recent activities
        });

        if (!activities || activities.length === 0) {
            return res.status(200).json({
                err: false,
                msg: 'No activities found for this invoice',
                activities: []
            });
        }

        // Transform activities to match expected format
        const transformedActivities = activities.map(activity => {
            return {
                id: activity.id,
                action: activity.action,
                description: activity.description,
                entityType: activity.entityType,
                entityId: activity.entityId,
                userId: activity.userId,
                user: activity.User, // User details
                createdAt: activity.createdAt,
                updatedAt: activity.updatedAt,
                metadata: activity.metadata,
            };
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return res.status(200).json({
            err: false,
            msg: 'Invoice activities successfully retrieved',
            activities: transformedActivities,
        });
    } catch (error) {
        console.error('Error fetching invoice activities:', error);
        return res.status(500).json({
            err: true,
            msg: 'Failed to retrieve invoice activities',
            error: error.message,
        });
    }
};
const getActivityAnalytics = async (req, res) => {
  try {
    // Validate input parameters
    const validationResult = await ValidationRunner.validate(req.query, 'ACTIVITY_ANALYTICS');
    if (!validationResult.isValid) {
      return res.status(400).json({
        err: true,
        msg: 'Invalid query parameters',
        errors: validationResult.errors
      });
    }

    const models = getModels();
    const { User } = models;
    
    const userId = req.userId;
    const {
      period = '30d', // 1d, 7d, 30d, 90d, 1y
      activityType,
      userId: filterUserId
    } = req.query;

    // Check permissions using centralized helper
    const hasAnalyticsPermission = await hasPermission(userId, 'activities', 'analytics');
    if (!hasAnalyticsPermission) {
      return res.status(403).json({
        err: true,
        msg: 'Insufficient permissions to view activity analytics'
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build filters
    const filters = ['isVisible = true'];
    if (activityType) filters.push(`activityType = "${activityType}"`);
    if (filterUserId) filters.push(`userId = ${filterUserId}`);
    
    const startTimestamp = startDate.getTime();
    const endTimestamp = now.getTime();
    filters.push(`createdAt >= ${startTimestamp} AND createdAt <= ${endTimestamp}`);

    // Get facet distribution for analytics
    const facetSearchOptions = {
      facets: ['activityType', 'action', 'severity', 'userId'],
      filter: filters.join(' AND '),
      limit: 0 // We only want facets, not results
    };

    const facetResult = await meiliClient.index('activities').search('', facetSearchOptions);
    
    // Get total activities in period
    const totalResult = await meiliClient.index('activities').search('', {
      filter: filters.join(' AND '),
      limit: 0
    });

    // Get user activity breakdown
    const userBreakdown = {};
    if (facetResult.facetDistribution.userId) {
      for (const [userId, count] of Object.entries(facetResult.facetDistribution.userId)) {
        try {
          const user = await User.findByPk(userId, {
            attributes: ['firstName', 'lastName', 'email']
          });
          userBreakdown[userId] = {
            count,
            name: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
            email: user ? user.email : ''
          };
        } catch (err) {
          userBreakdown[userId] = { count, name: 'Unknown User', email: '' };
        }
      }
    }

    res.status(200).json({
      err: false,
      msg: 'Activity analytics retrieved successfully',
      analytics: {
        period,
        totalActivities: totalResult.estimatedTotalHits,
        activityTypeBreakdown: facetResult.facetDistribution.activityType || {},
        actionBreakdown: facetResult.facetDistribution.action || {},
        severityBreakdown: facetResult.facetDistribution.severity || {},
        userBreakdown,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const getEntityActivitiesSearch = async (req, res) => {
  try {
    // Validate input parameters
    const validationResult = await ValidationRunner.validate({
      params: req.params,
      query: req.query
    }, 'ENTITY_ACTIVITIES_SEARCH');
    if (!validationResult.isValid) {
      return res.status(400).json({
        err: true,
        msg: 'Invalid search parameters',
        errors: validationResult.errors
      });
    }

    // Check permissions using centralized helper
    const hasEntityActivitiesPermission = await hasPermission(req.userId, 'activities', 'entity_search');
    if (!hasEntityActivitiesPermission) {
      return res.status(403).json({
        err: true,
        msg: 'Insufficient permissions to search entity activities'
      });
    }

    const { entityType, entityId } = req.params;
    const userId = req.userId;
    const {
      page = 1,
      limit = 20,
      action,
      severity,
      includeSystemGenerated = false
    } = req.query;

    // Validate entity type
    const validEntityTypes = [
      'client', 'estimate', 'event', 'invoice', 'workOrder', 'purchaseOrder', 
      'user', 'role', 'permission', 'lineItem', 'payment', 'note', 'document'
    ];
    
    if (!validEntityTypes.includes(entityType)) {
      return res.status(400).json({
        err: true,
        msg: 'Invalid entity type'
      });
    }

    // Build filters
    const filters = [
      'isVisible = true',
      `activityType = "${entityType}"`,
      `entityId = ${parseInt(entityId)}`
    ];
    
    if (action) filters.push(`action = "${action}"`);
    if (severity) filters.push(`severity = "${severity}"`);
    if (!includeSystemGenerated) filters.push('isSystemGenerated = false');

    const searchOptions = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      filter: filters.join(' AND '),
      sort: ['createdAt:desc']
    };

    const result = await meiliClient.index('activities').search('', searchOptions);
    
    res.status(200).json({
      err: false,
      msg: 'Entity activities retrieved successfully',
      activities: result.hits,
      entity: { type: entityType, id: entityId },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.estimatedTotalHits,
        totalPages: Math.ceil(result.estimatedTotalHits / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const getActivitiesTimeline = async (req, res) => {
  try {
    const models = getModels();
    const { Activity, User } = models;
    
    const userId = req.userId;
    const {
      page = 1,
      limit = 50,
      activityTypes, // comma-separated list
      excludeSystemGenerated = true,
      severity,
      sinceTimestamp // for real-time updates
    } = req.query;

    // Check permissions using centralized helper
    const hasTimelinePermission = await hasPermission(userId, 'activities', 'timeline');
    if (!hasTimelinePermission) {
      return res.status(403).json({
        err: true,
        msg: 'Insufficient permissions to view activities timeline'
      });
    }

    // Build filters for timeline
    const filters = ['isVisible = true'];
    
    if (excludeSystemGenerated) filters.push('isSystemGenerated = false');
    if (severity) filters.push(`severity = "${severity}"`);
    if (sinceTimestamp) filters.push(`createdAt > ${parseInt(sinceTimestamp)}`);
    
    if (activityTypes) {
      const types = activityTypes.split(',').map(type => `activityType = "${type.trim()}"`);
      filters.push(`(${types.join(' OR ')})`);
    }

    const searchOptions = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      filter: filters.join(' AND '),
      sort: ['createdAt:desc'],
      attributesToRetrieve: ['*']
    };

    try {
      // Try MeiliSearch first for fast results
      const result = await meiliClient.index('activities').search('', searchOptions);
      
      return res.status(200).json({
        err: false,
        msg: 'Activities timeline retrieved successfully',
        timeline: result.hits,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.estimatedTotalHits,
          totalPages: Math.ceil(result.estimatedTotalHits / parseInt(limit))
        },
        lastUpdated: new Date().toISOString(),
        source: 'meili'
      });
    } catch (meiliError) {
      console.log('MeiliSearch unavailable, falling back to database');
      
      // Fallback to database query
      const whereClause = { isVisible: true };
      
      if (excludeSystemGenerated) whereClause.isSystemGenerated = false;
      if (severity) whereClause.severity = severity;
      if (sinceTimestamp) {
        whereClause.createdAt = {
          [Op.gt]: new Date(parseInt(sinceTimestamp))
        };
      }
      
      if (activityTypes) {
        const types = activityTypes.split(',').map(type => type.trim());
        whereClause.activityType = { [Op.in]: types };
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows: activities } = await Activity.findAndCountAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'User',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profilePictureUrl']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset
      });

      // Transform activities to match MeiliSearch format
      const timeline = activities.map(activity => ({
        id: activity.id,
        userId: activity.userId,
        userName: activity.User ? `${activity.User.firstName} ${activity.User.lastName}` : 'Unknown User',
        userEmail: activity.User ? activity.User.email : '',
        activityType: activity.activityType,
        entityId: activity.entityId,
        action: activity.action,
        description: activity.description,
        severity: activity.severity,
        tags: activity.tags || [],
        isSystemGenerated: activity.isSystemGenerated,
        isVisible: activity.isVisible,
        metadata: activity.metadata || {},
        createdAt: activity.createdAt.getTime(),
        searchText: `${activity.activityType} ${activity.action} ${activity.description || ''}`.toLowerCase()
      }));

      return res.status(200).json({
        err: false,
        msg: 'Activities timeline retrieved successfully',
        timeline,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / parseInt(limit))
        },
        lastUpdated: new Date().toISOString(),
        source: 'database'
      });
    }
  } catch (err) {
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const createActivity = async (req, res) => {
  try {
    // Validate input parameters
    const validationResult = await ValidationRunner.validate(req.body, 'CREATE_ACTIVITY');
    if (!validationResult.isValid) {
      return res.status(400).json({
        err: true,
        msg: 'Invalid activity data',
        errors: validationResult.errors
      });
    }

    // Check permissions using centralized helper
    const hasCreatePermission = await hasPermission(req.userId, 'activities', 'create');
    if (!hasCreatePermission) {
      return res.status(403).json({
        err: true,
        msg: 'Insufficient permissions to create activities'
      });
    }

    const models = getModels();
    const { Activity } = models;
    
    const {
      activityType,
      entityId,
      action,
      description,
      metadata,
      severity = 'low',
      tags,
      isSystemGenerated = false
    } = req.body;

    const userId = req.userId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const activity = await Activity.create({
      userId,
      activityType,
      entityId,
      action,
      description,
      metadata,
      ipAddress,
      userAgent,
      isSystemGenerated,
      severity,
      tags
    });

    // Index in MeiliSearch
    await indexActivityInMeili(activity);

    res.status(201).json({
      err: false,
      msg: 'Activity created successfully',
      activity
    });
  } catch (err) {
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const bulkLogActivities = async (req, res) => {
  try {
    // Validate input parameters
    const validationResult = await ValidationRunner.validate(req.body, 'BULK_LOG_ACTIVITIES');
    if (!validationResult.isValid) {
      return res.status(400).json({
        err: true,
        msg: 'Invalid bulk activities data',
        errors: validationResult.errors
      });
    }

    // Check admin permissions using centralized helper
    const hasAdminPermission = await hasPermission(req.userId, 'activities', 'bulk_create');
    if (!hasAdminPermission) {
      return res.status(403).json({
        err: true,
        msg: 'Insufficient permissions to bulk log activities'
      });
    }

    const models = getModels();
    const { User, Role, Activity } = models;
    
    const userId = req.userId;
    const { activities } = req.body;

    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({
        err: true,
        msg: 'Activities array is required'
      });
    }

    // Prepare activities for bulk insert
    const activitiesToCreate = activities.map(activity => ({
      userId: activity.userId || userId,
      activityType: activity.activityType,
      entityId: activity.entityId,
      action: activity.action,
      description: activity.description,
      metadata: activity.metadata || {},
      severity: activity.severity || 'low',
      tags: activity.tags || null,
      isSystemGenerated: activity.isSystemGenerated || true,
      ipAddress: activity.ipAddress || null,
      userAgent: activity.userAgent || 'System Import'
    }));

    // Bulk create activities
    const createdActivities = await Activity.bulkCreate(activitiesToCreate);

    // Prepare for MeiliSearch bulk indexing
    const searchableActivities = [];
    for (const activity of createdActivities) {
      try {
        const user = await User.findByPk(activity.userId, {
          attributes: ['firstName', 'lastName', 'email']
        });

        searchableActivities.push({
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
        });
      } catch (err) {
        console.error('Error preparing activity for search:', err);
      }
    }

    // Bulk index in MeiliSearch
    if (searchableActivities.length > 0) {
      await meiliClient.index('activities').addDocuments(searchableActivities);
    }

    res.status(201).json({
      err: false,
      msg: `Successfully created ${createdActivities.length} activities`,
      count: createdActivities.length
    });
  } catch (err) {
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const logActivity = async (userId, activityType, entityId, action, description, metadata = {}, options = {}) => {
  try {
    const models = getModels();
    const { Activity } = models;
    
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

    // Index in MeiliSearch
    await indexActivityInMeili(activity);
    // Update activities in sockets
    updateActivities(activity);
    return activity;
  } catch (err) {
    console.error('Error logging activity:', err);
    return null;
  }
};
const indexActivityInMeili = async (activity) => {
  try {
    const models = getModels();
    const { User } = models;
    
    // Get user info for search
    const user = await User.findByPk(activity.userId, {
      attributes: ['firstName', 'lastName', 'email']
    });

    // Use the improved indexActivity helper
    await indexActivity(activity, user);
  } catch (err) {
    console.error('Error indexing activity in MeiliSearch:', err);
  }
};
const searchActivities = async (req, res) => {
  try {
    // Validate input parameters
    const validationResult = await ValidationRunner.validate(req.query, 'ACTIVITY_SEARCH');
    if (!validationResult.isValid) {
      return res.status(400).json({
        err: true,
        msg: 'Invalid search parameters',
        errors: validationResult.errors
      });
    }

    const userId = req.userId;
    const {
      q = '', // search query
      page = 1,
      limit = 20,
      activityType,
      action,
      severity,
      userId: filterUserId,
      entityId,
      startDate,
      endDate,
      tags,
      includeSystemGenerated = false,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Check permissions using centralized helper
    const hasSearchPermission = await hasPermission(userId, 'activities', 'search');
    if (!hasSearchPermission) {
      return res.status(403).json({
        err: true,
        msg: 'Insufficient permissions to search activities'
      });
    }

    // Build MeiliSearch filters
    const searchFilters = [];
    
    if (activityType) searchFilters.push(`activityType = "${activityType}"`);
    if (action) searchFilters.push(`action = "${action}"`);
    if (severity) searchFilters.push(`severity = "${severity}"`);
    if (filterUserId) searchFilters.push(`userId = ${filterUserId}`);
    if (entityId) searchFilters.push(`entityId = ${entityId}`);
    if (!includeSystemGenerated) searchFilters.push('isSystemGenerated = false');
    searchFilters.push('isVisible = true');

    // Date range filter (convert to timestamp)
    if (startDate && endDate) {
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime();
      searchFilters.push(`createdAt >= ${startTimestamp} AND createdAt <= ${endTimestamp}`);
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      const tagFilters = tagArray.map(tag => `tags = "${tag}"`);
      searchFilters.push(`(${tagFilters.join(' OR ')})`);
    }

    const searchOptions = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      filter: searchFilters.length > 0 ? searchFilters.join(' AND ') : undefined,
      sort: [`${sortBy}:${sortOrder}`],
      attributesToHighlight: ['description', 'searchText'],
      attributesToRetrieve: ['*']
    };

    const searchResult = await meiliClient.index('activities').search(q.trim(), searchOptions);
    
    res.status(200).json({
      err: false,
      msg: 'Activities search completed successfully',
      activities: searchResult.hits,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: searchResult.estimatedTotalHits,
        totalPages: Math.ceil(searchResult.estimatedTotalHits / parseInt(limit))
      },
      processingTime: searchResult.processingTimeMs
    });
  } catch (err) {
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const configureActivityIndex = async (req, res) => {
  try {
    // Check admin permissions using centralized helper
    const hasAdminPermission = await hasPermission(req.userId, 'activities', 'configure_index');
    if (!hasAdminPermission) {
      return res.status(403).json({
        err: true,
        msg: 'Insufficient permissions to configure activity index'
      });
    }

    const models = getModels();
    const { User, Role } = models;
    
    const userId = req.userId;

    const index = meiliClient.index('activities');
    
    // Configure searchable attributes
    await index.updateSearchableAttributes([
      'searchText',
      'description',
      'userName',
      'userEmail',
      'activityType',
      'action',
      'tags'
    ]);

    // Configure filterable attributes
    await index.updateFilterableAttributes([
      'activityType',
      'action',
      'severity',
      'userId',
      'entityId',
      'isSystemGenerated',
      'isVisible',
      'createdAt',
      'tags'
    ]);

    // Configure sortable attributes
    await index.updateSortableAttributes([
      'createdAt',
      'updatedAt',
      'severity',
      'activityType'
    ]);

    // Configure faceting
    await index.updateFaceting({
      maxValuesPerFacet: 100
    });

    // Configure ranking rules
    await index.updateRankingRules([
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness'
    ]);

    res.status(200).json({
      err: false,
      msg: 'Activity MeiliSearch index configured successfully'
    });
  } catch (err) {
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};

module.exports = {
    getClientActivities,
    getEventActivities,
    getEstimateActivities,
    getWorkOrderActivities,
    getInvoiceActivities,
    createActivity,
    logActivity,
    indexActivityInMeili,
    getActivities,
    searchActivities,
    getActivityAnalytics,
    getActivitiesTimeline,
    getEntityActivitiesSearch,
    bulkLogActivities,
    configureActivityIndex
};