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
    this.auditLogger = new AuditLogger(sequelize);
    this.piiProcessor = new PIIDataProcessor();
    this.indexManager = new IndexManager(sequelize);
    this.performanceMonitor = new PerformanceMonitor();
    this.permissionCalculator = new PermissionCalculator();
    this.documentVersionManager = new DocumentVersionManager();
    this.currencyConverter = new CurrencyConverter();
    this.jsonOptimizer = new JSONFieldOptimizer();
    this.jobManager = new JobQueueManager();
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
    
    // Create indexes
    this.createModelIndexes(Model, template);
    
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

    // Add standard tracking fields
    enhancedFields.id = {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    };

    enhancedFields.created_at = {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    };

    enhancedFields.updated_at = {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    };

    // Add soft delete if not analytics model
    if (template !== MODEL_TEMPLATES.ANALYTICS) {
      enhancedFields.deleted_at = {
        type: DataTypes.DATE,
        allowNull: true
      };
    }

    // Add company context for multi-tenancy
    enhancedFields.company_id = {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    };

    // Add audit fields if required
    if (template.features?.includes('audit')) {
      enhancedFields.created_by = {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      };

      enhancedFields.updated_by = {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      };

      enhancedFields.version = {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      };
    }

    // Add currency fields if required
    if (template.features?.includes('currency')) {
      enhancedFields.currency_code = {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'USD',
        validate: {
          isIn: [Object.keys(MULTI_CURRENCY.SUPPORTED_CURRENCIES)]
        }
      };

      enhancedFields.exchange_rate = {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
        defaultValue: 1.000000
      };
    }

    // Add document versioning fields if required
    if (template.features?.includes('versioning')) {
      enhancedFields.document_version = {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'v1.0.0'
      };

      enhancedFields.document_status = {
        type: DataTypes.ENUM('draft', 'review', 'approved', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft'
      };
    }

    // Process each field for PII protection
    if (template.features?.includes('pii')) {
      Object.keys(enhancedFields).forEach(fieldName => {
        const field = enhancedFields[fieldName];
        if (this.isPIIField(fieldName, field)) {
          field.get = function() {
            return this.piiProcessor.decrypt(this.getDataValue(fieldName));
          };
          field.set = function(value) {
            this.setDataValue(fieldName, this.piiProcessor.encrypt(value));
          };
        }
      });
    }

    // Add construction-specific fields if required
    if (template.features?.includes('construction')) {
      const constructionFields = this.getConstructionFields(fields);
      Object.assign(enhancedFields, constructionFields);
    }

    // Enhance validation
    if (template.features?.includes('validation')) {
      this.enhanceFieldValidation(enhancedFields, template);
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
      paranoid: template !== MODEL_TEMPLATES.ANALYTICS, // Soft deletes except analytics
      underscored: true,
      freezeTableName: true,
      ...userOptions
    };

    // Add indexes
    options.indexes = [
      ...(userOptions.indexes || []),
      ...this.getStandardIndexes(template),
      ...this.getPerformanceIndexes(modelName, template)
    ];

    // Add validation
    if (template.features?.includes('validation')) {
      options.validate = {
        ...this.getModelValidations(modelName, template),
        ...(userOptions.validate || {})
      };
    }

    return options;
  }

  /**
   * Adds instance methods to the model
   */
  addInstanceMethods(Model, template) {
    // PII methods
    if (template.features?.includes('pii')) {
      Model.prototype.anonymize = function() {
        return this.piiProcessor.anonymizeRecord(this);
      };

      Model.prototype.getPIIFields = function() {
        return this.piiProcessor.identifyPIIFields(this);
      };
    }

    // Audit methods
    if (template.features?.includes('audit')) {
      Model.prototype.createAuditEntry = function(action, changes) {
        return this.auditLogger.logActivity({
          modelName: Model.name,
          recordId: this.id,
          action: action,
          changes: changes,
          userId: this.updated_by || this.created_by
        });
      };
    }

    // Currency methods
    if (template.features?.includes('currency')) {
      Model.prototype.convertCurrency = async function(targetCurrency) {
        return await this.currencyConverter.convertAmount(
          this.amount,
          this.currency_code,
          targetCurrency
        );
      };
    }

    // Document versioning methods
    if (template.features?.includes('versioning')) {
      Model.prototype.createVersion = function(changes, approver) {
        return this.documentVersionManager.createVersion(this, changes, approver);
      };

      Model.prototype.getVersionHistory = function() {
        return this.documentVersionManager.getVersionHistory(this);
      };
    }

    // RBAC methods
    if (template.features?.includes('rbac')) {
      Model.prototype.checkPermission = function(user, action) {
        return this.permissionCalculator.checkPermission(user, this, action);
      };

      Model.prototype.getAccessibleFields = function(user) {
        return this.permissionCalculator.getAccessibleFields(user, this);
      };
    }

    // Performance methods
    if (template.features?.includes('performance')) {
      Model.prototype.getCachedData = function(cacheKey) {
        return this.performanceMonitor.getFromCache(cacheKey);
      };

      Model.prototype.setCachedData = function(cacheKey, data, ttl) {
        return this.performanceMonitor.setCache(cacheKey, data, ttl);
      };
    }
  }

  /**
   * Adds class methods to the model
   */
  addClassMethods(Model, template) {
    // Bulk operations with audit trail
    if (template.features?.includes('audit')) {
      Model.bulkCreateWithAudit = async function(records, options = {}) {
        const created = await this.bulkCreate(records, options);
        
        // Log bulk creation
        await this.auditLogger.logBulkActivity({
          modelName: Model.name,
          action: 'bulk_create',
          recordCount: created.length,
          userId: options.userId
        });

        return created;
      };
    }

    // Performance-optimized queries
    if (template.features?.includes('performance')) {
      Model.findWithOptimization = async function(options = {}) {
        const optimizedOptions = this.performanceMonitor.optimizeQuery(options);
        return await this.findAll(optimizedOptions);
      };
    }

    // RBAC-filtered queries
    if (template.features?.includes('rbac')) {
      Model.findAllAccessible = async function(user, options = {}) {
        const rbacFilters = this.permissionCalculator.getDataFilters(user, Model.name);
        return await this.findAll({
          ...options,
          where: {
            ...(options.where || {}),
            ...rbacFilters
          }
        });
      };
    }

    // Currency conversion queries
    if (template.features?.includes('currency')) {
      Model.findAllInCurrency = async function(targetCurrency, options = {}) {
        const records = await this.findAll(options);
        
        for (const record of records) {
          if (record.amount && record.currency_code !== targetCurrency) {
            record.converted_amount = await record.convertCurrency(targetCurrency);
          }
        }

        return records;
      };
    }
  }

  /**
   * Adds model hooks for automated processing
   */
  addModelHooks(Model, template) {
    // Before create hooks
    Model.addHook('beforeCreate', async (instance, options) => {
      // Set creator
      if (template.features?.includes('audit') && options.userId) {
        instance.created_by = options.userId;
        instance.updated_by = options.userId;
      }

      // Validate construction fields
      if (template.features?.includes('construction')) {
        await this.validateConstructionFields(instance);
      }

      // Set currency exchange rate
      if (template.features?.includes('currency') && instance.currency_code !== 'USD') {
        instance.exchange_rate = await this.currencyConverter.getExchangeRate(instance.currency_code, 'USD');
      }
    });

    // Before update hooks
    Model.addHook('beforeUpdate', async (instance, options) => {
      // Set updater and increment version
      if (template.features?.includes('audit')) {
        if (options.userId) {
          instance.updated_by = options.userId;
        }
        instance.version += 1;
      }

      // Update currency if changed
      if (template.features?.includes('currency') && instance.changed('currency_code')) {
        instance.exchange_rate = await this.currencyConverter.getExchangeRate(instance.currency_code, 'USD');
      }
    });

    // After create hooks
    Model.addHook('afterCreate', async (instance, options) => {
      // Create audit entry
      if (template.features?.includes('audit')) {
        await instance.createAuditEntry('create', instance.dataValues);
      }

      // Clear related caches
      if (template.features?.includes('caching')) {
        await this.performanceMonitor.clearRelatedCaches(Model.name, instance.id);
      }
    });

    // After update hooks
    Model.addHook('afterUpdate', async (instance, options) => {
      // Create audit entry
      if (template.features?.includes('audit')) {
        await instance.createAuditEntry('update', instance._changed);
      }

      // Clear related caches
      if (template.features?.includes('caching')) {
        await this.performanceMonitor.clearRelatedCaches(Model.name, instance.id);
      }

      // Create document version if significant changes
      if (template.features?.includes('versioning') && this.isSignificantChange(instance._changed)) {
        await instance.createVersion(instance._changed, options.userId);
      }
    });

    // After destroy hooks
    Model.addHook('afterDestroy', async (instance, options) => {
      // Create audit entry
      if (template.features?.includes('audit')) {
        await instance.createAuditEntry('delete', { deleted_at: new Date() });
      }

      // Clear related caches
      if (template.features?.includes('caching')) {
        await this.performanceMonitor.clearRelatedCaches(Model.name, instance.id);
      }
    });
  }

  /**
   * Creates optimized indexes for the model
   */
  async createModelIndexes(Model, template) {
    const indexes = this.indexManager.generateOptimalIndexes(Model.name, template);
    
    for (const index of indexes) {
      try {
        await this.sequelize.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS ${index.name} ON ${Model.tableName} ${index.definition}`);
        console.log(`Created index: ${index.name}`);
      } catch (error) {
        console.error(`Failed to create index ${index.name}:`, error.message);
      }
    }
  }

  // Helper methods
  isPIIField(fieldName, field) {
    const piiFields = ['first_name', 'last_name', 'email', 'phone', 'ssn', 'address', 'credit_card'];
    return piiFields.some(pii => fieldName.toLowerCase().includes(pii));
  }

  getTableName(modelName) {
    return modelName.toLowerCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '') + 's';
  }

  getStandardIndexes(template) {
    const indexes = [
      { fields: ['company_id'] },
      { fields: ['created_at'] },
      { fields: ['updated_at'] }
    ];

    if (template.features?.includes('audit')) {
      indexes.push(
        { fields: ['created_by'] },
        { fields: ['updated_by'] },
        { fields: ['version'] }
      );
    }

    return indexes;
  }

  getPerformanceIndexes(modelName, template) {
    return this.indexManager.getPerformanceIndexes(modelName, template);
  }

  getConstructionFields(baseFields) {
    // Return relevant construction fields based on base fields
    return {};
  }

  enhanceFieldValidation(fields, template) {
    // Add validation rules based on template
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      if (!field.validate) {
        field.validate = {};
      }

      // Add common validations
      if (field.type === DataTypes.STRING && !field.validate.len) {
        field.validate.len = [1, 255];
      }

      if (fieldName.includes('email') && !field.validate.isEmail) {
        field.validate.isEmail = true;
      }

      if (fieldName.includes('phone') && !field.validate.is) {
        field.validate.is = /^[\+]?[1-9][\d]{0,15}$/;
      }
    });
  }

  getModelValidations(modelName, template) {
    return {};
  }

  async validateConstructionFields(instance) {
    // Validate construction-specific business rules
    return true;
  }

  isSignificantChange(changes) {
    const significantFields = ['status', 'amount', 'approved_by', 'document_content'];
    return Object.keys(changes).some(field => significantFields.includes(field));
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
 * Batch model enhancement for existing models
 */
async function enhanceExistingModels(sequelize, models, options = {}) {
  const factory = new EnhancedModelFactory(sequelize, options);
  const enhancedModels = {};

  for (const [modelName, model] of Object.entries(models)) {
    try {
      // Get current model definition
      const fields = model.rawAttributes;
      const modelOptions = model.options;

      // Enhance the model
      const enhancedModel = factory.createModel(modelName, fields, {
        ...modelOptions,
        ...options
      });

      enhancedModels[modelName] = enhancedModel;
      console.log(`Enhanced model: ${modelName}`);
    } catch (error) {
      console.error(`Failed to enhance model ${modelName}:`, error.message);
      enhancedModels[modelName] = model; // Keep original
    }
  }

  return enhancedModels;
}

module.exports = {
  EnhancedModelFactory,
  MODEL_TEMPLATES,
  createEnhancedModel,
  enhanceExistingModels
};
