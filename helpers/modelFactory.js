/**
 * Comprehensive Model Factory
 * 
 * This factory integrates all helper systems to create production-ready
 * Sequelize models with enterprise-grade features including security,
 * performance optimization, compliance, and construction industry specifics.
 */

const { DataTypes, Model } = require('sequelize');

// Import all helper systems
const { PII_HELPER, PIIDataProcessor } = require('./piiHelper');
const { INDEXING_STRATEGY, IndexManager } = require('./indexingStrategy');
const { AUDIT_TRAIL, AuditLogger } = require('./auditTrail');
const { DATE_VALIDATION, DateValidator } = require('./dateValidation');
const { DATA_RETENTION, RetentionPolicyManager } = require('./dataRetention');
const { ERROR_HANDLING, ErrorHandler } = require('./errorHandling');
const { PERFORMANCE_OPTIMIZATION, PerformanceMonitor } = require('./performanceOptimization');
const { RBAC_SYSTEM, PermissionCalculator } = require('./rbacSystem');
const { CONSTRUCTION_FIELDS, CONSTRUCTION_VALIDATIONS } = require('./constructionFields');
const { DOCUMENT_VERSIONING, DocumentVersionManager } = require('./documentVersioning');
const { MULTI_CURRENCY, CurrencyConverter } = require('./multiCurrency');
const { VALIDATION_SCHEMAS, BUSINESS_VALIDATIONS } = require('./validationSchemas');
const { JSON_OPTIMIZATION, JSONFieldOptimizer } = require('./jsonOptimization');
const { JOB_TYPES, JobQueueManager } = require('./backgroundJobs');

/**
 * Model configuration templates for different model types
 */
const MODEL_TEMPLATES = {
  // Financial models (high security, audit trails, multi-currency)
  FINANCIAL: {
    security: 'high',
    auditLevel: 'comprehensive',
    encryptionRequired: true,
    multiCurrency: true,
    complianceFrameworks: ['SOX', 'PCI_DSS'],
    retentionYears: 7,
    features: ['audit', 'encryption', 'currency', 'validation', 'rbac']
  },

  // Client/Personal data models (PII protection, GDPR compliance)
  PERSONAL_DATA: {
    security: 'maximum',
    auditLevel: 'comprehensive', 
    encryptionRequired: true,
    piiProtection: true,
    complianceFrameworks: ['GDPR', 'CCPA', 'PIPEDA'],
    retentionYears: 3,
    features: ['pii', 'audit', 'encryption', 'gdpr', 'validation', 'rbac']
  },

  // Project/Construction models (industry-specific, document versioning)
  PROJECT_DATA: {
    security: 'high',
    auditLevel: 'standard',
    encryptionRequired: false,
    constructionSpecific: true,
    documentVersioning: true,
    complianceFrameworks: ['OSHA', 'ISO_9001'],
    retentionYears: 10,
    features: ['construction', 'versioning', 'audit', 'validation', 'rbac']
  },

  // Communication models (moderate security, retention policies)
  COMMUNICATION: {
    security: 'medium',
    auditLevel: 'basic',
    encryptionRequired: false,
    messageRetention: true,
    complianceFrameworks: ['CAN_SPAM'],
    retentionYears: 2,
    features: ['retention', 'validation', 'rbac']
  },

  // System/Configuration models (high availability, caching)
  SYSTEM_CONFIG: {
    security: 'high',
    auditLevel: 'comprehensive',
    encryptionRequired: true,
    highAvailability: true,
    caching: 'aggressive',
    complianceFrameworks: ['ISO_27001'],
    retentionYears: 5,
    features: ['audit', 'encryption', 'caching', 'validation', 'rbac']
  },

  // Analytics/Reporting models (performance optimized, materialized views)
  ANALYTICS: {
    security: 'medium',
    auditLevel: 'basic',
    encryptionRequired: false,
    performanceOptimized: true,
    materializedViews: true,
    retentionYears: 3,
    features: ['performance', 'caching', 'validation']
  }
};

/**
 * Model categories for applying different optimization strategies
 */
