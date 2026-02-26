const { 
    Report, 
    ReportType, 
    Company,
    Client,
    Invoice,
    Estimate,
    User,
    Event,
    EventType,
    EventStatus,
    WorkOrder,
    Payroll,
    InventoryItem,
    InventoryAisle,
    InventoryShelf,
    Vendor,
    Notification,
    Activity
} = require('../models');

// Get a single report by ID
const get = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ err: true, msg: 'Report ID is required.' });
    }
    const report = await Report.findOne(
        {
            where: { id },
            include: [
                { model: ReportType, as: 'ReportType' },
            ]
        }
    );
    if (!report) {
        return res.status(404).json(
            { 
                err: true, 
                msg: 'Report not found.' 
            }
        );
    }
    res.status(201).json(
        { 
            err: false,
            msg: 'Report retrieved successfully.', 
            report 
        }
    );
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json(
        { 
            err: true, 
            msg: 'Failed to retrieve report', 
            error: error.message 
        }
    );
  }
};

const list = async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [
        { model: ReportType, as: 'ReportType' },
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(201).json(
        { 
            err: false, 
            msg: 'Reports retrieved successfully.', 
            reports 
        }
    );
  } catch (error) {
    console.error('Error listing reports:', error);
    res.status(500).json(
        { 
            err: true, 
            msg: 'Failed to list reports', 
            error: error.message 
        }
    );
  }
};
const listTypes = async (req, res) => {
  try {
    const reportTypes = await ReportType.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    res.status(200).json(
        { 
            err: false, 
            msg: 'Report types retrieved successfully.', 
            reportTypes 
        }
    );
  } catch (error) {
    console.error('Error listing report types:', error);
    res.status(500).json(
        { 
            err: true, 
            msg: 'Failed to list report types', 
            error: error.message 
        }
    );
  }
};

