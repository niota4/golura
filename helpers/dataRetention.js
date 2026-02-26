/**
 * Data Retention Policy Helper
 * 
 * This helper provides standardized data retention policies
 * for compliance with legal requirements and business needs.
 */

/**
 * Standard retention periods by data category
 */
const RETENTION_PERIODS = {
  // Legal and compliance requirements
  FINANCIAL_RECORDS: {
    period: '7 years',
    reason: 'Tax law requirements (IRS, state tax authorities)',
    enforcement: 'strict',
    archiveAfter: '3 years'
  },

  PAYROLL_RECORDS: {
    period: '4 years',
    reason: 'Fair Labor Standards Act (FLSA) requirements',
    enforcement: 'strict',
    archiveAfter: '2 years'
  },

  EMPLOYEE_RECORDS: {
    period: '7 years',
    reason: 'EEOC and state employment law requirements',
    enforcement: 'strict',
    archiveAfter: '3 years'
  },

  SAFETY_RECORDS: {
    period: '5 years',
    reason: 'OSHA record-keeping requirements',
    enforcement: 'strict',
    archiveAfter: '2 years'
  },

  // Business operational data
  CLIENT_RECORDS: {
    period: '7 years',
    reason: 'Business relationship and contract history',
    enforcement: 'flexible',
    archiveAfter: '3 years'
  },

  PROJECT_RECORDS: {
    period: '10 years',
    reason: 'Construction warranty and liability periods',
    enforcement: 'strict',
    archiveAfter: '5 years'
  },

  COMMUNICATION_LOGS: {
    period: '3 years',
    reason: 'Customer service and dispute resolution',
    enforcement: 'flexible',
    archiveAfter: '1 year'
  },

  // Privacy and personal data
  PII_DATA: {
    period: 'varies',
    reason: 'GDPR/CCPA - based on lawful basis',
    enforcement: 'strict',
    archiveAfter: 'immediate',
    requiresConsent: true
  },

  MARKETING_DATA: {
    period: '3 years',
    reason: 'Marketing consent and opt-out tracking',
    enforcement: 'strict',
    archiveAfter: '1 year',
    requiresConsent: true
  },

  // System and security data
  AUDIT_LOGS: {
    period: '7 years',
    reason: 'Security auditing and compliance',
    enforcement: 'strict',
    archiveAfter: '1 year'
  },

  SESSION_DATA: {
    period: '30 days',
    reason: 'Security monitoring and debugging',
    enforcement: 'automatic',
    archiveAfter: '7 days'
  },

  ERROR_LOGS: {
    period: '2 years',
    reason: 'System debugging and improvement',
    enforcement: 'automatic',
    archiveAfter: '6 months'
  },

  // Temporary data
  TEMPORARY_FILES: {
    period: '30 days',
    reason: 'Processing and workflow completion',
    enforcement: 'automatic',
    archiveAfter: 'immediate'
  },

  CACHE_DATA: {
    period: '7 days',
    reason: 'Performance optimization',
    enforcement: 'automatic',
    archiveAfter: 'immediate'
  }
};

/**
 * Industry-specific retention requirements
 */
const INDUSTRY_RETENTION = {
  CONSTRUCTION: {
    PROJECT_DOCUMENTATION: {
      period: '10 years',
      reason: 'Statute of limitations for construction defects',
      categories: ['estimates', 'workOrders', 'inspections', 'permits']
    },
    
    SAFETY_INCIDENTS: {
      period: '5 years',
      reason: 'OSHA requirements for safety records',
      categories: ['incidents', 'safetyReports', 'training']
    },
    
    SUBCONTRACTOR_RECORDS: {
      period: '7 years',
      reason: 'Contract and liability documentation',
      categories: ['agreements', 'insurance', 'performance']
    },
    
    ENVIRONMENTAL_COMPLIANCE: {
      period: '3 years',
      reason: 'EPA and state environmental regulations',
      categories: ['wasteDisposal', 'materialSafety', 'spills']
    }
  },

  FINANCIAL_SERVICES: {
    TRANSACTION_RECORDS: {
      period: '5 years',
      reason: 'Bank Secrecy Act and anti-money laundering',
      categories: ['payments', 'transfers', 'deposits']
    },
    
    CUSTOMER_IDENTIFICATION: {
      period: '5 years',
      reason: 'Customer Identification Program (CIP)',
      categories: ['kyc', 'verification', 'documentation']
    }
  }
};

/**
 * Data lifecycle stages
 */
