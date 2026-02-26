/**
 * Role-Based Access Control (RBAC) System
 * 
 * This helper provides a comprehensive RBAC system for construction management
 * with hierarchical roles, granular permissions, and multi-tenant support.
 */

/**
 * Standard role hierarchy for construction companies
 */
const ROLE_HIERARCHY = {
  // Executive level (highest permissions)
  OWNER: {
    level: 100,
    description: 'Company Owner - Full system access',
    inherits: [],
    defaultPermissions: ['*'] // All permissions
  },

  ADMIN: {
    level: 90,
    description: 'System Administrator - Full operational access',
    inherits: [],
    defaultPermissions: [
      'users.*',
      'companies.*',
      'settings.*',
      'integrations.*',
      'reports.*',
      'financial.*'
    ]
  },

  // Management level
  PROJECT_MANAGER: {
    level: 80,
    description: 'Project Manager - Project and team oversight',
    inherits: ['ESTIMATOR', 'CREW_LEAD'],
    defaultPermissions: [
      'projects.*',
      'estimates.*',
      'clients.*',
      'crews.read',
      'crews.assign',
      'schedules.*',
      'documents.*',
      'reports.projects',
      'reports.estimates'
    ]
  },

  OFFICE_MANAGER: {
    level: 75,
    description: 'Office Manager - Administrative and financial oversight',
    inherits: ['ACCOUNTANT'],
    defaultPermissions: [
      'clients.*',
      'invoices.*',
      'payments.*',
      'documents.*',
      'users.read',
      'users.create',
      'reports.financial',
      'settings.company'
    ]
  },

  // Operational level
  ESTIMATOR: {
    level: 70,
    description: 'Estimator - Creates and manages estimates',
    inherits: [],
    defaultPermissions: [
      'estimates.*',
      'projects.read',
      'clients.read',
      'items.*',
      'labor.*',
      'documents.estimates',
      'reports.estimates'
    ]
  },

  ACCOUNTANT: {
    level: 65,
    description: 'Accountant - Financial management',
    inherits: [],
    defaultPermissions: [
      'invoices.*',
      'payments.*',
      'payrolls.*',
      'purchaseOrders.*',
      'clients.read',
      'reports.financial',
      'reports.tax'
    ]
  },

  CREW_LEAD: {
    level: 60,
    description: 'Crew Lead - Field operations and crew management',
    inherits: ['CREW_MEMBER'],
    defaultPermissions: [
      'projects.read',
      'projects.update_status',
      'schedules.read',
      'schedules.update',
      'timesheets.*',
      'inventory.read',
      'inventory.update',
      'documents.field'
    ]
  },

  SALES_REP: {
    level: 55,
    description: 'Sales Representative - Client and estimate management',
    inherits: [],
    defaultPermissions: [
      'clients.*',
      'estimates.create',
      'estimates.read',
      'estimates.update',
      'projects.read',
      'documents.estimates',
      'reports.sales'
    ]
  },

  // Field level
  CREW_MEMBER: {
    level: 50,
    description: 'Crew Member - Basic field operations',
    inherits: [],
    defaultPermissions: [
      'projects.read',
      'schedules.read',
      'timesheets.own',
      'inventory.read',
      'documents.read'
    ]
  },

  // Support level
  CUSTOMER_SERVICE: {
    level: 40,
    description: 'Customer Service - Client communication',
    inherits: [],
    defaultPermissions: [
      'clients.read',
      'clients.update',
      'projects.read',
      'estimates.read',
      'invoices.read',
      'communications.*',
      'documents.read'
    ]
  },

  // External access
  CLIENT: {
    level: 20,
    description: 'Client - Limited access to own projects',
    inherits: [],
    defaultPermissions: [
      'projects.own.read',
      'estimates.own.read',
      'invoices.own.read',
      'documents.own.read',
      'communications.own.*'
    ]
  },

  SUBCONTRACTOR: {
    level: 30,
    description: 'Subcontractor - Limited project access',
    inherits: [],
    defaultPermissions: [
      'projects.assigned.read',
      'schedules.assigned.read',
      'documents.assigned.read',
      'timesheets.own.*'
    ]
  },

  // Minimal access
  VIEWER: {
    level: 10,
    description: 'Read-only access',
    inherits: [],
    defaultPermissions: [
      '*.read'
    ]
  }
};

/**
 * Granular permission system
 */
