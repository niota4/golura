'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, check if there are any users in the system, if not create a default admin user
    const [users] = await queryInterface.sequelize.query('SELECT id FROM users LIMIT 1');
    let defaultUserId;
    
    if (users.length === 0) {
      // Get the administrator role ID
      const [adminRole] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name = 'administrator' LIMIT 1");
      const adminRoleId = adminRole.length > 0 ? adminRole[0].id : 6; // Default to 6 based on the seed order
      
      // Create a default admin user for seeding purposes
      await queryInterface.bulkInsert('users', [
        {
          id: 1,
          firstName: 'System',
          lastName: 'Admin',
          email: 'admin@golura.com',
          password: null, // Allow null password as per recent migration
          roleId: adminRoleId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});
      defaultUserId = 1;
    } else {
      defaultUserId = users[0].id;
    }

    // 1. Create Event Type for House Remodel (if not exists)
    const [existingEventType] = await queryInterface.sequelize.query(
      "SELECT id FROM eventTypes WHERE name = 'House Remodel' LIMIT 1"
    );
    
    let eventTypeId;
    if (existingEventType.length === 0) {
      await queryInterface.bulkInsert('eventTypes', [
        {
          id: 1000,
          name: 'House Remodel',
          backgroundColor: '#4CAF50',
          tags: JSON.stringify(['construction', 'remodel', 'residential']),
          map: false,
          requireCheckIn: true,
          requireCheckOut: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]);
      eventTypeId = 1000;
    } else {
      eventTypeId = existingEventType[0].id;
    }

    // 2. Create Variables for Formulas (if not exist)
    const variablesToCreate = [
      {
        name: 'LABOR_MARKUP',
        value: '1.35',
        description: 'Standard markup rate for labor costs (35%)',
      },
      {
        name: 'MATERIAL_MARKUP',
        value: '1.25',
        description: 'Standard markup rate for materials (25%)',
      },
      {
        name: 'PERMIT_FEE_RATE',
        value: '0.015',
        description: 'Permit fee as percentage of total project cost (1.5%)',
      },
      {
        name: 'OVERHEAD_RATE',
        value: '0.15',
        description: 'General overhead rate (15%)',
      },
      {
        name: 'PROFIT_MARGIN',
        value: '0.20',
        description: 'Target profit margin (20%)',
      }
    ];

    for (const variable of variablesToCreate) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM variables WHERE name = '${variable.name}' LIMIT 1`
      );
      
      if (existing.length === 0) {
        await queryInterface.bulkInsert('variables', [
          {
            ...variable,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]);
      }
    }

    // 3. Create Labor Types (check for existing ones)
    const laborTypesToCreate = [
      {
        role: 'General Contractor',
        rate: 85.00,
        overtimeRate: 127.50,
        standardHoursPerDay: 8,
      },
      {
        role: 'Carpenter',
        rate: 65.00,
        overtimeRate: 97.50,
        standardHoursPerDay: 8,
      },
      {
        role: 'Electrician',
        rate: 75.00,
        overtimeRate: 112.50,
        standardHoursPerDay: 8,
      },
      {
        role: 'Plumber',
        rate: 80.00,
        overtimeRate: 120.00,
        standardHoursPerDay: 8,
      },
      {
        role: 'Painter',
        rate: 45.00,
        overtimeRate: 67.50,
        standardHoursPerDay: 8,
      },
      {
        role: 'Flooring Specialist',
        rate: 55.00,
        overtimeRate: 82.50,
        standardHoursPerDay: 8,
      },
      {
        role: 'Tile Installer',
        rate: 60.00,
        overtimeRate: 90.00,
        standardHoursPerDay: 8,
      },
      {
        role: 'HVAC Technician',
        rate: 70.00,
        overtimeRate: 105.00,
        standardHoursPerDay: 8,
      }
    ];

    for (const labor of laborTypesToCreate) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM labor WHERE role = '${labor.role}' LIMIT 1`
      );
      
      if (existing.length === 0) {
        await queryInterface.bulkInsert('labor', [
          {
            ...labor,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]);
      }
    }

    // 4. Create Construction Items (check for existing ones)
    const itemsToCreate = [
      // Lumber & Framing
      {
        name: '2x4x8 Pressure Treated Lumber',
        partNumber: 'PT-2X4X8',
        rate: 8.50,
        cost: 6.80,
        markUpRate: 1.25,
        taxable: true,
        description: 'Pressure treated lumber for framing',
      },
      {
        name: '2x6x10 Pressure Treated Lumber',
        partNumber: 'PT-2X6X10',
        rate: 15.75,
        cost: 12.60,
        markUpRate: 1.25,
        taxable: true,
        description: 'Pressure treated lumber for larger framing',
      },
      {
        name: '3/4" Plywood Subflooring',
        partNumber: 'PLY-34-SUB',
        rate: 45.00,
        cost: 36.00,
        markUpRate: 1.25,
        taxable: true,
        description: '4x8 sheet of 3/4 inch plywood for subflooring',
      },
      // Drywall & Finishing
      {
        name: '1/2" Drywall Sheet',
        partNumber: 'DW-12-4X8',
        rate: 18.50,
        cost: 14.80,
        markUpRate: 1.25,
        taxable: true,
        description: '4x8 sheet of 1/2 inch drywall',
      },
      {
        name: 'Joint Compound (5 gallon)',
        partNumber: 'JC-5GAL',
        rate: 35.00,
        cost: 28.00,
        markUpRate: 1.25,
        taxable: true,
        description: '5 gallon bucket of joint compound',
      },
      {
        name: 'Drywall Tape (500ft roll)',
        partNumber: 'DT-500FT',
        rate: 12.50,
        cost: 10.00,
        markUpRate: 1.25,
        taxable: true,
        description: '500 foot roll of drywall tape',
      },
      // Flooring
      {
        name: 'Luxury Vinyl Plank Flooring',
        partNumber: 'LVP-PRE-SQ',
        rate: 4.50,
        cost: 3.60,
        markUpRate: 1.25,
        taxable: true,
        description: 'Premium luxury vinyl plank flooring per sq ft',
      },
      {
        name: 'Ceramic Tile 12x12',
        partNumber: 'CT-12X12',
        rate: 3.25,
        cost: 2.60,
        markUpRate: 1.25,
        taxable: true,
        description: '12x12 ceramic tile per sq ft',
      },
      {
        name: 'Hardwood Flooring (Oak)',
        partNumber: 'HW-OAK-SQ',
        rate: 8.75,
        cost: 7.00,
        markUpRate: 1.25,
        taxable: true,
        description: 'Solid oak hardwood flooring per sq ft',
      },
      // Paint & Finishes
      {
        name: 'Interior Paint (1 gallon)',
        partNumber: 'PAINT-INT-GAL',
        rate: 55.00,
        cost: 44.00,
        markUpRate: 1.25,
        taxable: true,
        description: 'Premium interior paint per gallon',
      },
      {
        name: 'Primer (1 gallon)',
        partNumber: 'PRIMER-GAL',
        rate: 40.00,
        cost: 32.00,
        markUpRate: 1.25,
        taxable: true,
        description: 'High-quality primer per gallon',
      },
      // Electrical
      {
        name: 'Standard Electrical Outlet',
        partNumber: 'OUTLET-STD',
        rate: 25.00,
        cost: 20.00,
        markUpRate: 1.25,
        taxable: true,
        description: 'Standard duplex electrical outlet',
      },
      {
        name: 'LED Light Fixture',
        partNumber: 'LED-FIX-STD',
        rate: 125.00,
        cost: 100.00,
        markUpRate: 1.25,
        taxable: true,
        description: 'Standard LED light fixture',
      },
      // Plumbing
      {
        name: 'PVC Pipe (10ft)',
        partNumber: 'PVC-PIPE-10',
        rate: 18.75,
        cost: 15.00,
        markUpRate: 1.25,
        taxable: true,
        description: '10 foot length of PVC pipe',
      },
      {
        name: 'Standard Toilet',
        partNumber: 'TOILET-STD',
        rate: 375.00,
        cost: 300.00,
        markUpRate: 1.25,
        taxable: true,
        description: 'Standard residential toilet',
      }
    ];

    for (const item of itemsToCreate) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM items WHERE partNumber = '${item.partNumber}' LIMIT 1`
      );
      
      if (existing.length === 0) {
        await queryInterface.bulkInsert('items', [
          {
            ...item,
            isActive: true,
            userId: defaultUserId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]);
      }
    }

    // 5. Create the Estimator (check if exists)
    const [existingEstimator] = await queryInterface.sequelize.query(
      "SELECT id FROM estimators WHERE title = 'Comprehensive House Remodel Estimator' LIMIT 1"
    );
    
    let estimatorId;
    if (existingEstimator.length === 0) {
      await queryInterface.bulkInsert('estimators', [
        {
          id: 2000, // Use explicit ID to avoid retrieval issues
          title: 'Comprehensive House Remodel Estimator',
          description: 'A comprehensive estimator for full house remodeling projects including kitchen, bathroom, flooring, painting, electrical, and plumbing work.',
          eventTypeId: eventTypeId,
          isActive: true,
          createdBy: defaultUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]);
      estimatorId = 2000;
    } else {
      estimatorId = existingEstimator[0].id;
    }

    // 6. Create Question Containers (check if they exist)
    const containersToCreate = [
      {
        id: 101,
        estimatorId: estimatorId,
        name: 'Project Overview',
        isActive: true,
        displayOrder: 1,
        lineItemIds: JSON.stringify([]),
      },
      {
        id: 102,
        estimatorId: estimatorId,
        name: 'Kitchen Remodel',
        isActive: true,
        displayOrder: 2,
        lineItemIds: JSON.stringify([]),
      },
      {
        id: 103,
        estimatorId: estimatorId,
        name: 'Bathroom Remodel',
        isActive: true,
        displayOrder: 3,
        lineItemIds: JSON.stringify([]),
      },
      {
        id: 104,
        estimatorId: estimatorId,
        name: 'Flooring Installation',
        isActive: true,
        displayOrder: 4,
        lineItemIds: JSON.stringify([]),
      },
      {
        id: 105,
        estimatorId: estimatorId,
        name: 'Interior Painting',
        isActive: true,
        displayOrder: 5,
        lineItemIds: JSON.stringify([]),
      },
      {
        id: 106,
        estimatorId: estimatorId,
        name: 'Electrical Work',
        isActive: true,
        displayOrder: 6,
        lineItemIds: JSON.stringify([]),
      },
      {
        id: 107,
        estimatorId: estimatorId,
        name: 'Plumbing Work',
        isActive: true,
        displayOrder: 7,
        lineItemIds: JSON.stringify([]),
      },
      {
        id: 108,
        estimatorId: estimatorId,
        name: 'Project Totals & Adjustments',
        isActive: true,
        displayOrder: 8,
        lineItemIds: JSON.stringify([]),
      }
    ];

    for (const container of containersToCreate) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM questionContainers WHERE id = ${container.id} LIMIT 1`
      );
      
      if (existing.length === 0) {
        await queryInterface.bulkInsert('questionContainers', [
          {
            ...container,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]);
      }
    }

    // Use the explicit container IDs
    const containerIds = [101, 102, 103, 104, 105, 106, 107, 108];

    // 7. Create Questions for each container
    const questions = [];

    // Project Overview Questions
    const projectQuestions = [
      {
        containerId: containerIds[0],
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
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 500, max: 10000 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[0],
        questionText: 'What is the project complexity level?',
        inputType: 'select',
        options: 'Basic||1,Standard||1.2,Complex||1.5,Luxury||2',
        defaultValue: '1.2',
        helpText: 'Select complexity level which affects labor multiplier',
        formulaReference: 'complexity_multiplier',
        displayOrder: 2,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[0],
        questionText: 'Project start date',
        inputType: 'date',
        helpText: 'When do you plan to start the project?',
        formulaReference: 'start_date',
        displayOrder: 3,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[0],
        questionText: 'Rush job multiplier?',
        inputType: 'select',
        options: 'Standard Timeline||1,Rush (2 weeks)||1.3,Emergency (1 week)||1.6',
        defaultValue: '1',
        helpText: 'Rushed projects require overtime and premium scheduling',
        formulaReference: 'rush_multiplier',
        displayOrder: 4,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[0],
        questionText: 'Contingency percentage',
        inputType: 'number',
        defaultValue: '10',
        helpText: 'Percentage buffer for unexpected costs (typically 10-20%)',
        formulaReference: 'contingency_percentage',
        displayOrder: 5,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 5, max: 30 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Kitchen Remodel Questions
    const kitchenQuestions = [
      {
        containerId: containerIds[1],
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
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[1],
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
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 50, max: 500 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[1],
        questionText: 'Cabinet quality level',
        inputType: 'select',
        options: 'Stock Cabinets||800,Semi-Custom||1200,Custom||2000',
        defaultValue: '1200',
        helpText: 'Select cabinet quality - price per linear foot',
        formulaReference: 'cabinet_price_per_lf',
        displayOrder: 3,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[1],
        questionText: 'Linear feet of cabinets needed',
        inputType: 'number',
        defaultValue: '15',
        helpText: 'Total linear feet of upper and lower cabinets',
        formulaReference: 'cabinet_linear_feet',
        displayOrder: 4,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 5, max: 50 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[1],
        questionText: 'Countertop square footage',
        inputType: 'number',
        defaultValue: '40',
        helpText: 'Total countertop area in square feet',
        formulaReference: 'countertop_sqft',
        displayOrder: 5,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 10, max: 100 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[1],
        questionText: 'Countertop material',
        inputType: 'select',
        options: 'Laminate||45,Quartz||85,Granite||95,Marble||120',
        defaultValue: '85',
        helpText: 'Select countertop material - price per square foot',
        formulaReference: 'countertop_price_per_sqft',
        displayOrder: 6,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Bathroom Remodel Questions
    const bathroomQuestions = [
      {
        containerId: containerIds[2],
        questionText: 'Include bathroom remodel?',
        inputType: 'radio',
        options: 'Yes||1,No||0',
        defaultValue: '0',
        helpText: 'Will this project include bathroom remodeling?',
        formulaReference: 'include_bathroom',
        displayOrder: 1,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[2],
        questionText: 'Number of bathrooms to remodel',
        inputType: 'number',
        defaultValue: '2',
        helpText: 'How many bathrooms will be remodeled?',
        formulaReference: 'bathroom_count',
        displayOrder: 2,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 1, max: 10 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[2],
        questionText: 'Average bathroom size (square feet)',
        inputType: 'number',
        defaultValue: '60',
        helpText: 'Average size of each bathroom in square feet',
        formulaReference: 'bathroom_sqft',
        displayOrder: 3,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 25, max: 150 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[2],
        questionText: 'Bathroom quality level',
        inputType: 'select',
        options: 'Basic||1,Standard||1.3,Luxury||1.8',
        defaultValue: '1.3',
        helpText: 'Select bathroom quality level multiplier',
        formulaReference: 'bathroom_quality_multiplier',
        displayOrder: 4,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Flooring Questions
    const flooringQuestions = [
      {
        containerId: containerIds[3],
        questionText: 'Include flooring installation?',
        inputType: 'radio',
        options: 'Yes||1,No||0',
        defaultValue: '0',
        helpText: 'Will this project include new flooring?',
        formulaReference: 'include_flooring',
        displayOrder: 1,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[3],
        questionText: 'Total flooring area (square feet)',
        inputType: 'number',
        defaultValue: '1500',
        helpText: 'Total area for new flooring installation',
        formulaReference: 'flooring_sqft',
        displayOrder: 2,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 100, max: 5000 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[3],
        questionText: 'Flooring type',
        inputType: 'select',
        options: 'Carpet||3.50,Luxury Vinyl||4.50,Ceramic Tile||3.25,Hardwood||8.75',
        defaultValue: '4.50',
        helpText: 'Select flooring material - price per square foot',
        formulaReference: 'flooring_price_per_sqft',
        displayOrder: 3,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[3],
        questionText: 'Remove existing flooring?',
        inputType: 'radio',
        options: 'Yes||1,No||0',
        defaultValue: '1',
        helpText: 'Will existing flooring need to be removed?',
        formulaReference: 'remove_existing_flooring',
        displayOrder: 4,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Painting Questions
    const paintingQuestions = [
      {
        containerId: containerIds[4],
        questionText: 'Include interior painting?',
        inputType: 'radio',
        options: 'Yes||1,No||0',
        defaultValue: '0',
        helpText: 'Will this project include interior painting?',
        formulaReference: 'include_painting',
        displayOrder: 1,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[4],
        questionText: 'Wall area to paint (square feet)',
        inputType: 'number',
        defaultValue: '2400',
        helpText: 'Total wall area for painting (typically 1.2x floor area)',
        formulaReference: 'paint_wall_sqft',
        displayOrder: 2,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 500, max: 8000 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[4],
        questionText: 'Ceiling area to paint (square feet)',
        inputType: 'number',
        defaultValue: '2000',
        helpText: 'Total ceiling area for painting',
        formulaReference: 'paint_ceiling_sqft',
        displayOrder: 3,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 0, max: 5000 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[4],
        questionText: 'Paint quality level',
        inputType: 'select',
        options: 'Builder Grade||35,Premium||55,Ultra Premium||75',
        defaultValue: '55',
        helpText: 'Select paint quality - price per gallon',
        formulaReference: 'paint_price_per_gallon',
        displayOrder: 4,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Electrical Questions
    const electricalQuestions = [
      {
        containerId: containerIds[5],
        questionText: 'Include electrical work?',
        inputType: 'radio',
        options: 'Yes||1,No||0',
        defaultValue: '0',
        helpText: 'Will this project include electrical work?',
        formulaReference: 'include_electrical',
        displayOrder: 1,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[5],
        questionText: 'Number of new electrical outlets',
        inputType: 'number',
        defaultValue: '8',
        helpText: 'How many new electrical outlets are needed?',
        formulaReference: 'electrical_outlets_count',
        displayOrder: 2,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 0, max: 50 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[5],
        questionText: 'Number of new light fixtures',
        inputType: 'number',
        defaultValue: '12',
        helpText: 'How many new light fixtures will be installed?',
        formulaReference: 'light_fixtures_count',
        displayOrder: 3,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 0, max: 100 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[5],
        questionText: 'Electrical panel upgrade needed?',
        inputType: 'radio',
        options: 'Yes||1,No||0',
        defaultValue: '0',
        helpText: 'Will the electrical panel need to be upgraded?',
        formulaReference: 'electrical_panel_upgrade',
        displayOrder: 4,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Plumbing Questions
    const plumbingQuestions = [
      {
        containerId: containerIds[6],
        questionText: 'Include plumbing work?',
        inputType: 'radio',
        options: 'Yes||1,No||0',
        defaultValue: '0',
        helpText: 'Will this project include plumbing work?',
        formulaReference: 'include_plumbing',
        displayOrder: 1,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[6],
        questionText: 'Linear feet of new plumbing',
        inputType: 'number',
        defaultValue: '100',
        helpText: 'Estimated linear feet of new plumbing runs',
        formulaReference: 'plumbing_linear_feet',
        displayOrder: 2,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 10, max: 500 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[6],
        questionText: 'Number of plumbing fixtures',
        inputType: 'number',
        defaultValue: '6',
        helpText: 'Total number of plumbing fixtures (toilets, sinks, etc.)',
        formulaReference: 'plumbing_fixtures_count',
        displayOrder: 3,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 1, max: 30 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Total Questions (read-only display)
    const totalQuestions = [
      {
        containerId: containerIds[7],
        questionText: 'Project Summary',
        inputType: 'text',
        helpText: 'This section will display the calculated totals and breakdown',
        formulaReference: 'project_summary',
        displayOrder: 1,
        isRequired: false,
        isVisible: true,
        isEditable: false,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Combine all questions
    questions.push(...projectQuestions, ...kitchenQuestions, ...bathroomQuestions, 
                  ...flooringQuestions, ...paintingQuestions, ...electricalQuestions, 
                  ...plumbingQuestions, ...totalQuestions);

    // Check and insert questions
    for (const question of questions) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM questions WHERE containerId = ${question.containerId} AND formulaReference = '${question.formulaReference}' LIMIT 1`
      );
      
      if (existing.length === 0) {
        await queryInterface.bulkInsert('questions', [question]);
      }
    }

    // 8. Create Formulas for calculations
    const formulasToCreate = [
      // Kitchen Cost Formula
      {
        containerId: containerIds[1],
        name: 'Kitchen Total Cost',
        expression: 'include_kitchen * ((cabinet_linear_feet * cabinet_price_per_lf) + (countertop_sqft * countertop_price_per_sqft) + (kitchen_sqft * 150)) * complexity_multiplier',
        isActive: true,
        createdBy: defaultUserId,
      },

      // Bathroom Cost Formula  
      {
        containerId: containerIds[2],
        name: 'Bathroom Total Cost',
        expression: 'include_bathroom * bathroom_count * (bathroom_sqft * 200 * bathroom_quality_multiplier) * complexity_multiplier',
        isActive: true,
        createdBy: defaultUserId,
      },

      // Flooring Cost Formula
      {
        containerId: containerIds[3],
        name: 'Flooring Total Cost',
        expression: 'include_flooring * (flooring_sqft * flooring_price_per_sqft + (remove_existing_flooring * flooring_sqft * 2)) * complexity_multiplier',
        isActive: true,
        createdBy: defaultUserId,
      },

      // Painting Cost Formula
      {
        containerId: containerIds[4],
        name: 'Painting Total Cost',
        expression: 'include_painting * (((paint_wall_sqft + paint_ceiling_sqft) / 350 * paint_price_per_gallon) + ((paint_wall_sqft + paint_ceiling_sqft) * 1.5)) * complexity_multiplier',
        isActive: true,
        createdBy: defaultUserId,
      },

      // Electrical Cost Formula
      {
        containerId: containerIds[5],
        name: 'Electrical Total Cost',
        expression: 'include_electrical * ((electrical_outlets_count * 150) + (light_fixtures_count * 200) + (electrical_panel_upgrade * 2500)) * complexity_multiplier',
        isActive: true,
        createdBy: defaultUserId,
      },

      // Plumbing Cost Formula
      {
        containerId: containerIds[6],
        name: 'Plumbing Total Cost',
        expression: 'include_plumbing * ((plumbing_linear_feet * 25) + (plumbing_fixtures_count * 400)) * complexity_multiplier',
        isActive: true,
        createdBy: defaultUserId,
      },

      // Project Grand Total Formula
      {
        containerId: containerIds[7],
        name: 'Project Grand Total',
        expression: '((Kitchen_Total_Cost + Bathroom_Total_Cost + Flooring_Total_Cost + Painting_Total_Cost + Electrical_Total_Cost + Plumbing_Total_Cost) * (1 + OVERHEAD_RATE) * (1 + PROFIT_MARGIN) * rush_multiplier * (1 + contingency_percentage/100)) + (house_sqft * PERMIT_FEE_RATE)',
        isActive: true,
        createdBy: defaultUserId,
      }
    ];

    for (const formula of formulasToCreate) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM formulas WHERE containerId = ${formula.containerId} AND name = '${formula.name}' LIMIT 1`
      );
      
      if (existing.length === 0) {
        await queryInterface.bulkInsert('formulas', [
          {
            ...formula,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]);
      }
    }

    console.log('✅ Comprehensive House Remodel Estimator seed data created successfully!');
    console.log('📊 Created:');
    console.log('   - 1 Event Type (House Remodel)');
    console.log('   - 5 Global Variables');
    console.log('   - 8 Labor Types');
    console.log('   - 15 Construction Items');
    console.log('   - 1 Comprehensive Estimator');
    console.log('   - 8 Question Containers');
    console.log('   - 29 Dynamic Questions');
    console.log('   - 7 Mathematical Formulas');
    console.log('');
    console.log('🏠 This estimator includes:');
    console.log('   - Project overview with complexity multipliers');
    console.log('   - Kitchen remodel calculations');
    console.log('   - Bathroom remodel calculations'); 
    console.log('   - Flooring installation costs');
    console.log('   - Interior painting estimates');
    console.log('   - Electrical work pricing');
    console.log('   - Plumbing work pricing');
    console.log('   - Automatic markup and overhead calculations');
    console.log('   - Contingency and rush job adjustments');
    console.log('   - Permit fee calculations');

  },

  down: async (queryInterface, Sequelize) => {
    // Remove in reverse order to respect foreign key constraints
    await queryInterface.bulkDelete('formulas', { containerId: [101, 102, 103, 104, 105, 106, 107, 108] }, {});
    await queryInterface.bulkDelete('questions', { containerId: [101, 102, 103, 104, 105, 106, 107, 108] }, {});
    await queryInterface.bulkDelete('questionContainers', { id: [101, 102, 103, 104, 105, 106, 107, 108] }, {});
    await queryInterface.bulkDelete('estimators', { title: 'Comprehensive House Remodel Estimator' }, {});
    await queryInterface.bulkDelete('items', { partNumber: ['PT-2X4X8', 'PT-2X6X10', 'PLY-34-SUB', 'DW-12-4X8', 'JC-5GAL', 'DT-500FT', 'LVP-PRE-SQ', 'CT-12X12', 'HW-OAK-SQ', 'PAINT-INT-GAL', 'PRIMER-GAL', 'OUTLET-STD', 'LED-FIX-STD', 'PVC-PIPE-10', 'TOILET-STD'] }, {});
    await queryInterface.bulkDelete('labor', { role: ['General Contractor', 'Carpenter', 'Electrician', 'Plumber', 'Painter', 'Flooring Specialist', 'Tile Installer', 'HVAC Technician'] }, {});
    await queryInterface.bulkDelete('variables', { name: ['LABOR_MARKUP', 'MATERIAL_MARKUP', 'PERMIT_FEE_RATE', 'OVERHEAD_RATE', 'PROFIT_MARGIN'] }, {});
    
    console.log('🗑️  Comprehensive House Remodel Estimator seed data removed');
  }
};
