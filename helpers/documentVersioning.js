/**
 * Document Versioning System
 * 
 * This helper provides comprehensive versioning for critical construction documents
 * including contracts, estimates, plans, and compliance documents.
 */

const { DataTypes } = require('sequelize');

/**
 * Document types that require versioning
 */
const VERSIONED_DOCUMENT_TYPES = {
  // Contracts and legal documents
  CONTRACTS: {
    type: 'contract',
    requiresApproval: true,
    retentionYears: 7,
    maxVersions: 50,
    approvalLevels: ['PROJECT_MANAGER', 'OFFICE_MANAGER', 'OWNER']
  },

  CHANGE_ORDERS: {
    type: 'change_order',
    requiresApproval: true,
    retentionYears: 7,
    maxVersions: 25,
    approvalLevels: ['PROJECT_MANAGER', 'OFFICE_MANAGER']
  },

  // Financial documents
  ESTIMATES: {
    type: 'estimate',
    requiresApproval: true,
    retentionYears: 5,
    maxVersions: 30,
    approvalLevels: ['ESTIMATOR', 'PROJECT_MANAGER']
  },

  INVOICES: {
    type: 'invoice',
    requiresApproval: true,
    retentionYears: 7,
    maxVersions: 10,
    approvalLevels: ['ACCOUNTANT', 'OFFICE_MANAGER']
  },

  // Technical documents
  BLUEPRINTS: {
    type: 'blueprint',
    requiresApproval: true,
    retentionYears: 10,
    maxVersions: 100,
    approvalLevels: ['PROJECT_MANAGER', 'OWNER']
  },

  SPECIFICATIONS: {
    type: 'specification',
    requiresApproval: true,
    retentionYears: 10,
    maxVersions: 50,
    approvalLevels: ['PROJECT_MANAGER']
  },

  // Compliance documents
  PERMITS: {
    type: 'permit',
    requiresApproval: false,
    retentionYears: 10,
    maxVersions: 20,
    approvalLevels: []
  },

  INSPECTION_REPORTS: {
    type: 'inspection_report',
    requiresApproval: false,
    retentionYears: 10,
    maxVersions: 50,
    approvalLevels: []
  },

  SAFETY_DOCUMENTS: {
    type: 'safety_document',
    requiresApproval: true,
    retentionYears: 7,
    maxVersions: 30,
    approvalLevels: ['CREW_LEAD', 'PROJECT_MANAGER']
  },

  // Project documents
  PROJECT_PLANS: {
    type: 'project_plan',
    requiresApproval: true,
    retentionYears: 7,
    maxVersions: 40,
    approvalLevels: ['PROJECT_MANAGER']
  },

  SCHEDULES: {
    type: 'schedule',
    requiresApproval: false,
    retentionYears: 3,
    maxVersions: 100,
    approvalLevels: []
  }
};

/**
 * Version status types
 */
const VERSION_STATUSES = {
  DRAFT: {
    status: 'draft',
    description: 'Document is in draft state',
    editable: true,
    requiresApproval: false
  },

  PENDING_REVIEW: {
    status: 'pending_review',
    description: 'Document is awaiting review',
    editable: false,
    requiresApproval: true
  },

  UNDER_REVIEW: {
    status: 'under_review',
    description: 'Document is currently being reviewed',
    editable: false,
    requiresApproval: true
  },

  APPROVED: {
    status: 'approved',
    description: 'Document has been approved',
    editable: false,
    requiresApproval: false
  },

  REJECTED: {
    status: 'rejected',
    description: 'Document has been rejected',
    editable: true,
    requiresApproval: false
  },

  SUPERSEDED: {
    status: 'superseded',
    description: 'Document has been replaced by newer version',
    editable: false,
    requiresApproval: false
  },

  ARCHIVED: {
    status: 'archived',
    description: 'Document has been archived',
    editable: false,
    requiresApproval: false
  }
};

/**
 * Document versioning fields
 */