const PERMISSION_SYSTEM = {
  // Resource-based permissions
  RESOURCES: {
    users: {
      actions: ['create', 'read', 'update', 'delete', 'invite', 'suspend'],
      scopes: ['own', 'team', 'company', 'all']
    },
    companies: {
      actions: ['create', 'read', 'update', 'delete', 'settings'],
      scopes: ['own', 'all']
    },
    projects: {
      actions: ['create', 'read', 'update', 'delete', 'assign', 'status_change'],
      scopes: ['own', 'assigned', 'team', 'company', 'all']
    },
    estimates: {
      actions: ['create', 'read', 'update', 'delete', 'approve', 'send'],
      scopes: ['own', 'assigned', 'team', 'company', 'all']
    },
    invoices: {
      actions: ['create', 'read', 'update', 'delete', 'send', 'payment'],
      scopes: ['own', 'assigned', 'team', 'company', 'all']
    },
    clients: {
      actions: ['create', 'read', 'update', 'delete', 'communicate'],
      scopes: ['own', 'assigned', 'team', 'company', 'all']
    },
    financial: {
      actions: ['read', 'create', 'update', 'approve', 'reconcile'],
      scopes: ['own', 'team', 'company']
    },
    reports: {
      actions: ['view', 'export', 'schedule'],
      scopes: ['own', 'team', 'company'],
      types: ['financial', 'projects', 'sales', 'operations', 'compliance']
    },
    settings: {
      actions: ['read', 'update'],
      scopes: ['user', 'company', 'system']
    }
  },

  // Permission format: resource.action.scope
  // Examples: 'projects.read.team', 'invoices.create.company', 'users.update.own'
  
  // Special permissions
  SPECIAL: {
    SUPER_ADMIN: '*', // All permissions
    EMERGENCY_ACCESS: 'emergency.*', // Emergency override
    AUDIT_ACCESS: '*.audit', // Audit trail access
    BACKUP_ACCESS: 'system.backup', // Backup operations
    INTEGRATION_ACCESS: 'integrations.*' // Third-party integrations
  }
};

/**
 * Context-based access control
 */
const ACCESS_CONTEXTS = {
  // Time-based access
  BUSINESS_HOURS: {
    type: 'time',
    rule: 'weekdays_9_to_5',
    description: 'Access only during business hours'
  },

  EMERGENCY_HOURS: {
    type: 'time',
    rule: 'always',
    description: 'Emergency access available 24/7'
  },

  // Location-based access
  OFFICE_ONLY: {
    type: 'location',
    rule: 'office_network',
    description: 'Access only from office network'
  },

  FIELD_ACCESS: {
    type: 'location',
    rule: 'job_site_proximity',
    description: 'Access when near assigned job sites'
  },

  // Device-based access
  COMPANY_DEVICES: {
    type: 'device',
    rule: 'registered_devices',
    description: 'Access only from company-registered devices'
  },

  // Project-based access
  ACTIVE_PROJECTS: {
    type: 'project',
    rule: 'assigned_projects',
    description: 'Access only to actively assigned projects'
  }
};

/**
 * Permission inheritance and calculation
 */
class PermissionCalculator {
  /**
   * Calculates effective permissions for a user
   * @param {Object} user - User object with roles
   * @param {Object} context - Access context
   * @returns {Set} - Set of effective permissions
   */
  static calculateEffectivePermissions(user, context = {}) {
    const permissions = new Set();
    
    // Get all user roles (including inherited)
    const allRoles = this.getAllRoles(user.roles || []);
    
    // Add permissions from all roles
    allRoles.forEach(roleName => {
      const role = ROLE_HIERARCHY[roleName];
      if (role) {
        role.defaultPermissions.forEach(permission => {
          permissions.add(permission);
        });
      }
    });

    // Add explicit user permissions
    if (user.permissions) {
      user.permissions.forEach(permission => {
        permissions.add(permission);
      });
    }

    // Remove explicitly denied permissions
    if (user.deniedPermissions) {
      user.deniedPermissions.forEach(permission => {
        permissions.delete(permission);
      });
    }

    // Apply context-based restrictions
    return this.applyContextRestrictions(permissions, context);
  }

  /**
   * Gets all roles including inherited ones
   */
  static getAllRoles(userRoles) {
    const allRoles = new Set(userRoles);
    
    userRoles.forEach(roleName => {
      const role = ROLE_HIERARCHY[roleName];
      if (role && role.inherits) {
        role.inherits.forEach(inheritedRole => {
          allRoles.add(inheritedRole);
          // Recursively add inherited roles
          this.getAllRoles([inheritedRole]).forEach(r => allRoles.add(r));
        });
      }
    });

    return Array.from(allRoles);
  }

