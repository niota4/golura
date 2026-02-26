const { Model } = require('sequelize');

class BaseModel extends Model {
  static findAllByCompany(companyId, options = {}) {
    options.where = {
      ...options.where,
      companyId
    };
    return super.findAll(options);
  }

  static createWithCompany(data, companyId, options = {}) {
    return super.create({ ...data, companyId }, options);
  }

  // Methods that work with res.companyId from request context
  static findAllByRequestCompany(res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    return this.findAllByCompany(res.companyId, options);
  }

  static findOneByRequestCompany(res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    options.where = {
      ...options.where,
      companyId: res.companyId
    };
    return super.findOne(options);
  }

  static findByPkWithCompany(id, res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    options.where = {
      ...options.where,
      id,
      companyId: res.companyId
    };
    return super.findOne(options);
  }

  static createWithRequestCompany(data, res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    return this.createWithCompany(data, res.companyId, options);
  }

  static updateByRequestCompany(data, res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    options.where = {
      ...options.where,
      companyId: res.companyId
    };
    return super.update(data, options);
  }

  static destroyByRequestCompany(res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    options.where = {
      ...options.where,
      companyId: res.companyId
    };
    return super.destroy(options);
  }

  static countByRequestCompany(res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    options.where = {
      ...options.where,
      companyId: res.companyId
    };
    return super.count(options);
  }

  // Instance method to check if record belongs to request company
  belongsToRequestCompany(res) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    return this.companyId === res.companyId;
  }

  // Instance method to update with company validation
  updateWithCompanyCheck(data, res, options = {}) {
    if (!this.belongsToRequestCompany(res)) {
      throw new Error('Access denied: Record does not belong to your company');
    }
    return this.update(data, options);
  }

  // Instance method to destroy with company validation
  destroyWithCompanyCheck(res, options = {}) {
    if (!this.belongsToRequestCompany(res)) {
      throw new Error('Access denied: Record does not belong to your company');
    }
    return this.destroy(options);
  }

  // Additional missing methods for complete coverage
  static findAndCountAllByRequestCompany(res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    options.where = {
      ...options.where,
      companyId: res.companyId
    };
    return super.findAndCountAll(options);
  }

  static findOrCreateByRequestCompany(findOptions, defaults, res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    findOptions.where = {
      ...findOptions.where,
      companyId: res.companyId
    };
    return super.findOrCreate({
      where: findOptions.where,
      defaults: { ...defaults, companyId: res.companyId },
      ...options
    });
  }

  static upsertByRequestCompany(values, res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    return super.upsert({ ...values, companyId: res.companyId }, options);
  }

  static bulkCreateByRequestCompany(records, res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    const recordsWithCompany = records.map(record => ({
      ...record,
      companyId: res.companyId
    }));
    return super.bulkCreate(recordsWithCompany, options);
  }

  static bulkUpdateByRequestCompany(values, res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    options.where = {
      ...options.where,
      companyId: res.companyId
    };
    return super.update(values, options);
  }

  static restoreByRequestCompany(res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    options.where = {
      ...options.where,
      companyId: res.companyId
    };
    return super.restore(options);
  }

  static aggregateByRequestCompany(field, aggregateFunction, res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    options.where = {
      ...options.where,
      companyId: res.companyId
    };
    return super.aggregate(field, aggregateFunction, options);
  }

  static sumByRequestCompany(field, res, options = {}) {
    return this.aggregateByRequestCompany(field, 'SUM', res, options);
  }

  static maxByRequestCompany(field, res, options = {}) {
    return this.aggregateByRequestCompany(field, 'MAX', res, options);
  }

  static minByRequestCompany(field, res, options = {}) {
    return this.aggregateByRequestCompany(field, 'MIN', res, options);
  }

  // Paranoid (soft delete) methods
  static findAllWithDeletedByRequestCompany(res, options = {}) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    options.where = {
      ...options.where,
      companyId: res.companyId
    };
    options.paranoid = false;
    return super.findAll(options);
  }

  // Transaction-aware methods
  static async withTransaction(callback, res = null) {
    const transaction = await this.sequelize.transaction();
    try {
      const result = await callback(transaction, res);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Scope-based methods for common queries
  static scopedByRequestCompany(res) {
    if (!res.companyId) {
      throw new Error('Company ID not found in request context');
    }
    return this.scope({
      where: { companyId: res.companyId }
    });
  }

  // Automatic hooks that can be enabled per model
  static enableAutoCompanyFiltering() {
    this.addHook('beforeFind', (options) => {
      if (options.skipCompanyFilter) return;
      if (options.companyId) {
        options.where = {
          ...options.where,
          companyId: options.companyId
        };
      }
    });

    this.addHook('beforeCreate', (instance, options) => {
      if (options.skipCompanyFilter) return;
      if (options.companyId && !instance.companyId) {
        instance.companyId = options.companyId;
      }
    });

    this.addHook('beforeBulkCreate', (instances, options) => {
      if (options.skipCompanyFilter) return;
      if (options.companyId) {
        instances.forEach(instance => {
          if (!instance.companyId) {
            instance.companyId = options.companyId;
          }
        });
      }
    });

    this.addHook('beforeUpdate', (instance, options) => {
      if (options.skipCompanyFilter) return;
      if (options.companyId) {
        options.where = {
          ...options.where,
          companyId: options.companyId
        };
      }
    });

    this.addHook('beforeDestroy', (instance, options) => {
      if (options.skipCompanyFilter) return;
      if (options.companyId) {
        options.where = {
          ...options.where,
          companyId: options.companyId
        };
      }
    });
  }

  // Global default scope for company filtering
  static setDefaultCompanyScope(companyId) {
    this.addScope('defaultScope', {
      where: { companyId }
    }, { override: true });
  }
}

module.exports = BaseModel;