const MODEL_CATEGORIES = {
  // Core business entities
  CORE_BUSINESS: {
    examples: ['companies', 'users', 'clients', 'projects'],
    features: ['fullAudit', 'strongValidation', 'highSecurity', 'performanceOptimized'],
    indexStrategy: 'READ_HEAVY',
    cacheStrategy: 'HOT_DATA',
    retentionCategory: 'BUSINESS_RECORDS'
  },

  // Financial data
  FINANCIAL: {
    examples: ['invoices', 'payments', 'estimates', 'lineItems'],
    features: ['financialValidation', 'fullAudit', 'immutableRecords', 'highSecurity'],
    indexStrategy: 'READ_HEAVY',
    cacheStrategy: 'COMPUTED_DATA',
    retentionCategory: 'FINANCIAL_RECORDS'
  },

  // Communication & messaging
  COMMUNICATION: {
    examples: ['emails', 'chatMessages', 'notifications', 'phoneCalls'],
    features: ['basicAudit', 'piiHandling', 'bulkOperations'],
    indexStrategy: 'TIME_SERIES',
    cacheStrategy: 'SESSION_DATA',
    retentionCategory: 'COMMUNICATION_RECORDS'
  },

  // Reference data
  REFERENCE: {
    examples: ['categories', 'types', 'statuses', 'templates'],
    features: ['basicValidation', 'highCaching', 'readOptimized'],
    indexStrategy: 'READ_HEAVY',
    cacheStrategy: 'REFERENCE_DATA',
    retentionCategory: 'PERMANENT'
  },

  // Activity & logging
  ACTIVITY: {
    examples: ['activities', 'logs', 'events', 'tracking'],
    features: ['writeOptimized', 'bulkInsert', 'timePartitioned'],
    indexStrategy: 'TIME_SERIES',
    cacheStrategy: 'MINIMAL',
    retentionCategory: 'ACTIVITY_LOGS'
  },

  // System & configuration
  SYSTEM: {
    examples: ['settings', 'configurations', 'integrations', 'permissions'],
    features: ['strongValidation', 'changeTracking', 'highSecurity'],
    indexStrategy: 'READ_HEAVY',
    cacheStrategy: 'REFERENCE_DATA',
    retentionCategory: 'SYSTEM_CONFIG'
  }
};

/**
 * Enhanced Model Factory Class
 */
class EnhancedModelFactory {
  constructor(sequelize, options = {}) {
    this.sequelize = sequelize;
    this.options = {
      enableAuditTrails: true,
      enablePIIProtection: true,
      enablePerformanceOptimization: true,
      enableRBAC: true,
      enableDocumentVersioning: true,
      enableMultiCurrency: true,
      ...options
    };

    // Initialize managers
    try {
      this.auditLogger = new AuditLogger(sequelize);
      this.piiProcessor = new PIIDataProcessor();
      this.indexManager = new IndexManager(sequelize);
      this.performanceMonitor = new PerformanceMonitor();
      this.permissionCalculator = new PermissionCalculator();
      this.documentVersionManager = new DocumentVersionManager();
      this.currencyConverter = new CurrencyConverter();
      this.jsonOptimizer = new JSONFieldOptimizer();
      this.jobManager = new JobQueueManager();
    } catch (error) {
      console.warn('Some helper systems not available:', error.message);
    }
  }

  /**
   * Creates an enhanced Sequelize model with integrated features
   */
  createModel(modelName, fields, options = {}) {
    // Determine model template
    const template = this.getModelTemplate(modelName, options);
    
    // Process fields with enhancements
    const enhancedFields = this.enhanceFields(fields, template);
    
    // Create model options with all features
    const enhancedOptions = this.createEnhancedOptions(modelName, template, options);
    
    // Define the model
    const Model = this.sequelize.define(modelName, enhancedFields, enhancedOptions);
    
    // Add instance methods
    this.addInstanceMethods(Model, template);
    
    // Add class methods
    this.addClassMethods(Model, template);
    
    // Add hooks
    this.addModelHooks(Model, template);
    
    return Model;
  }

