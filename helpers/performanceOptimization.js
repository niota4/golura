/**
 * Performance Optimization Helper
 * 
 * This helper provides standardized performance optimizations for Sequelize models
 * including query optimization, caching strategies, and database performance monitoring.
 */

/**
 * Query optimization patterns and strategies
 */
const QUERY_PATTERNS = {
  // Basic CRUD optimizations
  SINGLE_RECORD: {
    attributes: ['id'], // Only fetch required fields
    include: [], // Avoid unnecessary joins
    raw: true, // Use raw queries when appropriate
    logging: false // Disable logging in production
  },

  // List/pagination optimizations
  LIST_QUERY: {
    limit: 25, // Default page size
    offset: 0,
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['deletedAt'] }, // Exclude unnecessary fields
    subQuery: false, // Avoid subqueries when possible
    distinct: true // Use distinct for accurate counts
  },

  // Search optimizations
  SEARCH_QUERY: {
    attributes: ['id', 'name', 'description'],
    limit: 100,
    order: [['relevance', 'DESC']],
    include: [
      {
        model: null, // Will be set dynamically
        attributes: ['id', 'name'],
        required: false
      }
    ]
  },

  // Reporting optimizations
  REPORTING_QUERY: {
    attributes: [
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      [Sequelize.fn('SUM', Sequelize.col('amount')), 'total']
    ],
    group: ['status'],
    having: Sequelize.where(Sequelize.fn('COUNT', Sequelize.col('id')), '>', 0),
    raw: true
  }
};

/**
 * Index recommendations based on model usage patterns
 */
const INDEX_RECOMMENDATIONS = {
  // High-traffic read models
  READ_HEAVY: {
    indexes: [
      { fields: ['companyId'] }, // Multi-tenant
      { fields: ['status'] }, // Filtering
      { fields: ['createdAt'] }, // Sorting
      { fields: ['companyId', 'status'] }, // Composite
      { fields: ['deletedAt'] } // Soft delete
    ],
    tips: [
      'Use covering indexes for frequently accessed columns',
      'Consider partial indexes for soft deletes (WHERE deletedAt IS NULL)',
      'Monitor index usage with EXPLAIN ANALYZE'
    ]
  },

  // High-traffic write models
  WRITE_HEAVY: {
    indexes: [
      { fields: ['companyId'] }, // Essential for multi-tenant
      { fields: ['id', 'companyId'] } // Primary + tenant composite
    ],
    tips: [
      'Minimize indexes to reduce write overhead',
      'Use async indexing for large tables',
      'Consider index maintenance during off-peak hours'
    ]
  },

  // Search-optimized models
  SEARCH_OPTIMIZED: {
    indexes: [
      { fields: ['name'], type: 'GIN' }, // Full-text search
      { fields: ['description'], type: 'GIN' },
      { fields: ['companyId', 'name'] }, // Tenant + search
      { fields: ['tags'], type: 'GIN' } // Array search
    ],
    tips: [
      'Use GIN indexes for full-text search',
      'Consider trigram indexes for fuzzy matching',
      'Use tsvector for complex text search'
    ]
  },

  // Time-series models
  TIME_SERIES: {
    indexes: [
      { fields: ['companyId', 'createdAt'] }, // Partition key + time
      { fields: ['createdAt'] }, // Time range queries
      { fields: ['userId', 'createdAt'] }, // User activity
      { fields: ['status', 'createdAt'] } // Status + time
    ],
    tips: [
      'Consider table partitioning by time',
      'Use BRIN indexes for time-series data',
      'Implement data archiving for old records'
    ]
  }
};

/**
 * Caching strategies for different model types
 */
