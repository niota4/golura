/**
 * Audit Trail Helper
 * 
 * This helper provides standardized audit trail fields and functionality
 * for comprehensive change tracking and compliance requirements.
 */

/**
 * Standard audit trail field definitions
 */
const AUDIT_FIELDS = {
  // Creation tracking
  createdBy: {
    type: 'INTEGER',
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'User who created this record'
  },

  // Update tracking  
  updatedBy: {
    type: 'INTEGER',
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'User who last updated this record'
  },

  // Soft delete tracking
  deletedAt: {
    type: 'DATE',
    allowNull: true,
    comment: 'Soft delete timestamp'
  },

  deletedBy: {
    type: 'INTEGER',
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'User who deleted this record'
  },

  // System tracking
  ipAddress: {
    type: 'STRING(45)',
    allowNull: true,
    comment: 'IP address of the client that made the change'
  },

  userAgent: {
    type: 'TEXT',
    allowNull: true,
    comment: 'User agent of the client that made the change'
  },

  // Change reason (for compliance)
  changeReason: {
    type: 'TEXT',
    allowNull: true,
    comment: 'Reason for the change (required for sensitive data)'
  },

  // Approval workflow
  approvedBy: {
    type: 'INTEGER',
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'User who approved this change'
  },

  approvedAt: {
    type: 'DATE',
    allowNull: true,
    comment: 'Timestamp when change was approved'
  },

  // Financial/compliance locking
  isLocked: {
    type: 'BOOLEAN',
    allowNull: false,
    defaultValue: false,
    comment: 'Prevents modification for compliance'
  },

  lockedBy: {
    type: 'INTEGER',
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'User who locked this record'
  },

  lockedAt: {
    type: 'DATE',
    allowNull: true,
    comment: 'Timestamp when record was locked'
  },

  lockReason: {
    type: 'TEXT',
    allowNull: true,
    comment: 'Reason for locking the record'
  }
};

/**
 * Audit trail configurations for different types of models
 */
const AUDIT_CONFIGURATIONS = {
  // Basic audit trail (most models)
  BASIC: {
    fields: ['createdBy', 'updatedBy', 'deletedAt', 'deletedBy'],
    enableSoftDelete: true,
    trackIPAddress: false,
    requireChangeReason: false
  },

  // Enhanced audit trail (sensitive data)
  ENHANCED: {
    fields: ['createdBy', 'updatedBy', 'deletedAt', 'deletedBy', 'ipAddress', 'userAgent', 'changeReason'],
    enableSoftDelete: true,
    trackIPAddress: true,
    requireChangeReason: true
  },

  // Financial audit trail (financial data)
  FINANCIAL: {
    fields: ['createdBy', 'updatedBy', 'deletedAt', 'deletedBy', 'ipAddress', 'userAgent', 'changeReason', 'isLocked', 'lockedBy', 'lockedAt', 'lockReason'],
    enableSoftDelete: true,
    trackIPAddress: true,
    requireChangeReason: true,
    enableLocking: true
  },

  // Approval workflow audit trail
  APPROVAL: {
    fields: ['createdBy', 'updatedBy', 'deletedAt', 'deletedBy', 'approvedBy', 'approvedAt'],
    enableSoftDelete: true,
    trackIPAddress: false,
    requireChangeReason: false,
    requireApproval: true
  },

  // System-only audit trail (automated processes)
  SYSTEM: {
    fields: ['createdBy', 'updatedBy'],
    enableSoftDelete: false,
    trackIPAddress: false,
    requireChangeReason: false
  }
};

/**
 * Adds audit trail fields to a model definition
 * @param {Object} modelFields - Existing model field definitions
 * @param {string} auditType - Type of audit trail (BASIC, ENHANCED, FINANCIAL, etc.)
 * @param {Object} DataTypes - Sequelize DataTypes
 * @param {Object} options - Additional options
 * @returns {Object} - Enhanced model fields with audit trail
 */
