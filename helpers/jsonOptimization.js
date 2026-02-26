/**
 * JSON Field Optimization and Caching Strategies
 * 
 * This helper provides optimized JSON field usage patterns and comprehensive
 * caching strategies for high-performance construction management applications.
 */

const { DataTypes } = require('sequelize');

/**
 * Optimized JSON field patterns
 */
const JSON_FIELD_PATTERNS = {
  // Metadata patterns
  SIMPLE_METADATA: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    validate: {
      isValidMetadata(value) {
        if (typeof value !== 'object' || Array.isArray(value)) {
          throw new Error('Metadata must be a JSON object');
        }
        
        // Limit nested depth to prevent performance issues
        if (this.getObjectDepth(value) > 5) {
          throw new Error('Metadata cannot exceed 5 levels of nesting');
        }
        
        // Limit total size to prevent large objects
        if (JSON.stringify(value).length > 10000) {
          throw new Error('Metadata cannot exceed 10KB');
        }
      }
    },
    comment: 'Simple metadata object with depth and size limits'
  },

  // Configuration patterns
  SETTINGS_CONFIG: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    validate: {
      isValidConfig(value) {
        const allowedKeys = ['notifications', 'preferences', 'display', 'security', 'integrations'];
        const keys = Object.keys(value || {});
        
        const invalidKeys = keys.filter(key => !allowedKeys.includes(key));
        if (invalidKeys.length > 0) {
          throw new Error(`Invalid configuration keys: ${invalidKeys.join(', ')}`);
        }
      }
    },
    comment: 'Structured configuration settings'
  },

  // Address components
  ADDRESS_COMPONENTS: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: null,
    validate: {
      isValidAddressComponents(value) {
        if (value === null) return;
        
        const requiredFields = ['street_number', 'route', 'locality', 'administrative_area_level_1', 'country'];
        const missingFields = requiredFields.filter(field => !value[field]);
        
        if (missingFields.length > 0) {
          console.warn(`Address components missing: ${missingFields.join(', ')}`);
        }
      }
    },
    comment: 'Geocoded address components from mapping services'
  },

  // Contact information
  CONTACT_INFO: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    validate: {
      isValidContactInfo(value) {
        const validContactTypes = ['email', 'phone', 'fax', 'mobile', 'website', 'social'];
        
        Object.keys(value || {}).forEach(key => {
          if (!validContactTypes.includes(key)) {
            throw new Error(`Invalid contact type: ${key}`);
          }
        });
      }
    },
    comment: 'Structured contact information'
  },

  // Financial breakdown
  COST_BREAKDOWN: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      materials: 0,
      labor: 0,
      equipment: 0,
      overhead: 0,
      profit: 0,
      tax: 0
    },
    validate: {
      isValidCostBreakdown(value) {
        const requiredFields = ['materials', 'labor', 'equipment', 'overhead', 'profit'];
        
        requiredFields.forEach(field => {
          if (typeof value[field] !== 'number' || value[field] < 0) {
            throw new Error(`Cost breakdown ${field} must be a non-negative number`);
          }
        });
        
        // Ensure total adds up (with small tolerance for floating point)
        const total = Object.values(value).reduce((sum, val) => sum + (val || 0), 0);
        const expectedTotal = value.total || 0;
        
        if (Math.abs(total - expectedTotal) > 0.01) {
          console.warn('Cost breakdown total does not match sum of components');
        }
      }
    },
    comment: 'Detailed cost breakdown structure'
  },

  // Progress tracking
  PROGRESS_DATA: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      phases: {},
      milestones: {},
      tasks: {}
    },
    validate: {
      isValidProgressData(value) {
        ['phases', 'milestones', 'tasks'].forEach(section => {
          if (value[section]) {
            Object.values(value[section]).forEach(item => {
              if (typeof item.percent_complete !== 'undefined') {
                if (item.percent_complete < 0 || item.percent_complete > 100) {
                  throw new Error('Progress percentage must be between 0 and 100');
                }
              }
            });
          }
        });
      }
    },
    comment: 'Project progress tracking data'
  },

  // Schedule information
  SCHEDULE_DATA: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      shifts: [],
      breaks: [],
      overtime: [],
      holidays: []
    },
    validate: {
      isValidScheduleData(value) {
        // Validate shift times
        if (value.shifts) {
          value.shifts.forEach(shift => {
            if (!shift.start_time || !shift.end_time) {
              throw new Error('Shift must have start_time and end_time');
            }
            
            if (new Date(shift.start_time) >= new Date(shift.end_time)) {
              throw new Error('Shift end_time must be after start_time');
            }
          });
        }
      }
    },
    comment: 'Work schedule and timing data'
  }
};

