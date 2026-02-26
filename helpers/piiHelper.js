/**
 * PII Encryption Helper
 * 
 * This helper provides standardized PII field marking and encryption
 * indicators for compliance with data protection regulations.
 */

/**
 * Defines field types that contain Personally Identifiable Information (PII)
 * These fields should be encrypted at rest and in transit
 */
const PII_FIELD_TYPES = {
  // Personal identifiers
  SSN: 'ssn',
  TAX_ID: 'tax_id',
  DRIVER_LICENSE: 'driver_license',
  PASSPORT: 'passport',
  
  // Contact information
  EMAIL: 'email',
  PHONE: 'phone',
  ADDRESS: 'address',
  
  // Financial information
  CREDIT_CARD: 'credit_card',
  BANK_ACCOUNT: 'bank_account',
  ROUTING_NUMBER: 'routing_number',
  
  // Authentication and security
  PASSWORD: 'password',
  SECURITY_TOKEN: 'security_token',
  TWO_FACTOR_SECRET: 'two_factor_secret',
  
  // Biometric and sensitive personal data
  BIOMETRIC: 'biometric',
  MEDICAL: 'medical',
  NOTES: 'notes', // May contain sensitive information
  
  // Location data
  GPS_COORDINATES: 'gps_coordinates',
  
  // User-generated content that may contain PII
  COMMENTS: 'comments',
  DESCRIPTIONS: 'descriptions'
};

/**
 * Adds PII metadata to a Sequelize field definition
 * @param {Object} fieldDefinition - The Sequelize field definition
 * @param {string} piiType - The type of PII data (from PII_FIELD_TYPES)
 * @param {Object} options - Additional PII options
 * @returns {Object} - Enhanced field definition with PII metadata
 */
const addPIIMetadata = (fieldDefinition, piiType, options = {}) => {
  const {
    encryptionRequired = true,
    dataClassification = 'sensitive',
    retentionPeriod = null, // null means no automatic deletion
    auditLevel = 'high',
    redactInLogs = true,
    exportRestricted = true
  } = options;

  return {
    ...fieldDefinition,
    comment: fieldDefinition.comment 
      ? `${fieldDefinition.comment} - PII: ${piiType}` 
      : `PII: ${piiType}`,
    // PII metadata for compliance and security
    piiMetadata: {
      piiType,
      encryptionRequired,
      dataClassification,
      retentionPeriod,
      auditLevel,
      redactInLogs,
      exportRestricted,
      lastReviewed: new Date().toISOString()
    }
  };
};

/**
 * Creates a PII-aware field definition for common field types
 */
const createPIIField = {
  email: (options = {}) => addPIIMetadata({
    type: options.DataTypes?.STRING(255) || 'STRING(255)',
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Must be a valid email address'
      }
    }
  }, PII_FIELD_TYPES.EMAIL, options),

  phone: (options = {}) => addPIIMetadata({
    type: options.DataTypes?.STRING(20) || 'STRING(20)',
    allowNull: true,
    validate: {
      is: {
        args: /^\+?[\d\s\-\(\)\.]+$/,
        msg: 'Must be a valid phone number'
      }
    }
  }, PII_FIELD_TYPES.PHONE, options),

  ssn: (options = {}) => addPIIMetadata({
    type: options.DataTypes?.STRING(255) || 'STRING(255)', // Encrypted, so longer
    allowNull: true,
    validate: {
      len: {
        args: [9, 255],
        msg: 'SSN must be properly formatted'
      }
    }
  }, PII_FIELD_TYPES.SSN, { encryptionRequired: true, ...options }),

  address: (options = {}) => addPIIMetadata({
    type: options.DataTypes?.TEXT || 'TEXT',
    allowNull: true
  }, PII_FIELD_TYPES.ADDRESS, options),

  notes: (options = {}) => addPIIMetadata({
    type: options.DataTypes?.TEXT || 'TEXT',
    allowNull: true
  }, PII_FIELD_TYPES.NOTES, { 
    auditLevel: 'medium',
    retentionPeriod: '7 years',
    ...options 
  }),

  password: (options = {}) => addPIIMetadata({
    type: options.DataTypes?.STRING(255) || 'STRING(255)',
    allowNull: true,
    validate: {
      len: {
        args: [8, 255],
        msg: 'Password must be at least 8 characters long'
      }
    }
  }, PII_FIELD_TYPES.PASSWORD, { 
    encryptionRequired: true,
    redactInLogs: true,
    ...options 
  }),

  securityToken: (options = {}) => addPIIMetadata({
    type: options.DataTypes?.TEXT || 'TEXT',
    allowNull: true
  }, PII_FIELD_TYPES.SECURITY_TOKEN, { 
    encryptionRequired: true,
    retentionPeriod: '30 days',
    ...options 
  }),

  twoFactorSecret: (options = {}) => addPIIMetadata({
    type: options.DataTypes?.STRING(255) || 'STRING(255)',
    allowNull: true
  }, PII_FIELD_TYPES.TWO_FACTOR_SECRET, { 
    encryptionRequired: true,
    dataClassification: 'highly_sensitive',
    ...options 
  })
};

/**
 * Validates that a model properly handles PII fields
 * @param {Object} modelDefinition - Sequelize model definition
 * @returns {Array} - Array of validation warnings/errors
 */
const validatePIICompliance = (modelDefinition) => {
  const warnings = [];
  const attributes = modelDefinition.rawAttributes || modelDefinition.attributes;
  
  if (!attributes) {
    return warnings;
  }

  Object.entries(attributes).forEach(([fieldName, fieldDef]) => {
    if (fieldDef.piiMetadata) {
      // Check if encryption is required but not implemented
      if (fieldDef.piiMetadata.encryptionRequired && !fieldDef.encrypt) {
        warnings.push(`Field '${fieldName}' requires encryption but no encryption is configured`);
      }
      
      // Check if high-sensitivity fields have proper validation
      if (fieldDef.piiMetadata.dataClassification === 'highly_sensitive' && !fieldDef.validate) {
        warnings.push(`Field '${fieldName}' is highly sensitive but lacks validation rules`);
      }
    }
  });

  return warnings;
};

module.exports = {
  PII_FIELD_TYPES,
  addPIIMetadata,
  createPIIField,
  validatePIICompliance
};
