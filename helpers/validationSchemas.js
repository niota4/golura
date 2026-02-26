/**
 * Comprehensive Validation Schemas
 * 
 * This helper provides standardized validation schemas for all model types
 * with business logic validation, data integrity checks, and industry standards.
 */

const { DataTypes } = require('sequelize');

/**
 * Base validation patterns
 */
const VALIDATION_PATTERNS = {
  // Text patterns
  NAME: /^[a-zA-Z\s\-\.\']{1,100}$/,
  COMPANY_NAME: /^[a-zA-Z0-9\s\-\.\'&,]{1,255}$/,
  DESCRIPTION: /^[\s\S]{0,10000}$/, // Any characters, max 10k
  NOTES: /^[\s\S]{0,5000}$/, // Any characters, max 5k
  
  // Contact patterns
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[\+]?[1-9][\d\s\-\(\)\.]{7,20}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  // Address patterns
  ADDRESS: /^[a-zA-Z0-9\s\-\.\,\#]{1,255}$/,
  CITY: /^[a-zA-Z\s\-\.\']{1,100}$/,
  STATE: /^[a-zA-Z\s\-\.]{1,50}$/,
  ZIP_CODE: /^[0-9]{5}(-[0-9]{4})?$/,
  POSTAL_CODE: /^[A-Za-z0-9\s\-]{3,10}$/,
  COUNTRY_CODE: /^[A-Z]{2}$/,
  
  // Business patterns
  TAX_ID: /^[0-9]{2}-[0-9]{7}$/,
  LICENSE_NUMBER: /^[A-Za-z0-9\-]{5,20}$/,
  PERMIT_NUMBER: /^[A-Z]{2}[0-9]{6}$/,
  CONTRACT_NUMBER: /^CONT-[0-9]{4}-[0-9]{4}$/,
  PROJECT_NUMBER: /^PROJ-[0-9]{4}-[0-9]{4}$/,
  INVOICE_NUMBER: /^INV-[0-9]{4}-[0-9]{6}$/,
  
  // Technical patterns
  VERSION: /^v[0-9]+\.[0-9]+(\.[0-9]+)?$/,
  SUBDOMAIN: /^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?$/,
  COLOR_HEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Financial patterns
  CURRENCY_CODE: /^[A-Z]{3}$/,
  ACCOUNT_NUMBER: /^[0-9]{4}-[0-9]{4}-[0-9]{4}$/,
  ROUTING_NUMBER: /^[0-9]{9}$/,
  CREDIT_CARD: /^[0-9]{13,19}$/,
  
  // Date/Time patterns
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  DATETIME_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
};

/**
 * Validation schema templates
 */
const VALIDATION_SCHEMAS = {
  // Core business entities
  USER: {
    firstName: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: VALIDATION_PATTERNS.NAME,
      message: 'First name must be 1-50 characters, letters, spaces, hyphens, dots, and apostrophes only'
    },
    
    lastName: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: VALIDATION_PATTERNS.NAME,
      message: 'Last name must be 1-50 characters, letters, spaces, hyphens, dots, and apostrophes only'
    },
    
    email: {
      required: true,
      type: 'string',
      unique: true,
      pattern: VALIDATION_PATTERNS.EMAIL,
      maxLength: 320,
      message: 'Must be a valid email address'
    },
    
    phone: {
      required: false,
      type: 'string',
      pattern: VALIDATION_PATTERNS.PHONE,
      message: 'Must be a valid phone number with country code'
    },
    
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      maxLength: 128,
      customValidation: 'passwordComplexity',
      message: 'Password must be 8-128 characters with uppercase, lowercase, number, and special character'
    },
    
    role: {
      required: true,
      type: 'enum',
      values: ['OWNER', 'ADMIN', 'PROJECT_MANAGER', 'ESTIMATOR', 'CREW_LEAD', 'CREW_MEMBER'],
      message: 'Must be a valid user role'
    },
    
    isActive: {
      required: true,
      type: 'boolean',
      default: true
    }
  },

  COMPANY: {
    name: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 255,
      pattern: VALIDATION_PATTERNS.COMPANY_NAME,
      message: 'Company name must be 1-255 characters'
    },
    
    subdomain: {
      required: true,
      type: 'string',
      unique: true,
      minLength: 3,
      maxLength: 63,
      pattern: VALIDATION_PATTERNS.SUBDOMAIN,
      message: 'Subdomain must be 3-63 characters, lowercase letters, numbers, and hyphens only'
    },
    
    email: {
      required: true,
      type: 'string',
      pattern: VALIDATION_PATTERNS.EMAIL,
      message: 'Must be a valid email address'
    },
    
    phone: {
      required: false,
      type: 'string',
      pattern: VALIDATION_PATTERNS.PHONE,
      message: 'Must be a valid phone number'
    },
    
    website: {
      required: false,
      type: 'string',
      pattern: VALIDATION_PATTERNS.URL,
      message: 'Must be a valid URL'
    },
    
    taxId: {
      required: false,
      type: 'string',
      pattern: VALIDATION_PATTERNS.TAX_ID,
      message: 'Tax ID must be in format XX-XXXXXXX'
    },
    
    licenseNumber: {
      required: false,
      type: 'string',
      pattern: VALIDATION_PATTERNS.LICENSE_NUMBER,
      message: 'License number must be 5-20 alphanumeric characters'
    },
    
    primaryColor: {
      required: false,
      type: 'string',
      pattern: VALIDATION_PATTERNS.COLOR_HEX,
      message: 'Must be a valid hex color code'
    }
  },

  PROJECT: {
    name: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 255,
      message: 'Project name is required and must be 1-255 characters'
    },
    
    projectNumber: {
      required: true,
      type: 'string',
      unique: true,
      pattern: VALIDATION_PATTERNS.PROJECT_NUMBER,
      message: 'Project number must be in format PROJ-YYYY-NNNN'
    },
    
    contractNumber: {
      required: false,
      type: 'string',
      pattern: VALIDATION_PATTERNS.CONTRACT_NUMBER,
      message: 'Contract number must be in format CONT-YYYY-NNNN'
    },
    
    permitNumber: {
      required: false,
      type: 'string',
      pattern: VALIDATION_PATTERNS.PERMIT_NUMBER,
      message: 'Permit number must be in format AA123456'
    },
    
    startDate: {
      required: true,
      type: 'date',
      customValidation: 'futureDate',
      message: 'Start date must be in the future'
    },
    
    endDate: {
      required: true,
      type: 'date',
      customValidation: 'dateRange',
      dependsOn: 'startDate',
      message: 'End date must be after start date'
    },
    
    budget: {
      required: true,
      type: 'decimal',
      min: 0,
      max: 99999999.99,
      precision: 2,
      message: 'Budget must be a positive amount up to $99,999,999.99'
    },
    
    clientId: {
      required: true,
      type: 'integer',
      foreignKey: 'clients.id',
      message: 'Must reference a valid client'
    },
    
    status: {
      required: true,
      type: 'enum',
      values: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
      default: 'planning',
      message: 'Must be a valid project status'
    }
  },

  ESTIMATE: {
    estimateNumber: {
      required: true,
      type: 'string',
      unique: true,
      pattern: /^EST-[0-9]{4}-[0-9]{6}$/,
      message: 'Estimate number must be in format EST-YYYY-NNNNNN'
    },
    
    title: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 255,
      message: 'Estimate title is required and must be 1-255 characters'
    },
    
    totalAmount: {
      required: true,
      type: 'decimal',
      min: 0,
      max: 99999999.99,
      precision: 2,
      message: 'Total amount must be a positive value up to $99,999,999.99'
    },
    
    validUntil: {
      required: true,
      type: 'date',
      customValidation: 'futureDate',
      message: 'Estimate must be valid until a future date'
    },
    
    terms: {
      required: false,
      type: 'text',
      maxLength: 5000,
      message: 'Terms cannot exceed 5000 characters'
    },
    
    status: {
      required: true,
      type: 'enum',
      values: ['draft', 'sent', 'viewed', 'approved', 'rejected', 'expired'],
      default: 'draft',
      message: 'Must be a valid estimate status'
    }
  },

  INVOICE: {
    invoiceNumber: {
      required: true,
      type: 'string',
      unique: true,
      pattern: VALIDATION_PATTERNS.INVOICE_NUMBER,
      message: 'Invoice number must be in format INV-YYYY-NNNNNN'
    },
    
    amount: {
      required: true,
      type: 'decimal',
      min: 0.01,
      max: 99999999.99,
      precision: 2,
      message: 'Invoice amount must be between $0.01 and $99,999,999.99'
    },
    
    taxAmount: {
      required: false,
      type: 'decimal',
      min: 0,
      max: 9999999.99,
      precision: 2,
      message: 'Tax amount must be positive'
    },
    
    dueDate: {
      required: true,
      type: 'date',
      customValidation: 'futureDate',
      message: 'Due date must be in the future'
    },
    
    paymentTerms: {
      required: true,
      type: 'enum',
      values: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom'],
      message: 'Must be a valid payment term'
    },
    
    status: {
      required: true,
      type: 'enum',
      values: ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
      message: 'Must be a valid invoice status'
    }
  },

  CLIENT: {
    firstName: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: VALIDATION_PATTERNS.NAME,
      message: 'First name must be 1-50 characters'
    },
    
    lastName: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: VALIDATION_PATTERNS.NAME,
      message: 'Last name must be 1-50 characters'
    },
    
    email: {
      required: true,
      type: 'string',
      pattern: VALIDATION_PATTERNS.EMAIL,
      message: 'Must be a valid email address'
    },
    
    phone: {
      required: false,
      type: 'string',
      pattern: VALIDATION_PATTERNS.PHONE,
      message: 'Must be a valid phone number'
    },
    
    companyName: {
      required: false,
      type: 'string',
      maxLength: 255,
      pattern: VALIDATION_PATTERNS.COMPANY_NAME,
      message: 'Company name must be valid'
    },
    
    creditLimit: {
      required: false,
      type: 'decimal',
      min: 0,
      max: 9999999.99,
      precision: 2,
      message: 'Credit limit must be positive'
    },
    
    paymentTerms: {
      required: true,
      type: 'enum',
      values: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt'],
      default: 'net_30',
      message: 'Must be a valid payment term'
    }
  },

  ADDRESS: {
    line1: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 255,
      pattern: VALIDATION_PATTERNS.ADDRESS,
      message: 'Address line 1 is required'
    },
    
    line2: {
      required: false,
      type: 'string',
      maxLength: 255,
      pattern: VALIDATION_PATTERNS.ADDRESS,
      message: 'Address line 2 must be valid'
    },
    
    city: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: VALIDATION_PATTERNS.CITY,
      message: 'City is required and must be valid'
    },
    
    state: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: VALIDATION_PATTERNS.STATE,
      message: 'State is required'
    },
    
    zipCode: {
      required: true,
      type: 'string',
      pattern: VALIDATION_PATTERNS.ZIP_CODE,
      message: 'ZIP code must be in format 12345 or 12345-6789'
    },
    
    country: {
      required: true,
      type: 'string',
      pattern: VALIDATION_PATTERNS.COUNTRY_CODE,
      default: 'US',
      message: 'Country must be a valid 2-letter code'
    },
    
    latitude: {
      required: false,
      type: 'decimal',
      min: -90,
      max: 90,
      precision: 8,
      message: 'Latitude must be between -90 and 90 degrees'
    },
    
    longitude: {
      required: false,
      type: 'decimal',
      min: -180,
      max: 180,
      precision: 8,
      message: 'Longitude must be between -180 and 180 degrees'
    }
  }
};

