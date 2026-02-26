const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  // Lazy-load to avoid circular dependency
  const { createActivityHooks } = require('../helpers/activityHooks');
  const PayrollDeduction = sequelize.define('payrollDeductions', {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('fixed', 'percentage'),
      allowNull: false,
      defaultValue: 'fixed'
    },
    value: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0.0000,
    },
    appliesTo: {
      type: DataTypes.ENUM('employee', 'employer', 'both'),
      allowNull: false,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'payrollDeductions',
    timestamps: true,
    hooks: {
      // Use new unified activity hooks
      ...createActivityHooks('payrollDeduction', {
        getDescription: {
          created: (deduction) => `Payroll deduction "${deduction.name}" (${deduction.type}: ${deduction.value}) was created`,
          updated: (deduction, changes) => {
            const fieldDescriptions = {
              name: 'name',
              type: 'type',
              value: 'value',
              appliesTo: 'applies to',
              description: 'description',
              isActive: 'active status',
              effectiveDate: 'effective date',
              endDate: 'end date',
            };
            
            const changedFields = Object.keys(changes)
              .map(field => fieldDescriptions[field] || field)
              .join(', ');
            
            return `Payroll deduction "${deduction.name}" ${changedFields} was updated`;
          },
          deleted: (deduction) => `Payroll deduction "${deduction.name}" (${deduction.type}: ${deduction.value}) was deleted`
        },
        trackFields: ['name', 'type', 'value', 'appliesTo', 'description', 'isActive', 'effectiveDate', 'endDate'],
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
        name: "payrollDeductions_name_idx",
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "payrollDeductions_type_idx",
        using: "BTREE",
        fields: [
          { name: "type" },
        ]
      },
      {
        name: "payrollDeductions_appliesTo_idx",
        using: "BTREE",
        fields: [
          { name: "appliesTo" },
        ]
      },
      {
        name: "payrollDeductions_active_idx",
        using: "BTREE",
        fields: [
          { name: "isActive" },
        ]
      },
      {
        name: "payrollDeductions_effectiveDate_idx",
        using: "BTREE",
        fields: [
          { name: "effectiveDate" },
        ]
      },
    ]
  });

  PayrollDeduction.associate = models => {
    // Belongs to User (creator)
    PayrollDeduction.belongsTo(models.User, {
      as: 'Creator',
      foreignKey: 'creatorId'
    });
    // Belongs to User (employee, optional)
    PayrollDeduction.belongsTo(models.User, {
      as: 'Employee',
      foreignKey: 'employeeId'
    });

    // Virtual association with Activities (polymorphic - no foreign key constraint)
    // Activities will be fetched manually using: activityType: 'payrollDeduction' AND entityId: payrollDeduction.id
  };

  return PayrollDeduction;
};
