'use strict';

const { faker } = require('@faker-js/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, get existing users to create payrolls for
    const users = await queryInterface.sequelize.query(
      'SELECT id, firstName, lastName, email FROM Users WHERE isActive = 1 ORDER BY id ASC',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log('No users found, skipping payroll seeding');
      return;
    }

    // Create payrolls for the last 12 months
    const payrolls = [];
    const payrollItems = [];
    let payrollId = 1;
    let payrollItemId = 1;

    // Define payroll statuses and their probabilities
    const statuses = [
      { status: 'draft', weight: 20 },
      { status: 'approved', weight: 30 },
      { status: 'paid', weight: 50 }
    ];

    // Weighted random status picker
    const getRandomStatus = () => {
      const totalWeight = statuses.reduce((sum, s) => sum + s.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (const statusObj of statuses) {
        random -= statusObj.weight;
        if (random <= 0) {
          return statusObj.status;
        }
      }
      return 'draft';
    };

    // Calculate payroll deductions
    const calculateDeductions = (grossPay) => {
      const federalTax = grossPay * 0.22; // 22% federal tax
      const stateTax = grossPay * 0.08; // 8% state tax
      const socialSecurity = grossPay * 0.062; // 6.2% social security
      const medicare = grossPay * 0.0145; // 1.45% medicare
      const insurance = Math.random() > 0.3 ? faker.number.float({ min: 150, max: 400 }) : 0; // 70% have insurance
      const retirement = Math.random() > 0.4 ? grossPay * 0.05 : 0; // 60% contribute to retirement
      
      return {
        federalTax: Math.round(federalTax * 100) / 100,
        stateTax: Math.round(stateTax * 100) / 100,
        socialSecurity: Math.round(socialSecurity * 100) / 100,
        medicare: Math.round(medicare * 100) / 100,
        insurance: Math.round(insurance * 100) / 100,
        retirement: Math.round(retirement * 100) / 100
      };
    };

    // Create payrolls for each month in the last 3 months (simplified for testing)
    for (let monthsAgo = 2; monthsAgo >= 0; monthsAgo--) {
      const payrollDate = new Date();
      payrollDate.setMonth(payrollDate.getMonth() - monthsAgo);
      payrollDate.setDate(1); // First of the month
      
      const startDate = new Date(payrollDate);
      const endDate = new Date(payrollDate.getFullYear(), payrollDate.getMonth() + 1, 0); // Last day of month
      
      // Create 1 payroll per month (simplified)
      const payrollsThisMonth = 1;
      
      for (let p = 0; p < payrollsThisMonth; p++) {
        const payrollStartDate = new Date(startDate);
        if (p === 1) payrollStartDate.setDate(15); // Mid-month payroll
        if (p === 2) payrollStartDate.setDate(22); // End-month payroll
        
        const payrollEndDate = new Date(payrollStartDate);
        payrollEndDate.setDate(payrollStartDate.getDate() + 13); // 2-week period
        
        const createdBy = users[faker.number.int({ min: 0, max: Math.min(2, users.length - 1) })]; // Use first few users as creators
        const status = getRandomStatus();
        
        // Include only first 5 users in each payroll (simplified)
        const employeesInPayroll = users.slice(0, Math.min(5, users.length));
        
        let totalGrossPay = 0;
        let totalDeductions = 0;
        let totalNetPay = 0;
        
        // Create payroll items for each employee
        employeesInPayroll.forEach(employee => {
          // Generate realistic work data
          const rate = faker.number.float({ min: 15, max: 75 }); // $15-$75/hour
          const hoursWorked = faker.number.float({ min: 40, max: 80 }); // 40-80 hours per pay period
          const overtimeHours = hoursWorked > 40 ? hoursWorked - 40 : 0;
          const regularHours = hoursWorked - overtimeHours;
          const overtimeRate = rate * 1.5; // Time and a half
          
          const regularPay = regularHours * rate;
          const overtimePay = overtimeHours * overtimeRate;
          const grossPay = regularPay + overtimePay;
          
          const deductions = calculateDeductions(grossPay);
          const totalEmployeeDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
          const netPay = grossPay - totalEmployeeDeductions;
          
          totalGrossPay += grossPay;
          totalDeductions += totalEmployeeDeductions;
          totalNetPay += netPay;
          
          // Create payroll item
          payrollItems.push({
            id: payrollItemId,
            payrollId: payrollId,
            employeeId: employee.id,
            rate: Math.round(rate * 100) / 100,
            overtimeRate: Math.round(overtimeRate * 100) / 100,
            regularHours: Math.round(regularHours * 100) / 100,
            overtimeHours: Math.round(overtimeHours * 100) / 100,
            totalHours: Math.round(hoursWorked * 100) / 100,
            grossPay: Math.round(grossPay * 100) / 100,
            deductions: Math.round(totalEmployeeDeductions * 100) / 100,
            netPay: Math.round(netPay * 100) / 100,
            paymentMethod: faker.helpers.arrayElement(['direct_deposit', 'check', 'cash']),
            isActive: true,
            creatorId: createdBy.id,
            createdAt: payrollStartDate,
            updatedAt: payrollStartDate
          });
          
          payrollItemId++;
        });
        
        // Create the payroll record
        payrolls.push({
          id: payrollId,
          startDate: payrollStartDate,
          endDate: payrollEndDate,
          status: status,
          totalGrossPay: Math.round(totalGrossPay * 100) / 100,
          totalDeductions: Math.round(totalDeductions * 100) / 100,
          totalNetPay: Math.round(totalNetPay * 100) / 100,
          processedDate: status === 'paid' ? 
            new Date(payrollEndDate.getTime() + faker.number.int({ min: 1, max: 7 }) * 24 * 60 * 60 * 1000) : null,
          approvedBy: (status === 'approved' || status === 'paid') ? 
            createdBy.id : null,
          approvedAt: (status === 'approved' || status === 'paid') ? 
            new Date(payrollEndDate.getTime() + faker.number.int({ min: 1, max: 5 }) * 24 * 60 * 60 * 1000) : null,
          notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
          isActive: true,
          creatorId: createdBy.id,
          createdAt: payrollStartDate,
          updatedAt: payrollStartDate
        });
        
        payrollId++;
      }
    }
    
    console.log(`Creating ${payrolls.length} payrolls with ${payrollItems.length} payroll items`);
    
    // Insert the data
    if (payrolls.length > 0) {
      await queryInterface.bulkInsert('Payrolls', payrolls);
    }
    
    if (payrollItems.length > 0) {
      await queryInterface.bulkInsert('PayrollItems', payrollItems);
    }
    
    console.log('Payroll data seeded successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove seeded data
    await queryInterface.bulkDelete('PayrollItems', null, {});
    await queryInterface.bulkDelete('Payrolls', null, {});
    console.log('Payroll seed data removed');
  }
};
