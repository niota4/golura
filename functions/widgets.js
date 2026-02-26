// Load environment variables
require('dotenv').config();

const { Op } = require('sequelize');
const env = process.env;

const {
  Client,
  User,
  UserPreference,
  Estimate,
  EstimateStatus,
  EstimateHistory,
  Event,
  EventStatus,
  EventCategory,
  EventParticipant,
  WorkOrder,
  WorkOrderStatus,
  Invoice,
  InvoiceHistory,
  RoleWidget,
  Role,
  Permission,
  Page,
  Widget,
  Activity,
  Payment,
  Priority,
  Payroll,
  PayrollItem,
 CompanySubscription, 
 SubscriptionPlan
} = require('../models');
const { MeiliSearch } = require('meilisearch');
const meiliClient = new MeiliSearch({
  host: env.MEILI_HOST,
  apiKey: env.MEILI_API_KEY
});

const getAllPermissions = async (userId) => {
  const user = await User.findByPk(
    userId, {
      include: [{
          model: Role,
          as: 'Role',
          include: [{
            model: Permission,
            as: 'Permissions',
            include: [{
              model: Page,
              as: 'Page',
            }]
          }]
        },
        {
          model: Permission,
          as: 'Permissions',
          include: [{
            model: Page,
            as: 'Page',
          }]
        }
      ]
    }
  );
  
  // Handle case where user might not have permissions or role
  const userPermissions = user?.Permissions || [];
  const rolePermissions = user?.Role?.Permissions || [];

  // Combine and deduplicate permissions
  const allPermissions = [...userPermissions, ...rolePermissions].reduce((acc, permission) => {
    if (!acc.some(p => p.Page.id === permission.Page.id && p.action === permission.action)) {
      acc.push(permission);
    }
    return acc;
  }, []);

  return allPermissions;
};
async function getAllowedPages(companyId) {
  const subscription = await CompanySubscription.findOne({
    where: { companyId },
    include: [
      { model: SubscriptionPlan, as: 'SubscriptionPlan' },
    ],
  });
  let pageAccess = [];
  if (subscription && Array.isArray(subscription.pageAccess) && subscription.pageAccess.length > 0) {
    pageAccess = subscription.pageAccess;
  }
  return pageAccess;
};
const getStartEndDate = (period) => {
  const now = new Date();
  let startDate;
  
  // Handle period as object { value, name } or string
  const periodValue = typeof period === 'object' && period !== null && period.value ? period.value : period;
  const periodName = typeof period === 'object' && period !== null && period.name ? period.name : period;
  
  switch (periodValue) {
    case '1d':
      startDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
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
    case '180d':
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    case '365d':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case null:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return { 
    startDate, 
    endDate: now, 
    periodValue: periodValue || '30d',
    periodName: periodName || periodValue || '30d'
  };
};
const generalSearch = async (req, res) => {
  const query = (req.body.query || '').trim();
  const page = parseInt(req.body.page) || 1;
  const limit = 4; // Fixed limit of 4 per model
  const offset = (page - 1) * limit;
  const userId = req.userId;

  try {
    const permissions = await getAllPermissions(userId);
    const allowedPages = permissions.filter(p => p.action === 'view').map(p => p.Page.name);
    const searchPromises = [];
    // --- Clients ---
    if (allowedPages.includes('clients')) {
      searchPromises.push(
        meiliClient.index('clients').search(query, { limit, offset }).then(r => r.hits)
      );
      // For phone, email, address: fallback to empty (or implement MeiliSearch for those if needed)
      searchPromises.push(Promise.resolve([]));
      searchPromises.push(Promise.resolve([]));
      searchPromises.push(Promise.resolve([]));
    } else {
      searchPromises.push(Promise.resolve([]), Promise.resolve([]), Promise.resolve([]), Promise.resolve([]));
    }
    // --- Users ---
    if (allowedPages.includes('users')) {
      searchPromises.push(
        meiliClient.index('users').search(query, { limit, offset }).then(r => r.hits)
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }
    // --- Estimates ---
    if (allowedPages.includes('estimates')) {
      searchPromises.push(
        meiliClient.index('estimates').search(query, { limit, offset }).then(r => r.hits)
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }
    // --- Events ---
    if (allowedPages.includes('events')) {
      searchPromises.push(
        meiliClient.index('events').search(query, { limit, offset }).then(r => r.hits)
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }
    // --- Work Orders ---
    if (allowedPages.includes('workOrders')) {
      searchPromises.push(
        meiliClient.index('workOrders').search(query, { limit, offset }).then(r => r.hits)
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }
    // --- Invoices ---
    if (allowedPages.includes('invoices')) {
      searchPromises.push(
        meiliClient.index('invoices').search(query, { limit, offset }).then(r => r.hits)
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }
    // --- Purchase Orders ---
    if (allowedPages.includes('purchaseOrders')) {
      searchPromises.push(
        meiliClient.index('purchaseOrders').search(query, { limit, offset }).then(r => r.hits)
      );
    } else {
      searchPromises.push(Promise.resolve([]));
    }
    // --- Await all searches ---
    const results = await Promise.all(searchPromises);
    // Build results object only for allowed and searched entities
    // The order of entityMap must match the order of searchPromises above
    const entityMap = [
      {
        key: 'clients',
        allowed: allowedPages.includes('clients'),
        index: [0, 1, 2, 3], // combine all 4 client-related indexes
        flatten: true
      },
      { key: 'users', allowed: allowedPages.includes('users'), index: 4 },
      { key: 'estimates', allowed: allowedPages.includes('estimates'), index: 5 },
      { key: 'events', allowed: allowedPages.includes('events'), index: 6 },
      { key: 'workOrders', allowed: allowedPages.includes('workOrders'), index: 7 },
      { key: 'invoices', allowed: allowedPages.includes('invoices'), index: 8 },
      { key: 'purchaseOrders', allowed: allowedPages.includes('purchaseOrders'), index: 9 },
    ];
    let combinedResults = {};
    for (const entity of entityMap) {
      if (!entity.allowed) continue;
      if (Array.isArray(entity.index)) {
        combinedResults[entity.key] = entity.index
          .map(i => results[i] || [])
          .flat();
      } else if (entity.flatten) {
        combinedResults[entity.key] = results[entity.index]?.flat?.() || [];
      } else {
        combinedResults[entity.key] = results[entity.index] || [];
      }
    }
    res.status(200).json({
      err: false,
      msg: 'Search results retrieved successfully',
      results: combinedResults
    });
  } catch (err) {
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const getWidget = async (req, res) => {
    try {
      const { id } = req.body;
      const widget = await Widget.findByPk(id);
      if (widget) {
        res.status(200).json({ err: false, msg: 'Widget retrieved successfully', widget });
      } else {
        res.status(404).json({ err: true, msg: 'Widget not found' });
      }
    } catch (err) {
      res.status(400).json({ err: true, msg: err.message });
    }
};
const getWidgetEstimateData = async (req, res) => {
    const { period, includeAllUsers } = req.query;
  const userId = req.userId;

    // Use shared utility for date range calculation
    const { startDate, endDate, periodName, periodValue } = getStartEndDate(period);

    let whereClause = {
    createdAt: {
    [Op.between]: [startDate, endDate]
    }
    };

  if (!includeAllUsers) {
    whereClause.userId = userId;
  }

  try {
    const estimates = await Estimate.findAll(
      {
        where: whereClause,
        include: [
          { 
            model: User, 
            as: 'Creator',
            attributes: [
              'id',
              'email',
              'firstName',
              'lastName',
              'roleId',
              'lastSeen',
              'online',
              'createdAt'
            ],
           },
          { 
            model: EstimateHistory, 
            as: 'Histories' 
          }
        ]
      }
    );

    const totals = calculateTotals(estimates);

    res.status(200).json({
      err: false,
      msg: 'Estimates retrieved successfully',
      widget: {
        type: 'estimateData',
        period: periodName || periodValue,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        data: {
          estimates,
          totals
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
const getActivityTimeline = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      limit,
      severity,
      period
    } = req.body;

    const activityTypes = req.body.activityTypes || 'client,estimate,event,invoice,workOrder';
    
    // Extract period value if it's an object, otherwise use as string
    const periodValue = typeof period === 'object' && period !== null ? period.value : period;
    const periodName = typeof period === 'object' && period !== null ? period.name : period;

    const parsedLimit = parseInt(limit) || 10;

    // Get user permissions
    const permissions = await getAllPermissions(userId);
    const allowedPages = permissions.filter(p => p.action === 'view').map(p => p.Page.name);

    // Use shared utility for date range calculation
    const { startDate, endDate } = getStartEndDate(period);

    // Build MeiliSearch filters
    const searchFilters = ['isVisible = true', 'isSystemGenerated = false'];
    
    if (severity) searchFilters.push(`severity = "${severity}"`);
    
    // Date range filter
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    searchFilters.push(`createdAtTimestamp >= ${startTimestamp} AND createdAtTimestamp <= ${endTimestamp}`);
    
    // Activity types filter based on permissions
    const requestedTypes = activityTypes.split(',').map(type => type.trim());
    const allowedTypes = [];
    
    if (allowedPages.includes('clients') && requestedTypes.includes('client')) {
      allowedTypes.push('client');
    }
    if (allowedPages.includes('estimates') && requestedTypes.includes('estimate')) {
      allowedTypes.push('estimate');
    }
    if (allowedPages.includes('events') && requestedTypes.includes('event')) {
      allowedTypes.push('event');
    }
    if (allowedPages.includes('invoices') && requestedTypes.includes('invoice')) {
      allowedTypes.push('invoice');
    }
    if (allowedPages.includes('workOrders') && requestedTypes.includes('workOrder')) {
      allowedTypes.push('workOrder');
    }

    if (allowedTypes.length > 0) {
      const typeFilters = allowedTypes.map(type => `activityType = "${type}"`);
      searchFilters.push(`(${typeFilters.join(' OR ')})`);
    } else {
      // No allowed types, return empty result
      return res.status(200).json({
        err: false,
        msg: 'Activity timeline retrieved successfully',
        timeline: [],
        summary: {
          total: 0,
          period: periodName || periodValue,
          allowedTypes: []
        }
      });
    }

    const searchOptions = {
      limit: parsedLimit,
      offset: 0,
      filter: searchFilters.join(' AND '),
      sort: ['createdAtTimestamp:desc'],
      facets: ['activityType', 'action', 'severity'],
      attributesToRetrieve: ['*']
    };
    try {
      // Try MeiliSearch for fast results
      const result = await meiliClient.index('activities').search('', searchOptions);
      
      // Enrich MeiliSearch results with user preferences
      const enrichedTimeline = await Promise.all(
        result.hits.map(async (activity) => {
          if (activity.userId) {
            try {
              const user = await User.findByPk(activity.userId, {
                include: [{
                  model: UserPreference,
                  as: 'Preferences',
                  attributes: ['backgroundColor']
                }],
                attributes: ['id', 'firstName', 'lastName', 'email', 'lastSeen', 'profilePictureUrl', 'online']
              });
              
              if (user) {
                activity.User = {
                  id: user.id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  lastSeen: user.lastSeen,
                  profilePictureUrl: user.profilePictureUrl,
                  online: user.online,
                  Preferences: {
                    backgroundColor: user.Preferences ? user.Preferences.backgroundColor : null
                  }
                };
              }
            } catch (userError) {
              console.log(`Could not fetch user preferences for userId ${activity.userId}:`, userError.message);
            }
          }
          return activity;
        })
      );
      
      // Get activity counts by type for summary
      const typeCounts = result.facetDistribution?.activityType || {};
      const actionCounts = result.facetDistribution?.action || {};
      const severityCounts = result.facetDistribution?.severity || {};
      
      return res.status(200).json({
        err: false,
        msg: 'Activity timeline retrieved successfully',
        timeline: enrichedTimeline,
        summary: {
          total: result.estimatedTotalHits,
          period: periodName || periodValue,
          allowedTypes,
          breakdown: {
            byType: typeCounts,
            byAction: actionCounts,
            bySeverity: severityCounts
          },
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        },
        processingTime: result.processingTimeMs,
        source: 'meili'
      });
      
    } catch (meiliError) {
      console.log('MeiliSearch unavailable for timeline, falling back to database');
      
      // Fallback to database query
      const whereClause = {
        isVisible: true,
        isSystemGenerated: false,
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      };
      
      if (severity) whereClause.severity = severity;
      if (allowedTypes.length > 0) {
        whereClause.activityType = { [Op.in]: allowedTypes };
      }

      const activities = await Activity.findAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'User',
          attributes: [
            'id', 
            'firstName', 
            'lastName', 
            'email',
            'lastSeen',
            'profilePictureUrl',
            'online',
          ],
          include: [{ model: UserPreference, as: 'Preferences', attributes: ['backgroundColor'] }]
        }],
        order: [['createdAt', 'DESC']],
        limit: parsedLimit
      });
      
      // Transform to match MeiliSearch format
      const timeline = activities.map(activity => ({
        id: activity.id,
        userId: activity.userId,
        userName: activity.User ? `${activity.User.firstName} ${activity.User.lastName}` : 'Unknown User',
        userEmail: activity.User ? activity.User.email : '',
        User: activity.User ? {
          id: activity.User.id,
          firstName: activity.User.firstName,
          lastName: activity.User.lastName,
          email: activity.User.email,
          Preferences: {
            backgroundColor: activity.User.Preferences ? activity.User.Preferences.backgroundColor : null
          }
        } : null,
        activityType: activity.activityType,
        entityId: activity.entityId,
        action: activity.action,
        description: activity.description,
        severity: activity.severity,
        tags: activity.tags || [],
        metadata: activity.metadata || {},
        createdAt: activity.createdAt.getTime(),
        isSystemGenerated: activity.isSystemGenerated,
        isVisible: activity.isVisible
      }));

      // Calculate breakdown manually
      const typeCounts = {};
      const actionCounts = {};
      const severityCounts = {};
      
      timeline.forEach(activity => {
        typeCounts[activity.activityType] = (typeCounts[activity.activityType] || 0) + 1;
        actionCounts[activity.action] = (actionCounts[activity.action] || 0) + 1;
        severityCounts[activity.severity] = (severityCounts[activity.severity] || 0) + 1;
      });

      return res.status(200).json({
        err: false,
        msg: 'Activity timeline retrieved successfully',
        timeline,
        summary: {
          total: timeline.length,
          period: periodName || periodValue,
          allowedTypes,
          breakdown: {
            byType: typeCounts,
            byAction: actionCounts,
            bySeverity: severityCounts
          },
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        },
        source: 'database'
      });
    }
  } catch (err) {
    console.error('Error retrieving activity timeline:', err);
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const getActivitySummaryWidget = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      hours = 24,
      period,
      limit = 10
    } = req.body;

    // Use period if provided, otherwise fall back to hours
    let actualHours = hours;
    if (period) {
      const match = period.match(/^(\d+)([hd])$/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        actualHours = unit === 'h' ? value : value * 24;
      }
    }

    // Get user permissions
    const permissions = await getAllPermissions(userId);
    const allowedPages = permissions.filter(p => p.action === 'view').map(p => p.Page.name);

    // Calculate time range
    const now = new Date();
    const startTime = new Date(now.getTime() - parseInt(actualHours) * 60 * 60 * 1000);
    const startTimestamp = startTime.getTime();
    const endTimestamp = now.getTime();

    // Build allowed activity types based on permissions
    const allowedActivityTypes = [];
    if (allowedPages.includes('clients')) allowedActivityTypes.push('client');
    if (allowedPages.includes('estimates')) allowedActivityTypes.push('estimate');
    if (allowedPages.includes('events')) allowedActivityTypes.push('event');
    if (allowedPages.includes('invoices')) allowedActivityTypes.push('invoice');
    if (allowedPages.includes('workOrders')) allowedActivityTypes.push('workOrder');

    if (allowedActivityTypes.length === 0) {
      return res.status(200).json({
        err: false,
        msg: 'Activity summary retrieved successfully',
        summary: {
          totalActivities: 0,
          recentActivities: [],
          activityCounts: {},
          timeRange: {
            hours: parseInt(actualHours),
            start: startTime.toISOString(),
            end: now.toISOString()
          }
        }
      });
    }

    // Build filters
    const searchFilters = [
      'isVisible = true',
      'isSystemGenerated = false',
      `createdAtTimestamp >= ${startTimestamp} AND createdAtTimestamp <= ${endTimestamp}`
    ];

    if (allowedActivityTypes.length > 0) {
      const typeFilters = allowedActivityTypes.map(type => `activityType = "${type}"`);
      searchFilters.push(`(${typeFilters.join(' OR ')})`);
    }

    try {
      // Try MeiliSearch first
      const searchOptions = {
        limit: parseInt(limit),
        offset: 0,
        filter: searchFilters.join(' AND '),
        sort: ['createdAtTimestamp:desc'],
        facets: ['activityType', 'action', 'severity'],
        attributesToRetrieve: ['id', 'activityType', 'action', 'description', 'severity', 'userName', 'createdAt', 'createdAtTimestamp', 'entityId']
      };

      const result = await meiliClient.index('activities').search('', searchOptions);
      
      // Get counts by activity type
      const activityCounts = result.facetDistribution?.activityType || {};
      
      // Format recent activities for widget display
      const recentActivities = result.hits.map(activity => ({
        id: activity.id,
        type: activity.activityType,
        action: activity.action,
        description: activity.description,
        user: activity.userName || 'Unknown User',
        severity: activity.severity,
        time: new Date(activity.createdAt).toISOString(),
        entityId: activity.entityId,
        icon: getActivityIcon(activity.activityType, activity.action),
        color: getSeverityColor(activity.severity)
      }));

      return res.status(200).json({
        err: false,
        msg: 'Activity summary retrieved successfully',
        summary: {
          totalActivities: result.estimatedTotalHits,
          recentActivities,
          activityCounts,
          timeRange: {
            hours: parseInt(actualHours),
            start: startTime.toISOString(),
            end: now.toISOString()
          },
          source: 'meili'
        }
      });

    } catch (meiliError) {
      console.log('MeiliSearch unavailable for summary, using database');
      
      // Fallback to database
      const whereClause = {
        isVisible: true,
        isSystemGenerated: false,
        createdAt: {
          [Op.between]: [startTime, now]
        }
      };

      if (allowedActivityTypes.length > 0) {
        whereClause.activityType = { [Op.in]: allowedActivityTypes };
      }

      // Get total count
      const totalCount = await Activity.count({ where: whereClause });

      // Get recent activities
      const activities = await Activity.findAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'User',
          attributes: ['firstName', 'lastName']
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        attributes: ['id', 'activityType', 'action', 'description', 'severity', 'createdAt', 'entityId']
      });

      // Format for widget
      const recentActivities = activities.map(activity => ({
        id: activity.id,
        type: activity.activityType,
        action: activity.action,
        description: activity.description,
        user: activity.User ? `${activity.User.firstName} ${activity.User.lastName}` : 'Unknown User',
        severity: activity.severity,
        time: activity.createdAt.toISOString(),
        entityId: activity.entityId,
        icon: getActivityIcon(activity.activityType, activity.action),
        color: getSeverityColor(activity.severity)
      }));

      // Calculate activity counts
      const countsByType = await Activity.findAll({
        where: whereClause,
        attributes: [
          'activityType',
          [Activity.sequelize.fn('COUNT', Activity.sequelize.col('id')), 'count']
        ],
        group: ['activityType'],
        raw: true
      });

      const activityCounts = {};
      countsByType.forEach(row => {
        activityCounts[row.activityType] = parseInt(row.count);
      });

      return res.status(200).json({
        err: false,
        msg: 'Activity summary retrieved successfully',
        summary: {
          totalActivities: totalCount,
          recentActivities,
          activityCounts,
          timeRange: {
            hours: parseInt(actualHours),
            start: startTime.toISOString(),
            end: now.toISOString()
          },
          source: 'database'
        }
      });
    }
  } catch (err) {
    console.error('Error retrieving activity summary:', err);
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const getActivityIcon = (activityType, action) => {
  const iconMap = {
    client: {
      created: 'user-plus',
      updated: 'user-edit',
      deleted: 'user-minus',
      default: 'user'
    },
    estimate: {
      created: 'file-text',
      sent: 'send',
      approved: 'check-circle',
      rejected: 'x-circle',
      default: 'file-text'
    },
    event: {
      created: 'calendar-plus',
      scheduled: 'calendar',
      completed: 'check-square',
      cancelled: 'x-square',
      default: 'calendar'
    },
    invoice: {
      created: 'file-text',
      sent: 'send',
      payment_received: 'dollar-sign',
      default: 'file-text'
    },
    workOrder: {
      created: 'tool',
      assigned: 'user-check',
      completed: 'check-circle',
      default: 'tool'
    }
  };

  return iconMap[activityType]?.[action] || iconMap[activityType]?.default || 'activity';
};
const getSeverityColor = (severity) => {
  const colorMap = {
    low: '#6B7280',      // gray
    medium: '#F59E0B',   // amber
    high: '#EF4444',     // red
    critical: '#DC2626'  // dark red
  };
  return colorMap[severity] || colorMap.low;
};
const getSalesOverviewWidget = async (req, res) => {
  try {
    const userId = req.userId;
    const { period, limit = 10, includeAllUsers = false } = req.body;

    // Use shared utility for date range calculation
    const { startDate, endDate, periodName, periodValue } = getStartEndDate(period);

    const baseWhereClause = {
      createdAt: { [Op.between]: [startDate, endDate] }
    };

    // Create separate where clauses for different models
    const estimatesWhereClause = { ...baseWhereClause };
    const invoicesWhereClause = { ...baseWhereClause };
    const paymentsWhereClause = { ...baseWhereClause };

    if (!includeAllUsers) {
      estimatesWhereClause.assignedUserId = userId;
      invoicesWhereClause.createdBy = userId;
      paymentsWhereClause.createdBy = userId; // Assuming payments use createdBy
    }

    let salesData = {
      totalRevenue: 0,
      estimatesTotal: 0,
      invoicesTotal: 0,
      paymentsTotal: 0,
      estimatesCount: 0,
      invoicesCount: 0,
      paymentsCount: 0,
      breakdown: []
    };

    // Get Estimates data
    const estimates = await Estimate.findAll({
      where: estimatesWhereClause,
      include: [{
        model: EstimateHistory,
        as: 'Histories'
      }],
      attributes: ['id', 'createdAt']
    });

    const estimatesTotal = estimates.reduce((sum, estimate) => {
      const historyTotal = estimate.Histories.reduce((histSum, history) => {
        return histSum + parseFloat(history.amount || 0);
      }, 0);
      return sum + historyTotal;
    }, 0);

    salesData.estimatesTotal = estimatesTotal;
    salesData.estimatesCount = estimates.length;
    salesData.totalRevenue += estimatesTotal;

    // Get Invoices data
    const invoices = await Invoice.findAll({
      where: invoicesWhereClause,
      attributes: ['id', 'total', 'createdAt']
    });

    const invoicesTotal = invoices.reduce((sum, invoice) => {
      return sum + parseFloat(invoice.total || 0);
    }, 0);

    salesData.invoicesTotal = invoicesTotal;
    salesData.invoicesCount = invoices.length;
    salesData.totalRevenue += invoicesTotal;

    // Get Payments data
    try {
      const payments = await Payment.findAll({
        where: paymentsWhereClause,
        attributes: ['id', 'amount', 'createdAt']
      });

      const paymentsTotal = payments.reduce((sum, payment) => {
        return sum + parseFloat(payment.amount || 0);
      }, 0);

      salesData.paymentsTotal = paymentsTotal;
      salesData.paymentsCount = payments.length;
    } catch (paymentError) {
      console.log('Payments data not available:', paymentError.message);
      salesData.paymentsTotal = 0;
      salesData.paymentsCount = 0;
    }

    // Create breakdown for chart visualization
    salesData.breakdown = [
      { category: 'Estimates', amount: salesData.estimatesTotal, count: salesData.estimatesCount },
      { category: 'Invoices', amount: salesData.invoicesTotal, count: salesData.invoicesCount },
      { category: 'Payments', amount: salesData.paymentsTotal, count: salesData.paymentsCount }
    ].filter(item => item.amount > 0)
     .sort((a, b) => b.amount - a.amount)
     .slice(0, parseInt(limit));

    res.status(200).json({
      err: false,
      msg: 'Sales overview retrieved successfully',
      widget: {
        type: 'salesOverview',
        period: periodName || periodValue,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        data: salesData
      }
    });

  } catch (err) {
    console.error('Error retrieving sales overview:', err);
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const getWorkOrdersSummaryWidget = async (req, res) => {
  try {
    const userId = req.userId;
    const { period, includeAllUsers } = req.body;

    // Use shared utility for date range calculation
    const { startDate, endDate, periodName, periodValue } = getStartEndDate(period);

    const whereClause = {
      createdAt: { [Op.between]: [startDate, endDate] }
    };

    if (!includeAllUsers) {
      whereClause.assignedUserId = userId;
    }

    const workOrders = await WorkOrder.findAll({
      where: whereClause,
      include: [
        {
          model: WorkOrderStatus,
          as: 'WorkOrderStatus',
          attributes: ['id', 'name']
        },
        {
          model: Priority,
          as: 'Priority',
          attributes: ['id', 'level']
        },
        {
          model: User,
          as: 'AssignedUser',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      attributes: ['id', 'title', 'estimatedHours', 'actualHours', 'cost', 'scheduledDate', 'dueDate', 'createdAt']
    });

    // Calculate metrics
    const metrics = {
      total: workOrders.length,
      totalCost: workOrders.reduce((sum, wo) => sum + parseFloat(wo.cost || 0), 0),
      totalEstimatedHours: workOrders.reduce((sum, wo) => sum + parseFloat(wo.estimatedHours || 0), 0),
      totalActualHours: workOrders.reduce((sum, wo) => sum + parseFloat(wo.actualHours || 0), 0),
      statusBreakdown: {},
      priorityBreakdown: {},
      overdue: 0,
      dueToday: 0,
      dueSoon: 0 // Next 7 days
    };

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    workOrders.forEach(wo => {
      // Status breakdown
      const statusName = wo.WorkOrderStatus?.name || 'Unknown';
      metrics.statusBreakdown[statusName] = (metrics.statusBreakdown[statusName] || 0) + 1;

      // Priority breakdown
      const priorityLevel = wo.Priority?.level || 'Unknown';
      metrics.priorityBreakdown[priorityLevel] = (metrics.priorityBreakdown[priorityLevel] || 0) + 1;

      // Due date analysis
      if (wo.dueDate) {
        const dueDate = new Date(wo.dueDate);
        if (dueDate < today) {
          metrics.overdue += 1;
        } else if (dueDate.toDateString() === today.toDateString()) {
          metrics.dueToday += 1;
        } else if (dueDate <= nextWeek) {
          metrics.dueSoon += 1;
        }
      }
    });

    // Calculate efficiency ratio
    metrics.efficiencyRatio = metrics.totalEstimatedHours > 0 
      ? (metrics.totalActualHours / metrics.totalEstimatedHours * 100).toFixed(1)
      : 0;

    res.status(200).json({
      err: false,
      msg: 'Work orders summary retrieved successfully',
      widget: {
        type: 'workOrdersSummary',
        period: periodName || periodValue,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        data: metrics
      }
    });

  } catch (err) {
    console.error('Error retrieving work orders summary:', err);
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const getClientInsightsWidget = async (req, res) => {
  try {
    const { period, limit = 10 } = req.body;

    // Use shared utility for date range calculation
    const { startDate, endDate, periodName, periodValue } = getStartEndDate(period);

    // Get clients with their related data
    const clients = await Client.findAll({
      include: [
        {
          model: Estimate,
          as: 'Estimates',
          where: { 
            createdAt: { [Op.between]: [startDate, endDate] },
            isActive: true,
            statusId: { [Op.notIn]: [2, 4, 6] } // Exclude inactive, lost, expired
          },
          required: false,
          attributes: ['id', 'total', 'createdAt', 'statusId']
        },
        {
          model: Invoice,
          as: 'Invoices',
          where: { 
            createdAt: { [Op.between]: [startDate, endDate] },
            isActive: true 
          },
          required: false,
          attributes: ['id', 'total', 'createdAt']
        },
        {
          model: WorkOrder,
          as: 'WorkOrders',
          where: { 
            createdAt: { [Op.between]: [startDate, endDate] },
            isActive: true 
          },
          required: false,
          attributes: ['id', 'cost', 'createdAt']
        }
      ],
      attributes: ['id', 'firstName', 'lastName', 'createdAt']
    });

    // Calculate client metrics with better categorization
    const clientMetrics = clients.map(client => {
      const estimatesCount = client.Estimates?.length || 0;
      const invoicesCount = client.Invoices?.length || 0;
      const workOrdersCount = client.WorkOrders?.length || 0;
      
      // Potential Revenue (Estimates) - opportunities in pipeline
      const potentialRevenue = client.Estimates?.reduce((sum, estimate) => {
        return sum + parseFloat(estimate.total || 0);
      }, 0) || 0;
      
      // Realized Revenue (Invoices) - actual money earned
      const realizedRevenue = client.Invoices?.reduce((sum, invoice) => {
        return sum + parseFloat(invoice.total || 0);
      }, 0) || 0;

      // Service Investment (Work Orders) - operational costs/resources deployed
      const serviceInvestment = client.WorkOrders?.reduce((sum, workOrder) => {
        return sum + parseFloat(workOrder.cost || 0);
      }, 0) || 0;

      const totalActivity = estimatesCount + invoicesCount + workOrdersCount;
      const totalValue = potentialRevenue + realizedRevenue + serviceInvestment;
      
      // Calculate client health metrics
      const conversionRate = estimatesCount > 0 ? (invoicesCount / estimatesCount * 100) : 0;
      const profitability = realizedRevenue - serviceInvestment;
      const engagementScore = totalActivity; // Simple engagement metric

      return {
        id: client.id,
        name: `${client.firstName} ${client.lastName}`.trim() || 'Unknown',
        
        // Activity counts
        estimatesCount,
        invoicesCount,
        workOrdersCount,
        totalActivity,
        
        // Revenue categories
        potentialRevenue,
        realizedRevenue,
        serviceInvestment,
        totalValue,
        
        // Client health metrics
        conversionRate: Math.round(conversionRate * 100) / 100,
        profitability: Math.round(profitability * 100) / 100,
        engagementScore,
        
        // Client tier based on total value
        tier: totalValue >= 10000 ? 'Premium' : 
              totalValue >= 5000 ? 'Gold' : 
              totalValue >= 1000 ? 'Silver' : 'Bronze'
      };
    }).filter(client => client.totalActivity > 0)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, parseInt(limit));

    // Calculate enhanced summary metrics
    const summary = {
      totalClients: clients.length,
      activeClients: clientMetrics.length,
      
      // Revenue breakdown
      totalPotentialRevenue: clientMetrics.reduce((sum, client) => sum + client.potentialRevenue, 0),
      totalRealizedRevenue: clientMetrics.reduce((sum, client) => sum + client.realizedRevenue, 0),
      totalServiceInvestment: clientMetrics.reduce((sum, client) => sum + client.serviceInvestment, 0),
      totalValue: clientMetrics.reduce((sum, client) => sum + client.totalValue, 0),
      
      // Performance metrics
      averageValuePerClient: clientMetrics.length > 0 
        ? (clientMetrics.reduce((sum, client) => sum + client.totalValue, 0) / clientMetrics.length)
        : 0,
      averageConversionRate: clientMetrics.length > 0
        ? (clientMetrics.reduce((sum, client) => sum + client.conversionRate, 0) / clientMetrics.length)
        : 0,
      totalProfitability: clientMetrics.reduce((sum, client) => sum + client.profitability, 0),
      
      // Client tier distribution
      tierDistribution: {
        Premium: clientMetrics.filter(c => c.tier === 'Premium').length,
        Gold: clientMetrics.filter(c => c.tier === 'Gold').length,
        Silver: clientMetrics.filter(c => c.tier === 'Silver').length,
        Bronze: clientMetrics.filter(c => c.tier === 'Bronze').length
      }
    };

    res.status(200).json({
      err: false,
      msg: 'Client insights retrieved successfully',
      widget: {
        type: 'clientInsights',
        period: periodName || periodValue,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        data: {
          summary,
          topClients: clientMetrics
        }
      }
    });

  } catch (err) {
    console.error('Error retrieving client insights:', err);
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const getUpcomingEventsWidget = async (req, res) => {
  try {
    // Get userId from request body, query params, or default to 1
    const userId = req.body.userId || req.userId;
    const { period, limit, includeAllUsers } = req.body;

    // Extract period value if it's an object, otherwise use as string
    const periodValue = typeof period === 'object' && period !== null ? period.value : period;
    const periodName = typeof period === 'object' && period !== null ? period.name : (period || '7d');

    // Calculate date range (from now to X days ahead based on period)
    const now = new Date();
    let days;
    
    switch (periodValue) {
      case '1d':
        days = 1;
        break;
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      case null:
        days = 1;
        break;
      default:
        days = 7; // Default to 7 days
    }

    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    let events;

    if (includeAllUsers) {
      // Get all events without user filtering
      // Include events that overlap with the period: events that start before the period ends AND end after the period starts
      events = await Event.findAll({
        where: {
          [Op.and]: [
            { startDate: { [Op.lte]: endDate } }, // Event starts before or during the period
            { endDate: { [Op.gte]: now } }        // Event ends during or after the period starts
          ],
          isActive: true
        },
        include: [
          {
            model: EventStatus,
            as: 'EventStatus',
            attributes: ['id', 'name']
          },
          {
            model: EventCategory,
            as: 'EventCategory',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        order: [['startDate', 'ASC']],
        limit: parseInt(limit),
        attributes: ['id', 'title', 'startDate', 'endDate', 'details', 'createdAt']
      });
    } else {
      // Get events where the user is a participant using EventParticipant
      // Include events that overlap with the period: events that start before the period ends AND end after the period starts
      events = await Event.findAll({
        where: {
          [Op.and]: [
            { startDate: { [Op.lte]: endDate } }, // Event starts before or during the period
            { endDate: { [Op.gte]: now } }        // Event ends during or after the period starts
          ],
          isActive: true
        },
        include: [
          {
            model: EventParticipant,
            as: 'EventParticipants',
            where: { userId: userId },
            attributes: ['userId']
          },
          {
            model: EventStatus,
            as: 'EventStatus',
            attributes: ['id', 'name']
          },
          {
            model: EventCategory,
            as: 'EventCategory',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'Creator',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        order: [['startDate', 'ASC']],
        limit: parseInt(limit),
        attributes: ['id', 'title', 'startDate', 'endDate', 'details', 'createdAt']
      });
    }
    
    // Format events for widget display
    const formattedEvents = events.map(event => {
      const startDate = new Date(event.startDate);
      const timeUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
      
      return {
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        details: event.details,
        status: event.EventStatus?.name || 'Unknown',
        category: event.EventCategory?.name || 'General',
        priority: 'Normal', // Priority not directly associated with events
        assignedUser: event.Creator ? `${event.Creator.firstName} ${event.Creator.lastName}` : 'Unassigned',
        daysUntil: timeUntil,
        isToday: timeUntil === 0,
        isPastDue: timeUntil < 0,
        urgency: timeUntil <= 1 ? 'urgent' : timeUntil <= 3 ? 'soon' : 'normal'
      };
    });

    // Calculate summary metrics
    const summary = {
      total: events.length,
      today: formattedEvents.filter(e => e.isToday).length,
      urgent: formattedEvents.filter(e => e.urgency === 'urgent').length,
      soon: formattedEvents.filter(e => e.urgency === 'soon').length
    };

    res.status(200).json({
      err: false,
      msg: 'Upcoming events retrieved successfully',
      widget: {
        type: 'upcomingEvents',
        period: periodName || periodValue,
        dateRange: {
          start: now.toISOString(),
          end: endDate.toISOString()
        },
        data: {
          summary,
          events: formattedEvents
        }
      }
    });

  } catch (err) {
    console.error('Error retrieving upcoming events:', err);
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const getInvoiceStatusWidget = async (req, res) => {
  try {
    const userId = req.userId;
    const { period, includeAllUsers = false } = req.body;

    // Get user permissions
    const permissions = await getAllPermissions(userId);
    const allowedPages = permissions.filter(p => p.action === 'view').map(p => p.Page.name);

    if (!allowedPages.includes('invoices')) {
      return res.status(403).json({
        err: true,
        msg: 'Access denied: insufficient permissions for invoices'
      });
    }

    // Use shared utility for date range calculation
    const { startDate, endDate, periodName, periodValue } = getStartEndDate(period);

    const whereClause = {
      createdAt: { [Op.between]: [startDate, endDate] }
    };

    if (!includeAllUsers) {
      whereClause.createdBy = userId;
    }

    const invoices = await Invoice.findAll({
      where: whereClause,
      include: [
        {
          model: Client,
          as: 'Client',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: InvoiceHistory,
          as: 'InvoiceHistories',
          attributes: ['id', 'amount'] // Only available fields
        }
      ],
      attributes: ['id', 'invoiceNumber', 'total', 'createdAt']
    });

    // Analyze invoice status and aging
    const metrics = {
      total: invoices.length,
      totalValue: 0,
      paid: 0,
      paidValue: 0,
      overdue: 0,
      overdueValue: 0,
      pending: 0,
      pendingValue: 0,
      aging: {
        current: 0,      // 0-30 days
        days30: 0,       // 31-60 days
        days60: 0,       // 61-90 days
        days90Plus: 0    // 90+ days
      },
      agingValues: {
        current: 0,
        days30: 0,
        days60: 0,
        days90Plus: 0
      }
    };

    const thirtyDaysAgo = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(endDate.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);

    invoices.forEach(invoice => {
      const invoiceValue = parseFloat(invoice.total || 0);
      metrics.totalValue += invoiceValue;

      // Determine payment status - simplified since we don't have status fields
      // We'll assume invoices are paid if they have positive history amounts
      const historyTotal = invoice.InvoiceHistories?.reduce((sum, history) => {
        return sum + parseFloat(history.amount || 0);
      }, 0) || 0;

      const isPaid = historyTotal >= invoiceValue; // Simple heuristic
      const invoiceDate = new Date(invoice.createdAt);

      if (isPaid) {
        metrics.paid += 1;
        metrics.paidValue += invoiceValue;
      } else {
        metrics.pending += 1;
        metrics.pendingValue += invoiceValue;

        // Check if overdue (assuming 30 day payment terms)
        const thirtyDaysAfterInvoice = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (endDate > thirtyDaysAfterInvoice) {
          metrics.overdue += 1;
          metrics.overdueValue += invoiceValue;
        }

        // Aging analysis
        if (invoiceDate >= thirtyDaysAgo) {
          metrics.aging.current += 1;
          metrics.agingValues.current += invoiceValue;
        } else if (invoiceDate >= sixtyDaysAgo) {
          metrics.aging.days30 += 1;
          metrics.agingValues.days30 += invoiceValue;
        } else if (invoiceDate >= ninetyDaysAgo) {
          metrics.aging.days60 += 1;
          metrics.agingValues.days60 += invoiceValue;
        } else {
          metrics.aging.days90Plus += 1;
          metrics.agingValues.days90Plus += invoiceValue;
        }
      }
    });

    // Calculate percentages
    metrics.paidPercentage = metrics.total > 0 ? (metrics.paid / metrics.total * 100).toFixed(1) : 0;
    metrics.overduePercentage = metrics.total > 0 ? (metrics.overdue / metrics.total * 100).toFixed(1) : 0;

    res.status(200).json({
      err: false,
      msg: 'Invoice status retrieved successfully',
      widget: {
        type: 'invoiceStatus',
        period: periodName || periodValue,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        data: metrics
      }
    });

  } catch (err) {
    console.error('Error retrieving invoice status:', err);
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const getEstimateAnalyticsWidget = async (req, res) => {
  try {
    const {
      period,
      includeAllUsers
    } = req.body;

    const userId = req.body.userId || req.userId;

    // Use shared utility for date range calculation
    const { startDate, endDate, periodName, periodValue } = getStartEndDate(period);

    const whereClause = {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    };

    // Add user filtering if not including all users
    if (!includeAllUsers && userId) {
      // Filter by estimates assigned to or created by the specific user
      whereClause[Op.or] = [
        { assignedUserId: userId },
        { creatorId: userId }
      ];
    }

    const estimates = await Estimate.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Client,
          as: 'Client',
          attributes: ['id', 'firstName', 'lastName', 'companyName']
        },
        {
          model: EstimateStatus,
          as: 'EstimateStatus',
          attributes: ['id', 'name']
        },
        {
          model: EstimateHistory,
          as: 'Histories',
          attributes: ['id', 'amount', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate metrics
    const totalEstimates = estimates.length;
    let totalValue = 0;
    let totalProfit = 0;
    let acceptedEstimates = 0;
    let pendingEstimates = 0;
    let rejectedEstimates = 0;
    
    const statusBreakdown = {};
    const monthlyData = {};

    estimates.forEach(estimate => {
      // Calculate values from histories
      const estimateValue = estimate.Histories.reduce((sum, history) => 
        sum + (parseFloat(history.amount) || 0), 0);
      const estimateCost = parseFloat(estimate.cost) || 0;
      
      totalValue += estimateValue;
      totalProfit += estimateValue - estimateCost;

      // Status breakdown
      const statusName = estimate.EstimateStatus?.name || 'Unknown';
      statusBreakdown[statusName] = (statusBreakdown[statusName] || 0) + 1;

      if (statusName.toLowerCase().includes('accept') || statusName.toLowerCase().includes('approve')) {
        acceptedEstimates++;
      } else if (statusName.toLowerCase().includes('reject') || statusName.toLowerCase().includes('decline')) {
        rejectedEstimates++;
      } else {
        pendingEstimates++;
      }

      // Monthly data
      const month = estimate.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, value: 0 };
      }
      monthlyData[month].count++;
      monthlyData[month].value += estimateValue;
    });

    const conversionRate = totalEstimates > 0 ? (acceptedEstimates / totalEstimates * 100) : 0;
    const averageValue = totalEstimates > 0 ? (totalValue / totalEstimates) : 0;
    const profitMargin = totalValue > 0 ? (totalProfit / totalValue * 100) : 0;

    res.status(200).json({
      err: false,
      msg: 'Estimate analytics retrieved successfully',
      data: {
        period: periodName || periodValue,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        summary: {
          totalEstimates,
          totalValue: Math.round(totalValue * 100) / 100,
          totalProfit: Math.round(totalProfit * 100) / 100,
          averageValue: Math.round(averageValue * 100) / 100,
          conversionRate: Math.round(conversionRate * 100) / 100,
          profitMargin: Math.round(profitMargin * 100) / 100
        },
        breakdown: {
          accepted: acceptedEstimates,
          pending: pendingEstimates,
          rejected: rejectedEstimates,
          byStatus: statusBreakdown
        },
        trends: {
          monthly: Object.keys(monthlyData).sort().map(month => ({
            month,
            count: monthlyData[month].count,
            value: Math.round(monthlyData[month].value * 100) / 100
          }))
        }
      }
    });

  } catch (err) {
    console.error('Error retrieving estimate analytics:', err);
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const getPayrollMonthlyWidget = async (req, res) => {
  try {
    const userId = req.userId;
    const { period, status, includeItems = false } = req.body;

    // Use shared utility for date range calculation
    const { startDate, endDate, periodName, periodValue } = getStartEndDate(period);

    const whereClause = {
      createdAt: { [Op.between]: [startDate, endDate] },
      isActive: true
    };

    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }

    // Get payrolls with their items
    const payrolls = await Payroll.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'ApprovedBy',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        },
        {
          model: PayrollItem,
          as: 'PayrollItems',
          attributes: includeItems ? undefined : ['id'], // Always include for count, but limit attributes if not needed
          include: includeItems ? [{
            model: User,
            as: 'Employee',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }] : []
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate summary metrics
    const summary = {
      totalGrossPay: 0,
      totalDeductions: 0,
      totalNetPay: 0,
      totalPayrolls: payrolls.length,
      statusBreakdown: {},
      averagePayrollValue: 0
    };

    payrolls.forEach(payroll => {
      summary.totalGrossPay += parseFloat(payroll.totalGrossPay || 0);
      summary.totalDeductions += parseFloat(payroll.totalDeductions || 0);
      summary.totalNetPay += parseFloat(payroll.totalNetPay || 0);

      // Status breakdown
      const status = payroll.status || 'unknown';
      summary.statusBreakdown[status] = (summary.statusBreakdown[status] || 0) + 1;
    });

    summary.averagePayrollValue = summary.totalPayrolls > 0 
      ? summary.totalNetPay / summary.totalPayrolls 
      : 0;

    // Format payrolls for widget display
    const formattedPayrolls = payrolls.map(payroll => ({
      id: payroll.id,
      startDate: payroll.startDate,
      endDate: payroll.endDate,
      status: payroll.status,
      totalGrossPay: parseFloat(payroll.totalGrossPay || 0),
      totalDeductions: parseFloat(payroll.totalDeductions || 0),
      totalNetPay: parseFloat(payroll.totalNetPay || 0),
      employeeCount: payroll.PayrollItems ? payroll.PayrollItems.length : 0,
      processedDate: payroll.processedDate,
      creator: payroll.Creator ? `${payroll.Creator.firstName} ${payroll.Creator.lastName}` : 'Unknown',
      approvedBy: payroll.ApprovedBy ? `${payroll.ApprovedBy.firstName} ${payroll.ApprovedBy.lastName}` : 'Not Approved',
      creatorId: payroll.Creator ? payroll.Creator.id : null,
      createdAt: payroll.createdAt,
      PayrollItems: includeItems && payroll.PayrollItems ? payroll.PayrollItems : undefined
    }));

    res.status(200).json({
      err: false,
      msg: 'Payroll monthly data retrieved successfully',
      widget: {
        type: 'payrollMonthly',
        period: periodName || periodValue,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        data: formattedPayrolls,
        summary: {
          ...summary,
          totalGrossPay: Math.round(summary.totalGrossPay * 100) / 100,
          totalDeductions: Math.round(summary.totalDeductions * 100) / 100,
          totalNetPay: Math.round(summary.totalNetPay * 100) / 100,
          averagePayrollValue: Math.round(summary.averagePayrollValue * 100) / 100
        }
      }
    });

  } catch (err) {
    console.error('Error retrieving payroll monthly widget:', err);
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const getPayrollMonthlyExpensesWidget = async (req, res) => {
  try {
    const userId = req.userId;
    const { period, chartType = 'line', includeDeductions = true, includeAllUsers = false, limit = 10 } = req.body;

    // Use shared utility for date range calculation
    const { startDate, endDate, periodName, periodValue } = getStartEndDate(period);

    const whereClause = {
      createdAt: { [Op.between]: [startDate, endDate] },
      isActive: true
    };

    // Add user filter if not including all users
    if (!includeAllUsers) {
      whereClause.creatorId = userId;
    }

    // Get payrolls with their items for expense analysis
    const payrolls = await Payroll.findAll({
      where: whereClause,
      include: [
        {
          model: PayrollItem,
          as: 'PayrollItems',
          include: [{
            model: User,
            as: 'Employee',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit) || 50 // Apply limit to payrolls query
    });

    // Calculate expense summary
    const summary = {
      totalExpenses: 0,
      totalHours: 0,
      avgPerEmployee: 0,
      avgHourlyRate: 0,
      expenseChange: 0, // Will need historical data for comparison
      maxEmployeePay: 0
    };

    // Process employee data
    const employeeExpenses = {};
    const monthlyData = {};
    let totalEmployees = 0;

    payrolls.forEach(payroll => {
      const payrollDate = new Date(payroll.createdAt);
      const monthKey = `${payrollDate.getFullYear()}-${String(payrollDate.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: payrollDate,
          totalExpenses: 0,
          payrollCount: 0,
          grossPay: 0,
          deductions: 0,
          netPay: 0
        };
      }

      const payrollExpense = parseFloat(payroll.totalNetPay || 0);
      summary.totalExpenses += payrollExpense;
      monthlyData[monthKey].totalExpenses += payrollExpense;
      monthlyData[monthKey].payrollCount += 1;
      monthlyData[monthKey].grossPay += parseFloat(payroll.totalGrossPay || 0);
      monthlyData[monthKey].deductions += parseFloat(payroll.totalDeductions || 0);
      monthlyData[monthKey].netPay += parseFloat(payroll.totalNetPay || 0);

      // Process individual employee data
      if (payroll.PayrollItems) {
        payroll.PayrollItems.forEach(item => {
          const employeeId = item.employeeId;
          const employeeName = item.Employee ? `${item.Employee.firstName} ${item.Employee.lastName}` : 'Unknown';
          const itemPay = parseFloat(item.netPay || 0);
          const itemHours = parseFloat(item.totalHours || 0);

          if (!employeeExpenses[employeeId]) {
            employeeExpenses[employeeId] = {
              id: employeeId,
              firstName: item.Employee?.firstName || 'Unknown',
              lastName: item.Employee?.lastName || '',
              totalPay: 0,
              totalHours: 0,
              payrollCount: 0
            };
            totalEmployees++;
          }

          employeeExpenses[employeeId].totalPay += itemPay;
          employeeExpenses[employeeId].totalHours += itemHours;
          employeeExpenses[employeeId].payrollCount += 1;

          summary.totalHours += itemHours;
          summary.maxEmployeePay = Math.max(summary.maxEmployeePay, employeeExpenses[employeeId].totalPay);
        });
      }
    });

    // Calculate derived metrics
    summary.avgPerEmployee = totalEmployees > 0 ? summary.totalExpenses / totalEmployees : 0;
    summary.avgHourlyRate = summary.totalHours > 0 ? summary.totalExpenses / summary.totalHours : 0;

    // Get top employees by expense
    const topEmployees = Object.values(employeeExpenses)
      .sort((a, b) => b.totalPay - a.totalPay)
      .slice(0, parseInt(limit) || 10);

    // Calculate monthly trends with change percentages
    const monthlyTrend = Object.keys(monthlyData)
      .sort()
      .map((monthKey, index, array) => {
        const current = monthlyData[monthKey];
        let change = 0;
        
        if (index > 0) {
          const previousKey = array[index - 1];
          const previous = monthlyData[previousKey];
          if (previous.totalExpenses > 0) {
            change = ((current.totalExpenses - previous.totalExpenses) / previous.totalExpenses) * 100;
          }
        }

        return {
          month: current.month,
          totalExpenses: Math.round(current.totalExpenses * 100) / 100,
          payrollCount: current.payrollCount,
          change: Math.round(change * 100) / 100,
          grossPay: Math.round(current.grossPay * 100) / 100,
          deductions: Math.round(current.deductions * 100) / 100,
          netPay: Math.round(current.netPay * 100) / 100
        };
      });

    // Calculate expense change (comparing first and last month)
    if (monthlyTrend.length >= 2) {
      const firstMonth = monthlyTrend[0];
      const lastMonth = monthlyTrend[monthlyTrend.length - 1];
      if (firstMonth.totalExpenses > 0) {
        summary.expenseChange = ((lastMonth.totalExpenses - firstMonth.totalExpenses) / firstMonth.totalExpenses) * 100;
      }
    }

    res.status(200).json({
      err: false,
      msg: 'Payroll expenses data retrieved successfully',
      widget: {
        type: 'payrollExpenses',
        period: periodName || periodValue,
        chartType,
        includeDeductions,
        includeAllUsers,
        limit,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        data: payrolls,
        summary: {
          ...summary,
          totalExpenses: Math.round(summary.totalExpenses * 100) / 100,
          avgPerEmployee: Math.round(summary.avgPerEmployee * 100) / 100,
          avgHourlyRate: Math.round(summary.avgHourlyRate * 100) / 100,
          expenseChange: Math.round(summary.expenseChange * 100) / 100,
          totalHours: Math.round(summary.totalHours * 100) / 100,
          maxEmployeePay: Math.round(summary.maxEmployeePay * 100) / 100
        },
        topEmployees,
        monthlyTrend
      }
    });

  } catch (err) {
    console.error('Error retrieving payroll expenses widget:', err);
    res.status(400).json({
      err: true,
      msg: err.message
    });
  }
};
const listWidgets = async (req, res) => {
  const widgetPageMap = {
    'Sales Overview': 'estimates',
    'Work Orders Summary': 'work orders',
    'Client Insights': 'clients',
    'Upcoming Events': 'events',
    'Invoice Status': 'invoices',
    'Activity Timeline': 'events',
    'Activity Summary': 'events',
    'Estimate Analytics': 'estimates',
    'Payroll Monthly': 'payroll',
    'Payroll Monthly Expenses': 'payroll',
  };
  try {
    const companyId = res.companyId || req.companyId || (req.user && req.user.companyId);
    let allowedPages = [];
    if (companyId) {
      allowedPages = await getAllowedPages(companyId);
    }
    console.log('Allowed Pages:', allowedPages);
    const widgets = await Widget.findAll();
    // Filter widgets based on allowed pages
    const filteredWidgets = widgets.filter(widget => {
      const page = widgetPageMap[widget.name];
      return !page || allowedPages.includes(page);
    });
    res.status(200).json({ err: false, msg: 'Widgets retrieved successfully', widgets: filteredWidgets });
  } catch (err) {
    res.status(400).json({ err: true, msg: err.message });
  }
};
const listRoleWidgets = async (req, res) => {
  const widgetPageMap = {
    'Sales Overview': 'estimates',
    'Work Orders Summary': 'work orders',
    'Client Insights': 'clients',
    'Upcoming Events': 'events',
    'Invoice Status': 'invoices',
    'Activity Timeline': 'events',
    'Activity Summary': 'events',
    'Estimate Analytics': 'estimates',
    'Payroll Monthly': 'payroll',
    'Payroll Monthly Expenses': 'payroll',
  };
  try {
    const companyId = res.companyId || req.companyId || (req.user && req.user.companyId);
    let allowedPages = [];
    if (companyId) {
      allowedPages = await getAllowedPages(companyId);
    }
    const widgets = await RoleWidget.findAll({
      include: [{ model: Widget, as: 'Widget' }]
    });
    // Filter widgets based on allowed pages
    const filteredWidgets = widgets.filter(roleWidget => {
      const widget = roleWidget.Widget;
      const page = widget && widgetPageMap[widget.name];
      return !page || allowedPages.includes(page);
    });
    res.status(200).json({ err: false, msg: 'Role Widgets retrieved successfully', widgets: filteredWidgets });
  } catch (err) {
    res.status(400).json({ err: true, msg: err.message });
  }
};
const calculateTotals = (estimates) => {
    let totalAmount = 0;
    let totalProfit = 0;

    estimates.forEach(
    estimate => {
      estimate.Histories.forEach(
        history => {
          totalAmount += parseFloat(history.amount);
          totalProfit += parseFloat(history.amount) - (parseFloat(estimate.cost) || 0);
        }
      );
      }
  );

    return { totalAmount, totalProfit };
};

module.exports = {
  getWidget,
  getWidgetEstimateData,
  getActivityTimeline,
  getActivitySummaryWidget,
  getSalesOverviewWidget,
  getWorkOrdersSummaryWidget,
  getClientInsightsWidget,
  getUpcomingEventsWidget,
  getInvoiceStatusWidget,
  getEstimateAnalyticsWidget,
  getPayrollMonthlyWidget,
  getPayrollMonthlyExpensesWidget,
  listWidgets,
  listRoleWidgets,
  generalSearch,
};