const addAuditFields = (modelFields, auditType = 'BASIC', DataTypes, options = {}) => {
  const config = AUDIT_CONFIGURATIONS[auditType];
  const auditFields = {};

  // Add selected audit fields
  config.fields.forEach(fieldName => {
    if (AUDIT_FIELDS[fieldName]) {
      const fieldDef = { ...AUDIT_FIELDS[fieldName] };
      
      // Convert string types to DataTypes
      if (fieldDef.type === 'INTEGER') {
        fieldDef.type = DataTypes.INTEGER;
      } else if (fieldDef.type === 'DATE') {
        fieldDef.type = DataTypes.DATE;
      } else if (fieldDef.type === 'BOOLEAN') {
        fieldDef.type = DataTypes.BOOLEAN;
      } else if (fieldDef.type === 'TEXT') {
        fieldDef.type = DataTypes.TEXT;
      } else if (fieldDef.type.startsWith('STRING')) {
        const length = fieldDef.type.match(/\((\d+)\)/)?.[1] || 255;
        fieldDef.type = DataTypes.STRING(parseInt(length));
      }

      auditFields[fieldName] = fieldDef;
    }
  });

  return {
    ...modelFields,
    ...auditFields
  };
};

/**
 * Generates audit trail indexes for a model
 * @param {string} tableName - The table name
 * @param {string} auditType - Type of audit trail
 * @returns {Array} - Array of audit-related indexes
 */
const generateAuditIndexes = (tableName, auditType = 'BASIC') => {
  const config = AUDIT_CONFIGURATIONS[auditType];
  const indexes = [];

  // Index for soft delete queries
  if (config.enableSoftDelete) {
    indexes.push({
      name: `idx_${tableName}_soft_delete`,
      using: "BTREE",
      fields: [{ name: "deletedAt" }],
      description: 'Optimizes soft delete filtering'
    });
  }

  // Index for audit trail queries
  if (config.fields.includes('createdBy')) {
    indexes.push({
      name: `idx_${tableName}_created_by`,
      using: "BTREE",
      fields: [{ name: "createdBy" }],
      description: 'Optimizes audit queries by creator'
    });
  }

  if (config.fields.includes('updatedBy')) {
    indexes.push({
      name: `idx_${tableName}_updated_by`,
      using: "BTREE",
      fields: [{ name: "updatedBy" }],
      description: 'Optimizes audit queries by updater'
    });
  }

  // Index for approval workflow
  if (config.requireApproval) {
    indexes.push({
      name: `idx_${tableName}_approval`,
      using: "BTREE",
      fields: [{ name: "approvedBy" }, { name: "approvedAt" }],
      description: 'Optimizes approval workflow queries'
    });
  }

  // Index for locked records
  if (config.enableLocking) {
    indexes.push({
      name: `idx_${tableName}_locked`,
      using: "BTREE",
      fields: [{ name: "isLocked" }],
      description: 'Optimizes locked record queries'
    });
  }

  return indexes;
};

/**
 * Generates audit trail model options (hooks, etc.)
 * @param {string} auditType - Type of audit trail
 * @param {Object} options - Additional options
 * @returns {Object} - Sequelize model options with audit hooks
 */
const generateAuditOptions = (auditType = 'BASIC', options = {}) => {
  const config = AUDIT_CONFIGURATIONS[auditType];
  const modelOptions = {
    timestamps: true
  };

  // Enable soft deletes if configured
  if (config.enableSoftDelete) {
    modelOptions.paranoid = true;
    modelOptions.deletedAt = 'deletedAt';
  }

  // Add audit hooks
  modelOptions.hooks = {
    beforeCreate: (instance, options) => {
      const userId = options.userId || options.context?.userId;
      const ipAddress = options.context?.ipAddress;
      const userAgent = options.context?.userAgent;

      if (userId && config.fields.includes('createdBy')) {
        instance.createdBy = userId;
      }

      if (config.trackIPAddress && ipAddress) {
        instance.ipAddress = ipAddress;
        instance.userAgent = userAgent;
      }

      // Require change reason for sensitive operations
      if (config.requireChangeReason && !instance.changeReason && !options.context?.isSystemGenerated) {
        throw new Error('Change reason is required for this operation');
      }
    },

    beforeUpdate: (instance, options) => {
      const userId = options.userId || options.context?.userId;
      const ipAddress = options.context?.ipAddress;
      const userAgent = options.context?.userAgent;

      if (userId && config.fields.includes('updatedBy')) {
        instance.updatedBy = userId;
      }

      if (config.trackIPAddress && ipAddress) {
        instance.ipAddress = ipAddress;
        instance.userAgent = userAgent;
      }

      // Check if record is locked
      if (config.enableLocking && instance.isLocked && !options.context?.bypassLock) {
        throw new Error('Cannot modify locked record');
      }

      // Require change reason for sensitive operations
      if (config.requireChangeReason && !instance.changeReason && !options.context?.isSystemGenerated) {
        throw new Error('Change reason is required for this operation');
      }
    },

    beforeDestroy: (instance, options) => {
      const userId = options.userId || options.context?.userId;

      if (userId && config.fields.includes('deletedBy')) {
        instance.deletedBy = userId;
      }

      // Check if record is locked
      if (config.enableLocking && instance.isLocked && !options.context?.bypassLock) {
        throw new Error('Cannot delete locked record');
      }
    }
  };

  return modelOptions;
};