const CACHING_STRATEGIES = {
  // Static/reference data caching
  REFERENCE_DATA: {
    ttl: 3600, // 1 hour
    strategy: 'cache-first',
    invalidation: 'manual',
    key: (model, id) => `ref:${model}:${id}`,
    examples: ['countries', 'states', 'categories', 'templates']
  },

  // User session data caching
  SESSION_DATA: {
    ttl: 1800, // 30 minutes
    strategy: 'cache-aside',
    invalidation: 'time-based',
    key: (userId, type) => `session:${userId}:${type}`,
    examples: ['user preferences', 'permissions', 'recent activities']
  },

  // Computed/aggregated data caching
  COMPUTED_DATA: {
    ttl: 300, // 5 minutes
    strategy: 'write-through',
    invalidation: 'event-based',
    key: (companyId, metric) => `computed:${companyId}:${metric}`,
    examples: ['dashboard metrics', 'reports', 'summaries']
  },

  // Frequently accessed records
  HOT_DATA: {
    ttl: 900, // 15 minutes
    strategy: 'cache-aside',
    invalidation: 'version-based',
    key: (model, id, version) => `hot:${model}:${id}:${version}`,
    examples: ['active projects', 'current estimates', 'open invoices']
  }
};

/**
 * Database connection pool optimization
 */
const CONNECTION_POOL_CONFIG = {
  // Development environment
  DEVELOPMENT: {
    max: 5,
    min: 1,
    idle: 10000,
    acquire: 60000,
    evict: 1000,
    handleDisconnects: true
  },

  // Production environment
  PRODUCTION: {
    max: 20,
    min: 5,
    idle: 30000,
    acquire: 60000,
    evict: 1000,
    handleDisconnects: true,
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3
    }
  },

  // High-load environment
  HIGH_LOAD: {
    max: 50,
    min: 10,
    idle: 60000,
    acquire: 120000,
    evict: 2000,
    handleDisconnects: true,
    validate: true
  }
};

/**
 * Query performance monitoring
 */
const PERFORMANCE_MONITORING = {
  // Query execution time thresholds (milliseconds)
  THRESHOLDS: {
    FAST: 100,
    ACCEPTABLE: 500,
    SLOW: 1000,
    CRITICAL: 5000
  },

  // Monitoring configuration
  CONFIG: {
    enableLogging: process.env.NODE_ENV !== 'production',
    logSlowQueries: true,
    slowQueryThreshold: 1000,
    enableMetrics: true,
    metricsInterval: 60000 // 1 minute
  },

  // Performance metrics to track
  METRICS: [
    'query_count',
    'avg_execution_time',
    'slow_query_count',
    'connection_pool_usage',
    'cache_hit_ratio',
    'index_usage_ratio'
  ]
};

/**
 * Creates performance optimization hooks for a model
 * @param {Object} options - Performance optimization options
 * @returns {Object} - Sequelize hooks for performance optimization
 */
const createPerformanceHooks = (options = {}) => {
  const {
    enableQueryLogging = false,
    enableCaching = true,
    enableMetrics = true,
    optimizationLevel = 'standard'
  } = options;

  return {
    // Optimize queries before execution
    beforeFind: (options) => {
      optimizeQuery(options, optimizationLevel);
      
      if (enableQueryLogging) {
        console.time(`Query: ${options.model.name}`);
      }
    },

    // Log performance after query execution
    afterFind: (result, options) => {
      if (enableQueryLogging) {
        console.timeEnd(`Query: ${options.model.name}`);
      }

      if (enableMetrics) {
        recordQueryMetrics(options, result);
      }
    },

    // Cache invalidation on data changes
    afterCreate: (instance, options) => {
      if (enableCaching) {
        invalidateModelCache(instance, 'create');
      }
    },

    afterUpdate: (instance, options) => {
      if (enableCaching) {
        invalidateModelCache(instance, 'update');
      }
    },

    afterDestroy: (instance, options) => {
      if (enableCaching) {
        invalidateModelCache(instance, 'destroy');
      }
    }
  };
};

/**
 * Optimizes query options based on optimization level
 */
const optimizeQuery = (options, level) => {
  switch (level) {
    case 'aggressive':
      // Maximum optimization
      applyAggressiveOptimizations(options);
      break;
    case 'standard':
      // Balanced optimization
      applyStandardOptimizations(options);
      break;
    case 'minimal':
      // Basic optimization only
      applyMinimalOptimizations(options);
      break;
  }
};

/**
 * Applies aggressive query optimizations
 */
