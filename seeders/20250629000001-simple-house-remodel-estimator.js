'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const timestamp = new Date();
    
    // Get existing user or create one
    const [users] = await queryInterface.sequelize.query('SELECT id FROM users LIMIT 1');
    let userId;
    
    if (users.length === 0) {
      const [adminRole] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name = 'administrator' LIMIT 1");
      const adminRoleId = adminRole.length > 0 ? adminRole[0].id : 6;
      
      await queryInterface.bulkInsert('users', [
        {
          id: 1,
          firstName: 'System',
          lastName: 'Admin',
          email: 'admin@golura.com',
          password: null,
          roleId: adminRoleId,
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      ], {});
      userId = 1;
    } else {
      userId = users[0].id;
    }

    // 1. Create Event Type
    await queryInterface.bulkInsert('eventTypes', [
      {
        id: 100,
        name: 'House Remodel Estimate',
        backgroundColor: '#4CAF50',
        tags: JSON.stringify(['construction', 'remodel', 'estimate']),
        map: false,
        requireCheckIn: false,
        requireCheckOut: false,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ], {});

    // 2. Create Variables
    await queryInterface.bulkInsert('variables', [
      {
        name: 'LABOR_RATE_PER_HOUR',
        value: '75.00',
        description: 'Standard hourly rate for construction labor',
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        name: 'MATERIAL_MARKUP',
        value: '1.25',
        description: 'Markup multiplier for materials (25%)',
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        name: 'OVERHEAD_RATE',
        value: '0.15',
        description: 'General overhead rate (15%)',
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ], {});

    // 3. Create Labor Types
    await queryInterface.bulkInsert('labor', [
      {
        role: 'General Contractor',
        rate: 85.00,
        overtimeRate: 127.50,
        standardHoursPerDay: 8,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        role: 'Skilled Carpenter',
        rate: 65.00,
        overtimeRate: 97.50,
        standardHoursPerDay: 8,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        role: 'Electrician',
        rate: 75.00,
        overtimeRate: 112.50,
        standardHoursPerDay: 8,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ], {});

    // 4. Create Items
    await queryInterface.bulkInsert('items', [
      {
        name: 'Drywall Sheet (4x8)',
        partNumber: 'DW-4X8',
        rate: 18.50,
        cost: 14.80,
        markUpRate: 1.25,
        taxable: true,
        description: 'Standard 1/2 inch drywall sheet',
        isActive: true,
        userId: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        name: 'Interior Paint (Gallon)',
        partNumber: 'PAINT-INT-GAL',
        rate: 55.00,
        cost: 44.00,
        markUpRate: 1.25,
        taxable: true,
        description: 'Premium interior paint per gallon',
        isActive: true,
        userId: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        name: 'Hardwood Flooring (per sqft)',
        partNumber: 'HW-OAK-SQFT',
        rate: 8.75,
        cost: 7.00,
        markUpRate: 1.25,
        taxable: true,
        description: 'Solid oak hardwood flooring',
        isActive: true,
        userId: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ], {});

    // 5. Create Estimator
    await queryInterface.bulkInsert('estimators', [
      {
        id: 100,
        title: 'House Remodel Estimator',
        description: 'Comprehensive estimator for residential remodeling projects including kitchens, bathrooms, and general construction.',
        status: 'Published',
        eventTypeId: 100,
        isActive: true,
        createdBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ], {});

    // 6. Create Question Containers
    await queryInterface.bulkInsert('questionContainers', [
      {
        id: 100,
        estimatorId: 100,
        name: 'Project Overview',
        isActive: true,
        displayOrder: 1,
        lineItemIds: JSON.stringify([]),
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        id: 101,
        estimatorId: 100,
        name: 'Kitchen Remodel',
        isActive: true,
        displayOrder: 2,
        lineItemIds: JSON.stringify([]),
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        id: 102,
        estimatorId: 100,
        name: 'Flooring',
        isActive: true,
        displayOrder: 3,
        lineItemIds: JSON.stringify([]),
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        id: 103,
        estimatorId: 100,
        name: 'Project Totals',
        isActive: true,
        displayOrder: 4,
        lineItemIds: JSON.stringify([]),
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ], {});

    // 7. Create Questions
    await queryInterface.bulkInsert('questions', [
      // Project Overview Questions
      {
        containerId: 100,
        questionText: 'What is the total square footage of the house?',
        inputType: 'number',
        defaultValue: '2000',
        helpText: 'Enter the total living space square footage',
        formulaReference: 'house_sqft',
        displayOrder: 1,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: userId,
        validationRules: JSON.stringify({ min: 500, max: 10000 }),
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        containerId: 100,
        questionText: 'Project complexity level',
        inputType: 'select',
        options: 'Basic||1,Standard||1.2,Complex||1.5',
        defaultValue: '1.2',
        helpText: 'Select complexity level which affects labor costs',
        formulaReference: 'complexity_multiplier',
        displayOrder: 2,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      },

      // Kitchen Questions
      {
        containerId: 101,
        questionText: 'Include kitchen remodel?',
        inputType: 'radio',
        options: 'Yes||1,No||0',
        defaultValue: '0',
        helpText: 'Will this project include kitchen remodeling?',
        formulaReference: 'include_kitchen',
        displayOrder: 1,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        containerId: 101,
        questionText: 'Kitchen square footage',
        inputType: 'number',
        defaultValue: '150',
        helpText: 'Enter kitchen area in square feet',
        formulaReference: 'kitchen_sqft',
        displayOrder: 2,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: userId,
        validationRules: JSON.stringify({ min: 50, max: 500 }),
        createdAt: timestamp,
        updatedAt: timestamp
      },

      // Flooring Questions
      {
        containerId: 102,
        questionText: 'Include new flooring?',
        inputType: 'radio',
        options: 'Yes||1,No||0',
        defaultValue: '0',
        helpText: 'Will this project include new flooring installation?',
        formulaReference: 'include_flooring',
        displayOrder: 1,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        containerId: 102,
        questionText: 'Flooring area (square feet)',
        inputType: 'number',
        defaultValue: '1000',
        helpText: 'Total square footage for new flooring',
        formulaReference: 'flooring_sqft',
        displayOrder: 2,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: userId,
        validationRules: JSON.stringify({ min: 100, max: 5000 }),
        createdAt: timestamp,
        updatedAt: timestamp
      },

      // Project Totals
      {
        containerId: 103,
        questionText: 'Additional contingency percentage',
        inputType: 'slider',
        defaultValue: '10',
        helpText: 'Additional contingency percentage (recommended 10-20%)',
        formulaReference: 'contingency_percentage',
        displayOrder: 1,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: userId,
        validationRules: JSON.stringify({ min: 0, max: 30 }),
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ], {});

    // 8. Create Formulas
    await queryInterface.bulkInsert('formulas', [
      {
        containerId: 101,
        name: 'Kitchen Total Cost',
        expression: 'include_kitchen * (kitchen_sqft * 200) * complexity_multiplier',
        isActive: true,
        createdBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        containerId: 102,
        name: 'Flooring Total Cost',
        expression: 'include_flooring * (flooring_sqft * 8.75) * complexity_multiplier',
        isActive: true,
        createdBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        containerId: 103,
        name: 'Project Grand Total',
        expression: '(Kitchen_Total_Cost + Flooring_Total_Cost) * (1 + OVERHEAD_RATE) * (1 + contingency_percentage/100)',
        isActive: true,
        createdBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ], {});

    console.log('✅ House Remodel Estimator created successfully!');
    console.log('📊 Created:');
    console.log('   - 1 Event Type');
    console.log('   - 3 Variables');
    console.log('   - 3 Labor Types');
    console.log('   - 3 Items');
    console.log('   - 1 Estimator');
    console.log('   - 4 Question Containers');
    console.log('   - 7 Questions');
    console.log('   - 3 Formulas');

  },

  down: async (queryInterface, Sequelize) => {
    // Remove in reverse order to respect foreign key constraints
    await queryInterface.bulkDelete('formulas', { containerId: { [Sequelize.Op.in]: [100, 101, 102, 103] } });
    await queryInterface.bulkDelete('questions', { containerId: { [Sequelize.Op.in]: [100, 101, 102, 103] } });
    await queryInterface.bulkDelete('questionContainers', { estimatorId: 100 });
    await queryInterface.bulkDelete('estimators', { id: 100 });
    await queryInterface.bulkDelete('items', { partNumber: { [Sequelize.Op.in]: ['DW-4X8', 'PAINT-INT-GAL', 'HW-OAK-SQFT'] } });
    await queryInterface.bulkDelete('labor', { role: { [Sequelize.Op.in]: ['General Contractor', 'Skilled Carpenter', 'Electrician'] } });
    await queryInterface.bulkDelete('variables', { name: { [Sequelize.Op.in]: ['LABOR_RATE_PER_HOUR', 'MATERIAL_MARKUP', 'OVERHEAD_RATE'] } });
    await queryInterface.bulkDelete('eventTypes', { id: 100 });
    
    console.log('🗑️ House Remodel Estimator seed data removed');
  }
};