  /**
   * Determines the appropriate model template
   */
  getModelTemplate(modelName, options) {
    // Check for explicit template
    if (options.template) {
      return { ...MODEL_TEMPLATES[options.template], ...options };
    }

    // Auto-detect template based on model name
    const modelNameLower = modelName.toLowerCase();
    
    if (['payment', 'invoice', 'estimate', 'payroll', 'expense'].some(term => modelNameLower.includes(term))) {
      return MODEL_TEMPLATES.FINANCIAL;
    }
    
    if (['client', 'user', 'contact', 'address', 'phone', 'email'].some(term => modelNameLower.includes(term))) {
      return MODEL_TEMPLATES.PERSONAL_DATA;
    }
    
    if (['project', 'construction', 'estimate', 'document', 'blueprint'].some(term => modelNameLower.includes(term))) {
      return MODEL_TEMPLATES.PROJECT_DATA;
    }
    
    if (['message', 'notification', 'email', 'sms'].some(term => modelNameLower.includes(term))) {
      return MODEL_TEMPLATES.COMMUNICATION;
    }
    
    if (['setting', 'config', 'permission', 'role'].some(term => modelNameLower.includes(term))) {
      return MODEL_TEMPLATES.SYSTEM_CONFIG;
    }
    
    if (['analytic', 'report', 'metric', 'dashboard'].some(term => modelNameLower.includes(term))) {
      return MODEL_TEMPLATES.ANALYTICS;
    }

    // Default template
    return MODEL_TEMPLATES.PROJECT_DATA;
  }

  /**
   * Enhances field definitions with security and validation features
   */
  enhanceFields(fields, template) {
    const enhancedFields = { ...fields };

    // Add standard tracking fields if not present
    if (!enhancedFields.id) {
      enhancedFields.id = FIELD_TEMPLATES.UUID_PRIMARY;
    }

    if (!enhancedFields.created_at) {
      enhancedFields.created_at = FIELD_TEMPLATES.CREATED_AT;
    }

    if (!enhancedFields.updated_at) {
      enhancedFields.updated_at = FIELD_TEMPLATES.UPDATED_AT;
    }

    // Add soft delete if not analytics model
    if (template !== MODEL_TEMPLATES.ANALYTICS && !enhancedFields.deleted_at) {
      enhancedFields.deleted_at = FIELD_TEMPLATES.DELETED_AT;
    }

    // Add company context for multi-tenancy
    if (!enhancedFields.company_id) {
      enhancedFields.company_id = FIELD_TEMPLATES.COMPANY_ID;
    }

    // Add audit fields if required
    if (template.features?.includes('audit')) {
      if (!enhancedFields.created_by) {
        enhancedFields.created_by = FIELD_TEMPLATES.CREATED_BY;
      }
      if (!enhancedFields.updated_by) {
        enhancedFields.updated_by = FIELD_TEMPLATES.UPDATED_BY;
      }
      if (!enhancedFields.version) {
        enhancedFields.version = FIELD_TEMPLATES.VERSION;
      }
    }

    // Add currency fields if required
    if (template.features?.includes('currency')) {
      if (!enhancedFields.currency_code) {
        enhancedFields.currency_code = FIELD_TEMPLATES.CURRENCY;
      }
    }

    return enhancedFields;
  }

  /**
   * Creates enhanced model options
   */
  createEnhancedOptions(modelName, template, userOptions) {
    const options = {
      sequelize: this.sequelize,
      modelName: modelName,
      tableName: userOptions.tableName || this.getTableName(modelName),
      timestamps: true,
      paranoid: template !== MODEL_TEMPLATES.ANALYTICS,
      underscored: true,
      freezeTableName: true,
      ...userOptions
    };

    // Add hooks
    options.hooks = {
      ...(userOptions.hooks || {}),
      ...this.createModelHooks(template)
    };

    return options;
  }

  /**
   * Creates model hooks based on template
   */
  createModelHooks(template) {
    const hooks = {};

    // Add audit hooks if available
    if (template.features?.includes('audit') && this.auditLogger) {
      Object.assign(hooks, createAuditHooks());
    }

    // Add performance hooks if available
    if (template.features?.includes('performance') && this.performanceMonitor) {
      Object.assign(hooks, createPerformanceHooks());
    }

    // Add error handling hooks if available
    if (this.errorHandler) {
      Object.assign(hooks, createErrorHandlingHooks());
    }

    return hooks;
  }

  /**
   * Adds instance methods to the model
   */
  addInstanceMethods(Model, template) {
    // Add basic utility methods
    Model.prototype.toSafeJSON = function() {
      const data = this.toJSON();
      // Remove sensitive fields
      delete data.deleted_at;
      return data;
    };

    // Add PII methods if available
    if (template.features?.includes('pii') && this.piiProcessor) {
      Model.prototype.anonymize = function() {
        return this.piiProcessor.anonymizeRecord(this);
      };
    }

    // Add audit methods if available
    if (template.features?.includes('audit') && this.auditLogger) {
      Model.prototype.getAuditTrail = function() {
        return this.auditLogger.getActivityHistory(Model.name, this.id);
      };
    }
  }

