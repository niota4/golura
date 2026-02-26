/**
 * Construction Industry Specific Fields and Validations
 * 
 * This helper provides specialized field definitions, validations, and business logic
 * specifically tailored for the construction industry.
 */

const { DataTypes } = require('sequelize');

/**
 * Construction-specific field templates
 */
const CONSTRUCTION_FIELDS = {
  // Project identification
  PROJECT_NUMBER: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      is: /^PROJ-\d{4}-\d{4}$/,
      notEmpty: true
    },
    comment: 'Unique project identifier (format: PROJ-YYYY-NNNN)'
  },

  CONTRACT_NUMBER: {
    type: DataTypes.STRING(25),
    allowNull: true,
    validate: {
      is: /^CONT-\d{4}-\d{4}$/
    },
    comment: 'Contract reference number'
  },

  PERMIT_NUMBER: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: {
      is: /^[A-Z]{2}\d{6}$/
    },
    comment: 'Building permit number (format: AA123456)'
  },

  // Project phases and milestones
  PROJECT_PHASE: {
    type: DataTypes.ENUM(
      'planning',
      'design',
      'permits',
      'procurement',
      'foundation',
      'framing',
      'roofing',
      'electrical',
      'plumbing',
      'hvac',
      'insulation',
      'drywall',
      'flooring',
      'fixtures',
      'exterior',
      'landscaping',
      'inspection',
      'completion',
      'warranty'
    ),
    allowNull: false,
    defaultValue: 'planning',
    comment: 'Current project phase'
  },

  MILESTONE_TYPE: {
    type: DataTypes.ENUM(
      'groundbreaking',
      'foundation_complete',
      'frame_complete',
      'roof_complete',
      'mechanical_rough',
      'electrical_rough',
      'plumbing_rough',
      'insulation_complete',
      'drywall_complete',
      'final_inspection',
      'certificate_of_occupancy',
      'project_completion'
    ),
    allowNull: false,
    comment: 'Type of project milestone'
  },

  // Work classifications
  WORK_TYPE: {
    type: DataTypes.ENUM(
      'residential_new',
      'residential_renovation',
      'residential_addition',
      'commercial_new',
      'commercial_renovation',
      'commercial_tenant_improvement',
      'industrial',
      'infrastructure',
      'specialty'
    ),
    allowNull: false,
    comment: 'Type of construction work'
  },

  TRADE_TYPE: {
    type: DataTypes.ENUM(
      'general_contractor',
      'electrical',
      'plumbing',
      'hvac',
      'roofing',
      'flooring',
      'painting',
      'landscaping',
      'concrete',
      'framing',
      'drywall',
      'insulation',
      'windows_doors',
      'specialty'
    ),
    allowNull: false,
    comment: 'Trade or specialty type'
  },

  // Labor and crew management
  CREW_SIZE: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 50,
      isInt: true
    },
    comment: 'Number of crew members'
  },

  SKILL_LEVEL: {
    type: DataTypes.ENUM('apprentice', 'journeyman', 'master', 'supervisor'),
    allowNull: false,
    defaultValue: 'journeyman',
    comment: 'Worker skill/certification level'
  },

  HOURLY_RATE: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 999.99
    },
    comment: 'Hourly labor rate in USD'
  },

  OVERTIME_RATE: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 999.99
    },
    comment: 'Overtime hourly rate in USD'
  },

  // Material and equipment
  MATERIAL_TYPE: {
    type: DataTypes.ENUM(
      'lumber',
      'concrete',
      'steel',
      'drywall',
      'insulation',
      'roofing',
      'electrical',
      'plumbing',
      'hvac',
      'flooring',
      'paint',
      'hardware',
      'fixtures',
      'tools',
      'equipment',
      'other'
    ),
    allowNull: false,
    comment: 'Category of material or equipment'
  },

  UNIT_OF_MEASURE: {
    type: DataTypes.ENUM(
      'each',
      'linear_foot',
      'square_foot',
      'cubic_foot',
      'cubic_yard',
      'ton',
      'pound',
      'gallon',
      'board_foot',
      'hour',
      'day',
      'week',
      'lot'
    ),
    allowNull: false,
    defaultValue: 'each',
    comment: 'Unit of measurement for materials/labor'
  },

  WASTE_FACTOR: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false,
    defaultValue: 0.0500, // 5% default waste
    validate: {
      min: 0,
      max: 1 // 100% max
    },
    comment: 'Material waste factor (0.05 = 5%)'
  },

  // Safety and compliance
  SAFETY_RATING: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium',
    comment: 'Safety risk level for work item'
  },

  OSHA_CLASSIFICATION: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      is: /^[0-9]{4}$/
    },
    comment: 'OSHA industry classification code'
  },

  REQUIRES_PERMIT: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether work requires building permit'
  },

  INSPECTION_REQUIRED: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether work requires inspection'
  },

  // Weather and environmental
  WEATHER_DEPENDENT: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether work is weather dependent'
  },

  TEMPERATURE_MIN: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: -50,
      max: 150
    },
    comment: 'Minimum temperature for work (Fahrenheit)'
  },

  TEMPERATURE_MAX: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: -50,
      max: 150
    },
    comment: 'Maximum temperature for work (Fahrenheit)'
  },

  // Quality and specifications
  QUALITY_GRADE: {
    type: DataTypes.ENUM('economy', 'standard', 'premium', 'luxury'),
    allowNull: false,
    defaultValue: 'standard',
    comment: 'Quality grade of materials/work'
  },

  SPECIFICATION_VERSION: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^v\d+\.\d+(\.\d+)?$/
    },
    comment: 'Version of specifications (format: v1.0.0)'
  },

  // Progress tracking
  PERCENT_COMPLETE: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Completion percentage (0-100)'
  },

  ACTUAL_START_DATE: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Actual work start date'
  },

  ACTUAL_END_DATE: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Actual work completion date'
  },

  PLANNED_START_DATE: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Planned work start date'
  },

  PLANNED_END_DATE: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Planned work completion date'
  },

  // Cost tracking
  BUDGETED_COST: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    },
    comment: 'Originally budgeted cost'
  },

  ACTUAL_COST: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    },
    comment: 'Actual incurred cost'
  },

  VARIANCE_AMOUNT: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: 'Cost variance (actual - budgeted)'
  },

  VARIANCE_PERCENT: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: true,
    comment: 'Cost variance percentage'
  },

  // Equipment and tools
  EQUIPMENT_ID: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^EQ-\d{6}$/
    },
    comment: 'Equipment identifier (format: EQ-123456)'
  },

  TOOL_REQUIREMENTS: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Required tools and equipment list'
  },

  // Subcontractor management
  SUBCONTRACTOR_ID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'companies',
      key: 'id'
    },
    comment: 'Subcontractor company ID'
  },

  SUBCONTRACTOR_LICENSE: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Subcontractor license number'
  },

  INSURANCE_VERIFIED: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether subcontractor insurance is verified'
  },

  // Change orders and variations
  CHANGE_ORDER_NUMBER: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: {
      is: /^CO-\d{4}-\d{4}$/
    },
    comment: 'Change order reference (format: CO-YYYY-NNNN)'
  },

  CHANGE_REASON: {
    type: DataTypes.ENUM(
      'client_request',
      'design_change',
      'site_conditions',
      'material_unavailable',
      'code_requirements',
      'weather_delay',
      'unforeseen_conditions'
    ),
    allowNull: true,
    comment: 'Reason for change order'
  },

  // Warranty and maintenance
  WARRANTY_PERIOD_MONTHS: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 12,
    validate: {
      min: 0,
      max: 240 // 20 years max
    },
    comment: 'Warranty period in months'
  },

  WARRANTY_TYPE: {
    type: DataTypes.ENUM('material', 'workmanship', 'comprehensive'),
    allowNull: false,
    defaultValue: 'workmanship',
    comment: 'Type of warranty coverage'
  },

  MAINTENANCE_REQUIRED: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether item requires ongoing maintenance'
  }
};