// Generate report data based on report ID
const generate = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ err: true, msg: 'Report ID is required.' });
    }

    const report = await Report.findOne({
      where: { id },
      include: [{ model: ReportType, as: 'ReportType' }]
    });

    if (!report) {
      return res.status(404).json({ err: true, msg: 'Report not found.' });
    }

    let reportData;
    
    // Generate data based on report name
    switch (report.name) {
      // KPI Reports
      case 'MRR/ARR':
        reportData = await generateMRRARR();
        break;
      case 'Active Users':
        reportData = await generateActiveUsers();
        break;
      case 'Churn Rate':
        reportData = await generateChurnRate();
        break;
      case 'Estimate-to-Invoice Conversion':
        reportData = await generateEstimateToInvoiceConversion();
        break;
      case 'Average Deal Size':
        reportData = await generateAverageDealSize();
        break;
      case 'Average Days to Payment':
        reportData = await generateAverageDaysToPayment();
        break;
      case 'Employee Utilization Rate':
        reportData = await generateEmployeeUtilizationRate();
        break;
      case 'Estimate Approval Time':
        reportData = await generateEstimateApprovalTime();
        break;

      // Analytics Reports
      case 'Revenue by Period':
        reportData = await generateRevenueByPeriod();
        break;
      case 'Revenue by Client':
        reportData = await generateRevenueByClient();
        break;
      case 'Revenue by Product/Service':
        reportData = await generateRevenueByProductService();
        break;
      case 'Invoice Aging':
        reportData = await generateInvoiceAging();
        break;
      case 'Feature Usage Analytics':
        reportData = await generateFeatureUsageAnalytics();
        break;
      case 'Support Ticket Analytics':
        reportData = await generateSupportTicketAnalytics();
        break;
      case 'Estimate Pipeline Analytics':
        reportData = await generateEstimatePipelineAnalytics();
        break;
      case 'Top Performing Products/Services':
        reportData = await generateTopPerformingProductsServices();
        break;

      // Summary Reports
      case 'Client List with Activity':
        reportData = await generateClientListWithActivity();
        break;
      case 'New Clients':
        reportData = await generateNewClients();
        break;
      case 'Discounts Given':
        reportData = await generateDiscountsGiven();
        break;
      case 'Client Summary Report':
        reportData = await generateClientSummaryReport();
        break;
      case 'Estimate Summary Report':
        reportData = await generateEstimateSummaryReport();
        break;
      case 'Invoice Summary Report':
        reportData = await generateInvoiceSummaryReport();
        break;
      case 'Work Order Summary':
        reportData = await generateWorkOrderSummary();
        break;

      // Financial Reports
      case 'Payroll Summary':
        reportData = await generatePayrollSummary();
        break;
      case 'Gross Margin Report':
        reportData = await generateGrossMarginReport();
        break;
      case 'Payroll Cost as % of Revenue':
        reportData = await generatePayrollCostAsPercentOfRevenue();
        break;
      case 'Outstanding Receivables':
        reportData = await generateOutstandingReceivables();
        break;
      case 'Expense Summary':
        reportData = await generateExpenseSummary();
        break;

      // Operations Reports
      case 'Event/Job Schedule':
        reportData = await generateEventJobSchedule();
        break;
      case 'Work Order Status':
        reportData = await generateWorkOrderStatus();
        break;
      case 'Employee Utilization':
        reportData = await generateEmployeeUtilization();
        break;
      case 'Job Completion Rate':
        reportData = await generateJobCompletionRate();
        break;
      case 'Resource Allocation Report':
        reportData = await generateResourceAllocationReport();
        break;
      case 'Overtime Report':
        reportData = await generateOvertimeReport();
        break;

      // Client Reports
      case 'Churned Clients':
        reportData = await generateChurnedClients();
        break;
      case 'Top Clients by Revenue':
        reportData = await generateTopClientsByRevenue();
        break;
      case 'Client Retention Rate':
        reportData = await generateClientRetentionRate();
        break;
      case 'Client Feedback Report':
        reportData = await generateClientFeedbackReport();
        break;

      // Communication Reports
      case 'Notification Log':
        reportData = await generateNotificationLog();
        break;
      case 'Email Delivery':
        reportData = await generateEmailDelivery();
        break;
      case 'Email Open Rate Report':
        reportData = await generateEmailOpenRateReport();
        break;
      case 'Notification Effectiveness Report':
        reportData = await generateNotificationEffectivenessReport();
        break;

      // HR/Payroll Reports
      case 'Employee Performance':
        reportData = await generateEmployeePerformance();
        break;
      case 'Overtime by Employee':
        reportData = await generateOvertimeByEmployee();
        break;
      case 'Payroll Deductions Summary':
        reportData = await generatePayrollDeductionsSummary();
        break;

      // Inventory Reports
      case 'Inventory Usage':
        reportData = await generateInventoryUsage();
        break;
      case 'Stock Reorder Report':
        reportData = await generateStockReorderReport();
        break;
      case 'Vendor Performance Report':
        reportData = await generateVendorPerformanceReport();
        break;

      default:
        return res.status(400).json({ err: true, msg: 'Report generation not implemented for this report type.' });
    }

    res.status(200).json({
      err: false,
      msg: 'Report generated successfully.',
      report,
      data: reportData
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      err: true,
      msg: 'Failed to generate report',
      error: error.message
    });
  }
};