/**
 * Validates audit configuration for compliance
 * @param {string} modelName - Model name
 * @param {string} auditType - Audit type
 * @param {Object} modelFields - Model field definitions
 * @returns {Array} - Array of compliance warnings
 */
const validateAuditCompliance = (modelName, auditType, modelFields) => {
  const warnings = [];
  const config = AUDIT_CONFIGURATIONS[auditType];
  const fieldNames = Object.keys(modelFields);

  // Check for financial data without proper audit trail
  const hasFinancialFields = fieldNames.some(field => 
    ['total', 'amount', 'subtotal', 'tax', 'price', 'cost'].some(financial => 
      field.toLowerCase().includes(financial)
    )
  );

  if (hasFinancialFields && auditType !== 'FINANCIAL') {
    warnings.push(`Model '${modelName}' contains financial data but uses '${auditType}' audit trail instead of 'FINANCIAL'`);
  }

  // Check for PII data without enhanced audit trail
  const hasPIIFields = fieldNames.some(field => {
    const fieldDef = modelFields[field];
    return fieldDef.piiMetadata || ['email', 'phone', 'ssn', 'address'].includes(field.toLowerCase());
  });

  if (hasPIIFields && !['ENHANCED', 'FINANCIAL'].includes(auditType)) {
    warnings.push(`Model '${modelName}' contains PII data but uses '${auditType}' audit trail instead of 'ENHANCED' or 'FINANCIAL'`);
  }

  return warnings;
};

/**
 * Standard audit field patterns by industry/compliance requirement
 */
const COMPLIANCE_PATTERNS = {
  // SOX compliance for financial data
  SOX: {
    requiredFields: ['createdBy', 'updatedBy', 'deletedAt', 'deletedBy', 'isLocked', 'lockedBy', 'lockedAt'],
    immutableAfterLock: true,
    requireApproval: true,
    retentionPeriod: '7 years'
  },

  // GDPR compliance for personal data
  GDPR: {
    requiredFields: ['createdBy', 'updatedBy', 'deletedAt', 'deletedBy', 'changeReason'],
    trackIPAddress: true,
    dataSubjectRights: true,
    retentionPeriod: 'varies'
  },

  // HIPAA compliance for healthcare data
  HIPAA: {
    requiredFields: ['createdBy', 'updatedBy', 'deletedAt', 'deletedBy', 'ipAddress', 'userAgent', 'changeReason'],
    encryptionRequired: true,
    accessLogging: true,
    retentionPeriod: '6 years'
  },

  // Construction industry standards
  CONSTRUCTION: {
    requiredFields: ['createdBy', 'updatedBy', 'deletedAt', 'deletedBy'],
    projectTracking: true,
    safetyCompliance: true,
    retentionPeriod: '7 years'
  }
};

module.exports = {
  AUDIT_FIELDS,
  AUDIT_CONFIGURATIONS,
  COMPLIANCE_PATTERNS,
  addAuditFields,
  generateAuditIndexes,
  generateAuditOptions,
  validateAuditCompliance
};
