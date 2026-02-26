const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  // Lazy-load to avoid circular dependency
  const { createActivityHooks } = require('../helpers/activityHooks');
  const UserCredentials = sequelize.define('userCredentials', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // One-to-one relationship with user
      references: {
        model: 'users',
        key: 'id'
      }
    },
    ssn: {
      type: DataTypes.STRING(11), // XXX-XX-XXXX format
      allowNull: true,
      validate: {
        is: /^\d{3}-\d{2}-\d{4}$|^\d{9}$/i // SSN format validation
      }
    },
    birthDate: {
      type: DataTypes.DATEONLY,
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
      type: DataTypes.STRING(100),
      allowNull: true
    },
    stateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'states',
          key: 'id'
        }
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    zipCode: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    emergencyContactName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    emergencyContactPhone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    emergencyContactRelationship: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    terminationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    employmentStatus: {
      type: DataTypes.ENUM('active', 'inactive', 'terminated', 'on_leave'),
      allowNull: true,
      defaultValue: 'active'
    },
    taxFilingStatus: {
      type: DataTypes.ENUM('single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household', 'qualifying_widow'),
      allowNull: true
    },
    federalAllowances: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    stateAllowances: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    additionalFederalWithholding: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    additionalStateWithholding: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    // Banking information
    bankName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    bankAccountType: {
      type: DataTypes.ENUM('checking', 'savings'),
      allowNull: true
    },
    routingNumber: {
      type: DataTypes.STRING(9),
      allowNull: true,
      validate: {
        isNumeric: true,
        len: [9, 9]
      }
    },
    accountNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    driverLicenseNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    driverLicenseStateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id'
      }
    },
    driverLicenseExpiration: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    w4OnFile: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    i9OnFile: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'userCredentials',
    timestamps: true,
    hooks: {
      // Use activity hooks for sensitive data changes
      ...createActivityHooks('userCredentials', {
        getDescription: {
          created: (credentials, options) => {
            const user = options.include?.find(inc => inc.model?.name === 'users')?.dataValues || {};
            return `Credentials created for user "${user.firstName || 'Unknown'} ${user.lastName || 'User'}"`;
          },
          updated: (credentials, changes, options) => {
            const user = options.include?.find(inc => inc.model?.name === 'users')?.dataValues || {};
            const fieldDescriptions = {
              street1: 'street address',
              street2: 'address line 2',
              city: 'city',
              stateId: 'state',
              zipCode: 'zip code',
              emergencyContactName: 'emergency contact',
              employmentStatus: 'employment status',
              taxFilingStatus: 'tax filing status',
              bankName: 'banking information',
              birthDate: 'date of birth'
            };
            
            const changedFields = Object.keys(changes)
              .filter(field => !['ssn', 'accountNumber', 'routingNumber'].includes(field)) // Don't log sensitive fields
              .map(field => fieldDescriptions[field] || field)
              .join(', ');
            
            return changedFields ? 
              `Credentials updated for user "${user.firstName || 'Unknown'} ${user.lastName || 'User'}" - ${changedFields}` :
              `Sensitive credentials updated for user "${user.firstName || 'Unknown'} ${user.lastName || 'User'}"`;
          },
          deleted: (credentials, options) => {
            const user = options.include?.find(inc => inc.model?.name === 'users')?.dataValues || {};
            return `Credentials deleted for user "${user.firstName || 'Unknown'} ${user.lastName || 'User'}"`;
          }
        },
        trackFields: [
          'street1', 'street2', 'city', 'stateId', 'zipCode', 'emergencyContactName', 
          'employmentStatus', 'taxFilingStatus', 'bankName', 'birthDate',
          'hireDate', 'terminationDate'
        ],
        includeMetadata: false, // Never include sensitive data in activity logs
        sensitiveFields: ['ssn', 'accountNumber', 'routingNumber', 'driverLicenseNumber'] // Mark truly sensitive fields
      })
    },
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
        name: "user_credentials_userId_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userId" },
        ]
      },
      {
        name: "user_credentials_ssn_index",
        using: "BTREE",
        fields: [
          { name: "ssn" },
        ]
      }
    ]
  });

  UserCredentials.associate = models => {
    // One-to-one relationship with User
    UserCredentials.belongsTo(models.User, {
      as: 'User',
      foreignKey: 'userId'
    });

    // Relationship with State
    UserCredentials.belongsTo(models.State, {
      as: 'State',
      foreignKey: 'stateId'
    });

    // Relationship with user who created the record
    UserCredentials.belongsTo(models.User, {
      as: 'CreatedBy',
      foreignKey: 'createdBy'
    });

    // Relationship with user who last updated
    UserCredentials.belongsTo(models.User, {
      as: 'UpdatedBy',
      foreignKey: 'updatedBy'
    });

    // Add unified Activity association for credential changes
    UserCredentials.hasMany(models.Activity, {
      as: 'CredentialActivities',
      foreignKey: 'entityId',
      scope: {
        activityType: 'userCredentials'
      }
    });
  };

  // Instance methods for data handling
  UserCredentials.prototype.toSafeJSON = function() {
    const values = this.toJSON();
    // Remove truly sensitive fields for safe transmission
    delete values.ssn;
    delete values.accountNumber;
    delete values.routingNumber;
    delete values.driverLicenseNumber;
    return values;
  };

  UserCredentials.prototype.getFullAddress = function() {
    const parts = [
      this.street1,
      this.street2,
      this.city ? `${this.city},` : null,
      this.State ? this.State.name : null,
      this.zipCode
    ].filter(Boolean);
    return parts.join(' ');
  };

  UserCredentials.prototype.getMaskedSSN = function() {
    if (!this.ssn) return null;
    const cleaned = this.ssn.replace(/\D/g, '');
    if (cleaned.length !== 9) return null;
    return `XXX-XX-${cleaned.slice(-4)}`;
  };

  UserCredentials.prototype.getMaskedAccountNumber = function() {
    if (!this.accountNumber) return null;
    const cleaned = this.accountNumber.replace(/\D/g, '');
    if (cleaned.length < 4) return 'XXXX';
    return `XXXX${cleaned.slice(-4)}`;
  };

  return UserCredentials;
};