const VERSIONING_FIELDS = {
  // Version identification
  DOCUMENT_ID: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Unique identifier for the document (shared across versions)'
  },

  VERSION_NUMBER: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      is: /^v\d+\.\d+(\.\d+)?$/
    },
    comment: 'Version number (format: v1.0.0)'
  },

  MAJOR_VERSION: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      isInt: true
    },
    comment: 'Major version number'
  },

  MINOR_VERSION: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      isInt: true
    },
    comment: 'Minor version number'
  },

  PATCH_VERSION: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      isInt: true
    },
    comment: 'Patch version number'
  },

  // Version status and metadata
  VERSION_STATUS: {
    type: DataTypes.ENUM(...Object.keys(VERSION_STATUSES).map(k => VERSION_STATUSES[k].status)),
    allowNull: false,
    defaultValue: 'draft',
    comment: 'Current status of this version'
  },

  VERSION_NOTES: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notes about changes in this version'
  },

  CHANGE_SUMMARY: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Summary of changes from previous version'
  },

  // Document metadata
  DOCUMENT_TYPE: {
    type: DataTypes.ENUM(...Object.keys(VERSIONED_DOCUMENT_TYPES).map(k => VERSIONED_DOCUMENT_TYPES[k].type)),
    allowNull: false,
    comment: 'Type of document being versioned'
  },

  DOCUMENT_TITLE: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      len: [1, 500],
      notEmpty: true
    },
    comment: 'Title of the document'
  },

  DOCUMENT_CATEGORY: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Category or classification of document'
  },

  // File information
  FILE_PATH: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    comment: 'Path to the document file'
  },

  FILE_NAME: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Original file name'
  },

  FILE_SIZE: {
    type: DataTypes.BIGINT,
    allowNull: true,
    validate: {
      min: 0
    },
    comment: 'File size in bytes'
  },

  FILE_MIME_TYPE: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'MIME type of the file'
  },

  FILE_HASH: {
    type: DataTypes.STRING(128),
    allowNull: true,
    comment: 'SHA-256 hash of file content for integrity verification'
  },

  // Approval workflow
  REQUIRES_APPROVAL: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this document type requires approval'
  },

  APPROVAL_LEVEL: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Current approval level (0 = no approval needed)'
  },

  APPROVED_BY: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who approved this version'
  },

  APPROVED_AT: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when version was approved'
  },

  REJECTED_BY: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who rejected this version'
  },

  REJECTED_AT: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when version was rejected'
  },

  REJECTION_REASON: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for rejection'
  },

  // Parent version tracking
  PARENT_VERSION_ID: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID of the parent version this was created from'
  },

  IS_CURRENT_VERSION: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether this is the current/latest version'
  },

  IS_PUBLISHED: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this version is published/released'
  },

  // Expiration and lifecycle
  EFFECTIVE_DATE: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when this version becomes effective'
  },

  EXPIRATION_DATE: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when this version expires'
  },

  // Access control
  ACCESS_LEVEL: {
    type: DataTypes.ENUM('public', 'company', 'project', 'team', 'private'),
    allowNull: false,
    defaultValue: 'company',
    comment: 'Access level for this document version'
  },

  // Digital signature
  DIGITAL_SIGNATURE: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Digital signature for document integrity'
  },

  SIGNATURE_TIMESTAMP: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when document was digitally signed'
  },

  // Review tracking
  REVIEW_DEADLINE: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Deadline for document review'
  },

  REVIEWERS: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'List of assigned reviewers'
  },

  REVIEW_COMMENTS: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Review comments and feedback'
  }
};

/**
 * Version management class
 */
class DocumentVersionManager {
  /**
   * Creates a new version of a document
   */
  static async createVersion(documentData, options = {}) {
    const {
      incrementType = 'minor', // 'major', 'minor', 'patch'
      parentVersionId = null,
      versionNotes = '',
      userId,
      companyId
    } = options;

    // Get the latest version to determine new version number
    const latestVersion = await this.getLatestVersion(documentData.document_id);
    const newVersionNumber = this.calculateNextVersion(latestVersion, incrementType);

    // Mark previous version as superseded if it exists
    if (latestVersion) {
      await this.updateVersionStatus(latestVersion.id, 'superseded');
    }

    // Create new version
    const versionData = {
      ...documentData,
      version_number: newVersionNumber.string,
      major_version: newVersionNumber.major,
      minor_version: newVersionNumber.minor,
      patch_version: newVersionNumber.patch,
      parent_version_id: parentVersionId || (latestVersion ? latestVersion.id : null),
      version_notes: versionNotes,
      version_status: 'draft',
      is_current_version: true,
      is_published: false,
      created_by: userId,
      company_id: companyId,
      created_at: new Date()
    };

    return await DocumentVersion.create(versionData);
  }