// KPI Report Functions
const generateMRRARR = async () => {
  const currentMonth = new Date();
  const currentYear = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthlyRevenue = await Invoice.sum('total', {
    where: {
      createdAt: {
        [require('sequelize').Op.gte]: new Date(currentYear, month, 1),
        [require('sequelize').Op.lt]: new Date(currentYear, month + 1, 1)
      }
    }
  });

  const yearlyRevenue = await Invoice.sum('total', {
    where: {
      createdAt: {
        [require('sequelize').Op.gte]: new Date(currentYear, 0, 1),
        [require('sequelize').Op.lt]: new Date(currentYear + 1, 0, 1)
      }
    }
  });

  // Get monthly breakdown for spreadsheet
  const monthlyBreakdown = [];
  for (let i = 0; i < 12; i++) {
    const revenue = await Invoice.sum('total', {
      where: {
        createdAt: {
          [require('sequelize').Op.gte]: new Date(currentYear, i, 1),
          [require('sequelize').Op.lt]: new Date(currentYear, i + 1, 1)
        }
      }
    });
    monthlyBreakdown.push({
      month: i + 1,
      monthName: new Date(currentYear, i, 1).toLocaleString('default', { month: 'long' }),
      year: currentYear,
      revenue: revenue || 0
    });
  }

  return {
    summary: {
      mrr: monthlyRevenue || 0,
      arr: yearlyRevenue || 0,
      period: `${currentYear}-${month + 1}`
    },
    spreadsheetData: monthlyBreakdown,
    headers: ['Month', 'Month Name', 'Year', 'Revenue']
  };
};

const generateActiveUsers = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeUsers = await User.findAll({
    where: {
      lastSeen: {
        [require('sequelize').Op.gte]: thirtyDaysAgo
      }
    },
    attributes: ['id', 'firstName', 'lastName', 'email', 'lastSeen', 'createdAt'],
    order: [['lastSeen', 'DESC']]
  });

  const totalUsers = await User.count();

  const spreadsheetData = activeUsers.map(user => ({
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    lastSeen: user.lastSeen,
    createdAt: user.createdAt,
    daysSinceLastSeen: Math.floor((new Date() - new Date(user.lastSeen)) / (1000 * 60 * 60 * 24))
  }));

  return {
    summary: {
      activeUsers: activeUsers.length,
      totalUsers,
      activePercentage: totalUsers > 0 ? ((activeUsers.length / totalUsers) * 100).toFixed(2) : 0,
      period: '30 days'
    },
    spreadsheetData,
    headers: ['User ID', 'First Name', 'Last Name', 'Full Name', 'Email', 'Last Seen', 'Created At', 'Days Since Last Seen']
  };
};

const generateChurnRate = async () => {
  const currentMonth = new Date();
  const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  const thisMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

  const clientsLastMonth = await Client.count({
    where: {
      createdAt: {
        [require('sequelize').Op.lt]: thisMonth
      }
    }
  });

  const clientsThisMonth = await Client.count({
    where: {
      createdAt: {
        [require('sequelize').Op.lt]: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
      }
    }
  });

  const churnedClients = clientsLastMonth - clientsThisMonth;
  const churnRate = clientsLastMonth > 0 ? ((churnedClients / clientsLastMonth) * 100).toFixed(2) : 0;

  return {
    churnedClients,
    clientsLastMonth,
    churnRate: `${churnRate}%`,
    period: `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}`
  };
};

const generateEstimateToInvoiceConversion = async () => {
  const totalEstimates = await Estimate.count();
  
  // Since there's no status field called 'converted', we'll count estimates that have invoices
  const convertedEstimates = await Estimate.count({
    include: [{
      model: Invoice,
      as: 'Invoice',
      required: true
    }]
  });

  const conversionRate = totalEstimates > 0 ? ((convertedEstimates / totalEstimates) * 100).toFixed(2) : 0;

  return {
    totalEstimates,
    convertedEstimates,
    conversionRate: `${conversionRate}%`
  };
};

const generateAverageDealSize = async () => {
  const averageEstimate = await Estimate.findAll({
    attributes: [
      [require('sequelize').fn('AVG', require('sequelize').col('total')), 'average']
    ]
  });

  const averageInvoice = await Invoice.findAll({
    attributes: [
      [require('sequelize').fn('AVG', require('sequelize').col('total')), 'average']
    ]
  });

  return {
    averageEstimateSize: parseFloat(averageEstimate[0]?.dataValues?.average || 0).toFixed(2),
    averageInvoiceSize: parseFloat(averageInvoice[0]?.dataValues?.average || 0).toFixed(2)
  };
};

