/**
 * Database Indexing Strategy Helper
 * 
 * This helper provides standardized indexing strategies for optimal
 * database performance in production environments.
 */

/**
 * Index types and their use cases
 */
const INDEX_TYPES = {
  // Primary and unique indexes
  PRIMARY: 'primary',
  UNIQUE: 'unique',
  
  // Performance indexes
  BTREE: 'btree',          // Default for most queries
  HASH: 'hash',            // Equality lookups only
  FULLTEXT: 'fulltext',    // Text search
  SPATIAL: 'spatial',      // Geographic data
  
  // Composite indexes
  COMPOSITE: 'composite',   // Multiple columns
  COVERING: 'covering',     // Include additional columns
  
  // Specialized indexes
  PARTIAL: 'partial',       // With WHERE clause
  EXPRESSION: 'expression'  // On computed values
};

/**
 * Standard index patterns for common use cases
 */
const STANDARD_INDEX_PATTERNS = {
  // Multi-tenant application patterns
  TENANT_ISOLATION: {
    name: 'idx_{table}_company_id',
    fields: ['companyId'],
    priority: 'critical',
    description: 'Ensures efficient tenant data isolation'
  },
  
  TENANT_CREATED_AT: {
    name: 'idx_{table}_company_created',
    fields: ['companyId', 'createdAt'],
    priority: 'high',
    description: 'Optimizes tenant-specific chronological queries'
  },
  
  // Soft delete patterns
  SOFT_DELETE: {
    name: 'idx_{table}_soft_delete',
    fields: ['deletedAt'],
    priority: 'high',
    description: 'Optimizes queries filtering deleted records'
  },
  
  ACTIVE_RECORDS: {
    name: 'idx_{table}_active',
    fields: ['isActive'],
    priority: 'medium',
    description: 'Optimizes queries for active records only'
  },
  
  // Foreign key patterns
  FOREIGN_KEY: {
    name: 'idx_{table}_{field}',
    fields: ['{field}'],
    priority: 'high',
    description: 'Optimizes foreign key lookups and joins'
  },
  
  // Search patterns
  NAME_SEARCH: {
    name: 'idx_{table}_name_search',
    fields: ['firstName', 'lastName'],
    priority: 'medium',
    description: 'Optimizes name-based searches'
  },
  
  FULL_NAME_SEARCH: {
    name: 'idx_{table}_full_name',
    fields: ['CONCAT(firstName, " ", lastName)'],
    type: 'expression',
    priority: 'low',
    description: 'Optimizes full name searches'
  },
  
  // Status and workflow patterns
  STATUS_WORKFLOW: {
    name: 'idx_{table}_status',
    fields: ['statusId'],
    priority: 'medium',
    description: 'Optimizes status-based filtering'
  },
  
  // Date range patterns
  DATE_RANGE: {
    name: 'idx_{table}_date_range',
    fields: ['startDate', 'endDate'],
    priority: 'medium',
    description: 'Optimizes date range queries'
  },
  
  // Financial reporting patterns
  FINANCIAL_REPORTING: {
    name: 'idx_{table}_financial',
    fields: ['companyId', 'createdAt', 'total'],
    priority: 'high',
    description: 'Optimizes financial reporting queries'
  },
  
  // Geographic patterns
  COORDINATES: {
    name: 'idx_{table}_coordinates',
    fields: ['latitude', 'longitude'],
    type: 'spatial',
    priority: 'low',
    description: 'Optimizes geographic queries'
  },
  
  // Communication patterns
  EMAIL_LOOKUP: {
    name: 'idx_{table}_email',
    fields: ['email'],
    unique: true,
    priority: 'critical',
    description: 'Ensures unique email constraint and fast lookups'
  },
  
  PHONE_LOOKUP: {
    name: 'idx_{table}_phone',
    fields: ['phoneNumber'],
    priority: 'medium',
    description: 'Optimizes phone number lookups'
  }
};

/**
 * Generates comprehensive index strategy for a model
 * @param {string} tableName - The table name
 * @param {Object} fields - Model field definitions
 * @param {Object} options - Indexing options
 * @returns {Array} - Array of index definitions
 */