/**
 * Construction-specific validation rules
 */
const CONSTRUCTION_VALIDATIONS = {
  // Project validation
  validateProjectDates: (instance) => {
    if (instance.planned_start_date && instance.planned_end_date) {
      if (new Date(instance.planned_start_date) >= new Date(instance.planned_end_date)) {
        throw new Error('Planned start date must be before planned end date');
      }
    }

    if (instance.actual_start_date && instance.actual_end_date) {
      if (new Date(instance.actual_start_date) > new Date(instance.actual_end_date)) {
        throw new Error('Actual start date cannot be after actual end date');
      }
    }
  },

  // Cost validation
  validateCosts: (instance) => {
    if (instance.budgeted_cost && instance.actual_cost) {
      const variance = instance.actual_cost - instance.budgeted_cost;
      instance.variance_amount = variance;
      instance.variance_percent = (variance / instance.budgeted_cost) * 100;
    }

    // Check for unrealistic costs
    if (instance.actual_cost > instance.budgeted_cost * 3) {
      console.warn(`Large cost variance detected: ${instance.variance_percent}%`);
    }
  },

  // Safety validation
  validateSafety: (instance) => {
    // High-risk work requires additional safety measures
    if (instance.safety_rating === 'critical') {
      if (!instance.inspection_required) {
        throw new Error('Critical safety rating requires mandatory inspection');
      }
    }

    // OSHA classification validation
    if (instance.osha_classification && instance.osha_classification.length !== 4) {
      throw new Error('OSHA classification must be 4 digits');
    }
  },

  // Weather validation
  validateWeather: (instance) => {
    if (instance.temperature_min && instance.temperature_max) {
      if (instance.temperature_min >= instance.temperature_max) {
        throw new Error('Minimum temperature must be less than maximum temperature');
      }
    }
  },

  // Progress validation
  validateProgress: (instance) => {
    if (instance.percent_complete < 0 || instance.percent_complete > 100) {
      throw new Error('Percent complete must be between 0 and 100');
    }

    // Auto-calculate completion based on dates
    if (instance.actual_start_date && instance.actual_end_date && !instance.percent_complete) {
      instance.percent_complete = 100;
    }
  },

  // Equipment validation
  validateEquipment: (instance) => {
    if (instance.tool_requirements && !Array.isArray(instance.tool_requirements)) {
      throw new Error('Tool requirements must be an array');
    }

    // Validate tool requirements format
    if (instance.tool_requirements) {
      instance.tool_requirements.forEach(tool => {
        if (!tool.name || !tool.quantity) {
          throw new Error('Each tool requirement must have name and quantity');
        }
      });
    }
  },

  // Subcontractor validation
  validateSubcontractor: (instance) => {
    if (instance.subcontractor_id && !instance.insurance_verified) {
      console.warn('Subcontractor assigned without verified insurance');
    }

    if (instance.subcontractor_license && instance.subcontractor_license.length < 5) {
      throw new Error('Subcontractor license must be at least 5 characters');
    }
  },

  // Warranty validation
  validateWarranty: (instance) => {
    if (instance.warranty_period_months && instance.warranty_period_months > 240) {
      throw new Error('Warranty period cannot exceed 240 months (20 years)');
    }

    // Certain material types have minimum warranty requirements
    const minimumWarrantyMonths = {
      'roofing': 24,
      'hvac': 12,
      'electrical': 12,
      'plumbing': 12,
      'structural': 120
    };

    if (instance.material_type && minimumWarrantyMonths[instance.material_type]) {
      const minMonths = minimumWarrantyMonths[instance.material_type];
      if (instance.warranty_period_months < minMonths) {
        console.warn(`${instance.material_type} typically requires ${minMonths} month warranty`);
      }
    }
  }
};

