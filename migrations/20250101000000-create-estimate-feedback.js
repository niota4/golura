'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('estimateFeedback', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      estimateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'estimates',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      feedbackType: {
        type: Sequelize.ENUM('approve', 'reject', 'request_changes', 'general'),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      clientEmail: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      clientName: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('estimateFeedback', ['estimateId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('estimateFeedback');
  }
};