  /**
   * Applies context-based access restrictions
   */
  static applyContextRestrictions(permissions, context) {
    // Apply time restrictions
    if (context.time && !this.checkTimeAccess(context.time)) {
      return this.filterEmergencyPermissions(permissions);
    }

    // Apply location restrictions
    if (context.location && !this.checkLocationAccess(context.location)) {
      return this.filterLocationPermissions(permissions);
    }

    // Apply device restrictions
    if (context.device && !this.checkDeviceAccess(context.device)) {
      return this.filterDevicePermissions(permissions);
    }

    return permissions;
  }

  /**
   * Checks if user has specific permission
   */
  static hasPermission(userPermissions, requiredPermission, context = {}) {
    // Check for wildcard permissions
    if (userPermissions.has('*')) {
      return true;
    }

    // Check exact permission
    if (userPermissions.has(requiredPermission)) {
      return true;
    }

    // Check wildcard patterns
    for (const permission of userPermissions) {
      if (this.matchesWildcard(permission, requiredPermission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Matches wildcard permission patterns
   */
  static matchesWildcard(pattern, permission) {
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return permission.startsWith(prefix + '.');
    }

    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return permission.startsWith(prefix);
    }

    return pattern === permission;
  }

  // Helper methods for context checks
  static checkTimeAccess(timeContext) {
    // Implementation for time-based access control
    return true; // Simplified for example
  }

  static checkLocationAccess(locationContext) {
    // Implementation for location-based access control
    return true; // Simplified for example
  }

  static checkDeviceAccess(deviceContext) {
    // Implementation for device-based access control
    return true; // Simplified for example
  }

  static filterEmergencyPermissions(permissions) {
    // Filter to only emergency permissions during off-hours
    const emergencyPermissions = new Set();
    permissions.forEach(permission => {
      if (permission.startsWith('emergency.') || permission === '*') {
        emergencyPermissions.add(permission);
      }
    });
    return emergencyPermissions;
  }

  static filterLocationPermissions(permissions) {
    // Filter permissions based on location
    return permissions; // Simplified for example
  }

  static filterDevicePermissions(permissions) {
    // Filter permissions based on device
    return permissions; // Simplified for example
  }
}

/**
 * RBAC middleware for route protection
 */
const createRBACMiddleware = (requiredPermission, options = {}) => {
  return async (req, res, next) => {
    try {
      const { user } = req;
      const {
        requireAll = false,
        context = {},
        customCheck = null
      } = options;

      if (!user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Calculate effective permissions
      const effectivePermissions = PermissionCalculator.calculateEffectivePermissions(
        user,
        { ...context, ...req.rbacContext }
      );

      // Check permissions
      const permissions = Array.isArray(requiredPermission) 
        ? requiredPermission 
        : [requiredPermission];

      const hasAccess = requireAll
        ? permissions.every(perm => PermissionCalculator.hasPermission(effectivePermissions, perm))
        : permissions.some(perm => PermissionCalculator.hasPermission(effectivePermissions, perm));

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: permissions,
          userPermissions: Array.from(effectivePermissions)
        });
      }

      // Custom permission check
      if (customCheck && !await customCheck(user, req)) {
        return res.status(403).json({
          error: 'Custom permission check failed',
          code: 'CUSTOM_CHECK_FAILED'
        });
      }

      // Add permissions to request for use in controllers
      req.userPermissions = effectivePermissions;
      next();

    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        error: 'Permission check failed',
        code: 'RBAC_ERROR'
      });
    }
  };
};

/**
 * Resource-based access control helpers
 */
