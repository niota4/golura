module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get reportTypes
    const types = await queryInterface.sequelize.query('SELECT id, name FROM reportTypes;', { type: Sequelize.QueryTypes.SELECT });
    const typeMap = {};
    types.forEach(t => { typeMap[t.name] = t.id; });
    await queryInterface.bulkInsert('reports', [
      // KPI
      { name: 'MRR/ARR', description: 'Monthly/Annual Recurring Revenue', typeId: typeMap['KPI'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Active Users', description: 'Active users in a period', typeId: typeMap['KPI'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Churn Rate', description: 'Client churn rate', typeId: typeMap['KPI'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Estimate-to-Invoice Conversion', description: 'Conversion rate from estimate to invoice', typeId: typeMap['KPI'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Average Deal Size', description: 'Average value of deals/estimates', typeId: typeMap['KPI'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Average Days to Payment', description: 'Average time from invoice to payment', typeId: typeMap['KPI'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Employee Utilization Rate', description: 'Percentage of employee hours billed vs. available', typeId: typeMap['KPI'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Estimate Approval Time', description: 'Average time from estimate creation to approval', typeId: typeMap['KPI'], data: null, createdAt: new Date(), updatedAt: new Date() },
      // Analytics
      { name: 'Revenue by Period', description: 'Revenue by month, quarter, or year', typeId: typeMap['Analytics'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Revenue by Client', description: 'Total revenue per client', typeId: typeMap['Analytics'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Revenue by Product/Service', description: 'Revenue by each line item or service', typeId: typeMap['Analytics'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Invoice Aging', description: 'Unpaid invoices grouped by overdue period', typeId: typeMap['Analytics'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Feature Usage Analytics', description: 'Usage statistics for features/modules', typeId: typeMap['Analytics'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Support Ticket Analytics', description: 'Support ticket volume and resolution', typeId: typeMap['Analytics'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Estimate Pipeline Analytics', description: 'Analytics on estimate pipeline stages', typeId: typeMap['Analytics'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Top Performing Products/Services', description: 'Most frequently sold products/services', typeId: typeMap['Analytics'], data: null, createdAt: new Date(), updatedAt: new Date() },
      // Summary
      { name: 'Client List with Activity', description: 'Clients with their activity', typeId: typeMap['Summary'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'New Clients', description: 'Clients acquired in a period', typeId: typeMap['Summary'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Discounts Given', description: 'All discounts applied', typeId: typeMap['Summary'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Client Summary Report', description: 'Summary of all clients', typeId: typeMap['Summary'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Estimate Summary Report', description: 'Summary of all estimates', typeId: typeMap['Summary'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Invoice Summary Report', description: 'Summary of all invoices', typeId: typeMap['Summary'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Work Order Summary', description: 'Summary of all work orders', typeId: typeMap['Summary'], data: null, createdAt: new Date(), updatedAt: new Date() },
      // Financial
      { name: 'Payroll Summary', description: 'Payroll runs by employee and period', typeId: typeMap['Financial'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gross Margin Report', description: 'Gross margin calculation', typeId: typeMap['Financial'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Payroll Cost as % of Revenue', description: 'Payroll cost as a percentage of revenue', typeId: typeMap['Financial'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Outstanding Receivables', description: 'Total value of unpaid invoices', typeId: typeMap['Financial'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Expense Summary', description: 'Summary of expenses', typeId: typeMap['Financial'], data: null, createdAt: new Date(), updatedAt: new Date() },
      // Operations
      { name: 'Event/Job Schedule', description: 'All scheduled jobs/events', typeId: typeMap['Operations'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Work Order Status', description: 'Work orders grouped by status', typeId: typeMap['Operations'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Employee Utilization', description: 'Employee hours and utilization', typeId: typeMap['Operations'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Job Completion Rate', description: 'Percentage of jobs completed on time', typeId: typeMap['Operations'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Resource Allocation Report', description: 'Resource allocation and utilization', typeId: typeMap['Operations'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Overtime Report', description: 'Employee overtime hours', typeId: typeMap['Operations'], data: null, createdAt: new Date(), updatedAt: new Date() },
      // Client
      { name: 'Churned Clients', description: 'Clients lost over a period', typeId: typeMap['Client'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Top Clients by Revenue', description: 'Clients generating the most revenue', typeId: typeMap['Client'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Client Retention Rate', description: 'Percentage of clients retained', typeId: typeMap['Client'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Client Feedback Report', description: 'Feedback and satisfaction scores', typeId: typeMap['Client'], data: null, createdAt: new Date(), updatedAt: new Date() },
      // Communication
      { name: 'Notification Log', description: 'All notifications sent', typeId: typeMap['Communication'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Email Delivery', description: 'All emails sent and status', typeId: typeMap['Communication'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Email Open Rate Report', description: 'Open rates for emails', typeId: typeMap['Communication'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Notification Effectiveness Report', description: 'Effectiveness of notifications', typeId: typeMap['Communication'], data: null, createdAt: new Date(), updatedAt: new Date() },
      // HR/Payroll
      { name: 'Employee Performance', description: 'Employee jobs, hours, payroll', typeId: typeMap['HR/Payroll'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Overtime by Employee', description: 'Overtime hours by employee', typeId: typeMap['HR/Payroll'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Payroll Deductions Summary', description: 'Summary of payroll deductions', typeId: typeMap['HR/Payroll'], data: null, createdAt: new Date(), updatedAt: new Date() },
      // Inventory
      { name: 'Inventory Usage', description: 'Inventory usage and vendor info', typeId: typeMap['Inventory'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Stock Reorder Report', description: 'Items that need to be reordered', typeId: typeMap['Inventory'], data: null, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Vendor Performance Report', description: 'Performance of vendors', typeId: typeMap['Inventory'], data: null, createdAt: new Date(), updatedAt: new Date() },
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('reports', null, {});
  }
};
