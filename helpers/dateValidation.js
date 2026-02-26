/**
 * Date Validation Helper
 * 
 * This helper provides standardized date validation constraints
 * for maintaining data integrity and business logic compliance.
 */

/**
 * Common date validation patterns
 */
const DATE_VALIDATION_PATTERNS = {
  // Basic date validations
  PAST_DATE: {
    validate: {
      isPastDate(value) {
        if (value && new Date(value) > new Date()) {
          throw new Error('Date cannot be in the future');
        }
      }
    }
  },

  FUTURE_DATE: {
    validate: {
      isFutureDate(value) {
        if (value && new Date(value) < new Date()) {
          throw new Error('Date cannot be in the past');
        }
      }
    }
  },

  // Business hour validations
  BUSINESS_HOURS: {
    validate: {
      isBusinessHours(value) {
        if (value) {
          const date = new Date(value);
          const hours = date.getHours();
          const day = date.getDay();
          
          // Monday(1) to Friday(5), 9 AM to 5 PM
          if (day < 1 || day > 5 || hours < 9 || hours > 17) {
            throw new Error('Date must be during business hours (Mon-Fri, 9 AM - 5 PM)');
          }
        }
      }
    }
  },

  // Date range validations
  REASONABLE_FUTURE: {
    validate: {
      isReasonableFuture(value) {
        if (value) {
          const date = new Date(value);
          const maxFuture = new Date();
          maxFuture.setFullYear(maxFuture.getFullYear() + 5); // 5 years max
          
          if (date > maxFuture) {
            throw new Error('Date cannot be more than 5 years in the future');
          }
        }
      }
    }
  },

  REASONABLE_PAST: {
    validate: {
      isReasonablePast(value) {
        if (value) {
          const date = new Date(value);
          const minPast = new Date();
          minPast.setFullYear(minPast.getFullYear() - 50); // 50 years max
          
          if (date < minPast) {
            throw new Error('Date cannot be more than 50 years in the past');
          }
        }
      }
    }
  }
};

/**
 * Creates date range validation (startDate must be before endDate)
 * @param {string} startField - Name of the start date field
 * @param {string} endField - Name of the end date field
 * @param {Object} options - Validation options
 * @returns {Object} - Validation function
 */
const createDateRangeValidation = (startField, endField, options = {}) => {
  const {
    allowSameDay = true,
    maxDuration = null, // in days
    minDuration = null,  // in days
    errorMessage = null
  } = options;

  return {
    validate: {
      dateRangeValid() {
        const startDate = this[startField];
        const endDate = this[endField];

        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);

          // Basic range validation
          if (start > end) {
            throw new Error(errorMessage || `${endField} must be after ${startField}`);
          }

          if (!allowSameDay && start.getTime() === end.getTime()) {
            throw new Error(errorMessage || `${endField} must be different from ${startField}`);
          }

          // Duration validations
          if (maxDuration || minDuration) {
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

            if (maxDuration && diffDays > maxDuration) {
              throw new Error(`Duration cannot exceed ${maxDuration} days`);
            }

            if (minDuration && diffDays < minDuration) {
              throw new Error(`Duration must be at least ${minDuration} days`);
            }
          }
        }
      }
    }
  };
};

/**
 * Industry-specific date validations
 */
