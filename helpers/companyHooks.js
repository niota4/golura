const { Model } = require('sequelize');

// Global company filtering that applies to ALL models automatically
class GlobalCompanyHooks {
  static install(sequelize) {
    // Hook into all models after they're defined
    sequelize.addHook('afterDefine', (model) => {
      // Skip models that don't have companyId
      const excludedModels = ['Widget', 'Page', 'Permission', 'State', 'PaymentMethod', 'Day', 'Priority'];
      if (excludedModels.includes(model.name)) {
        return;
      }

      // Check if model has companyId field
      if (!model.rawAttributes.companyId) {
        return;
      }

      // Add static methods to the model
      Object.assign(model, {
        // Find all by request company
        findAllByRequestCompany(res, options = {}) {
          if (!res.companyId) {
            throw new Error('Company ID not found in request context');
          }
          options.where = {
            ...options.where,
            companyId: res.companyId
          };
          return this.findAll(options);
        },

        // Find one by request company
        findOneByRequestCompany(res, options = {}) {
          if (!res.companyId) {
            throw new Error('Company ID not found in request context');
          }
          options.where = {
            ...options.where,
            companyId: res.companyId
          };
          return this.findOne(options);
        },

        // Create with request company
        createWithRequestCompany(data, res, options = {}) {
          if (!res.companyId) {
            throw new Error('Company ID not found in request context');
          }
          return this.create({ ...data, companyId: res.companyId }, options);
        },

        // Find by PK with company validation
        findByPkWithCompany(id, res, options = {}) {
          if (!res.companyId) {
            throw new Error('Company ID not found in request context');
          }
          options.where = {
            ...options.where,
            id,
            companyId: res.companyId
          };
          return this.findOne(options);
        },

        // Update by request company
        updateByRequestCompany(data, res, options = {}) {
          if (!res.companyId) {
            throw new Error('Company ID not found in request context');
          }
          options.where = {
            ...options.where,
            companyId: res.companyId
          };
          return this.update(data, options);
        },

        // Destroy by request company
        destroyByRequestCompany(res, options = {}) {
          if (!res.companyId) {
            throw new Error('Company ID not found in request context');
          }
          options.where = {
            ...options.where,
            companyId: res.companyId
          };
          return this.destroy(options);
        },

        // Count by request company
        countByRequestCompany(res, options = {}) {
          if (!res.companyId) {
            throw new Error('Company ID not found in request context');
          }
          options.where = {
            ...options.where,
            companyId: res.companyId
          };
          return this.count(options);
        }
      });

      // Add instance methods to the prototype
      Object.assign(model.prototype, {
        // Check if record belongs to request company
        belongsToRequestCompany(res) {
          if (!res.companyId) {
            throw new Error('Company ID not found in request context');
          }
          return this.companyId === res.companyId;
        },

        // Update with company validation
        updateWithCompanyCheck(data, res, options = {}) {
          if (!this.belongsToRequestCompany(res)) {
            throw new Error('Access denied: Record does not belong to your company');
          }
          return this.update(data, options);
        },

        // Destroy with company validation
        destroyWithCompanyCheck(res, options = {}) {
          if (!this.belongsToRequestCompany(res)) {
            throw new Error('Access denied: Record does not belong to your company');
          }
          return this.destroy(options);
        }
      });
    });

    // Optional: Add automatic filtering hooks
    this.addAutomaticFiltering(sequelize);
  }

  static addAutomaticFiltering(sequelize) {
    // Store the current request context
    let currentRequestContext = null;
    
    // Function to set request context (called from middleware)
    sequelize.setRequestContext = (context) => {
      currentRequestContext = context;
    };

    // Function to get companyId from context
    const getCompanyId = (options) => {
      // Priority order: options.companyId > currentRequestContext.companyId
      return options.companyId || currentRequestContext?.companyId;
    };

    // Global beforeFind hook - automatically filter by companyId
    sequelize.addHook('beforeFind', function(options) {
      if (options.skipCompanyFilter) return;
      const companyId = getCompanyId(options);
      const model = this || options.model;
      if (companyId && model && model.rawAttributes && model.rawAttributes.companyId) {
        if (!options.where?.companyId) {
          options.where = {
            ...options.where,
            companyId: companyId
          };
        }
      }
    });

    // Global beforeCreate hook - automatically add companyId
    sequelize.addHook('beforeCreate', (instance, options) => {
      if (options.skipCompanyFilter) return;
      const companyId = getCompanyId(options);
      if (companyId && !instance.companyId && instance.constructor.rawAttributes.companyId) {
        instance.companyId = companyId;
      }
    });

    // Global beforeBulkCreate hook
    sequelize.addHook('beforeBulkCreate', function(instances, options) {
      if (options.skipCompanyFilter) return;
      const companyId = getCompanyId(options);
      const model = this || options.model;
      if (companyId && model && model.rawAttributes && model.rawAttributes.companyId) {
        instances.forEach(instance => {
          if (!instance.companyId) {
            instance.companyId = companyId;
          }
        });
      }
    });

    // Global beforeBulkUpdate/beforeBulkDestroy hooks (only for bulk operations)
    ['beforeBulkUpdate', 'beforeBulkDestroy'].forEach(hookName => {
      sequelize.addHook(hookName, function(options) {
        if (options.skipCompanyFilter) return;
        const companyId = getCompanyId(options);
        const model = this || options.model;
        if (companyId && model && model.rawAttributes && model.rawAttributes.companyId) {
          if (!options.where?.companyId) {
            options.where = {
              ...options.where,
              companyId: companyId
            };
          }
        }
      });
    });

    // Handle individual instance operations separately
    sequelize.addHook('beforeUpdate', function(instance, options) {
      if (options.skipCompanyFilter) return;
      const companyId = getCompanyId(options);
      if (companyId && instance?.constructor?.rawAttributes?.companyId) {
        if (instance.companyId && instance.companyId !== companyId) {
          throw new Error(`Access denied: Record does not belong to company ${companyId}`);
        }
      }
    });

    sequelize.addHook('beforeDestroy', function(instance, options) {
      if (options.skipCompanyFilter) return;
      const companyId = getCompanyId(options);
      if (companyId && instance?.constructor?.rawAttributes?.companyId) {
        if (instance.companyId && instance.companyId !== companyId) {
          throw new Error(`Access denied: Record does not belong to company ${companyId}`);
        }
      }
    });

    // Add validation hook for instance operations to ensure company isolation
    sequelize.addHook('beforeValidate', function(instance, options) {
      if (options.skipCompanyFilter) return;
      const companyId = getCompanyId(options);
      if (companyId && instance.constructor.rawAttributes?.companyId) {
        if (!instance.isNewRecord && instance.companyId && instance.companyId !== companyId) {
          throw new Error(`Access denied: Record does not belong to company ${companyId}`);
        }
        if (instance.isNewRecord && !instance.companyId) {
          instance.companyId = companyId;
        }
      }
    });
  }
}

module.exports = GlobalCompanyHooks;
