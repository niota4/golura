'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, get existing users to create payrolls for
    const users = await queryInterface.sequelize.query(
      'SELECT id, firstName, lastName, email FROM Users WHERE isActive = 1 ORDER BY id ASC LIMIT 10',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log('No users found, skipping payroll seeding');
      return;
    }

    console.log(`Found ${users.length} users for payroll seeding`);

    // Create sample payrolls for the last 3 months
    const now = new Date();
    const payrolls = [];
    const payrollItems = [];

    for (let monthsAgo = 2; monthsAgo >= 0; monthsAgo--) {
      const payrollDate = new Date();
      payrollDate.setMonth(payrollDate.getMonth() - monthsAgo);
      payrollDate.setDate(1); // First of the month
      
      const startDate = new Date(payrollDate);
      const endDate = new Date(payrollDate.getFullYear(), payrollDate.getMonth() + 1, 0); // Last day of month
      
      // Calculate totals for this payroll
      let totalGrossPay = 0;
      let totalDeductions = 0;
      let totalNetPay = 0;
      
      // Process each user for this payroll
      const employeesInPayroll = users.slice(0, 5); // First 5 users
      
      employeesInPayroll.forEach((employee, index) => {
        const rate = 20 + (index * 5); // $20, $25, $30, etc.
        const hoursWorked = 40 + (Math.random() * 20); // 40-60 hours
        const grossPay = rate * hoursWorked;
        const deductions = grossPay * 0.25; // 25% deductions
        const netPay = grossPay - deductions;
        
        totalGrossPay += grossPay;
        totalDeductions += deductions;
        totalNetPay += netPay;
        
        payrollItems.push([
          null, // id (auto-increment)
          `${monthsAgo + 1}`, // payrollId (will be 1, 2, 3)
          employee.id, // employeeId
          Math.round(hoursWorked * 100) / 100, // totalHours
          Math.round(grossPay * 100) / 100, // grossPay
          Math.round(deductions * 100) / 100, // deductions
          Math.round(netPay * 100) / 100, // netPay
          'direct_deposit', // paymentMethod
          Math.round(Math.min(hoursWorked, 40) * 100) / 100, // regularHours
          Math.round(Math.max(0, hoursWorked - 40) * 100) / 100, // overtimeHours
          rate, // rate
          rate * 1.5, // overtimeRate
          1, // isActive
          null, // notes
          users[0].id, // creatorId
          startDate.toISOString().slice(0, 19).replace('T', ' '), // createdAt
          startDate.toISOString().slice(0, 19).replace('T', ' ')  // updatedAt
        ]);
      });
      
      // Create the payroll record
      payrolls.push([
        monthsAgo + 1, // id
        startDate.toISOString().slice(0, 19).replace('T', ' '), // startDate
        endDate.toISOString().slice(0, 19).replace('T', ' '), // endDate
        null, // processedDate
        monthsAgo === 0 ? 'draft' : 'paid', // status (current month = draft, others = paid)
        Math.round(totalGrossPay * 100) / 100, // totalGrossPay
        Math.round(totalDeductions * 100) / 100, // totalDeductions
        Math.round(totalNetPay * 100) / 100, // totalNetPay
        1, // isActive
        `Payroll for ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, // notes
        users[0].id, // creatorId
        users[0].id, // approvedBy
        startDate.toISOString().slice(0, 19).replace('T', ' '), // approvedAt
        startDate.toISOString().slice(0, 19).replace('T', ' '), // createdAt
        startDate.toISOString().slice(0, 19).replace('T', ' ')  // updatedAt
      ]);
    }
    
    console.log(`Creating ${payrolls.length} payrolls with ${payrollItems.length} payroll items`);
    
    // Insert payrolls using raw SQL
    if (payrolls.length > 0) {
      const payrollValues = payrolls.map(p => `(${p.map(v => v === null ? 'NULL' : `'${v}'`).join(', ')})`).join(', ');
      await queryInterface.sequelize.query(`
        INSERT INTO Payrolls (id, startDate, endDate, processedDate, status, totalGrossPay, totalDeductions, totalNetPay, isActive, notes, creatorId, approvedBy, approvedAt, createdAt, updatedAt) 
        VALUES ${payrollValues}
      `);
    }
    
    // Insert payroll items using raw SQL
    if (payrollItems.length > 0) {
      const itemValues = payrollItems.map(item => `(${item.map(v => v === null ? 'NULL' : `'${v}'`).join(', ')})`).join(', ');
      await queryInterface.sequelize.query(`
        INSERT INTO PayrollItems (id, payrollId, employeeId, totalHours, grossPay, deductions, netPay, paymentMethod, regularHours, overtimeHours, rate, overtimeRate, isActive, notes, creatorId, createdAt, updatedAt) 
        VALUES ${itemValues}
      `);
    }
    
    console.log('Payroll data seeded successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove seeded data
    await queryInterface.sequelize.query('DELETE FROM PayrollItems');
    await queryInterface.sequelize.query('DELETE FROM Payrolls');
    console.log('Payroll seed data removed');
  }
};