/**
 * Construction business rules
 */
const CONSTRUCTION_BUSINESS_RULES = {
  // Project scheduling rules
  SCHEDULING: {
    // Weather-dependent work cannot be scheduled during certain seasons
    checkWeatherWindow: (instance) => {
      if (instance.weather_dependent && instance.planned_start_date) {
        const startDate = new Date(instance.planned_start_date);
        const month = startDate.getMonth(); // 0-11

        // Avoid exterior work during winter months (Dec, Jan, Feb)
        if ([0, 1, 11].includes(month) && 
            ['roofing', 'exterior', 'landscaping'].includes(instance.work_type)) {
          throw new Error('Weather-dependent exterior work should not be scheduled during winter months');
        }
      }
    },

    // Certain trades must follow logical sequence
    checkTradeSequence: (projectPhase, tradeType) => {
      const tradeSequence = {
        'foundation': ['concrete'],
        'framing': ['framing'],
        'roofing': ['roofing'],
        'electrical': ['electrical'],
        'plumbing': ['plumbing'],
        'hvac': ['hvac'],
        'insulation': ['insulation'],
        'drywall': ['drywall'],
        'flooring': ['flooring'],
        'painting': ['painting']
      };

      const allowedTrades = tradeSequence[projectPhase] || [];
      if (allowedTrades.length > 0 && !allowedTrades.includes(tradeType)) {
        console.warn(`Trade ${tradeType} may not be appropriate for phase ${projectPhase}`);
      }
    }
  },

  // Safety rules
  SAFETY: {
    // High-risk activities require additional crew size
    checkCrewSafety: (instance) => {
      const highRiskActivities = ['roofing', 'electrical', 'structural'];
      if (highRiskActivities.includes(instance.work_type) && instance.crew_size < 2) {
        throw new Error('High-risk activities require minimum crew size of 2 for safety');
      }
    },

    // Temperature restrictions for certain materials
    checkTemperatureRestrictions: (instance) => {
      const temperatureRestrictions = {
        'concrete': { min: 35, max: 90 },
        'paint': { min: 50, max: 85 },
        'roofing': { min: 45, max: 95 }
      };

      const restrictions = temperatureRestrictions[instance.material_type];
      if (restrictions) {
        if (instance.temperature_min < restrictions.min || 
            instance.temperature_max > restrictions.max) {
          throw new Error(`${instance.material_type} work requires temperature between ${restrictions.min}°F and ${restrictions.max}°F`);
        }
      }
    }
  },

  // Cost rules
  COST: {
    // Large variances require approval
    checkCostVariance: (instance) => {
      if (instance.variance_percent && Math.abs(instance.variance_percent) > 15) {
        console.warn(`Large cost variance (${instance.variance_percent}%) may require approval`);
      }
    },

    // Premium materials increase labor rates
    adjustLaborForQuality: (instance) => {
      const qualityMultipliers = {
        'economy': 0.9,
        'standard': 1.0,
        'premium': 1.2,
        'luxury': 1.5
      };

      if (instance.quality_grade && instance.hourly_rate) {
        const multiplier = qualityMultipliers[instance.quality_grade] || 1.0;
        const adjustedRate = instance.hourly_rate * multiplier;
        
        if (adjustedRate !== instance.hourly_rate) {
          console.info(`Labor rate adjusted for ${instance.quality_grade} quality: $${adjustedRate.toFixed(2)}/hr`);
        }
      }
    }
  },

  // Compliance rules
  COMPLIANCE: {
    // Permit requirements based on work type and value
    checkPermitRequirements: (instance) => {
      const permitThresholds = {
        'electrical': 1000,
        'plumbing': 1000,
        'structural': 5000,
        'roofing': 5000,
        'hvac': 2500
      };

      const threshold = permitThresholds[instance.work_type];
      if (threshold && instance.budgeted_cost > threshold && !instance.requires_permit) {
        throw new Error(`Work type ${instance.work_type} over $${threshold} requires a permit`);
      }
    },

    // Insurance requirements for subcontractors
    checkInsuranceRequirements: (instance) => {
      if (instance.subcontractor_id && !instance.insurance_verified) {
        throw new Error('Subcontractor insurance must be verified before work assignment');
      }
    }
  }
};

