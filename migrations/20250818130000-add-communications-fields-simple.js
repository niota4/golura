'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add columns one by one without any indexes to avoid key limit
      const columns = [
        {
          name: 'communicationsEnabled',
          definition: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
          }
        },
        {
          name: 'primaryPhoneNumberId',
          definition: {
            type: Sequelize.INTEGER,
            allowNull: true
          }
        },
        {
          name: 'communicationsSetupComplete',
          definition: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
          }
        },
        {
          name: 'monthlyMessageLimit',
          definition: {
            type: Sequelize.INTEGER,
            defaultValue: 100,
            allowNull: false
          }
        },
        {
          name: 'monthlyMessagesUsed',
          definition: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
          }
        },
        {
          name: 'communicationsSettings',
          definition: {
            type: Sequelize.TEXT,
            allowNull: true
          }
        }
      ];

      for (const column of columns) {
        try {
          // Check if column exists first
          const [results] = await queryInterface.sequelize.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_NAME = 'companies' AND COLUMN_NAME = '${column.name}' 
             AND TABLE_SCHEMA = DATABASE()`
          );
          
          if (results.length === 0) {
            await queryInterface.addColumn('companies', column.name, column.definition);
            console.log(`Added column: ${column.name}`);
          } else {
            console.log(`Column ${column.name} already exists, skipping`);
          }
        } catch (error) {
          console.log(`Error adding column ${column.name}:`, error.message);
          // Continue with other columns
        }
      }

      console.log('Communications fields migration completed');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const columns = [
        'communicationsSettings',
        'monthlyMessagesUsed', 
        'monthlyMessageLimit',
        'communicationsSetupComplete',
        'primaryPhoneNumberId',
        'communicationsEnabled'
      ];

      for (const columnName of columns) {
        try {
          await queryInterface.removeColumn('companies', columnName);
          console.log(`Removed column: ${columnName}`);
        } catch (error) {
          console.log(`Error removing column ${columnName}:`, error.message);
          // Continue with other columns
        }
      }
    } catch (error) {
      console.error('Migration rollback error:', error);
      throw error;
    }
  }
};