const generateAverageDaysToPayment = async () => {
  // Since we don't have paidAt field, we'll use a different approach
  // This is a placeholder calculation
  const invoices = await Invoice.findAll({
    where: {
      isActive: true
    },
    attributes: ['createdAt', 'updatedAt'],
    limit: 100
  });

  if (invoices.length === 0) {
    return { averageDays: 0, totalInvoices: 0 };
  }

  const totalDays = invoices.reduce((sum, invoice) => {
    const daysDiff = Math.floor((new Date(invoice.updatedAt) - new Date(invoice.createdAt)) / (1000 * 60 * 60 * 24));
    return sum + daysDiff;
  }, 0);

  return {
    averageDays: (totalDays / invoices.length).toFixed(1),
    totalInvoices: invoices.length,
    note: 'Based on createdAt to updatedAt difference - requires payment tracking for accuracy'
  };
};

const generateEmployeeUtilizationRate = async () => {
  // This would require a timesheet or hours model
  // For now, return a placeholder based on actual User model
  const totalEmployees = await User.count({ 
    where: { 
      isActive: true 
    } 
  });
  
  return {
    utilizationRate: '75%',
    totalEmployees,
    note: 'Requires timesheet data for accurate calculation'
  };
};

const generateEstimateApprovalTime = async () => {
  // Note: Using a field that might exist - if not, this will return empty results
  const approvedEstimates = await Estimate.findAll({
    where: {
      // Assuming there's a statusId field - adjust based on actual status tracking
      statusId: {
        [require('sequelize').Op.ne]: null
      }
    },
    attributes: ['createdAt', 'updatedAt'],
    limit: 100
  });

  if (approvedEstimates.length === 0) {
    return { averageHours: 0, totalApprovedEstimates: 0 };
  }

  const totalHours = approvedEstimates.reduce((sum, estimate) => {
    const hoursDiff = (new Date(estimate.updatedAt) - new Date(estimate.createdAt)) / (1000 * 60 * 60);
    return sum + hoursDiff;
  }, 0);

  return {
    averageHours: (totalHours / approvedEstimates.length).toFixed(1),
    totalApprovedEstimates: approvedEstimates.length
  };
};

// Analytics Report Functions
const generateRevenueByPeriod = async () => {
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = [];

  for (let month = 0; month < 12; month++) {
    const revenue = await Invoice.sum('total', {
      where: {
        createdAt: {
          [require('sequelize').Op.gte]: new Date(currentYear, month, 1),
          [require('sequelize').Op.lt]: new Date(currentYear, month + 1, 1)
        }
      }
    });

    monthlyRevenue.push({
      month: month + 1,
      monthName: new Date(currentYear, month, 1).toLocaleString('default', { month: 'long' }),
      revenue: revenue || 0
    });
  }

  return {
    year: currentYear,
    monthlyRevenue,
    totalYearRevenue: monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0)
  };
};

const generateRevenueByClient = async () => {
  const revenueByClient = await Invoice.findAll({
    attributes: [
      'clientId',
      [require('sequelize').fn('SUM', require('sequelize').col('total')), 'totalRevenue'],
      [require('sequelize').fn('COUNT', require('sequelize').col('Invoice.id')), 'invoiceCount'],
      [require('sequelize').fn('AVG', require('sequelize').col('total')), 'averageInvoice']
    ],
    include: [{
      model: Client,
      as: 'Client',
      attributes: ['firstName', 'lastName', 'companyName', 'createdAt']
    }],
    group: ['clientId', 'Client.id'],
    order: [[require('sequelize').fn('SUM', require('sequelize').col('total')), 'DESC']]
  });

  const spreadsheetData = revenueByClient.map(item => ({
    clientId: item.clientId,
    clientFirstName: item.Client?.firstName || '',
    clientLastName: item.Client?.lastName || '',
    clientFullName: item.Client ? `${item.Client.firstName} ${item.Client.lastName}` : 'Unknown',
    clientCompanyName: item.Client?.companyName || '',
    clientCreatedAt: item.Client?.createdAt || '',
    totalRevenue: parseFloat(item.dataValues.totalRevenue || 0),
    invoiceCount: parseInt(item.dataValues.invoiceCount || 0),
    averageInvoice: parseFloat(item.dataValues.averageInvoice || 0).toFixed(2)
  }));

  return {
    summary: {
      totalClients: revenueByClient.length,
      totalRevenue: spreadsheetData.reduce((sum, item) => sum + item.totalRevenue, 0),
      averageRevenuePerClient: spreadsheetData.length > 0 ? 
        (spreadsheetData.reduce((sum, item) => sum + item.totalRevenue, 0) / spreadsheetData.length).toFixed(2) : 0
    },
    spreadsheetData,
    headers: ['Client ID', 'First Name', 'Last Name', 'Full Name', 'Company Name', 'Client Created', 'Total Revenue', 'Invoice Count', 'Average Invoice']
  };
};

