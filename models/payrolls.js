const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  // Lazy-load to avoid circular dependency
  const { createActivityHooks } = require('../helpers/activityHooks');
  const Payroll = sequelize.define('payrolls', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    payrollNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    processDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    processedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'approved', 'paid'),
      allowNull: false,
      defaultValue: 'draft'
    },
    totalGrossPay: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    totalDeductions: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    totalNetPay: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
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
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'payrolls',
    timestamps: true,
    hooks: {
      // Use new unified activity hooks
      ...createActivityHooks('payroll', {
        getDescription: {
          created: (payroll) => `Payroll for period ${payroll.startDate} to ${payroll.endDate} (${payroll.status}) was created`,
          updated: (payroll, changes) => {
            const fieldDescriptions = {
              startDate: 'start date',
              endDate: 'end date',
              processedDate: 'processed date',
              processedBy: 'processed by',
              status: 'status',
              totalGrossPay: 'total gross pay',
              totalDeductions: 'total deductions',
              totalNetPay: 'total net pay',
              isActive: 'active status',
              approvedBy: 'approved by',
              approvedAt: 'approval date'
            };
            
            const changedFields = Object.keys(changes)
              .map(field => fieldDescriptions[field] || field)
              .join(', ');
            
            return `Payroll for period ${payroll.startDate} to ${payroll.endDate} ${changedFields} was updated`;
          },
          deleted: (payroll) => `Payroll for period ${payroll.startDate} to ${payroll.endDate} (${payroll.status}) was deleted`
        },
        trackFields: ['startDate', 'endDate', 'processedDate', 'processedBy', 'status', 'totalGrossPay', 'totalDeductions', 'totalNetPay', 'isActive', 'approvedBy', 'approvedAt'],
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
        name: "payrolls_status_idx",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
      {
        name: "payrolls_startDate_idx",
        using: "BTREE",
        fields: [
          { name: "startDate" },
        ]
      },
      {
        name: "payrolls_endDate_idx",
        using: "BTREE",
        fields: [
          { name: "endDate" },
        ]
      },
      {
        name: "payrolls_processedDate_idx",
        using: "BTREE",
        fields: [
          { name: "processedDate" },
        ]
      },
      {
        name: "payrolls_active_idx",
        using: "BTREE",
        fields: [
          { name: "isActive" },
        ]
      }
    ]
  });

  Payroll.associate = models => {
    // Belongs to User (creator)
    Payroll.belongsTo(models.User, {
      as: 'Creator',
      foreignKey: 'creatorId'
    });
    // Belongs to User (approver)
    Payroll.belongsTo(models.User, {
      as: 'Approver',
      foreignKey: 'approvedBy'
    });
    // Belongs to User (processor)
    Payroll.belongsTo(models.User, {
      as: 'ProcessedBy',
      foreignKey: 'processedBy'
    });

    // Has many PayrollItems
    Payroll.hasMany(models.PayrollItem, {
      as: 'PayrollItems',
      foreignKey: 'payrollId'
    });

    // Has many PayrollDeductions
    Payroll.hasMany(models.PayrollDeduction, {
      as: 'PayrollDeductions',
      foreignKey: 'payrollId'
    });

    // Virtual association with Activities (polymorphic - no foreign key constraint)
    // Activities will be fetched manually using: activityType: 'payroll' AND entityId: payroll.id
  };

  return Payroll;
};
