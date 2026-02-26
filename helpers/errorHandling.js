/**
 * Model Error Handling Helper
 * 
 * This helper provides standardized error handling for Sequelize models
 * including validation errors, constraint violations, and business logic errors.
 */

/**
 * Standard error types and their handling strategies
 */
const ERROR_TYPES = {
  // Validation errors
  VALIDATION_ERROR: {
    type: 'ValidationError',
    httpStatus: 400,
    logLevel: 'warn',
    userMessage: 'The provided data is invalid',
    retryable: false
  },

  // Database constraint errors
  UNIQUE_CONSTRAINT: {
    type: 'UniqueConstraintError',
    httpStatus: 409,
    logLevel: 'warn',
    userMessage: 'This value already exists',
    retryable: false
  },

  FOREIGN_KEY_CONSTRAINT: {
    type: 'ForeignKeyConstraintError',
    httpStatus: 400,
    logLevel: 'warn',
    userMessage: 'Referenced record does not exist',
    retryable: false
  },

  NOT_NULL_CONSTRAINT: {
    type: 'NotNullConstraintError',
    httpStatus: 400,
    logLevel: 'warn',
    userMessage: 'Required field cannot be empty',
    retryable: false
  },

  // Business logic errors
  BUSINESS_RULE_VIOLATION: {
    type: 'BusinessRuleError',
    httpStatus: 422,
    logLevel: 'warn',
    userMessage: 'Business rule validation failed',
    retryable: false
  },

  AUTHORIZATION_ERROR: {
    type: 'AuthorizationError',
    httpStatus: 403,
    logLevel: 'warn',
    userMessage: 'Access denied',
    retryable: false
  },

  // System errors
  DATABASE_CONNECTION: {
    type: 'ConnectionError',
    httpStatus: 503,
    logLevel: 'error',
    userMessage: 'Service temporarily unavailable',
    retryable: true
  },

  TIMEOUT_ERROR: {
    type: 'TimeoutError',
    httpStatus: 504,
    logLevel: 'error',
    userMessage: 'Operation timed out',
    retryable: true
  },

  // Data integrity errors
  DATA_CORRUPTION: {
    type: 'DataCorruptionError',
    httpStatus: 500,
    logLevel: 'error',
    userMessage: 'Data integrity issue detected',
    retryable: false
  }
};

/**
 * Field-specific error messages for better user experience
 */
const FIELD_ERROR_MESSAGES = {
  email: {
    unique: 'This email address is already registered',
    format: 'Please enter a valid email address',
    required: 'Email address is required'
  },

  phone: {
    format: 'Please enter a valid phone number',
    length: 'Phone number must be between 10-15 digits'
  },

  password: {
    length: 'Password must be at least 8 characters long',
    complexity: 'Password must contain uppercase, lowercase, number, and special character',
    required: 'Password is required'
  },

  zipCode: {
    format: 'ZIP code must be in format 12345 or 12345-6789',
    required: 'ZIP code is required'
  },

  currency: {
    negative: 'Amount cannot be negative',
    tooLarge: 'Amount exceeds maximum allowed value',
    required: 'Amount is required'
  },

  date: {
    future: 'Date cannot be in the future',
    past: 'Date cannot be in the past',
    range: 'End date must be after start date',
    format: 'Please enter a valid date'
  },

  subdomain: {
    unique: 'This subdomain is already taken',
    format: 'Subdomain can only contain lowercase letters, numbers, and hyphens',
    length: 'Subdomain must be between 3 and 63 characters',
    reserved: 'This subdomain is reserved'
  }
};

/**
 * Business rule error definitions
 */
const BUSINESS_RULES = {
  CONSTRUCTION: {
    PROJECT_OVERLAP: {
      message: 'Project dates overlap with existing project',
      code: 'PROJECT_OVERLAP',
      details: 'Projects for the same crew cannot overlap in time'
    },

    BUDGET_EXCEEDED: {
      message: 'Estimate total exceeds project budget',
      code: 'BUDGET_EXCEEDED',
      details: 'Total estimate amount cannot exceed approved project budget'
    },

    PERMIT_EXPIRED: {
      message: 'Required permit has expired',
      code: 'PERMIT_EXPIRED',
      details: 'Valid permits are required for this type of work'
    },

    CREW_UNAVAILABLE: {
      message: 'Assigned crew is not available',
      code: 'CREW_UNAVAILABLE',
      details: 'Crew is already assigned to another project during this time'
    }
  },

  FINANCIAL: {
    INSUFFICIENT_FUNDS: {
      message: 'Insufficient funds for this transaction',
      code: 'INSUFFICIENT_FUNDS',
      details: 'Account balance is insufficient'
    },

    CREDIT_LIMIT_EXCEEDED: {
      message: 'Transaction exceeds credit limit',
      code: 'CREDIT_LIMIT_EXCEEDED',
      details: 'Customer credit limit would be exceeded'
    },

    PAYMENT_OVERDUE: {
      message: 'Account has overdue payments',
      code: 'PAYMENT_OVERDUE',
      details: 'Previous invoices must be paid before creating new ones'
    }
  },

  ACCESS_CONTROL: {
    TENANT_MISMATCH: {
      message: 'Access denied: wrong tenant',
      code: 'TENANT_MISMATCH',
      details: 'Resource belongs to a different company'
    },

    INSUFFICIENT_PERMISSIONS: {
      message: 'Insufficient permissions',
      code: 'INSUFFICIENT_PERMISSIONS',
      details: 'User role does not have required permissions'
    },

    ACCOUNT_SUSPENDED: {
      message: 'Account is suspended',
      code: 'ACCOUNT_SUSPENDED',
      details: 'Account access has been temporarily suspended'
    }
  }
};