  /**
   * Gets the latest version of a document
   */
  static async getLatestVersion(documentId) {
    return await DocumentVersion.findOne({
      where: {
        document_id: documentId,
        is_current_version: true
      },
      order: [
        ['major_version', 'DESC'],
        ['minor_version', 'DESC'],
        ['patch_version', 'DESC'],
        ['created_at', 'DESC']
      ]
    });
  }

  /**
   * Gets version history for a document
   */
  static async getVersionHistory(documentId, options = {}) {
    const {
      includeArchived = false,
      limit = 50,
      offset = 0
    } = options;

    const whereClause = {
      document_id: documentId
    };

    if (!includeArchived) {
      whereClause.version_status = {
        [Op.ne]: 'archived'
      };
    }

    return await DocumentVersion.findAndCountAll({
      where: whereClause,
      order: [
        ['major_version', 'DESC'],
        ['minor_version', 'DESC'],
        ['patch_version', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
  }

  /**
   * Calculates the next version number
   */
  static calculateNextVersion(currentVersion, incrementType) {
    let major = 1;
    let minor = 0;
    let patch = 0;

    if (currentVersion) {
      major = currentVersion.major_version || 1;
      minor = currentVersion.minor_version || 0;
      patch = currentVersion.patch_version || 0;
    }

    switch (incrementType) {
      case 'major':
        major += 1;
        minor = 0;
        patch = 0;
        break;
      case 'minor':
        minor += 1;
        patch = 0;
        break;
      case 'patch':
        patch += 1;
        break;
    }

    return {
      major,
      minor,
      patch,
      string: `v${major}.${minor}.${patch}`
    };
  }

  /**
   * Updates version status
   */
  static async updateVersionStatus(versionId, newStatus, userId = null) {
    const updateData = {
      version_status: newStatus,
      updated_by: userId,
      updated_at: new Date()
    };

    // Add status-specific fields
    switch (newStatus) {
      case 'approved':
        updateData.approved_by = userId;
        updateData.approved_at = new Date();
        updateData.is_published = true;
        break;
      case 'rejected':
        updateData.rejected_by = userId;
        updateData.rejected_at = new Date();
        break;
      case 'superseded':
        updateData.is_current_version = false;
        break;
      case 'archived':
        updateData.is_current_version = false;
        updateData.is_published = false;
        break;
    }

    return await DocumentVersion.update(updateData, {
      where: { id: versionId }
    });
  }

  /**
   * Submits version for approval
   */
  static async submitForApproval(versionId, userId) {
    const version = await DocumentVersion.findByPk(versionId);
    if (!version) {
      throw new Error('Version not found');
    }

    const documentTypeConfig = VERSIONED_DOCUMENT_TYPES[version.document_type.toUpperCase()];
    if (!documentTypeConfig || !documentTypeConfig.requiresApproval) {
      throw new Error('This document type does not require approval');
    }

    // Set up approval workflow
    const approvalData = {
      version_status: 'pending_review',
      requires_approval: true,
      approval_level: 1,
      reviewers: documentTypeConfig.approvalLevels.map(level => ({ level, status: 'pending' })),
      updated_by: userId,
      updated_at: new Date()
    };

    return await DocumentVersion.update(approvalData, {
      where: { id: versionId }
    });
  }

  /**
   * Processes approval decision
   */
  static async processApproval(versionId, decision, userId, comments = '') {
    const version = await DocumentVersion.findByPk(versionId);
    if (!version) {
      throw new Error('Version not found');
    }

    if (decision === 'approve') {
      return await this.updateVersionStatus(versionId, 'approved', userId);
    } else if (decision === 'reject') {
      const updateData = {
        version_status: 'rejected',
        rejected_by: userId,
        rejected_at: new Date(),
        rejection_reason: comments,
        updated_by: userId,
        updated_at: new Date()
      };

      return await DocumentVersion.update(updateData, {
        where: { id: versionId }
      });
    }

    throw new Error('Invalid approval decision');
  }

  /**
   * Compares two versions
   */
  static async compareVersions(versionId1, versionId2) {
    const [version1, version2] = await Promise.all([
      DocumentVersion.findByPk(versionId1),
      DocumentVersion.findByPk(versionId2)
    ]);

    if (!version1 || !version2) {
      throw new Error('One or both versions not found');
    }

    // Basic comparison
    const comparison = {
      version1: {
        id: version1.id,
        version_number: version1.version_number,
        created_at: version1.created_at,
        status: version1.version_status
      },
      version2: {
        id: version2.id,
        version_number: version2.version_number,
        created_at: version2.created_at,
        status: version2.version_status
      },
      differences: []
    };

    // Compare key fields
    const fieldsToCompare = [
      'document_title',
      'document_category',
      'version_notes',
      'file_name',
      'file_size',
      'file_hash'
    ];

    fieldsToCompare.forEach(field => {
      if (version1[field] !== version2[field]) {
        comparison.differences.push({
          field,
          version1_value: version1[field],
          version2_value: version2[field]
        });
      }
    });

    return comparison;
  }

  /**
   * Archives old versions based on retention policy
   */
  static async archiveOldVersions(documentId) {
    const documentType = await this.getDocumentType(documentId);
    const typeConfig = VERSIONED_DOCUMENT_TYPES[documentType];
    
    if (!typeConfig) return;

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - typeConfig.retentionYears);

    // Find versions to archive
    const versionsToArchive = await DocumentVersion.findAll({
      where: {
        document_id: documentId,
        created_at: { [Op.lt]: cutoffDate },
        version_status: { [Op.notIn]: ['archived', 'approved'] },
        is_current_version: false
      }
    });

    // Archive old versions
    for (const version of versionsToArchive) {
      await this.updateVersionStatus(version.id, 'archived');
    }

    return versionsToArchive.length;
  }

  /**
   * Gets document type for a document ID
   */
  static async getDocumentType(documentId) {
    const version = await DocumentVersion.findOne({
      where: { document_id: documentId },
      attributes: ['document_type']
    });

    return version ? version.document_type.toUpperCase() : null;
  }
}

/**
 * Versioning hooks for Sequelize models
 */
const createVersioningHooks = (options = {}) => {
  const {
    autoVersion = true,
    versionOnUpdate = true,
    trackChanges = true
  } = options;

  return {
    beforeUpdate: async (instance, options) => {
      if (versionOnUpdate && instance.changed()) {
        // Create new version before updating
        const changes = instance.changed();
        const changesSummary = changes.map(field => `${field}: ${instance._previousDataValues[field]} → ${instance[field]}`).join(', ');
        
        // Store change summary
        instance.change_summary = changesSummary;
        
        if (autoVersion) {
          // Increment patch version for minor changes
          const incrementType = changes.length > 3 ? 'minor' : 'patch';
          const newVersion = await DocumentVersionManager.createVersion(instance.toJSON(), {
            incrementType,
            parentVersionId: instance.id,
            versionNotes: `Auto-generated version due to changes: ${changesSummary}`,
            userId: options.userId || options.transaction?.userId
          });
          
          // Mark current instance as superseded
          instance.version_status = 'superseded';
          instance.is_current_version = false;
        }
      }
    },

    afterCreate: async (instance, options) => {
      if (autoVersion && !instance.version_number) {
        // Auto-generate initial version
        const versionNumber = DocumentVersionManager.calculateNextVersion(null, 'major');
        await instance.update({
          version_number: versionNumber.string,
          major_version: versionNumber.major,
          minor_version: versionNumber.minor,
          patch_version: versionNumber.patch
        });
      }
    }
  };
};

module.exports = {
  VERSIONED_DOCUMENT_TYPES,
  VERSION_STATUSES,
  VERSIONING_FIELDS,
  DocumentVersionManager,
  createVersioningHooks
};
