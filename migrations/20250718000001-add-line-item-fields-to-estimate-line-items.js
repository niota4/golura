'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('estimateLineItems');
    
    // Add new fields to estimateLineItems table that will come from lineItems
    if (!tableInfo.pricedBy) {
      await queryInterface.addColumn('estimateLineItems', 'pricedBy', {
        type: Sequelize.ENUM('formula', 'question', 'custom'),
        allowNull: false,
        defaultValue: 'custom'
      });
    }

    if (!tableInfo.formulaId) {
      await queryInterface.addColumn('estimateLineItems', 'formulaId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'formulas',
          key: 'id'
        }
      });
    }

    if (!tableInfo.questionId) {
      await queryInterface.addColumn('estimateLineItems', 'questionId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'questions',
          key: 'id'
        }
      });
    }

    if (!tableInfo.moduleDescription) {
      await queryInterface.addColumn('estimateLineItems', 'moduleDescription', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!tableInfo.instructions) {
      await queryInterface.addColumn('estimateLineItems', 'instructions', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!tableInfo.adHoc) {
      await queryInterface.addColumn('estimateLineItems', 'adHoc', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }

    if (!tableInfo.isActive) {
      await queryInterface.addColumn('estimateLineItems', 'isActive', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }

    if (!tableInfo.userId) {
      await queryInterface.addColumn('estimateLineItems', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      });
    }

    // Add fields for labor calculations
    if (!tableInfo.hours) {
      await queryInterface.addColumn('estimateLineItems', 'hours', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null
      });
    }

    if (!tableInfo.useOvertimeRate) {
      await queryInterface.addColumn('estimateLineItems', 'useOvertimeRate', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }

    if (!tableInfo.standardHours) {
      await queryInterface.addColumn('estimateLineItems', 'standardHours', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null
      });
    }

    if (!tableInfo.overtimeHours) {
      await queryInterface.addColumn('estimateLineItems', 'overtimeHours', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null
      });
    }

    // Now migrate data from lineItems to estimateLineItems
    const [estimateLineItems] = await queryInterface.sequelize.query(`
      SELECT eli.*, li.pricedBy, li.formulaId, li.questionId, li.moduleDescription, 
             li.instructions, li.adHoc, li.isActive, li.userId
      FROM estimateLineItems eli
      LEFT JOIN lineItems li ON eli.lineItemId = li.id
      WHERE eli.lineItemId IS NOT NULL
    `);

    // Update each estimateLineItem with data from its associated lineItem
    for (const item of estimateLineItems) {
      await queryInterface.sequelize.query(`
        UPDATE estimateLineItems 
        SET 
          pricedBy = :pricedBy,
          formulaId = :formulaId,
          questionId = :questionId,
          moduleDescription = :moduleDescription,
          instructions = :instructions,
          adHoc = :adHoc,
          isActive = :isActive,
          userId = :userId
        WHERE id = :id
      `, {
        replacements: {
          id: item.id,
          pricedBy: item.pricedBy || 'custom',
          formulaId: item.formulaId,
          questionId: item.questionId,
          moduleDescription: item.moduleDescription,
          instructions: item.instructions,
          adHoc: item.adHoc || false,
          isActive: item.isActive !== null ? item.isActive : true,
          userId: item.userId
        }
      });
    }

    // For items that don't have lineItemId (direct estimate line items), 
    // set default values based on their existing data
    await queryInterface.sequelize.query(`
      UPDATE estimateLineItems 
      SET 
        pricedBy = 'custom',
        userId = 1
      WHERE lineItemId IS NULL AND userId IS NULL
    `);

    console.log('Migration completed: Added line item fields to estimate line items and migrated data');
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('estimateLineItems');
    
    // Remove the added columns if they exist
    if (tableInfo.pricedBy) {
      await queryInterface.removeColumn('estimateLineItems', 'pricedBy');
    }
    if (tableInfo.formulaId) {
      await queryInterface.removeColumn('estimateLineItems', 'formulaId');
    }
    if (tableInfo.questionId) {
      await queryInterface.removeColumn('estimateLineItems', 'questionId');
    }
    if (tableInfo.moduleDescription) {
      await queryInterface.removeColumn('estimateLineItems', 'moduleDescription');
    }
    if (tableInfo.instructions) {
      await queryInterface.removeColumn('estimateLineItems', 'instructions');
    }
    if (tableInfo.adHoc) {
      await queryInterface.removeColumn('estimateLineItems', 'adHoc');
    }
    if (tableInfo.isActive) {
      await queryInterface.removeColumn('estimateLineItems', 'isActive');
    }
    if (tableInfo.userId) {
      await queryInterface.removeColumn('estimateLineItems', 'userId');
    }
    if (tableInfo.hours) {
      await queryInterface.removeColumn('estimateLineItems', 'hours');
    }
    if (tableInfo.useOvertimeRate) {
      await queryInterface.removeColumn('estimateLineItems', 'useOvertimeRate');
    }
    if (tableInfo.standardHours) {
      await queryInterface.removeColumn('estimateLineItems', 'standardHours');
    }
    if (tableInfo.overtimeHours) {
      await queryInterface.removeColumn('estimateLineItems', 'overtimeHours');
    }
  }
};