const applyAggressiveOptimizations = (options) => {
  // Use raw queries when possible
  if (!options.include || options.include.length === 0) {
    options.raw = true;
  }

  // Limit attributes to essential fields only
  if (!options.attributes) {
    options.attributes = getEssentialAttributes(options.model);
  }

  // Disable logging in production
  if (process.env.NODE_ENV === 'production') {
    options.logging = false;
  }

  // Use subQuery: false for better performance
  options.subQuery = false;

  // Add appropriate indexes hint
  addIndexHints(options);
};

/**
 * Applies standard query optimizations
 */
const applyStandardOptimizations = (options) => {
  // Exclude soft delete fields unless specifically needed
  if (options.paranoid !== false && !options.include) {
    options.attributes = options.attributes || { exclude: ['deletedAt'] };
  }

  // Set reasonable limits for list queries
  if (!options.limit && isListQuery(options)) {
    options.limit = 25;
  }

  // Optimize include queries
  if (options.include) {
    optimizeIncludes(options.include);
  }
};

/**
 * Applies minimal query optimizations
 */
const applyMinimalOptimizations = (options) => {
  // Only apply essential optimizations
  if (process.env.NODE_ENV === 'production') {
    options.logging = false;
  }
};

/**
 * Gets essential attributes for a model
 */
const getEssentialAttributes = (model) => {
  const essentials = ['id', 'name', 'title', 'status', 'companyId', 'createdAt'];
  const modelAttributes = Object.keys(model.rawAttributes);
  
  return essentials.filter(attr => modelAttributes.includes(attr));
};

/**
 * Adds database index hints for query optimization
 */
const addIndexHints = (options) => {
  // PostgreSQL index hints
  if (options.where && options.where.companyId) {
    options.indexHints = [
      { type: 'USE', indexes: ['idx_company_id'] }
    ];
  }
};

/**
 * Determines if a query is a list/pagination query
 */
const isListQuery = (options) => {
  return options.offset !== undefined || 
         options.limit !== undefined || 
         (options.order && options.order.length > 0);
};

/**
 * Optimizes include queries
 */
const optimizeIncludes = (includes) => {
  includes.forEach(include => {
    // Limit attributes in includes
    if (!include.attributes) {
      include.attributes = ['id', 'name'];
    }

    // Use required: false for left joins
    if (include.required === undefined) {
      include.required = false;
    }

    // Recursively optimize nested includes
    if (include.include) {
      optimizeIncludes(include.include);
    }
  });
};

/**
 * Records query performance metrics
 */
const recordQueryMetrics = (options, result) => {
  const metrics = {
    model: options.model.name,
    operation: options.type || 'SELECT',
    executionTime: options.executionTime,
    resultCount: Array.isArray(result) ? result.length : (result ? 1 : 0),
    timestamp: new Date()
  };

  // Send metrics to monitoring system
  if (global.metricsCollector) {
    global.metricsCollector.record(metrics);
  }
};

/**
 * Invalidates relevant cache entries when model data changes
 */
const invalidateModelCache = (instance, operation) => {
  const modelName = instance.constructor.name;
  const companyId = instance.companyId;
  
  // Invalidate specific record cache
  const recordKey = `${modelName}:${instance.id}`;
  if (global.cacheManager) {
    global.cacheManager.del(recordKey);
  }

  // Invalidate list caches for the company
  const listKey = `${modelName}:list:${companyId}`;
  if (global.cacheManager) {
    global.cacheManager.del(listKey);
  }

  // Invalidate computed data caches
  invalidateComputedCaches(modelName, companyId, operation);
};

/**
 * Invalidates computed caches based on model changes
 */
const invalidateComputedCaches = (modelName, companyId, operation) => {
  const computedCachePatterns = {
    'invoices': ['dashboard:revenue', 'reports:financial'],
    'estimates': ['dashboard:sales', 'reports:estimates'],
    'projects': ['dashboard:projects', 'reports:activity'],
    'clients': ['dashboard:clients', 'reports:clients']
  };

  const patterns = computedCachePatterns[modelName.toLowerCase()];
  if (patterns && global.cacheManager) {
    patterns.forEach(pattern => {
      const key = `${pattern}:${companyId}`;
      global.cacheManager.del(key);
    });
  }
};

