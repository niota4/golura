'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const columns = [
        {
          name: 'twilioSid',
          definition: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Twilio phone number SID'
          }
        },
        {
          name: 'twilioFriendlyName',
          definition: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Twilio friendly name for the phone number'
          }
        },
        {
          name: 'capabilities',
          definition: {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'JSON object storing voice, sms, mms, fax capabilities'
          }
        },
        {
          name: 'providerSettings',
          definition: {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'JSON object storing provider-specific settings'
          }
        },
        {
          name: 'isPurchased',
          definition: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
            comment: 'Whether this number was purchased from Twilio'
          }
        },
        {
          name: 'locality',
          definition: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'City/locality for the phone number'
          }
        },
        {
          name: 'region',
          definition: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'State/region for the phone number'
          }
        },
        {
          name: 'postalCode',
          definition: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Postal code for the phone number'
          }
        }
      ];

      for (const column of columns) {
        try {
          // Check if column exists first
          const [results] = await queryInterface.sequelize.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_NAME = 'phoneNumbers' AND COLUMN_NAME = '${column.name}' 
             AND TABLE_SCHEMA = DATABASE()`
          );
          
          if (results.length === 0) {
            await queryInterface.addColumn('phoneNumbers', column.name, column.definition);
            console.log(`Added column: ${column.name}`);
          } else {
            console.log(`Column ${column.name} already exists, skipping`);
          }
        } catch (error) {
          console.log(`Error adding column ${column.name}:`, error.message);
          // Continue with other columns
        }
      }

      // Add unique index on twilioSid if it doesn't exist
      try {
        await queryInterface.addIndex('phoneNumbers', ['twilioSid'], {
          unique: true,
          name: 'phoneNumbers_twilioSid_unique',
          where: {
            twilioSid: {
              [Sequelize.Op.ne]: null
            }
          }
        });
        console.log('Added unique index on twilioSid');
      } catch (error) {
        console.log('Index on twilioSid may already exist:', error.message);
      }

      console.log('Twilio phone number fields migration completed');
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove index first
      try {
        await queryInterface.removeIndex('phoneNumbers', 'phoneNumbers_twilioSid_unique');
        console.log('Removed unique index on twilioSid');
      } catch (error) {
        console.log('Error removing index:', error.message);
      }

      const columns = [
        'postalCode',
        'region',
        'locality',
        'isPurchased',
        'providerSettings',
        'capabilities',
        'twilioFriendlyName',
        'twilioSid'
      ];

      for (const columnName of columns) {
        try {
          await queryInterface.removeColumn('phoneNumbers', columnName);
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