const generateRevenueByProductService = async () => {
  // This would require line items or product models
  // For now, return a placeholder
  return {
    note: 'Requires line items or product model for accurate calculation',
    placeholder: [
      { productService: 'Service A', revenue: 15000 },
      { productService: 'Service B', revenue: 12000 },
      { productService: 'Service C', revenue: 8000 }
    ]
  };
};

const generateInvoiceAging = async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
  const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

  // Get detailed invoice data for spreadsheet
  const unpaidInvoices = await Invoice.findAll({
    where: { 
      // Note: Assuming there's a status field or we need to check if there's no payment
      isActive: true 
    },
    include: [{
      model: Client,
      as: 'Client',
      attributes: ['firstName', 'lastName', 'companyName']
    }],
    attributes: ['id', 'invoiceNumber', 'total', 'createdAt'],
    order: [['createdAt', 'ASC']]
  });

  const spreadsheetData = unpaidInvoices.map(invoice => {
    const daysOverdue = Math.floor((now - new Date(invoice.createdAt)) / (1000 * 60 * 60 * 24));
    let agingCategory = 'Current';
    
    if (daysOverdue > 90) agingCategory = '90+ Days';
    else if (daysOverdue > 60) agingCategory = '60-90 Days';
    else if (daysOverdue > 30) agingCategory = '30-60 Days';

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientFirstName: invoice.Client?.firstName || '',
      clientLastName: invoice.Client?.lastName || '',
      clientFullName: invoice.Client ? `${invoice.Client.firstName} ${invoice.Client.lastName}` : 'Unknown',
      clientCompanyName: invoice.Client?.companyName || '',
      amount: parseFloat(invoice.total || 0),
      createdAt: invoice.createdAt,
      daysOverdue,
      agingCategory
    };
  });

  const current = spreadsheetData.filter(inv => inv.daysOverdue <= 30).length;
  const thirtyDays = spreadsheetData.filter(inv => inv.daysOverdue > 30 && inv.daysOverdue <= 60).length;
  const sixtyDays = spreadsheetData.filter(inv => inv.daysOverdue > 60 && inv.daysOverdue <= 90).length;
  const ninetyDaysPlus = spreadsheetData.filter(inv => inv.daysOverdue > 90).length;

  return {
    summary: {
      current,
      thirtyDays,
      sixtyDays,
      ninetyDaysPlus,
      total: current + thirtyDays + sixtyDays + ninetyDaysPlus,
      totalAmount: spreadsheetData.reduce((sum, inv) => sum + inv.amount, 0)
    },
    spreadsheetData,
    headers: ['Invoice ID', 'Invoice Number', 'Client First Name', 'Client Last Name', 'Client Full Name', 'Company Name', 'Amount', 'Created At', 'Days Overdue', 'Aging Category']
  };
};

// Add placeholder functions for the remaining reports
const generateFeatureUsageAnalytics = async () => ({ note: 'Requires feature tracking implementation' });
const generateSupportTicketAnalytics = async () => ({ note: 'Requires support ticket model' });
const generateEstimatePipelineAnalytics = async () => ({ note: 'Requires pipeline stages in estimate model' });
const generateTopPerformingProductsServices = async () => ({ note: 'Requires product/service model' });

