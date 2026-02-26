"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'payrollDefaultPayPeriod', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('companies', 'payrollStartDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('companies', 'payrollOvertimeThreshold', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('companies', 'payrollOvertimeMultiplier', {
      type: Sequelize.DECIMAL(5,2),
      allowNull: true,
    });
    await queryInterface.addColumn('companies', 'payrollDefaultPayRate', {
      type: Sequelize.DECIMAL(10,2),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('companies', 'payrollDefaultPayPeriod');
    await queryInterface.removeColumn('companies', 'payrollStartDate');
    await queryInterface.removeColumn('companies', 'payrollOvertimeThreshold');
    await queryInterface.removeColumn('companies', 'payrollOvertimeMultiplier');
    await queryInterface.removeColumn('companies', 'payrollDefaultPayRate');
  }
};