/**
 * Creates standardized error handling hooks for a model
 * @param {Object} options - Error handling options
 * @returns {Object} - Sequelize hooks for error handling
 */
const createErrorHandlingHooks = (options = {}) => {
  const {
    enableDetailedLogging = true,
    enableRetryLogic = false,
    customBusinessRules = [],
    sensitiveFields = []
  } = options;

  return {
    // Handle validation errors before they occur
    beforeValidate: (instance, options) => {
      try {
        // Apply custom business rules
        customBusinessRules.forEach(rule => {
          if (typeof rule === 'function') {
            rule(instance, options);
          }
        });
      } catch (error) {
        throw createBusinessRuleError(error.message, error.code || 'CUSTOM_RULE');
      }
    },

    // Handle errors after validation
    afterValidate: (instance, options) => {
      // Log successful validation for audit trail
      if (enableDetailedLogging) {
        console.log(`Validation successful for ${instance.constructor.name} ${instance.id || 'new'}`);
      }
    },

    // Global error handler
    afterCreate: (instance, options) => {
      if (enableDetailedLogging) {
        logModelOperation('CREATE', instance, options);
      }
    },

    afterUpdate: (instance, options) => {
      if (enableDetailedLogging) {
        logModelOperation('UPDATE', instance, options);
      }
    },

    afterDestroy: (instance, options) => {
      if (enableDetailedLogging) {
        logModelOperation('DELETE', instance, options);
      }
    }
  };
};

/**
 * Transforms Sequelize errors into user-friendly messages
 * @param {Error} error - The Sequelize error
 * @param {Object} options - Transform options
 * @returns {Object} - Transformed error object
 */
const transformError = (error, options = {}) => {
  const {
    includeDetails = false,
    maskSensitiveData = true,
    correlationId = null
  } = options;

  let transformedError = {
    type: error.name || 'UnknownError',
    message: 'An error occurred',
    code: null,
    field: null,
    details: null,
    correlationId,
    timestamp: new Date().toISOString()
  };

  // Handle Sequelize validation errors
  if (error.name === 'SequelizeValidationError') {
    transformedError = handleValidationError(error, transformedError, includeDetails);
  }
  
  // Handle Sequelize unique constraint errors
  else if (error.name === 'SequelizeUniqueConstraintError') {
    transformedError = handleUniqueConstraintError(error, transformedError);
  }
  
  // Handle Sequelize foreign key constraint errors
  else if (error.name === 'SequelizeForeignKeyConstraintError') {
    transformedError = handleForeignKeyError(error, transformedError);
  }
  
  // Handle custom business rule errors
  else if (error.name === 'BusinessRuleError') {
    transformedError = handleBusinessRuleError(error, transformedError);
  }
  
  // Handle database connection errors
  else if (error.name === 'SequelizeConnectionError') {
    transformedError = handleConnectionError(error, transformedError);
  }
  
  // Handle timeout errors
  else if (error.name === 'SequelizeTimeoutError') {
    transformedError = handleTimeoutError(error, transformedError);
  }
  
  // Handle generic errors
  else {
    transformedError = handleGenericError(error, transformedError, includeDetails);
  }

  // Mask sensitive data if requested
  if (maskSensitiveData) {
    transformedError = maskSensitiveErrorData(transformedError);
  }

  return transformedError;
};

/**
 * Handles validation errors
 */
const handleValidationError = (error, transformedError, includeDetails) => {
  const firstError = error.errors[0];
  const fieldName = firstError.path;
  const fieldErrorMessages = FIELD_ERROR_MESSAGES[fieldName] || {};

  transformedError.type = 'ValidationError';
  transformedError.field = fieldName;
  transformedError.code = firstError.validatorKey || 'VALIDATION_FAILED';

  // Use field-specific message if available
  if (fieldErrorMessages[transformedError.code]) {
    transformedError.message = fieldErrorMessages[transformedError.code];
  } else if (fieldErrorMessages[firstError.type]) {
    transformedError.message = fieldErrorMessages[firstError.type];
  } else {
    transformedError.message = firstError.message || 'Validation failed';
  }

  if (includeDetails) {
    transformedError.details = error.errors.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
  }

  return transformedError;
};