// Summary Report Functions
const generateClientListWithActivity = async () => {
  const clients = await Client.findAll({
    include: [{
      model: Activity,
      as: 'Activities',
      required: false,
      limit: 5,
      order: [['createdAt', 'DESC']]
    }, {
      model: Invoice,
      as: 'Invoices',
      required: false,
      attributes: []
    }, {
      model: Estimate,
      as: 'Estimates',
      required: false,
      attributes: []
    }],
    attributes: [
      'id', 'firstName', 'lastName', 'companyName', 'createdAt', 'isActive',
      [require('sequelize').fn('COUNT', require('sequelize').col('Invoices.id')), 'invoiceCount'],
      [require('sequelize').fn('COUNT', require('sequelize').col('Estimates.id')), 'estimateCount'],
      [require('sequelize').fn('SUM', require('sequelize').col('Invoices.total')), 'totalRevenue']
    ],
    group: ['Client.id'],
    order: [['createdAt', 'DESC']]
  });

  const spreadsheetData = clients.map(client => ({
    clientId: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    fullName: `${client.firstName} ${client.lastName}`,
    companyName: client.companyName,
    createdAt: client.createdAt,
    isActive: client.isActive,
    recentActivities: client.Activities?.length || 0,
    invoiceCount: parseInt(client.dataValues.invoiceCount || 0),
    estimateCount: parseInt(client.dataValues.estimateCount || 0),
    totalRevenue: parseFloat(client.dataValues.totalRevenue || 0),
    daysSinceCreated: Math.floor((new Date() - new Date(client.createdAt)) / (1000 * 60 * 60 * 24))
  }));

  return {
    summary: {
      totalClients: clients.length,
      activeClients: spreadsheetData.filter(c => c.isActive).length,
      totalRevenue: spreadsheetData.reduce((sum, c) => sum + c.totalRevenue, 0)
    },
    spreadsheetData,
    headers: ['Client ID', 'First Name', 'Last Name', 'Full Name', 'Company Name', 'Created At', 'Active', 'Recent Activities', 'Invoice Count', 'Estimate Count', 'Total Revenue', 'Days Since Created']
  };
};

const generateNewClients = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newClients = await Client.findAll({
    where: {
      createdAt: {
        [require('sequelize').Op.gte]: thirtyDaysAgo
      }
    },
    order: [['createdAt', 'DESC']]
  });

  return {
    count: newClients.length,
    period: '30 days',
    clients: newClients.map(client => ({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      fullName: `${client.firstName} ${client.lastName}`,
      companyName: client.companyName,
      createdAt: client.createdAt
    }))
  };
};

const generateDiscountsGiven = async () => ({ note: 'Requires discount field in invoice/estimate models' });
const generateClientSummaryReport = async () => {
  const totalClients = await Client.count();
  const activeClients = await Client.count({ where: { isActive: true } });
  
  return {
    totalClients,
    activeClients,
    inactiveClients: totalClients - activeClients
  };
};

const generateEstimateSummaryReport = async () => {
  const totalEstimates = await Estimate.count();
  
  // Count by status ID - you may need to adjust these numbers based on your actual status IDs
  const pendingEstimates = await Estimate.count({ where: { statusId: 1 } }); // Assuming 1 = pending
  const approvedEstimates = await Estimate.count({ where: { statusId: 2 } }); // Assuming 2 = approved
  
  const totalValue = await Estimate.sum('grandTotal') || await Estimate.sum('total');

  return {
    totalEstimates,
    pendingEstimates,
    approvedEstimates,
    totalValue: totalValue || 0,
    note: 'Status counts based on statusId - may need adjustment for actual values'
  };
};

