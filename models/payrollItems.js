const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  // Lazy-load to avoid circular dependency
  const { createActivityHooks } = require('../helpers/activityHooks');
  const PayrollItem = sequelize.define('payrollItems', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    payrollId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'payrolls',
        key: 'id'
      }
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    employeePayRateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'userPayRates',
        key: 'id'
      }
    },
    totalHours: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    grossPay: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    deductions: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    netPay: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    paymentMethod: {
      type: DataTypes.ENUM('direct_deposit', 'check', 'cash', 'other'),
      allowNull: false,
    },
    regularHours: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    overtimeHours: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    overtimeRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
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
    payStubUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
  }, {
    sequelize,
    tableName: 'payrollItems',
    timestamps: true,
    hooks: {
      // Use new unified activity hooks
      ...createActivityHooks('payrollItem', {
        getDescription: {
          created: (item) => `Payroll item for employee ID ${item.employeeId} (${item.totalHours} hours, $${item.netPay} net pay) was created`,
          updated: (item, changes) => {
            const fieldDescriptions = {
              payrollId: 'payroll run',
              employeeId: 'employee',
              totalHours: 'total hours',
              grossPay: 'gross pay',
              deductions: 'deductions',
              netPay: 'net pay',
              paymentMethod: 'payment method',
              regularHours: 'regular hours',
              overtimeHours: 'overtime hours',
              rate: 'hourly rate',
              overtimeRate: 'overtime rate',
              isActive: 'status'
            };
            
            const changedFields = Object.keys(changes)
              .map(field => fieldDescriptions[field] || field)
              .join(', ');
            
            return `Payroll item for employee ID ${item.employeeId} ${changedFields} was updated`;
          },
          deleted: (item) => `Payroll item for employee ID ${item.employeeId} (${item.totalHours} hours, $${item.netPay} net pay) was deleted`
        },
        trackFields: ['payrollId', 'employeeId', 'totalHours', 'grossPay', 'deductions', 'netPay', 'paymentMethod', 'regularHours', 'overtimeHours', 'rate', 'overtimeRate', 'isActive'],
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
        name: "payrollItems_payrollId_idx",
        using: "BTREE",
        fields: [
          { name: "payrollId" },
        ]
      },
      {
        name: "payrollItems_employeeId_idx",
        using: "BTREE",
        fields: [
          { name: "employeeId" },
        ]
      },
      {
        name: "payrollItems_paymentMethod_idx",
        using: "BTREE",
        fields: [
          { name: "paymentMethod" },
        ]
      },
      {
        name: "payrollItems_active_idx",
        using: "BTREE",
        fields: [
          { name: "isActive" },
        ]
      },
      {
        name: "payrollItems_composite_idx",
        using: "BTREE",
        fields: [
          { name: "payrollId" },
          { name: "employeeId" },
        ]
      }
    ]
  });

  PayrollItem.associate = models => {
    // Belongs to Payroll (payroll run)
    PayrollItem.belongsTo(models.Payroll, {
      as: 'Payroll',
      foreignKey: 'payrollId'
    });

    // Belongs to User (employee)
    PayrollItem.belongsTo(models.User, {
      as: 'Employee',
      foreignKey: 'employeeId'
    });
    // Belongs to UserPayRate (employee's pay rate)
    PayrollItem.belongsTo(models.UserPayRate, {
      as: 'EmployeePayRate',
      foreignKey: 'employeePayRateId'
    });
    // Belongs to User (creator)
    PayrollItem.belongsTo(models.User, {
      as: 'Creator',
      foreignKey: 'creatorId'
    });

    // Virtual association with Activities (polymorphic - no foreign key constraint)
    // Activities will be fetched manually using: activityType: 'payrollItem' AND entityId: payrollItem.id
  };

  return PayrollItem;
};