/**
 * Custom validation functions
 */
const CUSTOM_VALIDATIONS = {
  passwordComplexity: (value) => {
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      throw new Error('Password must contain uppercase, lowercase, number, and special character');
    }
  },

  futureDate: (value) => {
    const date = new Date(value);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    
    if (date <= now) {
      throw new Error('Date must be in the future');
    }
  },

  pastDate: (value) => {
    const date = new Date(value);
    const now = new Date();
    
    if (date > now) {
      throw new Error('Date must be in the past');
    }
  },

  dateRange: (endDate, startDate) => {
    if (!startDate) return; // Skip if start date not provided
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      throw new Error('End date must be after start date');
    }
  },

  businessEmail: (value) => {
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    const domain = value.split('@')[1]?.toLowerCase();
    
    if (personalDomains.includes(domain)) {
      console.warn('Personal email domain detected, consider using business email');
    }
  },

  phoneFormat: (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // US phone numbers should be 10 or 11 digits
    if (digits.length === 10 || (digits.length === 11 && digits[0] === '1')) {
      return true;
    }
    
    // International numbers can be 7-15 digits
    if (digits.length >= 7 && digits.length <= 15) {
      return true;
    }
    
    throw new Error('Phone number must be in valid format');
  },

  currencyAmount: (value, precision = 2) => {
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    
    if (decimalPlaces > precision) {
      throw new Error(`Amount cannot have more than ${precision} decimal places`);
    }
    
    if (value < 0) {
      throw new Error('Amount cannot be negative');
    }
  },

  uniqueInCompany: async (value, field, model, companyId) => {
    const existing = await model.findOne({
      where: {
        [field]: value,
        companyId: companyId
      }
    });
    
    if (existing) {
      throw new Error(`${field} must be unique within company`);
    }
  },

  validFileType: (filename, allowedTypes) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(extension)) {
      throw new Error(`File type .${extension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
  },

  maxFileSize: (fileSize, maxSizeMB) => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    
    if (fileSize > maxBytes) {
      throw new Error(`File size cannot exceed ${maxSizeMB}MB`);
    }
  }
};

/**
 * Business logic validations
 */
const BUSINESS_VALIDATIONS = {
  construction: {
    projectBudgetLimit: (budget, clientCreditLimit) => {
      if (clientCreditLimit && budget > clientCreditLimit * 1.5) {
        console.warn('Project budget significantly exceeds client credit limit');
      }
    },

    crewSizeForWork: (workType, crewSize) => {
      const minimumCrew = {
        'roofing': 2,
        'electrical': 1,
        'plumbing': 1,
        'structural': 3,
        'excavation': 2
      };

      const required = minimumCrew[workType];
      if (required && crewSize < required) {
        throw new Error(`${workType} work requires minimum crew size of ${required}`);
      }
    },

    weatherDependentScheduling: (workType, scheduledDate) => {
      const weatherDependent = ['roofing', 'exterior', 'landscaping', 'concrete'];
      
      if (weatherDependent.includes(workType)) {
        const month = new Date(scheduledDate).getMonth();
        
        // Avoid winter months (Dec, Jan, Feb) for outdoor work
        if ([0, 1, 11].includes(month)) {
          console.warn('Weather-dependent work scheduled during winter months may face delays');
        }
      }
    },

    permitRequirements: (workType, projectValue) => {
      const permitThresholds = {
        'electrical': 1000,
        'plumbing': 1000,
        'structural': 5000,
        'roofing': 5000,
        'hvac': 2500
      };

      const threshold = permitThresholds[workType];
      if (threshold && projectValue > threshold) {
        console.info(`Work type ${workType} over $${threshold} typically requires a permit`);
      }
    }
  },

  financial: {
    invoiceAmountVsEstimate: (invoiceAmount, estimateAmount) => {
      const variance = Math.abs(invoiceAmount - estimateAmount) / estimateAmount;
      
      if (variance > 0.15) { // 15% variance
        console.warn(`Invoice amount varies significantly from estimate (${(variance * 100).toFixed(1)}%)`);
      }
    },

    paymentTermsVsAmount: (amount, paymentTerms) => {
      // Large amounts should have longer payment terms
      if (amount > 50000 && ['net_15', 'due_on_receipt'].includes(paymentTerms)) {
        console.warn('Large invoice amounts typically use longer payment terms');
      }
    },

    creditLimitCheck: (clientId, newAmount) => {
      // This would need to check existing unpaid invoices + new amount vs credit limit
      // Implementation would require database queries
      console.info('Credit limit check should be performed');
    }
  }
};

/**
 * Validation runner
 */
class ValidationRunner {
  /**
   * Validates data against schema
   */
  static async validate(data, schemaName, options = {}) {
    const schema = VALIDATION_SCHEMAS[schemaName];
    if (!schema) {
      throw new Error(`Unknown validation schema: ${schemaName}`);
    }

    const errors = [];
    const warnings = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      
      try {
        await this.validateField(field, value, rules, data, options);
      } catch (error) {
        errors.push({
          field,
          message: error.message,
          code: error.code || 'VALIDATION_ERROR'
        });
      }
    }

    // Run business validations if specified
    if (options.businessDomain && BUSINESS_VALIDATIONS[options.businessDomain]) {
      try {
        await this.runBusinessValidations(data, options.businessDomain, options);
      } catch (error) {
        warnings.push({
          message: error.message,
          code: 'BUSINESS_WARNING'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates individual field
   */
  static async validateField(field, value, rules, allData, options) {
    // Check required
    if (rules.required && (value === null || value === undefined || value === '')) {
      throw new Error(rules.message || `${field} is required`);
    }

    // Skip further validation if value is empty and not required
    if (!rules.required && (value === null || value === undefined || value === '')) {
      return;
    }

    // Type validation
    if (rules.type && !this.validateType(value, rules.type)) {
      throw new Error(rules.message || `${field} must be of type ${rules.type}`);
    }

    // String validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        throw new Error(rules.message || `${field} must be at least ${rules.minLength} characters`);
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        throw new Error(rules.message || `${field} cannot exceed ${rules.maxLength} characters`);
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        throw new Error(rules.message || `${field} format is invalid`);
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        throw new Error(rules.message || `${field} must be at least ${rules.min}`);
      }
      
      if (rules.max !== undefined && value > rules.max) {
        throw new Error(rules.message || `${field} cannot exceed ${rules.max}`);
      }
    }

    // Enum validation
    if (rules.values && !rules.values.includes(value)) {
      throw new Error(rules.message || `${field} must be one of: ${rules.values.join(', ')}`);
    }

    // Custom validation
    if (rules.customValidation && CUSTOM_VALIDATIONS[rules.customValidation]) {
      if (rules.dependsOn && allData[rules.dependsOn]) {
        await CUSTOM_VALIDATIONS[rules.customValidation](value, allData[rules.dependsOn]);
      } else {
        await CUSTOM_VALIDATIONS[rules.customValidation](value);
      }
    }

    // Uniqueness validation (requires database check)
    if (rules.unique && options.model) {
      const existing = await options.model.findOne({
        where: { [field]: value }
      });
      
      if (existing && existing.id !== options.excludeId) {
        throw new Error(rules.message || `${field} must be unique`);
      }
    }
  }

  /**
   * Validates data type
   */
  static validateType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
      case 'integer':
      case 'decimal':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value));
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'enum':
        return true; // Enum validation is handled separately
      default:
        return true;
    }
  }

  /**
   * Runs business domain validations
   */
  static async runBusinessValidations(data, domain, options) {
    const validations = BUSINESS_VALIDATIONS[domain];
    if (!validations) return;

    for (const [validationName, validationFn] of Object.entries(validations)) {
      if (typeof validationFn === 'function') {
        try {
          await validationFn(...this.getValidationArgs(validationName, data));
        } catch (error) {
          console.warn(`Business validation ${validationName}:`, error.message);
        }
      }
    }
  }

  /**
   * Gets arguments for business validation functions
   */
  static getValidationArgs(validationName, data) {
    // Map validation function names to data fields
    const argMappings = {
      projectBudgetLimit: [data.budget, data.clientCreditLimit],
      crewSizeForWork: [data.workType, data.crewSize],
      weatherDependentScheduling: [data.workType, data.scheduledDate],
      permitRequirements: [data.workType, data.projectValue],
      invoiceAmountVsEstimate: [data.invoiceAmount, data.estimateAmount],
      paymentTermsVsAmount: [data.amount, data.paymentTerms],
      creditLimitCheck: [data.clientId, data.newAmount]
    };

    return argMappings[validationName] || [];
  }
}

module.exports = {
  VALIDATION_PATTERNS,
  VALIDATION_SCHEMAS,
  CUSTOM_VALIDATIONS,
  BUSINESS_VALIDATIONS,
  ValidationRunner
};