const generateIndexStrategy = (tableName, fields, options = {}) => {
  const {
    isMultiTenant = true,
    hasSoftDelete = false,
    hasGeoData = false,
    hasFinancialData = false,
    hasStatusWorkflow = false,
    hasDateRanges = false,
    customIndexes = []
  } = options;

  const indexes = [];
  const fieldNames = Object.keys(fields);

  // Always include primary key
  indexes.push({
    name: "PRIMARY",
    unique: true,
    using: "BTREE",
    fields: [{ name: "id" }],
    priority: 'critical',
    description: 'Primary key index'
  });

  // Multi-tenant indexes
  if (isMultiTenant && fieldNames.includes('companyId')) {
    indexes.push(createIndex(STANDARD_INDEX_PATTERNS.TENANT_ISOLATION, tableName));
    
    if (fieldNames.includes('createdAt')) {
      indexes.push(createIndex(STANDARD_INDEX_PATTERNS.TENANT_CREATED_AT, tableName));
    }
  }

  // Soft delete indexes
  if (hasSoftDelete && fieldNames.includes('deletedAt')) {
    indexes.push(createIndex(STANDARD_INDEX_PATTERNS.SOFT_DELETE, tableName));
  }

  if (fieldNames.includes('isActive')) {
    indexes.push(createIndex(STANDARD_INDEX_PATTERNS.ACTIVE_RECORDS, tableName));
  }

  // Foreign key indexes
  fieldNames.forEach(fieldName => {
    const field = fields[fieldName];
    if (field.references && !fieldName.endsWith('Id_idx')) {
      const pattern = { ...STANDARD_INDEX_PATTERNS.FOREIGN_KEY };
      pattern.name = pattern.name.replace('{field}', fieldName);
      pattern.fields = [fieldName];
      indexes.push(createIndex(pattern, tableName));
    }
  });

  // Search indexes
  if (fieldNames.includes('firstName') && fieldNames.includes('lastName')) {
    indexes.push(createIndex(STANDARD_INDEX_PATTERNS.NAME_SEARCH, tableName));
  }

  if (fieldNames.includes('email')) {
    indexes.push(createIndex(STANDARD_INDEX_PATTERNS.EMAIL_LOOKUP, tableName));
  }

  if (fieldNames.includes('phoneNumber') || fieldNames.includes('phone')) {
    const pattern = { ...STANDARD_INDEX_PATTERNS.PHONE_LOOKUP };
    pattern.fields = [fieldNames.includes('phoneNumber') ? 'phoneNumber' : 'phone'];
    indexes.push(createIndex(pattern, tableName));
  }

  // Status workflow indexes
  if (hasStatusWorkflow && fieldNames.includes('statusId')) {
    indexes.push(createIndex(STANDARD_INDEX_PATTERNS.STATUS_WORKFLOW, tableName));
  }

  // Date range indexes
  if (hasDateRanges && fieldNames.includes('startDate') && fieldNames.includes('endDate')) {
    indexes.push(createIndex(STANDARD_INDEX_PATTERNS.DATE_RANGE, tableName));
  }

  // Geographic indexes
  if (hasGeoData && fieldNames.includes('latitude') && fieldNames.includes('longitude')) {
    indexes.push(createIndex(STANDARD_INDEX_PATTERNS.COORDINATES, tableName));
  }

  // Financial reporting indexes
  if (hasFinancialData && fieldNames.includes('total') && fieldNames.includes('companyId')) {
    indexes.push(createIndex(STANDARD_INDEX_PATTERNS.FINANCIAL_REPORTING, tableName));
  }

  // Add custom indexes
  customIndexes.forEach(customIndex => {
    indexes.push(createIndex(customIndex, tableName));
  });

  return indexes;
};

/**
 * Creates an index definition from a pattern
 * @param {Object} pattern - Index pattern
 * @param {string} tableName - Table name
 * @returns {Object} - Sequelize index definition
 */
const createIndex = (pattern, tableName) => {
  const index = {
    name: pattern.name.replace('{table}', tableName),
    using: pattern.type === 'spatial' ? 'SPATIAL' : 'BTREE',
    fields: pattern.fields.map(field => {
      if (typeof field === 'string') {
        return { name: field };
      }
      return field;
    }),
    priority: pattern.priority,
    description: pattern.description
  };

  if (pattern.unique) {
    index.unique = true;
  }

  if (pattern.type === 'partial' && pattern.where) {
    index.where = pattern.where;
  }

  return index;
};

/**
 * Validates index strategy for performance issues
 * @param {Array} indexes - Array of index definitions
 * @param {Object} fields - Model field definitions
 * @returns {Array} - Array of performance warnings
 */
const validateIndexStrategy = (indexes, fields) => {
  const warnings = [];
  const fieldNames = Object.keys(fields);

  // Check for missing critical indexes
  const hasCompanyId = fieldNames.includes('companyId');
  const hasCompanyIndex = indexes.some(idx => 
    idx.fields.some(field => field.name === 'companyId')
  );
  
  if (hasCompanyId && !hasCompanyIndex) {
    warnings.push('Missing tenant isolation index on companyId - critical for performance');
  }

  // Check for too many indexes on small tables
  if (indexes.length > 10 && fieldNames.length < 10) {
    warnings.push('Too many indexes for small table - may hurt write performance');
  }

  // Check for redundant indexes
  const indexSignatures = new Set();
  indexes.forEach(idx => {
    const signature = idx.fields.map(f => f.name).join(',');
    if (indexSignatures.has(signature)) {
      warnings.push(`Potential redundant index: ${signature}`);
    }
    indexSignatures.add(signature);
  });

  return warnings;
};

/**
 * Performance monitoring index patterns
 */
const PERFORMANCE_INDEXES = {
  // Slow query optimization
  REPORTING_QUERIES: {
    activities: [
      {
        name: 'idx_activities_reporting',
        fields: ['companyId', 'activityType', 'createdAt', 'severity'],
        description: 'Optimizes activity reporting dashboards'
      }
    ],
    estimates: [
      {
        name: 'idx_estimates_pipeline',
        fields: ['companyId', 'statusId', 'createdAt', 'total'],
        description: 'Optimizes sales pipeline reporting'
      }
    ],
    invoices: [
      {
        name: 'idx_invoices_accounting',
        fields: ['companyId', 'createdAt', 'total', 'clientId'],
        description: 'Optimizes accounting and revenue reports'
      }
    ]
  },

  // Real-time features
  REAL_TIME: {
    notifications: [
      {
        name: 'idx_notifications_unread',
        fields: ['userId', 'isRead', 'createdAt'],
        where: { isRead: false },
        description: 'Optimizes unread notification queries'
      }
    ],
    activities: [
      {
        name: 'idx_activities_recent',
        fields: ['companyId', 'createdAt'],
        where: "createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)",
        description: 'Optimizes recent activity feeds'
      }
    ]
  }
};

module.exports = {
  INDEX_TYPES,
  STANDARD_INDEX_PATTERNS,
  PERFORMANCE_INDEXES,
  generateIndexStrategy,
  createIndex,
  validateIndexStrategy
};