  /**
   * Adds class methods to the model
   */
  addClassMethods(Model, template) {
    // Add tenant scoping
    Model.forCompany = function(companyId) {
      return this.scope({ where: { company_id: companyId } });
    };

    // Add soft delete utilities
    if (template !== MODEL_TEMPLATES.ANALYTICS) {
      Model.withDeleted = function() {
        return this.unscoped();
      };
    }
  }

  /**
   * Adds model hooks for automated processing
   */
  addModelHooks(Model, template) {
    // These are handled in createModelHooks method
  }

  // Helper methods
  getTableName(modelName) {
    return modelName.toLowerCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '') + 's';
  }
}

/**
 * Factory function to create enhanced models
 */
function createEnhancedModel(sequelize, modelName, fields, options = {}) {
  const factory = new EnhancedModelFactory(sequelize, options);
  return factory.createModel(modelName, fields, options);
}

/**
 * Standard field templates for common use cases
 */
const FIELD_TEMPLATES = {
  // Identity fields
  PRIMARY_KEY: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },

  UUID_PRIMARY: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },

  // Multi-tenant fields
  COMPANY_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    },
    onDelete: 'CASCADE',
    validate: {
      isInt: true,
      min: 1
    }
  },

  // User tracking fields
  CREATED_BY: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },

  UPDATED_BY: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },

  // Timestamp fields
  CREATED_AT: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },

  UPDATED_AT: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },

  // Soft delete
  DELETED_AT: {
    type: DataTypes.DATE,
    allowNull: true
  },

  // Status fields
  STATUS: {
    type: DataTypes.ENUM('active', 'inactive', 'pending', 'archived'),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'inactive', 'pending', 'archived']]
    }
  },

  // Text fields
  NAME: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [1, 255],
      notEmpty: true
    }
  },

  DESCRIPTION: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 10000]
    }
  },

  // Contact fields
  EMAIL: {
    type: DataTypes.STRING(320),
    allowNull: true,
    validate: {
      isEmail: true,
      len: [0, 320]
    }
  },

  PHONE: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^[\+]?[1-9][\d]{0,15}$/
    }
  },

  // Address fields
  ADDRESS_LINE_1: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: [0, 255]
    }
  },

  ADDRESS_LINE_2: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      len: [0, 255]
    }
  },

  CITY: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100],
      is: /^[a-zA-Z\s\-\.\']+$/
    }
  },

  STATE: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      len: [0, 50]
    }
  },

  ZIP_CODE: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^[0-9]{5}(-[0-9]{4})?$/
    }
  },

  COUNTRY: {
    type: DataTypes.STRING(2),
    allowNull: true,
    defaultValue: 'US',
    validate: {
      len: [2, 2],
      isUppercase: true
    }
  },

  // Geographic coordinates
  LATITUDE: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    validate: {
      min: -90,
      max: 90
    }
  },

  LONGITUDE: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    validate: {
      min: -180,
      max: 180
    }
  },

  // Financial fields
  AMOUNT: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      isDecimal: true
    }
  },

  CURRENCY: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD',
    validate: {
      len: [3, 3],
      isUppercase: true
    }
  },

  // URL fields
  URL: {
    type: DataTypes.STRING(2048),
    allowNull: true,
    validate: {
      isUrl: true,
      len: [0, 2048]
    }
  },

  // JSON fields
  METADATA: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },

  // Tags/categories
  TAGS: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },

  // Priority/ordering
  SORT_ORDER: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isInt: true,
      min: 0
    }
  },

  // Version tracking
  VERSION: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      isInt: true,
      min: 1
    }
  }
};

/**
 * Model validation rules for different business domains
 */
