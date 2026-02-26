const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  // Lazy-load to avoid circular dependency
  const { createActivityHooks } = require('../helpers/activityHooks');
  const User = sequelize.define('users', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: 'users_email_unique',
        msg: 'Email address already exists'
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address'
        },
        len: {
          args: [3, 255],
          msg: 'Email must be between 3 and 255 characters'
        }
      }
    },
    phoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    profilePictureUrl: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      validate: {
        len: {
          args: [8, 255],
          msg: 'Password must be at least 8 characters long'
        },
        isComplexPassword(value) {
          if (value && value.length > 0) {
            // Only validate if password is being set (not null)
            const hasUpperCase = /[A-Z]/.test(value);
            const hasLowerCase = /[a-z]/.test(value);
            const hasNumbers = /\d/.test(value);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            
            if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
              throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
            }
          }
        }
      }
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: true
    },
    online: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    securityToken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    stripeAccountId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    // Security and audit fields
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when email was verified'
    },
    phoneVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when phone was verified'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of last successful login'
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of failed login attempts'
    },
    lockoutUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Account locked until this timestamp'
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when password was last changed'
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether 2FA is enabled for this user'
    },
    twoFactorSecret: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Encrypted 2FA secret - REQUIRES ENCRYPTION'
    },
    // Soft delete
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Soft delete timestamp'
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who performed the deletion'
    }
  }, {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      // Use new unified activity hooks
      ...createActivityHooks('user', {
        getDescription: {
          created: (user) => `User "${user.firstName} ${user.lastName}" (${user.email}) was created`,
          updated: (user, changes) => {
            const fieldDescriptions = {
              firstName: 'first name',
              lastName: 'last name',
              email: 'email',
              isActive: 'status',
              roleId: 'role'
            };
            
            const changedFields = Object.keys(changes)
              .map(field => fieldDescriptions[field] || field)
              .join(', ');
            
            return `User "${user.firstName} ${user.lastName}" ${changedFields} was updated`;
          },
          deleted: (user) => `User "${user.firstName} ${user.lastName}" (${user.email}) was deleted`
        },
        trackFields: ['firstName', 'lastName', 'email', 'isActive', 'roleId'],
        includeMetadata: false // Don't include sensitive data like passwords
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
        name: "users_email_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "idx_users_company_id",
        using: "BTREE",
        fields: [
          { name: "companyId" },
        ]
      },
      {
        name: "idx_users_active",
        using: "BTREE",
        fields: [
          { name: "isActive" },
        ]
      },
      {
        name: "idx_users_role_id",
        using: "BTREE",
        fields: [
          { name: "roleId" },
        ]
      },
      {
        name: "idx_users_soft_delete",
        using: "BTREE",
        fields: [
          { name: "deletedAt" },
        ]
      }
    ],
    // Enable soft deletes
    paranoid: true,
    deletedAt: 'deletedAt'
  });

  User.associate = models => {
    // Add PayRates association
    User.hasMany(models.UserPayRate, {
      as: 'PayRates',
      foreignKey: 'userId'
    });

    // Add one-to-one association with UserCredentials
    User.hasOne(models.UserCredentials, {
      as: 'Credentials',
      foreignKey: 'userId'
    });

    // Add new unified Activity association
    User.hasMany(models.Activity, {
      as: 'UnifiedActivities',
      foreignKey: 'entityId',
      scope: {
        activityType: 'user'
      }
    });
    
    // Also add association for activities created by this user
    User.hasMany(models.Activity, {
      as: 'CreatedActivities',
      foreignKey: 'userId'
    });
  };

  return User;
};
