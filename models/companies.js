const Sequelize = require('sequelize');
const security = require('../helpers/security');
module.exports = function(sequelize, DataTypes) {
  const Company = sequelize.define('company', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: 'Company name is required'
        }
      }
    },
    typeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companyTypes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    subDomain: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: {
        name: 'companies_subdomain_unique',
        msg: 'Subdomain already exists'
      },
      validate: {
        is: {
          args: /^[a-z0-9\-]+$/,
          msg: 'Subdomain can only contain lowercase letters, numbers, and hyphens'
        },
        len: {
          args: [3, 63],
          msg: 'Subdomain must be between 3 and 63 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    street1: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    street2: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    stateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: {
          args: /^[0-9]{5}(-[0-9]{4})?$/,
          msg: 'ZIP code must be in format 12345 or 12345-6789'
        }
      }
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      validate: {
        min: {
          args: -90,
          msg: 'Latitude must be between -90 and 90'
        },
        max: {
          args: 90,
          msg: 'Latitude must be between -90 and 90'
        }
      }
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      validate: {
        min: {
          args: -180,
          msg: 'Longitude must be between -180 and 180'
        },
        max: {
          args: 180,
          msg: 'Longitude must be between -180 and 180'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    logoUrl: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    primaryColor: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: {
          args: /^#[0-9A-Fa-f]{6}$/,
          msg: 'Primary color must be a valid hex color (e.g., #FF0000)'
        }
      }
    },
    secondaryColor: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: {
          args: /^#[0-9A-Fa-f]{6}$/,
          msg: 'Secondary color must be a valid hex color (e.g., #FF0000)'
        }
      }
    },
    tertiaryColor: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: {
          args: /^#[0-9A-Fa-f]{6}$/,
          msg: 'Tertiary color must be a valid hex color (e.g., #FF0000)'
        }
      }
    },
    timezone: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'America/New_York',
      validate: {
        isValidTimezone(value) {
          if (value) {
            // Basic timezone validation - you may want to use a more comprehensive list
            const validTimezones = [
              'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
              'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu', 'Europe/London',
              'Europe/Paris', 'Asia/Tokyo', 'UTC'
            ];
            if (!validTimezones.includes(value)) {
              throw new Error('Invalid timezone format');
            }
          }
        }
      }
    },
    hours: {
      type: DataTypes.JSON,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    facebook: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    twitter: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    instagram: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    youtube: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    linkedin: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    defaultRoleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    eventExpirePast: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    eventRequireChecklist: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    eventChecklistFolderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'formFolders',
        key: 'id'
      }
    },
    eventClientRequireType: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    eventUserRequireType: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    eventGroupRequireType: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    eventCompanyRequireType: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    lineItemPrice : {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    estimateEmailNotification: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    estimateCallNotification: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    estimateEmailNotificationDelay: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estimateCallNotificationDelay: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estimateDefaultStatusId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'estimateStatuses',
        key: 'id'
      },
    },
    estimateDefaultMarkup: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    estimateDefaultSalesTaxRate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    minimumEstimatePaymentPercentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    estimateTermsAndConditions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    workOrderDefaultWarningReminder: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    workOrderDefaultAlertReminder: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    workOrderDefaultEmergencyReminder: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    invoiceTermsAndConditions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    invoiceEmailNotification: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    invoiceCallNotification: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    invoiceEmailNotificationDelay: {
      type: DataTypes.STRING,
      allowNull: true
    },
    invoiceCallNotificationDelay: {
      type: DataTypes.STRING,
      allowNull: true
    },
    invoiceDefaultMarkup: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    invoiceDefaultSalesTaxRate: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    payingInvoiceTermsAndConditions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    defaultEventClientTitle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    defaultEventUserTitle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    defaultEventGroupTitle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    defaultEventCompanyTitle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    defaultEmailReminder: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    defaultTextReminder: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    defaultCallReminder: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    defaultCalendarReminder: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    estimateEmailTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    estimatePdfTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    estimateSmsTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    eventEmailTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    eventPdfTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    eventSmsTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    workOrderEmailTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    workOrderPdfTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    workOrderSmsTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    workOrderDefaultStatusId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'workOrderStatuses',
        key: 'id'
      }
    },
    workOrderDefaultPriorityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'priorities',
        key: 'id'
      }
    },
    workOrderDefaultEstimatedHours: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    workOrderDefaultHourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    workOrderDefaultAssignedUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    workOrderAutoAssignmentMethod: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    workOrderEmailNotification: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    workOrderSmsNotification: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    workOrderAutoAssign: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    workOrderRequireApproval: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    invoiceEmailTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    invoicePdfTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    invoiceSmsTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    purchaseOrderEmailTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    purchaseOrderPdfTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    purchaseOrderSmsTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    companyDefaultEmailTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    companyDefaultPdfTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    companyDefaultSmsTemplateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'templates',
        key: 'id'
      }
    },
    twilioAccountSid: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    twilioAuthToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    twilioDefaultConversationSid: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    goEsti: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    supportEmail: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    supportPhone: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    types: {
      type: DataTypes.JSON,
      allowNull: true
    },
    securityToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    stripeAccountId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Stripe Connect account ID'
    },
    achPaymentsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether ACH payments are enabled for this company'
    },
    achProcessingFee: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.80,
      comment: 'ACH processing fee percentage'
    },
    achRequireVerification: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether bank account verification is required for ACH payments'
    },
    communicationsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: 'Enable communications features for this company'
    },
    primaryPhoneNumberId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'phoneNumbers',
        key: 'id'
      },
      comment: 'Primary phone number for outbound communications'
    },
    communicationsSetupComplete: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: 'Indicates if communications onboarding is complete'
    },
    monthlyMessageLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1000,
      comment: 'Monthly text message limit for the company'
    },
    monthlyMessagesUsed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of messages used this month'
    },
    communicationsSettings: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON settings for communications preferences'
    },
  }, {
    sequelize,
    tableName: 'companies',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "companies_subdomain_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "subDomain" },
        ]
      },
      {
        name: "idx_companies_state_id",
        using: "BTREE",
        fields: [
          { name: "stateId" },
        ]
      },
      {
        name: "idx_companies_type_id",
        using: "BTREE",
        fields: [
          { name: "typeId" },
        ]
      },
      {
        name: "idx_companies_active",
        using: "BTREE",
        fields: [
          { name: "isActive" },
        ]
      },
      {
        name: "idx_companies_name",
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "idx_companies_coordinates",
        using: "BTREE",
        fields: [
          { name: "latitude" },
          { name: "longitude" },
        ]
      }
    ]
  });

  return Company;
};
