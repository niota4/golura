'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, let's get all the records with options data
    const [rows] = await queryInterface.sequelize.query(
      "SELECT id, options FROM questions WHERE options IS NOT NULL AND options != ''"
    );

    // Process each row to convert the custom format to JSON
    for (const row of rows) {
      if (row.options && !row.options.startsWith('[') && !row.options.startsWith('{')) {
        // This is the custom format like "Basic||1,Standard||1.2,Complex||1.5"
        try {
          const optionsArray = row.options.split(',').map(item => {
            const [label, value] = item.split('||');
            return {
              label: label.trim(),
              value: value ? parseFloat(value.trim()) : 1
            };
          });
          
          const jsonOptions = JSON.stringify(optionsArray);
          
          // Update the row with proper JSON
          await queryInterface.sequelize.query(
            'UPDATE questions SET options = ? WHERE id = ?',
            {
              replacements: [jsonOptions, row.id],
              type: queryInterface.sequelize.QueryTypes.UPDATE
            }
          );
        } catch (error) {
          console.log(`Error processing row ${row.id}: ${error.message}`);
          // If conversion fails, set to empty JSON array
          await queryInterface.sequelize.query(
            'UPDATE questions SET options = ? WHERE id = ?',
            {
              replacements: ['[]', row.id],
              type: queryInterface.sequelize.QueryTypes.UPDATE
            }
          );
        }
      }
    }

    // Now change the column type to JSON
    await queryInterface.changeColumn('questions', 'options', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Change back to TEXT
    await queryInterface.changeColumn('questions', 'options', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Convert JSON back to the original format
    const [rows] = await queryInterface.sequelize.query(
      "SELECT id, options FROM questions WHERE options IS NOT NULL"
    );

    for (const row of rows) {
      if (row.options) {
        try {
          const parsedOptions = JSON.parse(row.options);
          if (Array.isArray(parsedOptions)) {
            const customFormat = parsedOptions.map(option => {
              return `${option.label}||${option.value}`;
            }).join(',');
            
            await queryInterface.sequelize.query(
              'UPDATE questions SET options = ? WHERE id = ?',
              {
                replacements: [customFormat, row.id],
                type: queryInterface.sequelize.QueryTypes.UPDATE
              }
            );
          }
        } catch (error) {
          console.log(`Error reverting row ${row.id}: ${error.message}`);
        }
      }
    }
  }
};
