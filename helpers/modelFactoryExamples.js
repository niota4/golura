/**
 * Model Factory Usage Examples
 * 
 * This file demonstrates how to use the enhanced model factory
 * to create production-ready Sequelize models.
 */

const { Sequelize } = require('sequelize');
const { 
  createEnhancedModel, 
  EnhancedModelFactory,
  MODEL_TEMPLATES,
  createProductionModel,
  ModelTypes 
} = require('./modelFactory');

// Initialize Sequelize (example)
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres'
});

/**
 * Example 1: Create a financial model using the enhanced factory
 */
function createInvoiceModel() {
  const Invoice = createEnhancedModel(sequelize, 'Invoice', {
    invoice_number: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    amount: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    due_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'draft'
    },
    client_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'clients', key: 'id' }
    }
  }, {
    template: 'FINANCIAL', // Uses financial template with audit, currency, etc.
    enableDocumentVersioning: true
  });

  return Invoice;
}

/**
 * Example 2: Create a client model with PII protection
 */
function createClientModel() {
  const Client = createEnhancedModel(sequelize, 'Client', {
    first_name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    last_name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    email: {
      type: Sequelize.STRING(320),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    phone: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  }, {
    template: 'PERSONAL_DATA', // Uses PII protection and GDPR compliance
    enablePIIProtection: true
  });

  return Client;
}

/**
 * Example 3: Create a project model with construction features
 */
function createProjectModel() {
  const Project = createEnhancedModel(sequelize, 'Project', {
    project_name: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    project_number: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    start_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    end_date: {
      type: Sequelize.DATE,
      allowNull: true
    },
    budget: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled'),
      defaultValue: 'planning'
    }
  }, {
    template: 'PROJECT_DATA', // Uses construction-specific features
    enableConstructionFields: true,
    enableDocumentVersioning: true
  });

  return Project;
}

/**
 * Example 4: Using the legacy production model creator
 */
function createPaymentModel() {
  const Payment = createProductionModel(sequelize, 'Payment', {
    amount: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    payment_method: {
      type: Sequelize.ENUM('cash', 'check', 'credit_card', 'bank_transfer', 'other'),
      allowNull: false
    },
    payment_date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    reference_number: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    invoice_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'invoices', key: 'id' }
    }
  }, {
    category: 'FINANCIAL',
    securityLevel: 'high',
    enableVersioning: true,
    businessDomain: 'FINANCIAL'
  });

  return Payment;
}

/**
 * Example 5: Using predefined model types
 */
function createModelsWithTypes() {
  // Financial record with all financial features
  const Estimate = ModelTypes.FinancialRecord(sequelize, 'Estimate', {
    estimate_number: { type: Sequelize.STRING(50), allowNull: false },
    total_amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
    valid_until: { type: Sequelize.DATE, allowNull: false }
  });

  // Communication record for emails
  const Email = ModelTypes.CommunicationRecord(sequelize, 'Email', {
    subject: { type: Sequelize.STRING(255), allowNull: false },
    body: { type: Sequelize.TEXT, allowNull: false },
    sent_at: { type: Sequelize.DATE, allowNull: true }
  });

  // Reference data for categories
  const Category = ModelTypes.ReferenceData(sequelize, 'Category', {
    name: { type: Sequelize.STRING(100), allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: true },
    sort_order: { type: Sequelize.INTEGER, defaultValue: 0 }
  });

  return { Estimate, Email, Category };
}

/**
 * Example 6: Advanced factory usage with custom configuration
 */
function createAdvancedModel() {
  const factory = new EnhancedModelFactory(sequelize, {
    enableAuditTrails: true,
    enablePIIProtection: true,
    enablePerformanceOptimization: true,
    enableRBAC: true,
    enableMultiCurrency: true
  });

  const Contract = factory.createModel('Contract', {
    contract_number: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    title: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    contract_value: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false
    },
    start_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    end_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    terms: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    client_id: {
      type: Sequelize.UUID,
      allowNull: false
    }
  }, {
    template: 'PROJECT_DATA',
    enableDocumentVersioning: true,
    enableMultiCurrency: true
  });

  return Contract;
}

/**
 * Example usage in application
 */
async function initializeModels() {
  try {
    // Create models
    const Invoice = createInvoiceModel();
    const Client = createClientModel();
    const Project = createProjectModel();
    const Payment = createPaymentModel();
    const { Estimate, Email, Category } = createModelsWithTypes();
    const Contract = createAdvancedModel();

    // Set up associations
    Client.hasMany(Invoice, { foreignKey: 'client_id' });
    Invoice.belongsTo(Client, { foreignKey: 'client_id' });
    
    Invoice.hasMany(Payment, { foreignKey: 'invoice_id' });
    Payment.belongsTo(Invoice, { foreignKey: 'invoice_id' });

    // Sync database (development only)
    await sequelize.sync({ alter: true });

    console.log('Models initialized successfully with enhanced features:');
    console.log('- Audit trails for compliance');
    console.log('- PII protection for client data');
    console.log('- Performance optimization');
    console.log('- Construction-specific fields');
    console.log('- Multi-currency support');
    console.log('- Document versioning');
    console.log('- RBAC integration ready');

    return {
      Invoice,
      Client,
      Project,
      Payment,
      Estimate,
      Email,
      Category,
      Contract
    };

  } catch (error) {
    console.error('Error initializing models:', error);
    throw error;
  }
}

/**
 * Example of using enhanced model features
 */
async function demonstrateFeatures(models) {
  try {
    const { Invoice, Client } = models;

    // Create a client with automatic PII protection
    const client = await Client.create({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      address: '123 Main St, Anytown, USA'
    });

    // Create an invoice with audit trail
    const invoice = await Invoice.create({
      invoice_number: 'INV-2025-000001',
      amount: 1500.00,
      due_date: new Date('2025-10-01'),
      status: 'draft',
      client_id: client.id
    });

    // Demonstrate features
    console.log('Client created with PII protection');
    console.log('Invoice created with audit trail');

    // Get audit trail (if available)
    if (invoice.getAuditTrail) {
      const auditTrail = await invoice.getAuditTrail();
      console.log('Audit trail entries:', auditTrail.length);
    }

    // Demonstrate safe JSON export
    const safeClientData = client.toSafeJSON();
    console.log('Safe client data export:', Object.keys(safeClientData));

    return { client, invoice };

  } catch (error) {
    console.error('Error demonstrating features:', error);
    throw error;
  }
}

module.exports = {
  createInvoiceModel,
  createClientModel,
  createProjectModel,
  createPaymentModel,
  createModelsWithTypes,
  createAdvancedModel,
  initializeModels,
  demonstrateFeatures
};
