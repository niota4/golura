const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  // Lazy-load to avoid circular dependency
  const { createActivityHooks } = require('../helpers/activityHooks');

  const EstimateTemplate = sequelize.define('EstimateTemplate', {
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
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Template name for identification'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Template description'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Template category (e.g., Kitchen, Bathroom, etc.)'
    },
    markUp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Default markup percentage for this template'
    },
    salesTaxRate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Default sales tax rate for this template'
    },
    itemize: {
      type: DataTypes.BOOLEAN,
      defaultValue: 1,
      comment: 'Default itemization setting'
    },
    lineItemPrice: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      comment: 'Default line item price visibility setting'
    },
    lineItemIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of line item IDs to include in estimates created from this template'
    },
    imageIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of image IDs to include in estimates created from this template'
    },
    videoIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of video IDs to include in estimates created from this template'
    },
    documentIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of document IDs to include in estimates created from this template'
    },
    memo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Default memo text for estimates created from this template'
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Number of times this template has been used'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this template is active and available for use'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of tags for categorizing and searching templates'
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  },
  {
    sequelize,
    tableName: 'estimateTemplates',
    timestamps: true,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'id' }],
      },
      {
        name: 'estimateTemplates_companyId',
        using: 'BTREE',
        fields: [{ name: 'companyId' }],
      },
      {
        name: 'estimateTemplates_creatorId',
        using: 'BTREE',
        fields: [{ name: 'creatorId' }],
      },
      {
        name: 'estimateTemplates_category',
        using: 'BTREE',
        fields: [{ name: 'category' }],
      },
      {
        name: 'estimateTemplates_isActive',
        using: 'BTREE',
        fields: [{ name: 'isActive' }],
      },
    ],
    hooks: {
      // Use unified activity hooks
      ...createActivityHooks('estimateTemplate', {
        getDescription: {
          created: (template) => `Estimate template "${template.name}" was created`,
          updated: (template, changes) => {
            const fieldDescriptions = {
              name: 'name',
              description: 'description',
              category: 'category',
              markUp: 'markup',
              lineItemIds: 'line items',
              isActive: 'status',
            };
            
            const changedFields = Object.keys(changes)
              .map(field => fieldDescriptions[field] || field)
              .join(', ');
            
            return `Estimate template "${template.name}" ${changedFields} was updated`;
          },
          deleted: (template) => `Estimate template "${template.name}" was deleted`
        },
        trackFields: ['name', 'description', 'category', 'markUp', 'lineItemIds', 'isActive']
      }),

      beforeUpdate: async (template, options) => {
        // Increment usage count when template is used to create an estimate
        if (options.context?.incrementUsage) {
          template.usageCount = (template.usageCount || 0) + 1;
        }
      },
    },
  });

  EstimateTemplate.associate = models => {
    EstimateTemplate.belongsTo(models.Company, {
      as: 'Company',
      foreignKey: 'companyId'
    });
    
    EstimateTemplate.belongsTo(models.User, {
      as: 'Creator',
      foreignKey: 'creatorId'
    });
    // Association for estimates created from this template
    EstimateTemplate.hasMany(models.Estimate, {
      as: 'GeneratedEstimates',
      foreignKey: 'templateId'
    });
  };

  return EstimateTemplate;
};