const ResourceAccess = {
  /**
   * Checks if user can access a specific resource
   */
  canAccess: (user, resource, action, resourceData = {}) => {
    const effectivePermissions = PermissionCalculator.calculateEffectivePermissions(user);
    
    // Build permission string
    const permission = `${resource}.${action}`;
    
    // Check basic permission
    if (!PermissionCalculator.hasPermission(effectivePermissions, permission)) {
      return false;
    }

    // Check scope-based access
    return ResourceAccess.checkScopeAccess(user, resource, resourceData);
  },

  /**
   * Checks scope-based access (own, team, company)
   */
  checkScopeAccess: (user, resource, resourceData) => {
    // Check if user owns the resource
    if (resourceData.createdBy === user.id || resourceData.userId === user.id) {
      return true;
    }

    // Check if resource belongs to user's team
    if (resourceData.teamId && user.teamIds?.includes(resourceData.teamId)) {
      return true;
    }

    // Check if resource belongs to user's company
    if (resourceData.companyId === user.companyId) {
      return true;
    }

    return false;
  },

  /**
   * Filters query results based on user access
   */
  applyAccessFilter: (query, user, resource) => {
    const userPermissions = PermissionCalculator.calculateEffectivePermissions(user);
    
    // If user has full access, return unfiltered query
    if (userPermissions.has('*') || userPermissions.has(`${resource}.*`)) {
      return query;
    }

    // Apply company-level filtering (multi-tenant)
    query.where = {
      ...query.where,
      companyId: user.companyId
    };

    // Apply additional scope filtering based on permissions
    const scopePermissions = Array.from(userPermissions)
      .filter(p => p.startsWith(`${resource}.`))
      .map(p => p.split('.').pop());

    if (scopePermissions.includes('own')) {
      query.where[Op.or] = [
        { createdBy: user.id },
        { userId: user.id },
        ...(query.where[Op.or] || [])
      ];
    }

    if (scopePermissions.includes('team') && user.teamIds) {
      query.where[Op.or] = [
        { teamId: { [Op.in]: user.teamIds } },
        ...(query.where[Op.or] || [])
      ];
    }

    return query;
  }
};

/**
 * Role management utilities
 */
const RoleManagement = {
  /**
   * Assigns role to user with validation
   */
  assignRole: async (userId, roleName, assignedBy, companyId) => {
    // Validate role exists
    if (!ROLE_HIERARCHY[roleName]) {
      throw new Error(`Invalid role: ${roleName}`);
    }

    // Check if assigner has permission to assign this role
    const assignerPermissions = PermissionCalculator.calculateEffectivePermissions(assignedBy);
    if (!PermissionCalculator.hasPermission(assignerPermissions, 'users.assign_role')) {
      throw new Error('Insufficient permissions to assign roles');
    }

    // Prevent privilege escalation
    const assignerRoles = RoleManagement.getUserRoles(assignedBy);
    const assignerMaxLevel = Math.max(...assignerRoles.map(r => ROLE_HIERARCHY[r]?.level || 0));
    const targetRoleLevel = ROLE_HIERARCHY[roleName].level;

    if (targetRoleLevel >= assignerMaxLevel) {
      throw new Error('Cannot assign role with equal or higher privileges');
    }

    // Create role assignment record
    return await UserRole.create({
      userId,
      roleName,
      assignedBy: assignedBy.id,
      companyId,
      assignedAt: new Date()
    });
  },

  /**
   * Gets user roles with inheritance
   */
  getUserRoles: (user) => {
    return PermissionCalculator.getAllRoles(user.roles || []);
  },

  /**
   * Validates role hierarchy
   */
  validateRoleHierarchy: () => {
    const errors = [];
    
    // Check for circular inheritance
    Object.entries(ROLE_HIERARCHY).forEach(([roleName, role]) => {
      if (RoleManagement.hasCircularInheritance(roleName, new Set())) {
        errors.push(`Circular inheritance detected for role: ${roleName}`);
      }
    });

    // Check level consistency
    Object.entries(ROLE_HIERARCHY).forEach(([roleName, role]) => {
      role.inherits?.forEach(inheritedRole => {
        const inheritedLevel = ROLE_HIERARCHY[inheritedRole]?.level;
        if (inheritedLevel && inheritedLevel >= role.level) {
          errors.push(`Invalid inheritance: ${roleName} inherits from higher level role ${inheritedRole}`);
        }
      });
    });

    return errors;
  },

  /**
   * Checks for circular inheritance
   */
  hasCircularInheritance: (roleName, visited) => {
    if (visited.has(roleName)) {
      return true;
    }

    visited.add(roleName);
    const role = ROLE_HIERARCHY[roleName];
    
    if (role?.inherits) {
      return role.inherits.some(inheritedRole => 
        RoleManagement.hasCircularInheritance(inheritedRole, new Set(visited))
      );
    }

    return false;
  }
};

module.exports = {
  ROLE_HIERARCHY,
  PERMISSION_SYSTEM,
  ACCESS_CONTEXTS,
  PermissionCalculator,
  createRBACMiddleware,
  ResourceAccess,
  RoleManagement
};
