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

    // 1. Create Event Type for House Remodel
    await queryInterface.bulkInsert('eventTypes', [
      {
        id: 1000, // Use explicit ID to avoid retrieval issues
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

    const eventTypeId = 1000; // Use the explicit ID we set

    // 2. Create Variables for Formulas
    await queryInterface.bulkInsert('variables', [
      {
        name: 'LABOR_MARKUP',
        value: '1.35',
        description: 'Standard markup rate for labor costs (35%)',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'MATERIAL_MARKUP',
        value: '1.25',
        description: 'Standard markup rate for materials (25%)',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'PERMIT_FEE_RATE',
        value: '0.015',
        description: 'Permit fee as percentage of total project cost (1.5%)',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'OVERHEAD_RATE',
        value: '0.15',
        description: 'General overhead rate (15%)',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'PROFIT_MARGIN',
        value: '0.20',
        description: 'Target profit margin (20%)',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);

    // 3. Create Labor Types
    await queryInterface.bulkInsert('labor', [
      {
        role: 'General Contractor',
        rate: 85.00,
        overtimeRate: 127.50,
        standardHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        role: 'Carpenter',
        rate: 65.00,
        overtimeRate: 97.50,
        standardHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        role: 'Electrician',
        rate: 75.00,
        overtimeRate: 112.50,
        standardHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        role: 'Plumber',
        rate: 80.00,
        overtimeRate: 120.00,
        standardHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        role: 'Painter',
        rate: 45.00,
        overtimeRate: 67.50,
        standardHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        role: 'Flooring Specialist',
        rate: 55.00,
        overtimeRate: 82.50,
        standardHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        role: 'Tile Installer',
        rate: 60.00,
        overtimeRate: 90.00,
        standardHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        role: 'HVAC Technician',
        rate: 70.00,
        overtimeRate: 105.00,
        standardHoursPerDay: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);

    // 4. Create Construction Items
    await queryInterface.bulkInsert('items', [
      // Lumber & Framing
      {
        name: '2x4x8 Pressure Treated Lumber',
        partNumber: 'PT-2X4X8',
        rate: 8.50,
        cost: 6.80,
        markUpRate: 1.25,
        taxable: true,
        description: 'Pressure treated lumber for framing',
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: '2x6x10 Pressure Treated Lumber',
        partNumber: 'PT-2X6X10',
        rate: 15.75,
        cost: 12.60,
        markUpRate: 1.25,
        taxable: true,
        description: 'Pressure treated lumber for larger framing',
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: '3/4" Plywood Subflooring',
        partNumber: 'PLY-34-SUB',
        rate: 45.00,
        cost: 36.00,
        markUpRate: 1.25,
        taxable: true,
        description: '4x8 sheet of 3/4 inch plywood for subflooring',
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Joint Compound (5 gallon)',
        partNumber: 'JC-5GAL',
        rate: 35.00,
        cost: 28.00,
        markUpRate: 1.25,
        taxable: true,
        description: '5 gallon bucket of joint compound',
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Drywall Tape (500ft roll)',
        partNumber: 'DT-500FT',
        rate: 12.50,
        cost: 10.00,
        markUpRate: 1.25,
        taxable: true,
        description: '500 foot roll of drywall tape',
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Ceramic Tile 12x12',
        partNumber: 'CT-12X12',
        rate: 3.25,
        cost: 2.60,
        markUpRate: 1.25,
        taxable: true,
        description: '12x12 ceramic tile per sq ft',
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Hardwood Flooring (Oak)',
        partNumber: 'HW-OAK-SQ',
        rate: 8.75,
        cost: 7.00,
        markUpRate: 1.25,
        taxable: true,
        description: 'Solid oak hardwood flooring per sq ft',
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Primer (1 gallon)',
        partNumber: 'PRIMER-GAL',
        rate: 45.00,
        cost: 36.00,
        markUpRate: 1.25,
        taxable: true,
        description: 'High quality primer per gallon',
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Electrical
      {
        name: '12 AWG Romex Wire (250ft)',
        partNumber: 'ROM-12-250',
        rate: 125.00,
        cost: 100.00,
        markUpRate: 1.25,
        taxable: true,
        description: '12 gauge Romex electrical wire, 250 foot roll',
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Electrical Outlet (GFCI)',
        partNumber: 'OUTLET-GFCI',
        rate: 15.50,
        cost: 12.40,
        markUpRate: 1.25,
        taxable: true,
        description: 'GFCI electrical outlet',
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Plumbing
      {
        name: '1/2" Copper Pipe (10ft)',
        partNumber: 'CU-12-10FT',
        rate: 25.00,
        cost: 20.00,
        markUpRate: 1.25,
        taxable: true,
        description: '1/2 inch copper pipe, 10 foot length',
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'PEX Tubing 1/2" (100ft)',
        partNumber: 'PEX-12-100',
        rate: 85.00,
        cost: 68.00,
        markUpRate: 1.25,
        taxable: true,
        description: '1/2 inch PEX tubing, 100 foot roll',
        isActive: true,
        userId: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);

    // 5. Create the Main Estimator
    await queryInterface.bulkInsert('estimators', [
      {
        id: 1, // Use explicit ID
        title: 'Comprehensive House Remodel Estimator',
        description: 'Complete estimator for residential house remodeling projects including kitchens, bathrooms, flooring, painting, electrical, and plumbing work. Includes material takeoffs, labor calculations, and markup formulas.',
        status: 'Published',
        eventTypeId: eventTypeId,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);

    const estimatorId = 1;

    // 6. Create Question Containers (Sections)
    await queryInterface.bulkInsert('questionContainers', [
      {
        id: 1,
        estimatorId: estimatorId,
        name: 'Project Overview',
        isActive: true,
        displayOrder: 1,
        lineItemIds: JSON.stringify([]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        estimatorId: estimatorId,
        name: 'Kitchen Remodel',
        isActive: true,
        displayOrder: 2,
        lineItemIds: JSON.stringify([]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        estimatorId: estimatorId,
        name: 'Bathroom Remodel',
        isActive: true,
        displayOrder: 3,
        lineItemIds: JSON.stringify([]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        estimatorId: estimatorId,
        name: 'Flooring Installation',
        isActive: true,
        displayOrder: 4,
        lineItemIds: JSON.stringify([]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        estimatorId: estimatorId,
        name: 'Interior Painting',
        isActive: true,
        displayOrder: 5,
        lineItemIds: JSON.stringify([]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        estimatorId: estimatorId,
        name: 'Electrical Work',
        isActive: true,
        displayOrder: 6,
        lineItemIds: JSON.stringify([]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        estimatorId: estimatorId,
        name: 'Plumbing Work',
        isActive: true,
        displayOrder: 7,
        lineItemIds: JSON.stringify([]),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 8,
        estimatorId: estimatorId,
        name: 'Project Totals & Adjustments',
        isActive: true,
        displayOrder: 8,
        lineItemIds: JSON.stringify([]),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);

    // Define container IDs explicitly
    const containerIds = [1, 2, 3, 4, 5, 6, 7, 8];

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
        questionText: 'Countertop material',
        inputType: 'select',
        options: 'Laminate||25,Granite||65,Quartz||85,Marble||120',
        defaultValue: '65',
        helpText: 'Select countertop material - price per square foot',
        formulaReference: 'countertop_price_per_sqft',
        displayOrder: 5,
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
        questionText: 'Countertop square footage',
        inputType: 'number',
        defaultValue: '45',
        helpText: 'Total square feet of countertop area',
        formulaReference: 'countertop_sqft',
        displayOrder: 6,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 10, max: 100 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Bathroom Questions
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
        defaultValue: '1',
        helpText: 'How many bathrooms will be remodeled?',
        formulaReference: 'bathroom_count',
        displayOrder: 2,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 1, max: 5 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[2],
        questionText: 'Bathroom size category',
        inputType: 'select',
        options: 'Half Bath (25 sqft)||25,Full Bath (50 sqft)||50,Master Bath (100 sqft)||100,Large Master (150 sqft)||150',
        defaultValue: '50',
        helpText: 'Select the average bathroom size',
        formulaReference: 'bathroom_sqft',
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
        containerId: containerIds[2],
        questionText: 'Bathroom fixture quality',
        inputType: 'select',
        options: 'Standard||1,Mid-Range||1.5,High-End||2.5,Luxury||4',
        defaultValue: '1.5',
        helpText: 'Quality multiplier for fixtures (toilet, vanity, shower)',
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
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[3],
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
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 100, max: 5000 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[3],
        questionText: 'Primary flooring type',
        inputType: 'select',
        options: 'Luxury Vinyl Plank||4.5,Ceramic Tile||3.25,Hardwood||8.75,Carpet||2.5,Laminate||3.0',
        defaultValue: '4.5',
        helpText: 'Select primary flooring material - price per square foot',
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
        helpText: 'Does existing flooring need to be removed?',
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
        defaultValue: '1',
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
        helpText: 'Does the electrical panel need upgrading?',
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
        questionText: 'Linear feet of new plumbing runs',
        inputType: 'number',
        defaultValue: '50',
        helpText: 'Total linear feet of new plumbing installation',
        formulaReference: 'plumbing_linear_feet',
        displayOrder: 2,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 0, max: 500 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[6],
        questionText: 'Number of new plumbing fixtures',
        inputType: 'number',
        defaultValue: '3',
        helpText: 'How many new fixtures (sinks, toilets, showers)?',
        formulaReference: 'plumbing_fixtures_count',
        displayOrder: 3,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 0, max: 20 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Project Totals Questions
    const totalQuestions = [
      {
        containerId: containerIds[7],
        questionText: 'Additional project contingency (%)',
        inputType: 'slider',
        defaultValue: '10',
        helpText: 'Additional contingency percentage (recommended 10-20%)',
        formulaReference: 'contingency_percentage',
        displayOrder: 1,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 0, max: 30 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[7],
        questionText: 'Rush job premium?',
        inputType: 'radio',
        options: 'No Rush||1,2 Week Rush||1.15,1 Week Rush||1.25,Emergency||1.5',
        defaultValue: '1',
        helpText: 'Rush premium multiplier based on timeline',
        formulaReference: 'rush_multiplier',
        displayOrder: 2,
        isRequired: true,
        isVisible: true,
        isEditable: true,
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

    await queryInterface.bulkInsert('questions', questions);

    // 8. Create Formulas for calculations
    await queryInterface.bulkInsert('formulas', [
      // Kitchen Cost Formula
      {
        containerId: containerIds[1],
        name: 'Kitchen Total Cost',
        expression: 'include_kitchen * ((cabinet_linear_feet * cabinet_price_per_lf) + (countertop_sqft * countertop_price_per_sqft) + (kitchen_sqft * 150)) * complexity_multiplier',
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Bathroom Cost Formula  
      {
        containerId: containerIds[2],
        name: 'Bathroom Total Cost',
        expression: 'include_bathroom * bathroom_count * (bathroom_sqft * 200 * bathroom_quality_multiplier) * complexity_multiplier',
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Flooring Cost Formula
      {
        containerId: containerIds[3],
        name: 'Flooring Total Cost',
        expression: 'include_flooring * (flooring_sqft * flooring_price_per_sqft + (remove_existing_flooring * flooring_sqft * 2)) * complexity_multiplier',
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Painting Cost Formula
      {
        containerId: containerIds[4],
        name: 'Painting Total Cost',
        expression: 'include_painting * (((paint_wall_sqft + paint_ceiling_sqft) / 350 * paint_price_per_gallon) + ((paint_wall_sqft + paint_ceiling_sqft) * 1.5)) * complexity_multiplier',
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Electrical Cost Formula
      {
        containerId: containerIds[5],
        name: 'Electrical Total Cost',
        expression: 'include_electrical * ((electrical_outlets_count * 150) + (light_fixtures_count * 200) + (electrical_panel_upgrade * 2500)) * complexity_multiplier',
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Plumbing Cost Formula
      {
        containerId: containerIds[6],
        name: 'Plumbing Total Cost',
        expression: 'include_plumbing * ((plumbing_linear_feet * 25) + (plumbing_fixtures_count * 400)) * complexity_multiplier',
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Project Grand Total Formula
      {
        containerId: containerIds[7],
        name: 'Project Grand Total',
        expression: '((Kitchen_Total_Cost + Bathroom_Total_Cost + Flooring_Total_Cost + Painting_Total_Cost + Electrical_Total_Cost + Plumbing_Total_Cost) * (1 + OVERHEAD_RATE) * (1 + PROFIT_MARGIN) * rush_multiplier * (1 + contingency_percentage/100)) + (house_sqft * PERMIT_FEE_RATE)',
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);

    console.log('✅ House Remodel Estimator seed data created successfully!');
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
    await queryInterface.bulkDelete('formulas', null, {});
    await queryInterface.bulkDelete('questions', null, {});
    await queryInterface.bulkDelete('questionContainers', null, {});
    await queryInterface.bulkDelete('estimators', { title: 'Comprehensive House Remodel Estimator' }, {});
    await queryInterface.bulkDelete('items', null, {});
    await queryInterface.bulkDelete('labor', null, {});
    await queryInterface.bulkDelete('variables', null, {});
    await queryInterface.bulkDelete('eventTypes', { name: 'House Remodel' }, {});
    
    console.log('🗑️  House Remodel Estimator seed data removed');
  }
};
