const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const GoluraSetting = sequelize.define('GoluraSetting', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'NULL for global settings, company ID for company-specific settings'
    },
    twilioSmsRate: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
        defaultValue: 0.0075,
        comment: 'Cost per SMS message in USD'
    },
    twilioCallRate: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
        defaultValue: 0.013,
        comment: 'Cost per minute for voice calls in USD'
    },
    twilioPhoneNumberCostPerMonth: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 1.00,
        comment: 'Monthly cost for phone number rental in USD'
    },
    twilioMessagingServiceFee: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
        defaultValue: 0.0000,
        comment: 'Additional messaging service fee per SMS'
    },
    stripeTransactionFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.30,
        comment: 'Fixed fee per transaction in USD'
    },
    stripeFeePercentage: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: true,
        defaultValue: 2.90,
        comment: 'Percentage fee per transaction'
    },
    stripeACHFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.80,
        comment: 'ACH transaction fee in USD'
    },
    stripeInternationalFeePercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 1.50,
        comment: 'Additional percentage for international cards'
    },
    emailCostPerEmail: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
        defaultValue: 0.0001,
        comment: 'Cost per email sent via service provider'
    },
    mailgunCostPerEmail: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
        defaultValue: 0.0008,
        comment: 'Mailgun cost per email'
    },
    cloudinaryImageTransformationCost: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
        defaultValue: 0.0018,
        comment: 'Cost per image transformation'
    },
    cloudinaryVideoTransformationCost: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
        defaultValue: 0.0125,
        comment: 'Cost per minute of video processing'
    },
    cloudinaryStorageCostPerGB: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
        defaultValue: 0.018,
        comment: 'Monthly storage cost per GB'
    },
    cloudinaryBandwidthCostPerGB: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
        defaultValue: 0.05,
        comment: 'Bandwidth cost per GB delivered'
    },
    googleMapsAPIcostPerRequest: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
        defaultValue: 0.005,
        comment: 'Google Maps API cost per request'
    },
    googlePlacesAPICostPerRequest: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
        defaultValue: 0.017,
        comment: 'Google Places API cost per request'
    },
    openAITokenCostPer1K: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
        defaultValue: 0.002,
        comment: 'Cost per 1000 tokens for AI processing'
    },
    ollamaHostingCostPerMonth: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: 'Monthly hosting cost for Ollama if self-hosted'
    },
    defaultLaborRatePerHour: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 75.00,
        comment: 'Default hourly labor rate in USD'
    },
    emergencyLaborMultiplier: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 1.50,
        comment: 'Multiplier for emergency/after-hours work'
    },
    overtimeLaborMultiplier: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 1.50,
        comment: 'Overtime labor rate multiplier'
    },
    materialMarkupPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 25.00,
        comment: 'Default markup percentage on materials'
    },
    tripChargeFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 50.00,
        comment: 'Standard trip charge fee'
    },
    diagnosticFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 100.00,
        comment: 'Diagnostic/assessment fee'
    },
    defaultSalesTaxRate: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: true,
        defaultValue: 8.25,
        comment: 'Default sales tax percentage'
    },
    maxUsersPerCompany: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 50,
        comment: 'Maximum users allowed per company'
    },
    maxStoragePerCompanyGB: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 100,
        comment: 'Maximum storage in GB per company'
    },
    maxAPICallsPerMonth: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 10000,
        comment: 'Maximum API calls per month per company'
    },
    maxEstimatesPerMonth: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 500,
        comment: 'Maximum estimates per month'
    },
    enableAIFeatures: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Enable AI-powered features'
    },
    enableCommunications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Enable SMS/call communications'
    },
    enablePaymentProcessing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Enable Stripe payment processing'
    },
    enableCloudinaryUpload: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Enable Cloudinary media uploads'
    },
    isGlobalSetting: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'True for global admin settings'
    },
    canCompanyOverride: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether companies can override this setting'
    },
    lastUpdatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        comment: 'User who last updated this setting'
    }
    
  }, {
    sequelize,
    tableName: 'goluraSettings',
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
        name: "companyId",
        using: "BTREE",
        fields: [
          { name: "companyId" },
        ]
      },
      {
        name: "isGlobalSetting",
        using: "BTREE",
        fields: [
          { name: "isGlobalSetting" },
        ]
      }
    ]
  });

  return GoluraSetting;
};