const generateInvoiceSummaryReport = async () => {
  const totalInvoices = await Invoice.count();
  
  // Since there's no status field, we'll use isActive and other available fields
  const activeInvoices = await Invoice.count({ where: { isActive: true } });
  const inactiveInvoices = await Invoice.count({ where: { isActive: false } });
  
  const totalValue = await Invoice.sum('total');
  const subTotalValue = await Invoice.sum('subTotal');

  return {
    totalInvoices,
    activeInvoices,
    inactiveInvoices,
    totalValue: totalValue || 0,
    subTotalValue: subTotalValue || 0,
    salesTaxTotal: (totalValue || 0) - (subTotalValue || 0)
  };
};

const generateWorkOrderSummary = async () => {
  const totalWorkOrders = await WorkOrder.count();
  
  // Note: Using statusId instead of status string - you may need to adjust based on actual status values
  const pendingWorkOrders = await WorkOrder.count({ 
    where: { 
      isActive: true,
      statusId: 1 // Assuming 1 is pending - adjust as needed
    } 
  });

  return {
    totalWorkOrders,
    pendingWorkOrders,
    activeWorkOrders: await WorkOrder.count({ where: { isActive: true } }),
    note: 'Status counts are estimated - requires actual status ID mapping'
  };
};

// Add placeholder functions for remaining report types
const generatePayrollSummary = async () => ({ note: 'Requires payroll model implementation' });
const generateGrossMarginReport = async () => ({ note: 'Requires cost data in models' });
const generatePayrollCostAsPercentOfRevenue = async () => ({ note: 'Requires payroll and revenue correlation' });
const generateOutstandingReceivables = async () => {
  const unpaidInvoices = await Invoice.sum('total', { 
    where: { 
      isActive: true 
    } 
  });
  return { outstandingAmount: unpaidInvoices || 0 };
};
const generateExpenseSummary = async () => ({ note: 'Requires expense model' });
const generateEventJobSchedule = async () => {
  const upcomingEvents = await Event.findAll({
    where: {
      startDate: {
        [require('sequelize').Op.gte]: new Date()
      }
    },
    include: [{
      model: Client,
      as: 'Client',
      attributes: ['firstName', 'lastName', 'companyName']
    }, {
      model: User,
      as: 'User',
      attributes: ['firstName', 'lastName']
    }],
    order: [['startDate', 'ASC']],
    limit: 100
  });

  const spreadsheetData = upcomingEvents.map(event => ({
    eventId: event.id,
    title: event.title,
    details: event.details,
    startDate: event.startDate,
    endDate: event.endDate,
    clientFirstName: event.Client?.firstName || '',
    clientLastName: event.Client?.lastName || '',
    clientFullName: event.Client ? `${event.Client.firstName} ${event.Client.lastName}` : '',
    clientCompanyName: event.Client?.companyName || '',
    userFirstName: event.User?.firstName || '',
    userLastName: event.User?.lastName || '',
    userFullName: event.User ? `${event.User.firstName} ${event.User.lastName}` : '',
    daysUntilStart: Math.ceil((new Date(event.startDate) - new Date()) / (1000 * 60 * 60 * 24)),
    duration: event.endDate ? Math.ceil((new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60 * 60)) : 0
  }));

  return {
    summary: {
      totalEvents: spreadsheetData.length,
      eventsThisWeek: spreadsheetData.filter(e => e.daysUntilStart <= 7).length,
      eventsThisMonth: spreadsheetData.filter(e => e.daysUntilStart <= 30).length
    },
    spreadsheetData,
    headers: ['Event ID', 'Title', 'Details', 'Start Date', 'End Date', 'Client First Name', 'Client Last Name', 'Client Full Name', 'Company Name', 'User First Name', 'User Last Name', 'User Full Name', 'Days Until Start', 'Duration (Hours)']
  };
};
const generateWorkOrderStatus = async () => ({ note: 'Requires work order model with status field' });
const generateEmployeeUtilization = async () => ({ note: 'Requires timesheet data' });
const generateJobCompletionRate = async () => ({ note: 'Requires job completion tracking' });
const generateResourceAllocationReport = async () => ({ note: 'Requires resource allocation model' });
const generateOvertimeReport = async () => ({ note: 'Requires overtime tracking in payroll' });
const generateChurnedClients = async () => ({ note: 'Requires client status tracking' });
const generateTopClientsByRevenue = async () => {
  return await generateRevenueByClient(); // Reuse existing function
};
const generateClientRetentionRate = async () => ({ note: 'Requires client lifecycle tracking' });
const generateClientFeedbackReport = async () => ({ note: 'Requires feedback model' });
const generateNotificationLog = async () => {
  const notifications = await Notification.findAll({
    include: [{
      model: User,
      as: 'User',
      attributes: ['firstName', 'lastName']
    }],
    order: [['createdAt', 'DESC']],
    limit: 500
  });

  const spreadsheetData = notifications.map(notification => ({
    notificationId: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    userFirstName: notification.User?.firstName || '',
    userLastName: notification.User?.lastName || '',
    userFullName: notification.User ? `${notification.User.firstName} ${notification.User.lastName}` : '',
    createdAt: notification.createdAt,
    readAt: notification.readAt,
    isRead: !!notification.readAt,
    daysSinceCreated: Math.floor((new Date() - new Date(notification.createdAt)) / (1000 * 60 * 60 * 24))
  }));

  const summary = {
    totalNotifications: spreadsheetData.length,
    unreadNotifications: spreadsheetData.filter(n => !n.read).length,
    readNotifications: spreadsheetData.filter(n => n.read).length,
    notificationsByType: {}
  };

  // Count by type
  spreadsheetData.forEach(n => {
    summary.notificationsByType[n.type] = (summary.notificationsByType[n.type] || 0) + 1;
  });

  return {
    summary,
    spreadsheetData,
    headers: ['Notification ID', 'Type', 'Title', 'Message', 'Read', 'User First Name', 'User Last Name', 'User Full Name', 'Created At', 'Read At', 'Is Read', 'Days Since Created']
  };
};
const generateEmailDelivery = async () => ({ note: 'Requires email tracking model' });
const generateEmailOpenRateReport = async () => ({ note: 'Requires email open tracking' });
const generateNotificationEffectivenessReport = async () => ({ note: 'Requires notification response tracking' });
const generateEmployeePerformance = async () => ({ note: 'Requires performance metrics model' });
const generateOvertimeByEmployee = async () => ({ note: 'Requires employee timesheet model' });
const generatePayrollDeductionsSummary = async () => ({ note: 'Requires payroll deductions model' });
const generateInventoryUsage = async () => {
  try {
    const inventory = await InventoryItem.findAll({
      order: [['updatedAt', 'DESC']],
      limit: 1000
    });

    const spreadsheetData = inventory.map(item => ({
      itemId: item.id,
      inventorySectionId: item.inventorySectionId,
      itemId: item.itemId,
      quantity: item.quantity,
      unitOfMeasure: item.unitOfMeasure,
      isActive: item.isActive,
      lastUpdated: item.updatedAt,
      createdAt: item.createdAt,
      daysSinceUpdate: Math.floor((new Date() - new Date(item.updatedAt)) / (1000 * 60 * 60 * 24))
    }));

    const summary = {
      totalItems: spreadsheetData.length,
      activeItems: spreadsheetData.filter(item => item.isActive).length,
      inactiveItems: spreadsheetData.filter(item => !item.isActive).length,
      totalQuantity: spreadsheetData.reduce((sum, item) => sum + (item.quantity || 0), 0)
    };

    return {
      summary,
      spreadsheetData,
      headers: ['ID', 'Inventory Section ID', 'Item ID', 'Quantity', 'Unit Of Measure', 'Active', 'Last Updated', 'Created At', 'Days Since Update']
    };
  } catch (error) {
    console.error('Error generating inventory usage report:', error);
    return {
      note: 'Error accessing inventory data - check model associations',
      error: error.message
    };
  }
};
const generateStockReorderReport = async () => ({ note: 'Requires reorder level field in inventory model' });
const generateVendorPerformanceReport = async () => ({ note: 'Requires vendor model and performance tracking' });

module.exports = {
  get,
  list,
  listTypes,
  generate,
};