/**
 * Handles unique constraint errors
 */
const handleUniqueConstraintError = (error, transformedError) => {
  const fieldName = error.errors[0]?.path || 'unknown';
  const fieldErrorMessages = FIELD_ERROR_MESSAGES[fieldName] || {};

  transformedError.type = 'UniqueConstraintError';
  transformedError.field = fieldName;
  transformedError.code = 'DUPLICATE_VALUE';
  transformedError.message = fieldErrorMessages.unique || `This ${fieldName} already exists`;

  return transformedError;
};

/**
 * Handles foreign key constraint errors
 */
const handleForeignKeyError = (error, transformedError) => {
  transformedError.type = 'ForeignKeyConstraintError';
  transformedError.code = 'INVALID_REFERENCE';
  transformedError.message = 'Referenced record does not exist or cannot be used';

  return transformedError;
};

/**
 * Handles custom business rule errors
 */
const handleBusinessRuleError = (error, transformedError) => {
  transformedError.type = 'BusinessRuleError';
  transformedError.code = error.code || 'BUSINESS_RULE_VIOLATION';
  transformedError.message = error.message;
  transformedError.details = error.details;

  return transformedError;
};

/**
 * Handles connection errors
 */
const handleConnectionError = (error, transformedError) => {
  transformedError.type = 'ConnectionError';
  transformedError.code = 'DATABASE_UNAVAILABLE';
  transformedError.message = 'Database service is temporarily unavailable';

  return transformedError;
};

/**
 * Handles timeout errors
 */
const handleTimeoutError = (error, transformedError) => {
  transformedError.type = 'TimeoutError';
  transformedError.code = 'OPERATION_TIMEOUT';
  transformedError.message = 'Operation timed out, please try again';

  return transformedError;
};

/**
 * Handles generic errors
 */
const handleGenericError = (error, transformedError, includeDetails) => {
  transformedError.type = 'SystemError';
  transformedError.code = 'INTERNAL_ERROR';
  transformedError.message = 'An unexpected error occurred';

  if (includeDetails) {
    transformedError.details = error.message;
  }

  return transformedError;
};

/**
 * Masks sensitive data in error messages
 */
const maskSensitiveErrorData = (error) => {
  const sensitivePatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /key/i,
    /ssn/i,
    /credit.*card/i
  ];

  if (error.details && typeof error.details === 'string') {
    sensitivePatterns.forEach(pattern => {
      error.details = error.details.replace(pattern, '[REDACTED]');
    });
  }

  return error;
};

/**
 * Creates a custom business rule error
 */
const createBusinessRuleError = (message, code, details = null) => {
  const error = new Error(message);
  error.name = 'BusinessRuleError';
  error.code = code;
  error.details = details;
  return error;
};

/**
 * Logs model operations for debugging and audit
 */
const logModelOperation = (operation, instance, options) => {
  const modelName = instance.constructor.name;
  const id = instance.id || 'new';
  const userId = options.userId || options.context?.userId || 'system';

  console.log(`Model Operation: ${operation} ${modelName}(${id}) by user ${userId}`);
};

/**
 * Retry logic for transient errors
 */
const createRetryWrapper = (operation, options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true
  } = options;

  return async (...args) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation(...args);
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        const errorType = Object.values(ERROR_TYPES).find(type => 
          error.name === type.type
        );
        
        if (!errorType?.retryable || attempt === maxRetries) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = exponentialBackoff 
          ? retryDelay * Math.pow(2, attempt - 1)
          : retryDelay;
        
        console.log(`Retrying operation after ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };
};

/**
 * Error monitoring and alerting
 */
const ERROR_MONITORING = {
  // Critical errors that require immediate attention
  CRITICAL_ERRORS: [
    'DATA_CORRUPTION',
    'DATABASE_UNAVAILABLE',
    'SECURITY_BREACH'
  ],

  // Error rate thresholds for alerting
  THRESHOLDS: {
    ERROR_RATE_PER_MINUTE: 10,
    UNIQUE_CONSTRAINT_RATE: 5,
    TIMEOUT_RATE: 3
  },

  // Alert channels
  ALERT_CHANNELS: {
    SLACK: 'error-alerts',
    EMAIL: 'dev-team@company.com',
    SMS: '+1234567890'
  }
};

module.exports = {
  ERROR_TYPES,
  FIELD_ERROR_MESSAGES,
  BUSINESS_RULES,
  ERROR_MONITORING,
  createErrorHandlingHooks,
  transformError,
  createBusinessRuleError,
  createRetryWrapper,
  logModelOperation
};
