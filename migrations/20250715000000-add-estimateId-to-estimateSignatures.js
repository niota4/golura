'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if estimateId column already exists
    const table = await queryInterface.describeTable('estimateSignatures');
    
    if (!table.estimateId) {
      // First, add the column as nullable
      await queryInterface.addColumn('estimateSignatures', 'estimateId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'estimates',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Check if there are any existing records
      const [results] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM estimateSignatures'
      );
      
      const count = results[0].count;
      
      if (count > 0) {
        // If there are existing records, we need to either:
        // 1. Delete them (if they're orphaned)
        // 2. Or link them to estimates based on some logic
        
        // For now, let's delete existing orphaned records to avoid constraint issues
        console.log(`Found ${count} existing signature records. Cleaning up orphaned records...`);
        
        // Delete any signatures that don't have a corresponding estimate
        await queryInterface.sequelize.query(`
          DELETE FROM estimateSignatures 
          WHERE id NOT IN (
            SELECT DISTINCT estimateSignatureId 
            FROM estimates 
            WHERE estimateSignatureId IS NOT NULL
          )
        `);
        
        // Update remaining signatures with their corresponding estimateId
        await queryInterface.sequelize.query(`
          UPDATE estimateSignatures 
          SET estimateId = (
            SELECT id 
            FROM estimates 
            WHERE estimates.estimateSignatureId = estimateSignatures.id
            LIMIT 1
          )
          WHERE estimateId IS NULL
        `);
      }
      
      // Now make the column NOT NULL
      await queryInterface.changeColumn('estimateSignatures', 'estimateId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'estimates',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('estimateSignatures', 'estimateId');
  }
};