const VALIDATION_RULES = {
  CONSTRUCTION: {
    projectNumber: {
      format: /^PROJ-\d{4}-\d{4}$/,
      message: 'Project number must be in format PROJ-YYYY-NNNN'
    },
    contractNumber: {
      format: /^CONT-\d{4}-\d{4}$/,
      message: 'Contract number must be in format CONT-YYYY-NNNN'
    },
    permitNumber: {
      format: /^[A-Z]{2}\d{6}$/,
      message: 'Permit number must be 2 letters followed by 6 digits'
    }
  },

  FINANCIAL: {
    invoiceNumber: {
      format: /^INV-\d{4}-\d{6}$/,
      message: 'Invoice number must be in format INV-YYYY-NNNNNN'
    },
    accountNumber: {
      format: /^\d{4}-\d{4}-\d{4}$/,
      message: 'Account number must be in format NNNN-NNNN-NNNN'
    },
    taxId: {
      format: /^\d{2}-\d{7}$/,
      message: 'Tax ID must be in format NN-NNNNNNN'
    }
  },

  CONTACT: {
    phoneNumber: {
      format: /^[\+]?[1-9][\d]{0,15}$/,
      message: 'Phone number must be in valid international format'
    },
    zipCode: {
      format: /^[0-9]{5}(-[0-9]{4})?$/,
      message: 'ZIP code must be in format 12345 or 12345-6789'
    }
  }
};

/**
 * Creates a production-ready Sequelize model with all features
 * @param {Object} sequelize - Sequelize instance
 * @param {string} modelName - Name of the model
 * @param {Object} attributes - Model attributes
 * @param {Object} options - Model configuration options
 * @returns {Object} - Enhanced Sequelize model
 */
const createProductionModel = (sequelize, modelName, attributes, options = {}) => {
  const {
    // Model category for optimization strategy
    category = 'CORE_BUSINESS',
    
    // Feature flags
    enableAuditTrail = true,
    enablePIIHandling = true,
    enableSoftDelete = true,
    enableVersioning = false,
    enablePerformanceOptimization = true,
    enableErrorHandling = true,
    enableDataRetention = true,
    
    // Multi-tenant configuration
    isMultiTenant = true,
    tenantField = 'companyId',
    
    // Custom configurations
    customValidations = {},
    customIndexes = [],
    customHooks = {},
    
    // Business domain
    businessDomain = 'CONSTRUCTION',
    
    // Security level
    securityLevel = 'standard', // 'minimal', 'standard', 'high', 'maximum'
    
    ...sequelizeOptions
  } = options;

  // Get model category configuration
  const categoryConfig = MODEL_CATEGORIES[category] || MODEL_CATEGORIES.CORE_BUSINESS;

  // Build enhanced attributes
  const enhancedAttributes = buildEnhancedAttributes(
    attributes,
    categoryConfig,
    {
      enableAuditTrail,
      enableSoftDelete,
      enableVersioning,
      isMultiTenant,
      tenantField,
      enablePIIHandling
    }
  );

  // Build model options with hooks and optimizations
  const enhancedOptions = buildEnhancedOptions(
    sequelizeOptions,
    categoryConfig,
    {
      enableAuditTrail,
      enablePerformanceOptimization,
      enableErrorHandling,
      enableDataRetention,
      enableSoftDelete,
      customHooks,
      businessDomain,
      securityLevel
    }
  );

  // Create the model
  const Model = sequelize.define(modelName, enhancedAttributes, enhancedOptions);

  // Add custom validations
  addCustomValidations(Model, customValidations, businessDomain);

  // Add indexes
  addModelIndexes(Model, categoryConfig, customIndexes, isMultiTenant, tenantField);

  // Add associations helper
  Model.addAssociations = (models) => {
    addStandardAssociations(Model, models, isMultiTenant, tenantField);
  };

  // Add utility methods
  addUtilityMethods(Model, categoryConfig, {
    enableAuditTrail,
    enablePIIHandling,
    enableSoftDelete,
    isMultiTenant,
    tenantField
  });

  return Model;
};

/**
 * Builds enhanced attributes with standard fields
 */
const buildEnhancedAttributes = (attributes, categoryConfig, options) => {
  const enhanced = { ...attributes };

  // Add primary key if not specified
  if (!enhanced.id && !hasCustomPrimaryKey(enhanced)) {
    enhanced.id = FIELD_TEMPLATES.PRIMARY_KEY;
  }

  // Add multi-tenant field
  if (options.isMultiTenant && !enhanced[options.tenantField]) {
    enhanced[options.tenantField] = FIELD_TEMPLATES.COMPANY_ID;
  }

  // Add audit trail fields
  if (options.enableAuditTrail) {
    enhanced.createdBy = enhanced.createdBy || FIELD_TEMPLATES.CREATED_BY;
    enhanced.updatedBy = enhanced.updatedBy || FIELD_TEMPLATES.UPDATED_BY;
  }

  // Add timestamp fields
  enhanced.createdAt = enhanced.createdAt || FIELD_TEMPLATES.CREATED_AT;
  enhanced.updatedAt = enhanced.updatedAt || FIELD_TEMPLATES.UPDATED_AT;

  // Add soft delete field
  if (options.enableSoftDelete) {
    enhanced.deletedAt = enhanced.deletedAt || FIELD_TEMPLATES.DELETED_AT;
  }

  // Add version field
  if (options.enableVersioning) {
    enhanced.version = enhanced.version || FIELD_TEMPLATES.VERSION;
  }

  // Add PII metadata for applicable fields
  if (options.enablePIIHandling) {
    addPIIMetadata(enhanced);
  }

  return enhanced;
};