/**
 * Database query optimization utilities
 */
const QueryOptimizer = {
  /**
   * Analyzes query performance and suggests optimizations
   */
  analyzeQuery: async (sql, params = []) => {
    try {
      // Use EXPLAIN ANALYZE for PostgreSQL
      const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sql}`;
      const result = await sequelize.query(explainQuery, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      return analyzeExplainResult(result[0]);
    } catch (error) {
      console.error('Query analysis failed:', error);
      return null;
    }
  },

  /**
   * Suggests indexes based on query patterns
   */
  suggestIndexes: (model, queryPatterns) => {
    const suggestions = [];
    
    queryPatterns.forEach(pattern => {
      if (pattern.where) {
        Object.keys(pattern.where).forEach(field => {
          suggestions.push({
            type: 'single',
            fields: [field],
            reason: `Frequent WHERE clause on ${field}`
          });
        });
      }

      if (pattern.order) {
        pattern.order.forEach(orderClause => {
          const field = Array.isArray(orderClause) ? orderClause[0] : orderClause;
          suggestions.push({
            type: 'single',
            fields: [field],
            reason: `Frequent ORDER BY on ${field}`
          });
        });
      }
    });

    return deduplicateIndexSuggestions(suggestions);
  },

  /**
   * Monitors slow queries and suggests optimizations
   */
  monitorSlowQueries: (threshold = 1000) => {
    const slowQueries = [];
    
    return {
      beforeQuery: (sql, options) => {
        options.startTime = Date.now();
      },
      
      afterQuery: (sql, options) => {
        const executionTime = Date.now() - options.startTime;
        
        if (executionTime > threshold) {
          slowQueries.push({
            sql,
            executionTime,
            timestamp: new Date(),
            options: sanitizeOptions(options)
          });
          
          console.warn(`Slow query detected (${executionTime}ms):`, sql);
        }
      },
      
      getSlowQueries: () => slowQueries,
      clearSlowQueries: () => { slowQueries.length = 0; }
    };
  }
};

/**
 * Analyzes EXPLAIN ANALYZE results
 */
const analyzeExplainResult = (explainResult) => {
  const plan = explainResult[0]?.Plan;
  if (!plan) return null;

  return {
    totalCost: plan['Total Cost'],
    executionTime: plan['Actual Total Time'],
    rowsReturned: plan['Actual Rows'],
    nodeType: plan['Node Type'],
    indexUsed: plan['Index Name'] || null,
    recommendations: generateRecommendations(plan)
  };
};

/**
 * Generates optimization recommendations based on query plan
 */
const generateRecommendations = (plan) => {
  const recommendations = [];

  if (plan['Node Type'] === 'Seq Scan') {
    recommendations.push('Consider adding an index for this sequential scan');
  }

  if (plan['Total Cost'] > 1000) {
    recommendations.push('High cost query - consider query optimization');
  }

  if (plan['Actual Rows'] > 10000) {
    recommendations.push('Large result set - consider pagination or filtering');
  }

  return recommendations;
};

/**
 * Deduplicates index suggestions
 */
const deduplicateIndexSuggestions = (suggestions) => {
  const seen = new Set();
  return suggestions.filter(suggestion => {
    const key = `${suggestion.type}:${suggestion.fields.join(',')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Sanitizes query options for logging
 */
const sanitizeOptions = (options) => {
  const sanitized = { ...options };
  delete sanitized.startTime;
  delete sanitized.password;
  delete sanitized.secret;
  return sanitized;
};

module.exports = {
  QUERY_PATTERNS,
  INDEX_RECOMMENDATIONS,
  CACHING_STRATEGIES,
  CONNECTION_POOL_CONFIG,
  PERFORMANCE_MONITORING,
  createPerformanceHooks,
  QueryOptimizer,
  optimizeQuery,
  recordQueryMetrics,
  invalidateModelCache
};