const INDUSTRY_DATE_VALIDATIONS = {
  CONSTRUCTION: {
    // Project timeline validations
    PROJECT_START: {
      validate: {
        isValidProjectStart(value) {
          if (value) {
            const date = new Date(value);
            const today = new Date();
            const maxAdvance = new Date();
            maxAdvance.setFullYear(maxAdvance.getFullYear() + 2); // Max 2 years advance booking

            if (date < today) {
              // Allow past dates for existing projects
              const minPast = new Date();
              minPast.setFullYear(minPast.getFullYear() - 5);
              
              if (date < minPast) {
                throw new Error('Project start date cannot be more than 5 years in the past');
              }
            } else if (date > maxAdvance) {
              throw new Error('Project start date cannot be more than 2 years in the future');
            }
          }
        }
      }
    },

    // Work order scheduling
    WORK_ORDER_SCHEDULE: {
      validate: {
        isValidWorkSchedule(value) {
          if (value) {
            const date = new Date(value);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            
            // Must be on the hour or half-hour
            if (minutes !== 0 && minutes !== 30) {
              throw new Error('Work orders must be scheduled on the hour or half-hour');
            }
            
            // Must be during work hours (6 AM to 8 PM)
            if (hours < 6 || hours > 20) {
              throw new Error('Work orders must be scheduled between 6 AM and 8 PM');
            }
          }
        }
      }
    },

    // Permit expiration
    PERMIT_EXPIRATION: {
      validate: {
        isValidPermitExpiration(value) {
          if (value) {
            const date = new Date(value);
            const today = new Date();
            const minFuture = new Date();
            minFuture.setDate(minFuture.getDate() + 30); // Minimum 30 days
            
            if (date < today) {
              throw new Error('Permit expiration date cannot be in the past');
            }
            
            if (date < minFuture) {
              throw new Error('Permit must be valid for at least 30 days');
            }
          }
        }
      }
    }
  },

  FINANCIAL: {
    // Invoice due dates
    INVOICE_DUE: {
      validate: {
        isValidDueDate(value) {
          if (value) {
            const date = new Date(value);
            const today = new Date();
            const maxFuture = new Date();
            maxFuture.setDate(maxFuture.getDate() + 365); // Max 1 year terms
            
            if (date < today) {
              throw new Error('Invoice due date cannot be in the past');
            }
            
            if (date > maxFuture) {
              throw new Error('Invoice terms cannot exceed 1 year');
            }
          }
        }
      }
    },

    // Payment processing
    PAYMENT_DATE: {
      validate: {
        isValidPaymentDate(value) {
          if (value) {
            const date = new Date(value);
            const today = new Date();
            const minPast = new Date();
            minPast.setDate(minPast.getDate() - 90); // Allow 90 days back for corrections
            
            if (date < minPast) {
              throw new Error('Payment date cannot be more than 90 days in the past');
            }
            
            if (date > today) {
              throw new Error('Payment date cannot be in the future');
            }
          }
        }
      }
    }
  },

  EVENT_MANAGEMENT: {
    // Event scheduling
    EVENT_BOOKING: {
      validate: {
        isValidEventDate(value) {
          if (value) {
            const date = new Date(value);
            const today = new Date();
            const minAdvance = new Date();
            minAdvance.setDate(minAdvance.getDate() + 1); // Minimum 24 hours notice
            
            if (date < minAdvance) {
              throw new Error('Events must be scheduled at least 24 hours in advance');
            }
          }
        }
      }
    }
  }
};

/**
 * Creates comprehensive date validation for a field
 * @param {Object} options - Validation options
 * @returns {Object} - Field definition with date validations
 */
const createDateField = (options = {}) => {
  const {
    DataTypes,
    allowNull = true,
    allowPast = true,
    allowFuture = true,
    businessHoursOnly = false,
    maxYearsFuture = null,
    maxYearsPast = null,
    industry = null,
    validationType = null,
    customValidation = null
  } = options;

  const field = {
    type: DataTypes.DATE,
    allowNull,
    validate: {}
  };

  // Add basic past/future validations
  if (!allowPast) {
    Object.assign(field.validate, DATE_VALIDATION_PATTERNS.FUTURE_DATE.validate);
  }

  if (!allowFuture) {
    Object.assign(field.validate, DATE_VALIDATION_PATTERNS.PAST_DATE.validate);
  }

  // Add business hours validation
  if (businessHoursOnly) {
    Object.assign(field.validate, DATE_VALIDATION_PATTERNS.BUSINESS_HOURS.validate);
  }

  // Add reasonable range validations
  if (maxYearsFuture) {
    field.validate.isReasonableFuture = function(value) {
      if (value) {
        const date = new Date(value);
        const maxFuture = new Date();
        maxFuture.setFullYear(maxFuture.getFullYear() + maxYearsFuture);
        
        if (date > maxFuture) {
          throw new Error(`Date cannot be more than ${maxYearsFuture} years in the future`);
        }
      }
    };
  }

  if (maxYearsPast) {
    field.validate.isReasonablePast = function(value) {
      if (value) {
        const date = new Date(value);
        const minPast = new Date();
        minPast.setFullYear(minPast.getFullYear() - maxYearsPast);
        
        if (date < minPast) {
          throw new Error(`Date cannot be more than ${maxYearsPast} years in the past`);
        }
      }
    };
  }

  // Add industry-specific validations
  if (industry && validationType && INDUSTRY_DATE_VALIDATIONS[industry]?.[validationType]) {
    Object.assign(field.validate, INDUSTRY_DATE_VALIDATIONS[industry][validationType].validate);
  }

  // Add custom validation
  if (customValidation) {
    Object.assign(field.validate, customValidation);
  }

  return field;
};