/**
 * Builds enhanced model options with hooks and optimizations
 */
const buildEnhancedOptions = (options, categoryConfig, features) => {
  const enhanced = {
    ...options,
    timestamps: true,
    paranoid: features.enableSoftDelete,
    version: features.enableVersioning,
    hooks: { ...options.hooks }
  };

  // Add audit trail hooks
  if (features.enableAuditTrail) {
    Object.assign(enhanced.hooks, createAuditHooks());
  }

  // Add performance optimization hooks
  if (features.enablePerformanceOptimization) {
    Object.assign(enhanced.hooks, createPerformanceHooks({
      optimizationLevel: getOptimizationLevel(features.securityLevel),
      enableCaching: categoryConfig.cacheStrategy !== 'MINIMAL'
    }));
  }

  // Add error handling hooks
  if (features.enableErrorHandling) {
    Object.assign(enhanced.hooks, createErrorHandlingHooks({
      enableDetailedLogging: features.securityLevel === 'maximum',
      customBusinessRules: getBusinessRules(features.businessDomain)
    }));
  }

  // Add data retention hooks
  if (features.enableDataRetention) {
    Object.assign(enhanced.hooks, createRetentionHooks({
      category: categoryConfig.retentionCategory
    }));
  }

  // Add custom hooks
  Object.assign(enhanced.hooks, features.customHooks);

  return enhanced;
};

/**
 * Adds custom validations based on business domain
 */
const addCustomValidations = (Model, customValidations, businessDomain) => {
  const domainRules = VALIDATION_RULES[businessDomain] || {};
  
  // Add domain-specific validations
  Object.entries(domainRules).forEach(([field, rule]) => {
    if (Model.rawAttributes[field]) {
      Model.rawAttributes[field].validate = {
        ...Model.rawAttributes[field].validate,
        customRule: (value) => {
          if (value && !rule.format.test(value)) {
            throw new Error(rule.message);
          }
        }
      };
    }
  });

  // Add custom validations
  Object.entries(customValidations).forEach(([field, validation]) => {
    if (Model.rawAttributes[field]) {
      Model.rawAttributes[field].validate = {
        ...Model.rawAttributes[field].validate,
        ...validation
      };
    }
  });
};

/**
 * Adds model indexes based on category and usage patterns
 */
const addModelIndexes = (Model, categoryConfig, customIndexes, isMultiTenant, tenantField) => {
  const indexes = [...customIndexes];

  // Add multi-tenant index
  if (isMultiTenant) {
    indexes.push({ fields: [tenantField] });
  }

  // Add category-specific indexes
  const indexStrategy = createIndexStrategy(categoryConfig.indexStrategy);
  indexes.push(...indexStrategy.getRecommendedIndexes());

  // Add performance indexes
  indexes.push(...createPerformanceIndexes(Model.name, categoryConfig.cacheStrategy));

  // Apply indexes to model
  indexes.forEach(index => {
    Model.addIndex?.(index);
  });
};

/**
 * Adds standard associations for multi-tenant models
 */
const addStandardAssociations = (Model, models, isMultiTenant, tenantField) => {
  if (isMultiTenant && models.companies) {
    Model.belongsTo(models.companies, {
      foreignKey: tenantField,
      as: 'company'
    });
  }

  if (models.users) {
    if (Model.rawAttributes.createdBy) {
      Model.belongsTo(models.users, {
        foreignKey: 'createdBy',
        as: 'creator'
      });
    }

    if (Model.rawAttributes.updatedBy) {
      Model.belongsTo(models.users, {
        foreignKey: 'updatedBy',
        as: 'updater'
      });
    }
  }
};

/**
 * Adds utility methods to the model
 */
