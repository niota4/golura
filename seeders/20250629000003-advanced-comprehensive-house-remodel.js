'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, check if there are any users in the system, if not create a default admin user
    const [users] = await queryInterface.sequelize.query('SELECT id FROM users LIMIT 1');
    let defaultUserId;
    
    if (users.length === 0) {
      // Get the administrator role ID
      const [adminRole] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name = 'administrator' LIMIT 1");
      const adminRoleId = adminRole.length > 0 ? adminRole[0].id : 6;
      
      // Create a default admin user for seeding purposes
      await queryInterface.bulkInsert('users', [
        {
          id: 1,
          firstName: 'System',
          lastName: 'Admin',
          email: 'admin@golura.com',
          password: null,
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

    // 1. Create Event Type for Advanced House Remodel (if not exists)
    const [existingEventType] = await queryInterface.sequelize.query(
      "SELECT id FROM eventTypes WHERE name = 'Advanced House Remodel' LIMIT 1"
    );
    
    let eventTypeId;
    if (existingEventType.length === 0) {
      await queryInterface.bulkInsert('eventTypes', [
        {
          id: 3000,
          name: 'Advanced House Remodel',
          backgroundColor: '#2E8B57',
          tags: JSON.stringify(['construction', 'remodel', 'residential', 'comprehensive']),
          map: false,
          requireCheckIn: true,
          requireCheckOut: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]);
      eventTypeId = 3000;
    } else {
      eventTypeId = existingEventType[0].id;
    }

    // 2. Create additional variables for comprehensive estimator
    const advancedVariablesToCreate = [
      {
        name: 'KITCHEN_BASE_COST_PER_SQFT',
        value: '150',
        description: 'Base kitchen remodel cost per square foot',
      },
      {
        name: 'BATHROOM_BASE_COST_PER_SQFT',
        value: '200',
        description: 'Base bathroom remodel cost per square foot',
      },
      {
        name: 'FLOORING_REMOVAL_COST_PER_SQFT',
        value: '2',
        description: 'Cost to remove existing flooring per square foot',
      },
      {
        name: 'PAINT_COVERAGE_PER_GALLON',
        value: '350',
        description: 'Square feet coverage per gallon of paint',
      },
      {
        name: 'PAINT_LABOR_PER_SQFT',
        value: '1.5',
        description: 'Labor cost per square foot for painting',
      }
    ];

    for (const variable of advancedVariablesToCreate) {
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

    // 3. Create the Advanced Comprehensive Estimator
    const [existingEstimator] = await queryInterface.sequelize.query(
      "SELECT id FROM estimators WHERE title = 'Advanced Comprehensive House Remodel' LIMIT 1"
    );
    
    let estimatorId;
    if (existingEstimator.length === 0) {
      await queryInterface.bulkInsert('estimators', [
        {
          id: 3000,
          title: 'Advanced Comprehensive House Remodel',
          description: 'The most comprehensive house remodeling estimator with detailed cost breakdowns for all major construction trades including kitchen, bathroom, flooring, painting, electrical, plumbing, and project management overhead.',
          eventTypeId: eventTypeId,
          isActive: true,
          createdBy: defaultUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]);
      estimatorId = 3000;
    } else {
      estimatorId = existingEstimator[0].id;
    }

    // 4. Create Question Containers with unique IDs
    const containersToCreate = [
      {
        id: 301,
        estimatorId: estimatorId,
        name: 'Project Overview & Scope',
        isActive: true,
        displayOrder: 1,
        lineItemIds: JSON.stringify([]),
      },
      {
        id: 302,
        estimatorId: estimatorId,
        name: 'Kitchen Remodel Details',
        isActive: true,
        displayOrder: 2,
        lineItemIds: JSON.stringify([]),
      },
      {
        id: 303,
        estimatorId: estimatorId,
        name: 'Bathroom Remodel Details',
        isActive: true,
        displayOrder: 3,
        lineItemIds: JSON.stringify([]),
      },
      {
        id: 304,
        estimatorId: estimatorId,
        name: 'Flooring Installation',
        isActive: true,
        displayOrder: 4,
        lineItemIds: JSON.stringify([]),
      },
      {
        id: 305,
        estimatorId: estimatorId,
        name: 'Interior Painting',
        isActive: true,
        displayOrder: 5,
        lineItemIds: JSON.stringify([]),
      },
      {
        id: 306,
        estimatorId: estimatorId,
        name: 'Electrical Systems',
        isActive: true,
        displayOrder: 6,
        lineItemIds: JSON.stringify([]),
      },
      {
        id: 307,
        estimatorId: estimatorId,
        name: 'Plumbing Systems',
        isActive: true,
        displayOrder: 7,
        lineItemIds: JSON.stringify([]),
      },
      {
        id: 308,
        estimatorId: estimatorId,
        name: 'Project Management & Totals',
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

    // Use the container IDs
    const containerIds = [301, 302, 303, 304, 305, 306, 307, 308];

    // 5. Create Questions for each container
    const questions = [];

    // Project Overview Questions
    const projectQuestions = [
      {
        containerId: containerIds[0],
        questionText: 'Total house square footage',
        inputType: 'number',
        defaultValue: '2500',
        helpText: 'Enter the total living space square footage of the house',
        formulaReference: 'house_sqft',
        displayOrder: 1,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 500, max: 15000 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[0],
        questionText: 'Project complexity level',
        inputType: 'select',
        options: 'Basic Renovation||1,Standard Remodel||1.2,Complex Renovation||1.5,Luxury Custom||2,Historic Restoration||2.5',
        defaultValue: '1.2',
        helpText: 'Complexity affects labor time, material handling, and coordination requirements',
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
        questionText: 'Project timeline urgency',
        inputType: 'select',
        options: 'Standard Schedule||1,Accelerated (2-3 months)||1.2,Rush (1-2 months)||1.5,Emergency (Under 1 month)||2',
        defaultValue: '1',
        helpText: 'Rushed timelines require overtime labor and expedited material delivery',
        formulaReference: 'timeline_multiplier',
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
        questionText: 'Geographic location factor',
        inputType: 'select',
        options: 'Rural Area||0.8,Small City||0.9,Suburban||1,Urban||1.2,Major Metropolitan||1.4',
        defaultValue: '1',
        helpText: 'Location affects material costs, labor rates, and permit fees',
        formulaReference: 'location_multiplier',
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
        questionText: 'Project contingency percentage',
        inputType: 'slider',
        defaultValue: '15',
        helpText: 'Recommended contingency for unexpected issues (10-25% typical)',
        formulaReference: 'contingency_percentage',
        displayOrder: 5,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 5, max: 35 }),
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
        options: 'Yes - Full Remodel||1,Yes - Partial Update||0.6,No||0',
        defaultValue: '0',
        helpText: 'Select the scope of kitchen work to be included',
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
        defaultValue: '200',
        helpText: 'Total kitchen area including island and pantry space',
        formulaReference: 'kitchen_sqft',
        displayOrder: 2,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 80, max: 800 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[1],
        questionText: 'Cabinet quality and style',
        inputType: 'select',
        options: 'Stock/Builder Grade||600,Semi-Custom Standard||1000,Semi-Custom Premium||1400,Full Custom||2200,Luxury Custom||3500',
        defaultValue: '1000',
        helpText: 'Cabinet cost per linear foot including hardware and installation',
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
        questionText: 'Total linear feet of cabinets',
        inputType: 'number',
        defaultValue: '25',
        helpText: 'Combined upper and lower cabinet linear footage (measure wall space)',
        formulaReference: 'cabinet_linear_feet',
        displayOrder: 4,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 8, max: 80 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[1],
        questionText: 'Countertop material',
        inputType: 'select',
        options: 'Laminate||35,Solid Surface||65,Granite||85,Quartz||95,Marble||130,Butcher Block||45',
        defaultValue: '95',
        helpText: 'Cost per square foot including fabrication and installation',
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
        defaultValue: '60',
        helpText: 'Total countertop area including islands and breakfast bars',
        formulaReference: 'countertop_sqft',
        displayOrder: 6,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 15, max: 150 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[1],
        questionText: 'Include kitchen island?',
        inputType: 'radio',
        options: 'Yes - New Island||1,Yes - Modify Existing||0.5,No||0',
        defaultValue: '0',
        helpText: 'Kitchen island adds significant value but increases costs',
        formulaReference: 'include_kitchen_island',
        displayOrder: 7,
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
        questionText: 'Include bathroom remodeling?',
        inputType: 'radio',
        options: 'Yes - Full Remodel||1,Yes - Partial Update||0.6,No||0',
        defaultValue: '0',
        helpText: 'Select the scope of bathroom work to be included',
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
        questionText: 'Number of bathrooms',
        inputType: 'number',
        defaultValue: '2',
        helpText: 'Total number of bathrooms to be remodeled',
        formulaReference: 'bathroom_count',
        displayOrder: 2,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 1, max: 12 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[2],
        questionText: 'Average bathroom size',
        inputType: 'select',
        options: 'Powder Room (20 sqft)||20,Half Bath (30 sqft)||30,Full Bath (50 sqft)||50,Large Bath (75 sqft)||75,Master Suite (120 sqft)||120,Luxury Master (200 sqft)||200',
        defaultValue: '50',
        helpText: 'Average square footage per bathroom being remodeled',
        formulaReference: 'bathroom_avg_sqft',
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
        questionText: 'Bathroom finish quality',
        inputType: 'select',
        options: 'Builder Grade||1,Standard||1.3,Premium||1.8,Luxury||2.5,Ultra Luxury||3.5',
        defaultValue: '1.3',
        helpText: 'Quality multiplier for fixtures, tile, and finishes',
        formulaReference: 'bathroom_quality_multiplier',
        displayOrder: 4,
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
        questionText: 'Include master bath features?',
        inputType: 'checkbox',
        options: 'Separate Shower||2500,Soaking Tub||1800,Double Vanity||1200,Walk-in Closet||3000',
        helpText: 'Select premium features for master bathroom (check all that apply)',
        formulaReference: 'master_bath_features',
        displayOrder: 5,
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
        options: 'Yes - Whole House||1,Yes - Partial Areas||0.6,No||0',
        defaultValue: '0',
        helpText: 'Select the scope of flooring work',
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
        questionText: 'Total flooring area',
        inputType: 'number',
        defaultValue: '2000',
        helpText: 'Total square footage for new flooring installation',
        formulaReference: 'flooring_sqft',
        displayOrder: 2,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 200, max: 10000 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[3],
        questionText: 'Primary flooring material',
        inputType: 'select',
        options: 'Carpet (Mid-grade)||3.50,Luxury Vinyl Plank||5.25,Ceramic Tile||4.75,Hardwood (Oak)||9.50,Engineered Hardwood||7.25,Natural Stone||8.50',
        defaultValue: '5.25',
        helpText: 'Material cost per square foot including installation',
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
        options: 'Yes - Standard Removal||1,Yes - Difficult Removal||1.8,No - Install Over||0',
        defaultValue: '1',
        helpText: 'Removal complexity affects labor time and disposal costs',
        formulaReference: 'flooring_removal_multiplier',
        displayOrder: 4,
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
        questionText: 'Subfloor work needed?',
        inputType: 'radio',
        options: 'Major Repair/Replace||1,Minor Repair||0.3,None||0',
        defaultValue: '0',
        helpText: 'Subfloor issues can significantly impact flooring costs',
        formulaReference: 'subfloor_work_multiplier',
        displayOrder: 5,
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
        options: 'Yes - Whole House||1,Yes - Partial Areas||0.6,No||0',
        defaultValue: '0',
        helpText: 'Select the scope of interior painting work',
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
        questionText: 'Wall area to paint',
        inputType: 'number',
        defaultValue: '3000',
        helpText: 'Total wall area in square feet (typically 1.2x floor area)',
        formulaReference: 'paint_wall_sqft',
        displayOrder: 2,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 500, max: 15000 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[4],
        questionText: 'Ceiling area to paint',
        inputType: 'number',
        defaultValue: '2500',
        helpText: 'Total ceiling area in square feet',
        formulaReference: 'paint_ceiling_sqft',
        displayOrder: 3,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 0, max: 10000 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[4],
        questionText: 'Paint quality level',
        inputType: 'select',
        options: 'Builder Grade||40,Good Quality||60,Premium||80,Ultra Premium||110',
        defaultValue: '60',
        helpText: 'Paint cost per gallon affects coverage and durability',
        formulaReference: 'paint_price_per_gallon',
        displayOrder: 4,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[4],
        questionText: 'Surface preparation level',
        inputType: 'select',
        options: 'Minimal Prep||1,Standard Prep||1.2,Extensive Prep||1.8,Full Restoration||2.5',
        defaultValue: '1.2',
        helpText: 'Surface condition affects prep time and material costs',
        formulaReference: 'paint_prep_multiplier',
        displayOrder: 5,
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
        options: 'Yes - Major Upgrade||1,Yes - Minor Updates||0.5,No||0',
        defaultValue: '0',
        helpText: 'Select the scope of electrical work needed',
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
        questionText: 'Number of new outlets',
        inputType: 'number',
        defaultValue: '15',
        helpText: 'New electrical outlets needed throughout the house',
        formulaReference: 'electrical_outlets_count',
        displayOrder: 2,
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
        questionText: 'Number of light fixtures',
        inputType: 'number',
        defaultValue: '20',
        helpText: 'New light fixtures to be installed',
        formulaReference: 'light_fixtures_count',
        displayOrder: 3,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 0, max: 150 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[5],
        questionText: 'Electrical panel upgrade?',
        inputType: 'radio',
        options: 'Yes - Full 200A Panel||1,Yes - Sub-panel Only||0.4,No||0',
        defaultValue: '0',
        helpText: 'Panel upgrades may be required for major remodels',
        formulaReference: 'electrical_panel_upgrade',
        displayOrder: 4,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[5],
        questionText: 'Smart home integration?',
        inputType: 'radio',
        options: 'Full Smart Home||1,Basic Smart Features||0.4,None||0',
        defaultValue: '0',
        helpText: 'Smart switches, thermostats, and automation systems',
        formulaReference: 'smart_home_multiplier',
        displayOrder: 5,
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
        options: 'Yes - Major Repiping||1,Yes - Fixture Updates||0.6,No||0',
        defaultValue: '0',
        helpText: 'Select the scope of plumbing work needed',
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
        defaultValue: '200',
        helpText: 'Estimated linear feet of new plumbing runs (supply and drain)',
        formulaReference: 'plumbing_linear_feet',
        displayOrder: 2,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 20, max: 1000 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[6],
        questionText: 'Number of plumbing fixtures',
        inputType: 'number',
        defaultValue: '8',
        helpText: 'Total fixtures: sinks, toilets, showers, tubs, etc.',
        formulaReference: 'plumbing_fixtures_count',
        displayOrder: 3,
        isRequired: false,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 1, max: 50 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        containerId: containerIds[6],
        questionText: 'Water heater replacement?',
        inputType: 'radio',
        options: 'Yes - Tankless||1,Yes - Standard Tank||0.6,No||0',
        defaultValue: '0',
        helpText: 'Water heater upgrades for increased capacity or efficiency',
        formulaReference: 'water_heater_upgrade',
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

    // Project Management Questions
    const managementQuestions = [
      {
        containerId: containerIds[7],
        questionText: 'Project management complexity',
        inputType: 'select',
        options: 'DIY Management||0,Basic Contractor||0.08,Full Service GC||0.15,Design-Build||0.20',
        defaultValue: '0.15',
        helpText: 'Management fee as percentage of total project cost',
        formulaReference: 'management_fee_percentage',
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
        containerId: containerIds[7],
        questionText: 'Permit and inspection costs',
        inputType: 'number',
        defaultValue: '2500',
        helpText: 'Estimated permit fees, inspections, and compliance costs',
        formulaReference: 'permit_costs',
        displayOrder: 2,
        isRequired: true,
        isVisible: true,
        isEditable: true,
        isActive: true,
        createdBy: defaultUserId,
        validationRules: JSON.stringify({ min: 500, max: 15000 }),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Combine all questions
    questions.push(...projectQuestions, ...kitchenQuestions, ...bathroomQuestions, 
                  ...flooringQuestions, ...paintingQuestions, ...electricalQuestions, 
                  ...plumbingQuestions, ...managementQuestions);

    // Insert questions one by one to avoid conflicts
    for (const question of questions) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM questions WHERE containerId = ${question.containerId} AND formulaReference = '${question.formulaReference}' LIMIT 1`
      );
      
      if (existing.length === 0) {
        await queryInterface.bulkInsert('questions', [question]);
      }
    }

    // 6. Create comprehensive formulas
    const formulasToCreate = [
      // Kitchen Formula
      {
        containerId: containerIds[1],
        name: 'Kitchen Total Cost',
        expression: 'include_kitchen * ((cabinet_linear_feet * cabinet_price_per_lf) + (countertop_sqft * countertop_price_per_sqft) + (kitchen_sqft * KITCHEN_BASE_COST_PER_SQFT) + (include_kitchen_island * 5000)) * complexity_multiplier * location_multiplier',
        isActive: true,
        createdBy: defaultUserId,
      },

      // Bathroom Formula
      {
        containerId: containerIds[2],
        name: 'Bathroom Total Cost',
        expression: 'include_bathroom * bathroom_count * (bathroom_avg_sqft * BATHROOM_BASE_COST_PER_SQFT * bathroom_quality_multiplier + master_bath_features) * complexity_multiplier * location_multiplier',
        isActive: true,
        createdBy: defaultUserId,
      },

      // Flooring Formula
      {
        containerId: containerIds[3],
        name: 'Flooring Total Cost',
        expression: 'include_flooring * flooring_sqft * (flooring_price_per_sqft + (flooring_removal_multiplier * FLOORING_REMOVAL_COST_PER_SQFT) + (subfloor_work_multiplier * 3)) * complexity_multiplier * location_multiplier',
        isActive: true,
        createdBy: defaultUserId,
      },

      // Painting Formula
      {
        containerId: containerIds[4],
        name: 'Painting Total Cost',
        expression: 'include_painting * (((paint_wall_sqft + paint_ceiling_sqft) / PAINT_COVERAGE_PER_GALLON * paint_price_per_gallon) + ((paint_wall_sqft + paint_ceiling_sqft) * PAINT_LABOR_PER_SQFT)) * paint_prep_multiplier * complexity_multiplier * location_multiplier',
        isActive: true,
        createdBy: defaultUserId,
      },

      // Electrical Formula
      {
        containerId: containerIds[5],
        name: 'Electrical Total Cost',
        expression: 'include_electrical * ((electrical_outlets_count * 180) + (light_fixtures_count * 250) + (electrical_panel_upgrade * 3500) + (smart_home_multiplier * 2500)) * complexity_multiplier * location_multiplier',
        isActive: true,
        createdBy: defaultUserId,
      },

      // Plumbing Formula
      {
        containerId: containerIds[6],
        name: 'Plumbing Total Cost',
        expression: 'include_plumbing * ((plumbing_linear_feet * 35) + (plumbing_fixtures_count * 600) + (water_heater_upgrade * 3200)) * complexity_multiplier * location_multiplier',
        isActive: true,
        createdBy: defaultUserId,
      },

      // Project Grand Total Formula
      {
        containerId: containerIds[7],
        name: 'Project Grand Total',
        expression: '((Kitchen_Total_Cost + Bathroom_Total_Cost + Flooring_Total_Cost + Painting_Total_Cost + Electrical_Total_Cost + Plumbing_Total_Cost) * (1 + management_fee_percentage) * timeline_multiplier * (1 + contingency_percentage/100)) + permit_costs',
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

    console.log('✅ Advanced Comprehensive House Remodel Estimator created successfully!');
    console.log('📊 Summary:');
    console.log('   - 1 Event Type (Advanced House Remodel)');
    console.log('   - 5 Additional Variables');
    console.log('   - 1 Advanced Comprehensive Estimator');
    console.log('   - 8 Detailed Question Containers');
    console.log('   - 35+ Dynamic Questions');
    console.log('   - 7 Complex Mathematical Formulas');
    console.log('');
    console.log('🏗️ This advanced estimator includes:');
    console.log('   ✓ Detailed project scoping with location factors');
    console.log('   ✓ Comprehensive kitchen remodel calculations');
    console.log('   ✓ Full bathroom remodel with luxury options');
    console.log('   ✓ Advanced flooring with subfloor considerations');
    console.log('   ✓ Professional painting with prep requirements');
    console.log('   ✓ Modern electrical with smart home options');
    console.log('   ✓ Complete plumbing with fixture upgrades');
    console.log('   ✓ Project management and timeline multipliers');
    console.log('   ✓ Location-based cost adjustments');
    console.log('   ✓ Complexity and quality multipliers');
    console.log('   ✓ Comprehensive contingency planning');

  },

  down: async (queryInterface, Sequelize) => {
    // Remove in reverse order to respect foreign key constraints
    await queryInterface.bulkDelete('formulas', { containerId: [301, 302, 303, 304, 305, 306, 307, 308] }, {});
    await queryInterface.bulkDelete('questions', { containerId: [301, 302, 303, 304, 305, 306, 307, 308] }, {});
    await queryInterface.bulkDelete('questionContainers', { id: [301, 302, 303, 304, 305, 306, 307, 308] }, {});
    await queryInterface.bulkDelete('estimators', { title: 'Advanced Comprehensive House Remodel' }, {});
    await queryInterface.bulkDelete('variables', { name: ['KITCHEN_BASE_COST_PER_SQFT', 'BATHROOM_BASE_COST_PER_SQFT', 'FLOORING_REMOVAL_COST_PER_SQFT', 'PAINT_COVERAGE_PER_GALLON', 'PAINT_LABOR_PER_SQFT'] }, {});
    await queryInterface.bulkDelete('eventTypes', { id: 3000 }, {});
    
    console.log('🗑️ Advanced Comprehensive House Remodel Estimator removed');
  }
};