/**
 * JSON field optimization utilities
 */
class JSONFieldOptimizer {
  /**
   * Gets the depth of a nested object
   */
  static getObjectDepth(obj, depth = 0) {
    if (typeof obj !== 'object' || obj === null) {
      return depth;
    }
    
    if (Array.isArray(obj)) {
      return Math.max(depth, ...obj.map(item => this.getObjectDepth(item, depth + 1)));
    }
    
    const values = Object.values(obj);
    if (values.length === 0) {
      return depth;
    }
    
    return Math.max(...values.map(value => this.getObjectDepth(value, depth + 1)));
  }

  /**
   * Compresses JSON data for storage
   */
  static compressJSON(data) {
    // Remove null/undefined values
    const compressed = this.removeEmptyValues(data);
    
    // Convert arrays to more efficient representations
    return this.optimizeArrays(compressed);
  }

  /**
   * Removes empty values from object
   */
  static removeEmptyValues(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeEmptyValues(item)).filter(item => item !== null);
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const result = {};
      Object.keys(obj).forEach(key => {
        const value = this.removeEmptyValues(obj[key]);
        if (value !== null && value !== undefined && value !== '' && 
            !(Array.isArray(value) && value.length === 0) &&
            !(typeof value === 'object' && Object.keys(value).length === 0)) {
          result[key] = value;
        }
      });
      return result;
    }
    
    return obj;
  }

  /**
   * Optimizes array storage
   */
  static optimizeArrays(obj) {
    if (Array.isArray(obj)) {
      // Convert arrays of similar objects to more efficient format
      if (obj.length > 0 && typeof obj[0] === 'object') {
        const keys = Object.keys(obj[0]);
        const allSameKeys = obj.every(item => 
          Object.keys(item).length === keys.length &&
          keys.every(key => item.hasOwnProperty(key))
        );
        
        if (allSameKeys && obj.length > 5) {
          // Convert to columnar format for better compression
          return {
            _format: 'columnar',
            _keys: keys,
            _data: keys.map(key => obj.map(item => item[key]))
          };
        }
      }
      
      return obj.map(item => this.optimizeArrays(item));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const result = {};
      Object.keys(obj).forEach(key => {
        result[key] = this.optimizeArrays(obj[key]);
      });
      return result;
    }
    
    return obj;
  }

  /**
   * Decompresses optimized JSON data
   */
  static decompressJSON(data) {
    if (Array.isArray(data)) {
      return data.map(item => this.decompressJSON(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      // Handle columnar format
      if (data._format === 'columnar' && data._keys && data._data) {
        return data._data[0].map((_, index) => {
          const item = {};
          data._keys.forEach((key, keyIndex) => {
            item[key] = data._data[keyIndex][index];
          });
          return item;
        });
      }
      
      const result = {};
      Object.keys(data).forEach(key => {
        result[key] = this.decompressJSON(data[key]);
      });
      return result;
    }
    
    return data;
  }

  /**
   * Creates indexes for JSON fields
   */
  static createJSONIndexes(model, field, paths) {
    const indexes = [];
    
    paths.forEach(path => {
      // GIN index for general JSON queries
      indexes.push({
        fields: [field],
        using: 'GIN',
        name: `idx_${model.tableName}_${field}_gin`
      });
      
      // Specific path indexes
      indexes.push({
        fields: [`(${field}->'${path}')`],
        name: `idx_${model.tableName}_${field}_${path.replace(/[^a-zA-Z0-9]/g, '_')}`
      });
    });
    
    return indexes;
  }
}

/**
 * Comprehensive caching strategies
 */
const CACHING_STRATEGIES = {
  // Cache configuration by model type
  MODEL_CACHE_CONFIG: {
    // Reference data - long cache times
    REFERENCE_DATA: {
      ttl: 3600, // 1 hour
      strategy: 'cache-first',
      invalidation: 'manual',
      compression: true,
      examples: ['companies', 'categories', 'statuses', 'templates']
    },

    // User data - medium cache times
    USER_DATA: {
      ttl: 1800, // 30 minutes
      strategy: 'cache-aside',
      invalidation: 'event-based',
      compression: false,
      examples: ['users', 'permissions', 'preferences']
    },

    // Transactional data - short cache times
    TRANSACTIONAL_DATA: {
      ttl: 300, // 5 minutes
      strategy: 'write-through',
      invalidation: 'time-based',
      compression: true,
      examples: ['invoices', 'estimates', 'projects']
    },

    // Real-time data - very short cache times
    REALTIME_DATA: {
      ttl: 60, // 1 minute
      strategy: 'cache-aside',
      invalidation: 'immediate',
      compression: false,
      examples: ['activities', 'notifications', 'status_updates']
    },

    // Analytics data - long cache with background refresh
    ANALYTICS_DATA: {
      ttl: 7200, // 2 hours
      strategy: 'refresh-ahead',
      invalidation: 'scheduled',
      compression: true,
      examples: ['reports', 'dashboards', 'metrics']
    }
  },

  // Cache levels
  CACHE_LEVELS: {
    L1_MEMORY: {
      storage: 'memory',
      size: '100MB',
      ttl: 300,
      description: 'In-process memory cache for hot data'
    },

    L2_REDIS: {
      storage: 'redis',
      size: '1GB',
      ttl: 3600,
      description: 'Distributed cache for shared data'
    },

    L3_DATABASE: {
      storage: 'database',
      size: 'unlimited',
      ttl: 86400,
      description: 'Database-level caching and materialized views'
    }
  },

  // Cache patterns
  CACHE_PATTERNS: {
    // Single record caching
    SINGLE_RECORD: {
      keyPattern: '{model}:{id}',
      ttl: 1800,
      strategy: 'cache-aside'
    },

    // Collection caching
    COLLECTION: {
      keyPattern: '{model}:list:{company_id}:{filters_hash}',
      ttl: 600,
      strategy: 'cache-aside'
    },

    // Computed data caching
    COMPUTED: {
      keyPattern: 'computed:{type}:{company_id}:{params_hash}',
      ttl: 3600,
      strategy: 'write-through'
    },

    // Session caching
    SESSION: {
      keyPattern: 'session:{user_id}:{type}',
      ttl: 1800,
      strategy: 'cache-aside'
    },

    // Search results caching
    SEARCH: {
      keyPattern: 'search:{query_hash}:{company_id}',
      ttl: 900,
      strategy: 'cache-aside'
    }
  }
};

/**
 * Cache manager implementation
 */
class CacheManager {
  constructor(options = {}) {
    this.levels = {
      memory: new Map(),
      redis: global.redisClient,
      database: null // Will be set up with materialized views
    };
    
    this.config = {
      defaultTTL: 3600,
      maxMemorySize: 100 * 1024 * 1024, // 100MB
      compressionThreshold: 1024, // 1KB
      ...options
    };
    
    this.stats = {
      hits: { memory: 0, redis: 0, database: 0 },
      misses: { memory: 0, redis: 0, database: 0 },
      sets: { memory: 0, redis: 0, database: 0 },
      deletes: { memory: 0, redis: 0, database: 0 }
    };
  }

  /**
   * Gets value from cache with multi-level fallback
   */
  async get(key, options = {}) {
    const { useCompression = true, levels = ['memory', 'redis'] } = options;

    // Try each cache level in order
    for (const level of levels) {
      try {
        const value = await this.getFromLevel(key, level);
        
        if (value !== null) {
          this.stats.hits[level]++;
          
          // Promote to higher cache levels
          await this.promoteToHigherLevels(key, value, level, levels, useCompression);
          
          return useCompression ? this.decompress(value) : value;
        }
      } catch (error) {
        console.warn(`Cache level ${level} error:`, error.message);
      }
    }

    // Cache miss
    levels.forEach(level => this.stats.misses[level]++);
    return null;
  }

  /**
   * Sets value in cache across multiple levels
   */
  async set(key, value, options = {}) {
    const { 
      ttl = this.config.defaultTTL,
      useCompression = true,
      levels = ['memory', 'redis']
    } = options;

    const compressedValue = useCompression ? this.compress(value) : value;

    const promises = levels.map(async (level) => {
      try {
        await this.setInLevel(key, compressedValue, ttl, level);
        this.stats.sets[level]++;
      } catch (error) {
        console.warn(`Cache level ${level} set error:`, error.message);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Deletes value from all cache levels
   */
  async delete(key, levels = ['memory', 'redis']) {
    const promises = levels.map(async (level) => {
      try {
        await this.deleteFromLevel(key, level);
        this.stats.deletes[level]++;
      } catch (error) {
        console.warn(`Cache level ${level} delete error:`, error.message);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Gets value from specific cache level
   */
  async getFromLevel(key, level) {
    switch (level) {
      case 'memory':
        const memoryItem = this.levels.memory.get(key);
        if (memoryItem && memoryItem.expires > Date.now()) {
          return memoryItem.value;
        }
        if (memoryItem) {
          this.levels.memory.delete(key);
        }
        return null;

      case 'redis':
        if (this.levels.redis) {
          return await this.levels.redis.get(key);
        }
        return null;

      case 'database':
        // Implementation for database-level caching
        return null;

      default:
        return null;
    }
  }

  /**
   * Sets value in specific cache level
   */
  async setInLevel(key, value, ttl, level) {
    switch (level) {
      case 'memory':
        // Check memory usage
        if (this.getMemoryUsage() < this.config.maxMemorySize) {
          this.levels.memory.set(key, {
            value,
            expires: Date.now() + (ttl * 1000)
          });
        }
        break;

      case 'redis':
        if (this.levels.redis) {
          await this.levels.redis.setex(key, ttl, JSON.stringify(value));
        }
        break;

      case 'database':
        // Implementation for database-level caching
        break;
    }
  }

  /**
   * Deletes value from specific cache level
   */
  async deleteFromLevel(key, level) {
    switch (level) {
      case 'memory':
        this.levels.memory.delete(key);
        break;

      case 'redis':
        if (this.levels.redis) {
          await this.levels.redis.del(key);
        }
        break;

      case 'database':
        // Implementation for database-level cache invalidation
        break;
    }
  }

  /**
   * Promotes cache entry to higher levels
   */
  async promoteToHigherLevels(key, value, currentLevel, allLevels, useCompression) {
    const currentIndex = allLevels.indexOf(currentLevel);
    const higherLevels = allLevels.slice(0, currentIndex);

    for (const level of higherLevels) {
      try {
        await this.setInLevel(key, value, this.config.defaultTTL, level);
      } catch (error) {
        console.warn(`Cache promotion to ${level} failed:`, error.message);
      }
    }
  }

  /**
   * Compresses data for storage
   */
  compress(data) {
    const jsonString = JSON.stringify(data);
    
    if (jsonString.length > this.config.compressionThreshold) {
      // Use gzip compression for large data
      try {
        const zlib = require('zlib');
        return {
          _compressed: true,
          _data: zlib.gzipSync(Buffer.from(jsonString)).toString('base64')
        };
      } catch (error) {
        console.warn('Compression failed:', error.message);
      }
    }
    
    return data;
  }

  /**
   * Decompresses data from storage
   */
  decompress(data) {
    if (data && data._compressed) {
      try {
        const zlib = require('zlib');
        const buffer = Buffer.from(data._data, 'base64');
        const decompressed = zlib.gunzipSync(buffer).toString();
        return JSON.parse(decompressed);
      } catch (error) {
        console.warn('Decompression failed:', error.message);
        return null;
      }
    }
    
    return data;
  }

  /**
   * Gets current memory usage
   */
  getMemoryUsage() {
    let size = 0;
    for (const [key, item] of this.levels.memory) {
      size += JSON.stringify(item).length * 2; // Rough estimate (UTF-16)
    }
    return size;
  }

  /**
   * Clears expired entries from memory cache
   */
  cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, item] of this.levels.memory) {
      if (item.expires <= now) {
        this.levels.memory.delete(key);
      }
    }
  }

  /**
   * Gets cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      memorySize: this.getMemoryUsage(),
      memoryEntries: this.levels.memory.size,
      hitRates: {
        memory: this.stats.hits.memory / (this.stats.hits.memory + this.stats.misses.memory) || 0,
        redis: this.stats.hits.redis / (this.stats.hits.redis + this.stats.misses.redis) || 0
      }
    };
  }

  /**
   * Invalidates cache patterns
   */
  async invalidatePattern(pattern) {
    // For Redis, use SCAN and DEL
    if (this.levels.redis) {
      try {
        const keys = await this.levels.redis.keys(pattern);
        if (keys.length > 0) {
          await this.levels.redis.del(...keys);
        }
      } catch (error) {
        console.warn('Pattern invalidation failed:', error.message);
      }
    }

    // For memory cache
    for (const key of this.levels.memory.keys()) {
      if (this.matchesPattern(key, pattern)) {
        this.levels.memory.delete(key);
      }
    }
  }

  /**
   * Checks if key matches pattern
   */
  matchesPattern(key, pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(key);
  }
}

/**
 * Cache hooks for Sequelize models
 */
const createCacheHooks = (cacheManager, options = {}) => {
  const {
    cacheConfig = CACHING_STRATEGIES.MODEL_CACHE_CONFIG.TRANSACTIONAL_DATA,
    keyPrefix = 'model'
  } = options;

  return {
    afterCreate: async (instance, options) => {
      // Cache the newly created instance
      const key = `${keyPrefix}:${instance.constructor.name}:${instance.id}`;
      await cacheManager.set(key, instance.toJSON(), {
        ttl: cacheConfig.ttl,
        useCompression: cacheConfig.compression
      });

      // Invalidate list caches
      await cacheManager.invalidatePattern(`${keyPrefix}:${instance.constructor.name}:list:*`);
    },

    afterUpdate: async (instance, options) => {
      // Update cached instance
      const key = `${keyPrefix}:${instance.constructor.name}:${instance.id}`;
      await cacheManager.set(key, instance.toJSON(), {
        ttl: cacheConfig.ttl,
        useCompression: cacheConfig.compression
      });

      // Invalidate related caches
      await cacheManager.invalidatePattern(`${keyPrefix}:${instance.constructor.name}:list:*`);
      await cacheManager.invalidatePattern(`computed:*:${instance.companyId || '*'}:*`);
    },

    afterDestroy: async (instance, options) => {
      // Remove from cache
      const key = `${keyPrefix}:${instance.constructor.name}:${instance.id}`;
      await cacheManager.delete(key);

      // Invalidate list caches
      await cacheManager.invalidatePattern(`${keyPrefix}:${instance.constructor.name}:list:*`);
    }
  };
};

module.exports = {
  JSON_FIELD_PATTERNS,
  CACHING_STRATEGIES,
  JSONFieldOptimizer,
  CacheManager,
  createCacheHooks
};