/**
 * Validates model date field configuration
 * @param {Object} modelFields - Model field definitions
 * @param {string} modelName - Model name for error messages
 * @returns {Array} - Array of validation warnings
 */
const validateDateFields = (modelFields, modelName) => {
  const warnings = [];
  const dateFields = [];

  // Find all date fields
  Object.entries(modelFields).forEach(([fieldName, fieldDef]) => {
    if (fieldDef.type && fieldDef.type.key === 'DATE') {
      dateFields.push(fieldName);
    }
  });

  // Check for common date field pairs without range validation
  const commonPairs = [
    ['startDate', 'endDate'],
    ['scheduledDate', 'completedDate'],
    ['createdAt', 'updatedAt'],
    ['issuedAt', 'expiresAt'],
    ['openDate', 'closeDate']
  ];

  commonPairs.forEach(([startField, endField]) => {
    if (dateFields.includes(startField) && dateFields.includes(endField)) {
      const startFieldDef = modelFields[startField];
      const endFieldDef = modelFields[endField];
      
      // Check if range validation exists
      const hasRangeValidation = 
        (startFieldDef.validate && Object.keys(startFieldDef.validate).some(v => v.includes('Range'))) ||
        (endFieldDef.validate && Object.keys(endFieldDef.validate).some(v => v.includes('Range')));
      
      if (!hasRangeValidation) {
        warnings.push(`Model '${modelName}': Consider adding date range validation for ${startField} and ${endField}`);
      }
    }
  });

  // Check for date fields without any validation
  dateFields.forEach(fieldName => {
    const fieldDef = modelFields[fieldName];
    if (!fieldDef.validate || Object.keys(fieldDef.validate).length === 0) {
      warnings.push(`Model '${modelName}': Date field '${fieldName}' has no validation constraints`);
    }
  });

  return warnings;
};

/**
 * Common date field presets for quick implementation
 */
const DATE_FIELD_PRESETS = {
  EVENT_DATE: (DataTypes) => createDateField({
    DataTypes,
    allowPast: false,
    maxYearsFuture: 2,
    industry: 'EVENT_MANAGEMENT',
    validationType: 'EVENT_BOOKING'
  }),

  PROJECT_START_DATE: (DataTypes) => createDateField({
    DataTypes,
    maxYearsFuture: 2,
    maxYearsPast: 5,
    industry: 'CONSTRUCTION',
    validationType: 'PROJECT_START'
  }),

  INVOICE_DUE_DATE: (DataTypes) => createDateField({
    DataTypes,
    allowPast: false,
    maxYearsFuture: 1,
    industry: 'FINANCIAL',
    validationType: 'INVOICE_DUE'
  }),

  PAYMENT_DATE: (DataTypes) => createDateField({
    DataTypes,
    allowFuture: false,
    maxYearsPast: 1,
    industry: 'FINANCIAL',
    validationType: 'PAYMENT_DATE'
  }),

  WORK_ORDER_SCHEDULE: (DataTypes) => createDateField({
    DataTypes,
    allowPast: false,
    industry: 'CONSTRUCTION',
    validationType: 'WORK_ORDER_SCHEDULE'
  }),

  PERMIT_EXPIRATION: (DataTypes) => createDateField({
    DataTypes,
    allowPast: false,
    maxYearsFuture: 5,
    industry: 'CONSTRUCTION',
    validationType: 'PERMIT_EXPIRATION'
  })
};

module.exports = {
  DATE_VALIDATION_PATTERNS,
  INDUSTRY_DATE_VALIDATIONS,
  DATE_FIELD_PRESETS,
  createDateField,
  createDateRangeValidation,
  validateDateFields
};
