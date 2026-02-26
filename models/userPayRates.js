const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  // Lazy-load to avoid circular dependency
  const { createActivityHooks } = require('../helpers/activityHooks');
  const UserPayRate = sequelize.define('userPayRates', {
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
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null
    },
    overtimeRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null
    },
    rateType: {
      type: DataTypes.ENUM('hourly', 'daily', 'project', 'fixed'),
      allowNull: false,
      defaultValue: 'hourly'
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    creatorId: {
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
    tableName: 'userPayRates',
    timestamps: true,
    hooks: {
      // Use new unified activity hooks
      ...createActivityHooks('userPayRate', {
        getDescription: {
          created: (payRate) => `Pay rate at $${payRate.rate}/${payRate.rateType} was created`,
          updated: (payRate, changes) => {
            const fieldDescriptions = {
              rate: 'rate',
              overtimeRate: 'overtime rate',
              rateType: 'rate type',
              effectiveDate: 'effective date',
              endDate: 'end date',
              isActive: 'status',
              isPrimary: 'primary status'
            };
            
            const changedFields = Object.keys(changes)
              .map(field => fieldDescriptions[field] || field)
              .join(', ');
            
            return `Pay rate at $${payRate.rate}/${payRate.rateType} ${changedFields} was updated`;
          },
          deleted: (payRate) => `Pay rate at $${payRate.rate}/${payRate.rateType} was deleted`
        },
        trackFields: ['rate', 'overtimeRate', 'rateType', 'effectiveDate', 'endDate', 'isActive', 'isPrimary'],
        includeMetadata: true
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
        name: "userPayRates_userId_idx",
        using: "BTREE",
        fields: [
          { name: "userId" },
        ]
      },
      {
        name: "userPayRates_active_idx",
        using: "BTREE",
        fields: [
          { name: "isActive" },
        ]
      },
      {
        name: "userPayRates_primary_idx",
        using: "BTREE",
        fields: [
          { name: "isPrimary" },
        ]
      },
      {
        name: "userPayRates_effective_date_idx",
        using: "BTREE",
        fields: [
          { name: "effectiveDate" },
        ]
      }
    ]
  });

  UserPayRate.associate = models => {
    // Belongs to User
    UserPayRate.belongsTo(models.User, {
      as: 'User',
      foreignKey: 'userId'
    });

    // Belongs to User (creator)
    UserPayRate.belongsTo(models.User, {
      as: 'Creator',
      foreignKey: 'creatorId'
    });

    // Belongs to User (updater)
    UserPayRate.belongsTo(models.User, {
      as: 'Updater',
      foreignKey: 'updatedBy'
    });

    // Virtual association with Activities (polymorphic - no foreign key constraint)
    // Activities will be fetched manually using: activityType: 'userPayRate' AND entityId: userPayRate.id
  };

  return UserPayRate;
};
