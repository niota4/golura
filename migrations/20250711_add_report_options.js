module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add options column to reports table if it doesn't exist
    const tableInfo = await queryInterface.describeTable('reports');
    if (!tableInfo.options) {
      await queryInterface.addColumn('reports', 'options', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null
      });
    }

    // Update reports with appropriate options based on their data structure
    const reportsWithSpreadsheet = [
      // Reports that return spreadsheetData and should have spreadsheet view
      'MRR/ARR',
      'Active Users', 
      'Revenue by Client',
      'Invoice Aging',
      'Client List with Activity',
      'Event/Job Schedule',
      'Inventory Usage'
    ];

    const reportsWithSummaryOnly = [
      // Reports that return only summary data
      'Churn Rate',
      'Estimate-to-Invoice Conversion',
      'Average Deal Size',
      'Average Days to Payment',
      'Employee Utilization Rate',
      'Estimate Approval Time',
      'Client Summary Report',
      'Estimate Summary Report',
      'Invoice Summary Report',
      'Work Order Summary',
      'Outstanding Receivables'
    ];

    const reportsWithDashboard = [
      // Reports that would benefit from dashboard view
      'Revenue by Period',
      'Revenue by Client',
      'Invoice Aging',
      'Client List with Activity',
      'MRR/ARR',
      'Active Users'
    ];

    // Update reports with spreadsheet option
    for (const reportName of reportsWithSpreadsheet) {
      await queryInterface.sequelize.query(
        `UPDATE reports SET options = JSON_ARRAY('spreadsheet') WHERE name = ?`,
        {
          replacements: [reportName],
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    }

    // Update reports with summary only option
    for (const reportName of reportsWithSummaryOnly) {
      await queryInterface.sequelize.query(
        `UPDATE reports SET options = JSON_ARRAY('summary') WHERE name = ?`,
        {
          replacements: [reportName],
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    }

    // Update reports that should have both spreadsheet and dashboard
    const reportsWithBoth = reportsWithSpreadsheet.filter(name => reportsWithDashboard.includes(name));
    for (const reportName of reportsWithBoth) {
      await queryInterface.sequelize.query(
        `UPDATE reports SET options = JSON_ARRAY('spreadsheet', 'dashboard') WHERE name = ?`,
        {
          replacements: [reportName],
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    }

    // Set default options for reports not yet configured
    await queryInterface.sequelize.query(
      `UPDATE reports SET options = JSON_ARRAY('summary') WHERE options IS NULL`,
      {
        type: Sequelize.QueryTypes.UPDATE
      }
    );

    // Special cases for specific reports
    await queryInterface.sequelize.query(
      `UPDATE reports SET options = JSON_ARRAY('summary', 'dashboard') WHERE name IN (?, ?, ?, ?)`,
      {
        replacements: [
          'Revenue by Period',
          'Client Summary Report',
          'Estimate Summary Report', 
          'Invoice Summary Report'
        ],
        type: Sequelize.QueryTypes.UPDATE
      }
    );

    // Reports that are placeholder/not implemented should have minimal options
    const placeholderReports = [
      'Revenue by Product/Service',
      'Feature Usage Analytics',
      'Support Ticket Analytics',
      'Estimate Pipeline Analytics',
      'Top Performing Products/Services',
      'New Clients',
      'Discounts Given',
      'Payroll Summary',
      'Gross Margin Report',
      'Payroll Cost as % of Revenue',
      'Expense Summary',
      'Work Order Status',
      'Employee Utilization',
      'Job Completion Rate',
      'Resource Allocation Report',
      'Overtime Report',
      'Churned Clients',
      'Top Clients by Revenue',
      'Client Retention Rate',
      'Client Feedback Report',
      'Notification Log',
      'Email Delivery',
      'Email Open Rate Report',
      'Notification Effectiveness Report',
      'Employee Performance',
      'Overtime by Employee',
      'Payroll Deductions Summary',
      'Stock Reorder Report',
      'Vendor Performance Report'
    ];

    for (const reportName of placeholderReports) {
      await queryInterface.sequelize.query(
        `UPDATE reports SET options = JSON_ARRAY('summary') WHERE name = ?`,
        {
          replacements: [reportName],
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove options column
    await queryInterface.removeColumn('reports', 'options');
  }
};