/**
 * Construction-specific hooks
 */
const createConstructionHooks = (options = {}) => {
  return {
    beforeValidate: (instance, options) => {
      // Apply all construction validations
      Object.values(CONSTRUCTION_VALIDATIONS).forEach(validation => {
        if (typeof validation === 'function') {
          validation(instance);
        }
      });

      // Apply business rules
      Object.values(CONSTRUCTION_BUSINESS_RULES).forEach(ruleCategory => {
        Object.values(ruleCategory).forEach(rule => {
          if (typeof rule === 'function') {
            try {
              rule(instance);
            } catch (error) {
              console.warn('Business rule warning:', error.message);
            }
          }
        });
      });
    },

    beforeCreate: (instance, options) => {
      // Auto-generate project numbers
      if (!instance.project_number && instance.constructor.name === 'projects') {
        const year = new Date().getFullYear();
        const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        instance.project_number = `PROJ-${year}-${sequence}`;
      }

      // Auto-generate change order numbers
      if (!instance.change_order_number && instance.change_reason) {
        const year = new Date().getFullYear();
        const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
        instance.change_order_number = `CO-${year}-${sequence}`;
      }
    },

    afterUpdate: (instance, options) => {
      // Recalculate cost variances
      if (instance.changed('budgeted_cost') || instance.changed('actual_cost')) {
        CONSTRUCTION_VALIDATIONS.validateCosts(instance);
      }

      // Update progress tracking
      if (instance.changed('actual_end_date') && instance.actual_end_date) {
        instance.percent_complete = 100;
      }
    }
  };
};