const LIFECYCLE_STAGES = {
  ACTIVE: {
    description: 'Data is actively used in business operations',
    storageType: 'primary',
    accessLevel: 'full',
    backupFrequency: 'daily'
  },

  INACTIVE: {
    description: 'Data is no longer actively used but may be needed',
    storageType: 'secondary',
    accessLevel: 'restricted',
    backupFrequency: 'weekly'
  },

  ARCHIVED: {
    description: 'Data is stored for compliance or historical purposes',
    storageType: 'archive',
    accessLevel: 'read-only',
    backupFrequency: 'monthly'
  },

  DISPOSED: {
    description: 'Data has been securely deleted or destroyed',
    storageType: 'none',
    accessLevel: 'none',
    backupFrequency: 'none'
  }
};

/**
 * Adds retention policy fields to a model definition
 * @param {Object} modelFields - Existing model field definitions
 * @param {string} retentionCategory - Retention category
 * @param {Object} DataTypes - Sequelize DataTypes
 * @param {Object} options - Additional options
 * @returns {Object} - Enhanced model fields with retention policy
 */
const addRetentionFields = (modelFields, retentionCategory, DataTypes, options = {}) => {
  const {
    enableArchiving = true,
    enablePurging = true,
    customRetentionPeriod = null
  } = options;

  const retentionFields = {};

  // Data lifecycle tracking
  retentionFields.lifecycleStage = {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED', 'DISPOSED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
    comment: 'Current lifecycle stage of the data'
  };

  retentionFields.retentionCategory = {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: retentionCategory,
    comment: 'Data retention category for compliance'
  };

  // Archiving fields
  if (enableArchiving) {
    retentionFields.archiveEligibleAt = {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when record becomes eligible for archiving'
    };

    retentionFields.archivedAt = {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when record was archived'
    };

    retentionFields.archivedBy = {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who archived the record'
    };
  }

  // Purging fields
  if (enablePurging) {
    retentionFields.purgeEligibleAt = {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when record becomes eligible for purging'
    };

    retentionFields.purgeScheduledAt = {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when record is scheduled for purging'
    };

    retentionFields.legalHoldUntil = {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date until which record must be preserved for legal reasons'
    };
  }

  // Retention metadata
  retentionFields.retentionMetadata = {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional retention policy metadata'
  };

  return {
    ...modelFields,
    ...retentionFields
  };
};

/**
 * Calculates retention dates based on policy
 * @param {string} retentionCategory - Retention category
 * @param {Date} baseDate - Base date for calculation (usually createdAt)
 * @param {Object} options - Additional options
 * @returns {Object} - Calculated retention dates
 */
const calculateRetentionDates = (retentionCategory, baseDate, options = {}) => {
  const policy = RETENTION_PERIODS[retentionCategory];
  const dates = {};

  if (!policy) {
    throw new Error(`Unknown retention category: ${retentionCategory}`);
  }

  const base = new Date(baseDate);

  // Calculate archive date
  if (policy.archiveAfter) {
    dates.archiveEligibleAt = addTimeToDate(base, policy.archiveAfter);
  }

  // Calculate purge date
  if (policy.period && policy.period !== 'varies') {
    dates.purgeEligibleAt = addTimeToDate(base, policy.period);
  }

  // Apply legal hold if specified
  if (options.legalHoldUntil) {
    dates.legalHoldUntil = new Date(options.legalHoldUntil);
    
    // Extend purge date if legal hold is longer
    if (dates.purgeEligibleAt && dates.legalHoldUntil > dates.purgeEligibleAt) {
      dates.purgeEligibleAt = dates.legalHoldUntil;
    }
  }

  return dates;
};

/**
 * Adds time period to a date
 * @param {Date} date - Base date
 * @param {string} period - Time period (e.g., "3 years", "6 months", "30 days")
 * @returns {Date} - New date with added time
 */
const addTimeToDate = (date, period) => {
  const result = new Date(date);
  const parts = period.split(' ');
  const amount = parseInt(parts[0]);
  const unit = parts[1].toLowerCase();

  switch (unit) {
    case 'day':
    case 'days':
      result.setDate(result.getDate() + amount);
      break;
    case 'week':
    case 'weeks':
      result.setDate(result.getDate() + (amount * 7));
      break;
    case 'month':
    case 'months':
      result.setMonth(result.getMonth() + amount);
      break;
    case 'year':
    case 'years':
      result.setFullYear(result.getFullYear() + amount);
      break;
    default:
      throw new Error(`Unknown time unit: ${unit}`);
  }

  return result;
};

