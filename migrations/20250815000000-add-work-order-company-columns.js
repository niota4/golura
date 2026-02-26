"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('companies', 'workOrderDefaultStatusId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('companies', 'workOrderDefaultPriorityId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('companies', 'workOrderDefaultEstimatedHours', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('companies', 'workOrderDefaultHourlyRate', {
      type: Sequelize.DECIMAL(10,2),
      allowNull: true,
    });

    await queryInterface.addColumn('companies', 'workOrderDefaultAssignedUserId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('companies', 'workOrderAutoAssignmentMethod', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('companies', 'workOrderEmailNotification', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn('companies', 'workOrderSmsNotification', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn('companies', 'workOrderAutoAssign', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn('companies', 'workOrderRequireApproval', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('companies', 'workOrderRequireApproval');
    await queryInterface.removeColumn('companies', 'workOrderAutoAssign');
    await queryInterface.removeColumn('companies', 'workOrderSmsNotification');
    await queryInterface.removeColumn('companies', 'workOrderEmailNotification');
    await queryInterface.removeColumn('companies', 'workOrderAutoAssignmentMethod');
    await queryInterface.removeColumn('companies', 'workOrderDefaultAssignedUserId');
    await queryInterface.removeColumn('companies', 'workOrderDefaultHourlyRate');
    await queryInterface.removeColumn('companies', 'workOrderDefaultEstimatedHours');
    await queryInterface.removeColumn('companies', 'workOrderDefaultPriorityId');
    await queryInterface.removeColumn('companies', 'workOrderDefaultStatusId');
  }
};