/**
 * Construction-specific indexes
 */
const CONSTRUCTION_INDEXES = [
  // Project tracking indexes
  { fields: ['project_number'] },
  { fields: ['contract_number'] },
  { fields: ['permit_number'] },
  { fields: ['project_phase', 'companyId'] },
  
  // Scheduling indexes
  { fields: ['planned_start_date', 'planned_end_date'] },
  { fields: ['actual_start_date', 'actual_end_date'] },
  { fields: ['weather_dependent', 'planned_start_date'] },
  
  // Cost tracking indexes
  { fields: ['budgeted_cost'] },
  { fields: ['actual_cost'] },
  { fields: ['variance_percent'] },
  
  // Work classification indexes
  { fields: ['work_type', 'companyId'] },
  { fields: ['trade_type', 'companyId'] },
  { fields: ['material_type'] },
  
  // Progress tracking indexes
  { fields: ['percent_complete'] },
  { fields: ['project_phase', 'percent_complete'] },
  
  // Safety and compliance indexes
  { fields: ['safety_rating'] },
  { fields: ['requires_permit'] },
  { fields: ['inspection_required'] },
  
  // Subcontractor indexes
  { fields: ['subcontractor_id'] },
  { fields: ['insurance_verified'] },
  
  // Composite indexes for common queries
  { fields: ['companyId', 'project_phase', 'planned_start_date'] },
  { fields: ['companyId', 'work_type', 'safety_rating'] },
  { fields: ['companyId', 'trade_type', 'percent_complete'] }
];

module.exports = {
  CONSTRUCTION_FIELDS,
  CONSTRUCTION_VALIDATIONS,
  CONSTRUCTION_BUSINESS_RULES,
  CONSTRUCTION_INDEXES,
  createConstructionHooks
};
