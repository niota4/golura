'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('subscription_plans', [
      {
        id: 1,
        name: 'starter',
        displayName: 'Starter Plan',
        description: 'Perfect for small businesses getting started with GoLura',
        monthlyPrice: 49.00,
        yearlyPrice: 490.00, // ~$41/month when billed yearly (2 months free)
        features: JSON.stringify([
          'basic_estimates',
          'client_management',
          'calendar_scheduling',
          'basic_invoicing',
          'email_notifications',
          'basic_reporting',
          'mobile_app',
          'basic_support'
        ]),
        limits: JSON.stringify({
          users: 3,
          clients: 100,
          estimates_per_month: 50,
          invoices_per_month: 25,
          storage_gb: 2,
          api_calls_per_month: 1000,
          integrations: 2,
          custom_templates: 5,
          email_notifications_per_month: 200
        }),
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'business',
        displayName: 'Business Plan',
        description: 'Advanced features for growing businesses',
        monthlyPrice: 149.00,
        yearlyPrice: 1490.00, // ~$124/month when billed yearly (2 months free)
        features: JSON.stringify([
          'basic_estimates',
          'advanced_estimates',
          'client_management',
          'calendar_scheduling',
          'advanced_invoicing',
          'recurring_invoicing',
          'email_notifications',
          'sms_notifications',
          'advanced_reporting',
          'custom_fields',
          'mobile_app',
          'priority_support',
          'team_collaboration',
          'document_templates',
          'payment_processing',
          'quickbooks_integration'
        ]),
        limits: JSON.stringify({
          users: 10,
          clients: 500,
          estimates_per_month: 200,
          invoices_per_month: 100,
          storage_gb: 10,
          api_calls_per_month: 5000,
          integrations: 5,
          custom_templates: 25,
          email_notifications_per_month: 1000,
          sms_notifications_per_month: 200,
          custom_fields: 20
        }),
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'growth',
        displayName: 'Growth Plan',
        description: 'Comprehensive solution for scaling businesses',
        monthlyPrice: 299.00,
        yearlyPrice: 2990.00, // ~$249/month when billed yearly (2 months free)
        features: JSON.stringify([
          'basic_estimates',
          'advanced_estimates',
          'ai_estimates',
          'client_management',
          'advanced_client_management',
          'calendar_scheduling',
          'advanced_scheduling',
          'advanced_invoicing',
          'recurring_invoicing',
          'automated_invoicing',
          'email_notifications',
          'sms_notifications',
          'push_notifications',
          'advanced_reporting',
          'analytics_dashboard',
          'custom_fields',
          'workflow_automation',
          'mobile_app',
          'priority_support',
          'team_collaboration',
          'role_based_permissions',
          'document_templates',
          'payment_processing',
          'multiple_payment_gateways',
          'quickbooks_integration',
          'zapier_integration',
          'api_access',
          'white_labeling',
          'multi_location'
        ]),
        limits: JSON.stringify({
          users: 25,
          clients: 2000,
          estimates_per_month: 1000,
          invoices_per_month: 500,
          storage_gb: 50,
          api_calls_per_month: 25000,
          integrations: 15,
          custom_templates: 100,
          email_notifications_per_month: 5000,
          sms_notifications_per_month: 1000,
          custom_fields: 100,
          locations: 5,
          automated_workflows: 20
        }),
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'enterprise',
        displayName: 'Enterprise Plan',
        description: 'Full-featured solution for large organizations',
        monthlyPrice: 499.00,
        yearlyPrice: 4990.00, // ~$416/month when billed yearly (2 months free)
        features: JSON.stringify([
          'basic_estimates',
          'advanced_estimates',
          'ai_estimates',
          'enterprise_estimates',
          'client_management',
          'advanced_client_management',
          'enterprise_client_management',
          'calendar_scheduling',
          'advanced_scheduling',
          'resource_scheduling',
          'advanced_invoicing',
          'recurring_invoicing',
          'automated_invoicing',
          'enterprise_invoicing',
          'email_notifications',
          'sms_notifications',
          'push_notifications',
          'advanced_reporting',
          'analytics_dashboard',
          'executive_dashboard',
          'custom_fields',
          'workflow_automation',
          'advanced_automation',
          'mobile_app',
          'dedicated_support',
          'team_collaboration',
          'role_based_permissions',
          'advanced_permissions',
          'document_templates',
          'payment_processing',
          'multiple_payment_gateways',
          'quickbooks_integration',
          'zapier_integration',
          'salesforce_integration',
          'api_access',
          'advanced_api',
          'white_labeling',
          'custom_branding',
          'multi_location',
          'multi_company',
          'sso_integration',
          'audit_logs',
          'data_export',
          'backup_restore',
          'compliance_tools'
        ]),
        limits: JSON.stringify({
          users: -1, // unlimited
          clients: -1, // unlimited
          estimates_per_month: -1, // unlimited
          invoices_per_month: -1, // unlimited
          storage_gb: 500,
          api_calls_per_month: -1, // unlimited
          integrations: -1, // unlimited
          custom_templates: -1, // unlimited
          email_notifications_per_month: -1, // unlimited
          sms_notifications_per_month: -1, // unlimited
          custom_fields: -1, // unlimited
          locations: -1, // unlimited
          automated_workflows: -1, // unlimited
          companies: 10
        }),
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('subscription_plans', null, {});
  }
};