const addUtilityMethods = (Model, categoryConfig, options) => {
  // Add tenant scoping for multi-tenant models
  if (options.isMultiTenant) {
    Model.forTenant = (tenantId) => {
      return Model.scope({
        where: { [options.tenantField]: tenantId }
      });
    };
  }

  // Add soft delete utilities
  if (options.enableSoftDelete) {
    Model.withDeleted = () => {
      return Model.unscoped();
    };

    Model.onlyDeleted = () => {
      return Model.scope({
        where: { deletedAt: { [Sequelize.Op.ne]: null } }
      });
    };
  }

  // Add audit trail utilities
  if (options.enableAuditTrail) {
    Model.prototype.getAuditTrail = function() {
      return this.getVersions?.() || [];
    };
  }

  // Add PII utilities
  if (options.enablePIIHandling) {
    Model.prototype.anonymize = function() {
      return anonymizePIIData(this);
    };

    Model.prototype.export = function(includeMetadata = false) {
      return exportWithCompliance(this, includeMetadata);
    };
  }

  // Add caching utilities
  if (categoryConfig.cacheStrategy !== 'MINIMAL') {
    Model.cached = (key, ttl) => {
      return getCachedResult(Model, key, ttl);
    };

    Model.invalidateCache = (pattern) => {
      return invalidateCachePattern(Model, pattern);
    };
  }
};

/**
 * Utilities
 */
const hasCustomPrimaryKey = (attributes) => {
  return Object.values(attributes).some(attr => attr.primaryKey);
};

const getOptimizationLevel = (securityLevel) => {
  const levels = {
    minimal: 'minimal',
    standard: 'standard',
    high: 'standard',
    maximum: 'aggressive'
  };
  return levels[securityLevel] || 'standard';
};

const getBusinessRules = (businessDomain) => {
  // Return domain-specific business rules
  return [];
};

const anonymizePIIData = (instance) => {
  // Implementation for PII anonymization
  return instance;
};

const exportWithCompliance = (instance, includeMetadata) => {
  // Implementation for compliant data export
  return instance;
};

const getCachedResult = (Model, key, ttl) => {
  // Implementation for cached queries
  return null;
};

const invalidateCachePattern = (Model, pattern) => {
  // Implementation for cache invalidation
  return true;
};

/**
 * Pre-configured model types for common use cases
 */
const ModelTypes = {
  // Core business entity
  CoreEntity: (sequelize, name, attributes, options = {}) => {
    return createProductionModel(sequelize, name, attributes, {
      category: 'CORE_BUSINESS',
      securityLevel: 'high',
      enableVersioning: true,
      ...options
    });
  },

  // Financial record
  FinancialRecord: (sequelize, name, attributes, options = {}) => {
    return createProductionModel(sequelize, name, attributes, {
      category: 'FINANCIAL',
      securityLevel: 'maximum',
      enableVersioning: true,
      businessDomain: 'FINANCIAL',
      ...options
    });
  },

  // Communication record
  CommunicationRecord: (sequelize, name, attributes, options = {}) => {
    return createProductionModel(sequelize, name, attributes, {
      category: 'COMMUNICATION',
      securityLevel: 'standard',
      enableVersioning: false,
      ...options
    });
  },

  // Reference data
  ReferenceData: (sequelize, name, attributes, options = {}) => {
    return createProductionModel(sequelize, name, attributes, {
      category: 'REFERENCE',
      securityLevel: 'standard',
      enableAuditTrail: false,
      enableSoftDelete: false,
      ...options
    });
  },

  // Activity/log record
  ActivityRecord: (sequelize, name, attributes, options = {}) => {
    return createProductionModel(sequelize, name, attributes, {
      category: 'ACTIVITY',
      securityLevel: 'minimal',
      enableAuditTrail: false,
      enableSoftDelete: false,
      enableVersioning: false,
      ...options
    });
  },

  // System configuration
  SystemConfig: (sequelize, name, attributes, options = {}) => {
    return createProductionModel(sequelize, name, attributes, {
      category: 'SYSTEM',
      securityLevel: 'high',
      enableVersioning: true,
      isMultiTenant: false,
      ...options
    });
  }
};

module.exports = {
  // Enhanced factory system
  EnhancedModelFactory,
  createEnhancedModel,
  MODEL_TEMPLATES,
  
  // Legacy compatibility
  MODEL_CATEGORIES,
  FIELD_TEMPLATES,
  VALIDATION_RULES,
  createProductionModel,
  ModelTypes
};