/**
 * Generates retention policy hooks for a model
 * @param {string} retentionCategory - Retention category
 * @param {Object} options - Additional options
 * @returns {Object} - Sequelize hooks for retention management
 */
const generateRetentionHooks = (retentionCategory, options = {}) => {
  return {
    afterCreate: (instance, options) => {
      // Calculate and set retention dates
      const retentionDates = calculateRetentionDates(
        retentionCategory,
        instance.createdAt || new Date(),
        options.context || {}
      );

      // Update instance with calculated dates
      Object.assign(instance, retentionDates);
    },

    beforeUpdate: (instance, options) => {
      // Prevent updates to archived records unless explicitly allowed
      if (instance.lifecycleStage === 'ARCHIVED' && !options.context?.allowArchivedUpdate) {
        throw new Error('Cannot update archived records');
      }

      // Prevent updates to records under legal hold
      if (instance.legalHoldUntil && new Date() < instance.legalHoldUntil && !options.context?.bypassLegalHold) {
        throw new Error('Cannot update records under legal hold');
      }
    },

    beforeDestroy: (instance, options) => {
      // Prevent deletion of records under legal hold
      if (instance.legalHoldUntil && new Date() < instance.legalHoldUntil && !options.context?.bypassLegalHold) {
        throw new Error('Cannot delete records under legal hold');
      }

      // Log retention policy compliance
      console.log(`Record ${instance.id} deleted in compliance with retention policy: ${retentionCategory}`);
    }
  };
};

/**
 * Validates retention policy compliance
 * @param {string} modelName - Model name
 * @param {string} retentionCategory - Retention category
 * @param {Object} modelFields - Model field definitions
 * @returns {Array} - Array of compliance warnings
 */
const validateRetentionCompliance = (modelName, retentionCategory, modelFields) => {
  const warnings = [];
  const policy = RETENTION_PERIODS[retentionCategory];

  if (!policy) {
    warnings.push(`Model '${modelName}' uses unknown retention category: ${retentionCategory}`);
    return warnings;
  }

  // Check for required retention fields
  const requiredFields = ['lifecycleStage', 'retentionCategory'];
  
  if (policy.archiveAfter) {
    requiredFields.push('archiveEligibleAt', 'archivedAt');
  }

  if (policy.period && policy.period !== 'varies') {
    requiredFields.push('purgeEligibleAt');
  }

  const fieldNames = Object.keys(modelFields);
  requiredFields.forEach(field => {
    if (!fieldNames.includes(field)) {
      warnings.push(`Model '${modelName}' missing required retention field: ${field}`);
    }
  });

  // Check for PII data with strict retention requirements
  const hasPIIFields = fieldNames.some(field => {
    const fieldDef = modelFields[field];
    return fieldDef.piiMetadata;
  });

  if (hasPIIFields && !fieldNames.includes('legalHoldUntil')) {
    warnings.push(`Model '${modelName}' contains PII but lacks legal hold protection`);
  }

  return warnings;
};

/**
 * Data retention job definitions for automated processing
 */
const RETENTION_JOBS = {
  ARCHIVE_ELIGIBLE: {
    name: 'Archive Eligible Records',
    schedule: '0 2 * * *', // Daily at 2 AM
    description: 'Moves eligible records to archived status',
    query: "SELECT * FROM {table} WHERE archiveEligibleAt <= NOW() AND lifecycleStage = 'ACTIVE'"
  },

  PURGE_ELIGIBLE: {
    name: 'Purge Eligible Records',
    schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
    description: 'Permanently deletes records eligible for purging',
    query: "SELECT * FROM {table} WHERE purgeEligibleAt <= NOW() AND lifecycleStage = 'ARCHIVED' AND (legalHoldUntil IS NULL OR legalHoldUntil <= NOW())"
  },

  LEGAL_HOLD_REVIEW: {
    name: 'Legal Hold Review',
    schedule: '0 9 * * 1', // Weekly on Monday at 9 AM
    description: 'Reviews records approaching legal hold expiration',
    query: "SELECT * FROM {table} WHERE legalHoldUntil BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)"
  }
};

module.exports = {
  RETENTION_PERIODS,
  INDUSTRY_RETENTION,
  LIFECYCLE_STAGES,
  RETENTION_JOBS,
  addRetentionFields,
  calculateRetentionDates,
  addTimeToDate,
  generateRetentionHooks,
  validateRetentionCompliance
};
