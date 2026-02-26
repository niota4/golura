const { EventType, Estimator, QuestionContainer, Question, LineItem, Formula, Variable } = require('../models');
const OllamaHelper = require('../helpers/ollama');

class EstimatorAI {
    static getBasicFormulas() {
        return [
            {
                title: 'Material Cost',
                formula: '{{total_area}} * {{material_cost_per_unit}}',
                description: 'Basic material cost calculation',
                category: 'materials',
                orderIndex: 0
            },
            {
                title: 'Labor Cost',
                formula: '{{total_area}} * {{labor_hours_per_unit}} * {{hourly_rate}}',
                description: 'Basic labor cost calculation',
                category: 'labor',
                orderIndex: 1
            },
            {
                title: 'Equipment Cost',
                formula: '{{project_duration_days}} * {{daily_equipment_rate}}',
                description: 'Equipment rental costs',
                category: 'equipment',
                orderIndex: 2
            },
            {
                title: 'Overhead',
                formula: '{{subtotal}} * {{overhead_percentage}} / 100',
                description: 'Business overhead costs',
                category: 'overhead',
                orderIndex: 3
            },
            {
                title: 'Project Total',
                formula: '{{material_cost}} + {{labor_cost}} + {{equipment_cost}} + {{overhead}}',
                description: 'Total project cost',
                category: 'totals',
                orderIndex: 4
            }
        ];
    };
    static getBasicFormulasForProject(projectType, complexity) {
        const baseFormulas = [
            {
                title: 'Material Cost',
                formula: '{{total_area}} * {{material_cost_per_unit}}',
                description: 'Basic material cost calculation'
            },
            {
                title: 'Labor Cost',
                formula: '{{total_area}} * {{labor_hours_per_unit}} * {{hourly_rate}}',
                description: 'Basic labor cost calculation'
            },
            {
                title: 'Equipment Cost',
                formula: '{{project_duration_days}} * {{daily_equipment_rate}}',
                description: 'Equipment rental costs'
            },
            {
                title: 'Overhead',
                formula: '{{subtotal}} * {{overhead_percentage}} / 100',
                description: 'Business overhead costs'
            },
            {
                title: 'Project Total',
                formula: '{{material_cost}} + {{labor_cost}} + {{equipment_cost}} + {{overhead}}',
                description: 'Total project cost'
            }
        ];

        if (complexity === 'large' || complexity === 'enterprise') {
            baseFormulas.push({
                title: 'Project Management Fee',
                formula: '{{subtotal}} * 0.15',
                description: 'Project management and coordination (15%)'
            });
        }

        return baseFormulas;
    };
    static getBasicLineItems() {
        return [
            { title: 'Site Preparation', description: 'Site setup, protection, and preparation', unit: 'day', category: 'Preparation', orderIndex: 0 },
            { title: 'Permits and Inspections', description: 'Required permits and inspection fees', unit: 'each', category: 'Permits', orderIndex: 1 },
            { title: 'Material Delivery', description: 'Material delivery and handling', unit: 'load', category: 'Logistics', orderIndex: 2 },
            { title: 'Primary Installation', description: 'Main project installation work', unit: 'sqft', category: 'Installation', orderIndex: 3 },
            { title: 'Cleanup and Disposal', description: 'Job site cleanup and waste disposal', unit: 'day', category: 'Cleanup', orderIndex: 4 }
        ];
    };
    static getBasicLineItemsForProject(projectType) {
        const projectSpecific = {
            'roofing': [
                { title: 'Roof Preparation', description: 'Site setup and roof access preparation', unit: 'day', category: 'Preparation' },
                { title: 'Material Delivery', description: 'Roofing material delivery and staging', unit: 'load', category: 'Logistics' },
                { title: 'Tear-off', description: 'Remove existing roofing materials', unit: 'sqft', category: 'Demolition' },
                { title: 'Deck Repair', description: 'Repair and prepare roof deck', unit: 'sqft', category: 'Preparation' },
                { title: 'Underlayment', description: 'Install roofing underlayment', unit: 'sqft', category: 'Materials' },
                { title: 'Roofing Installation', description: 'Install new roofing material', unit: 'sqft', category: 'Installation' },
                { title: 'Flashing', description: 'Install roof flashing', unit: 'linear_ft', category: 'Installation' },
                { title: 'Cleanup', description: 'Site cleanup and debris removal', unit: 'day', category: 'Cleanup' }
            ],
            'kitchen-remodel': [
                { title: 'Demolition', description: 'Remove existing kitchen components', unit: 'sqft', category: 'Demolition' },
                { title: 'Electrical Rough-in', description: 'Electrical wiring and outlets', unit: 'hour', category: 'Electrical' },
                { title: 'Plumbing Rough-in', description: 'Plumbing modifications', unit: 'hour', category: 'Plumbing' },
                { title: 'Drywall', description: 'Drywall installation and finishing', unit: 'sqft', category: 'Finishing' },
                { title: 'Cabinets', description: 'Kitchen cabinet installation', unit: 'linear_ft', category: 'Installation' },
                { title: 'Countertops', description: 'Countertop fabrication and installation', unit: 'sqft', category: 'Installation' },
                { title: 'Appliances', description: 'Kitchen appliance installation', unit: 'each', category: 'Installation' },
                { title: 'Final Cleanup', description: 'Final cleaning and touch-ups', unit: 'day', category: 'Cleanup' }
            ],
            'bathroom-remodel': [
                { title: 'Demolition', description: 'Remove existing bathroom fixtures', unit: 'sqft', category: 'Demolition' },
                { title: 'Plumbing Rough-in', description: 'Plumbing rough-in work', unit: 'hour', category: 'Plumbing' },
                { title: 'Electrical Work', description: 'Electrical updates and GFCI', unit: 'hour', category: 'Electrical' },
                { title: 'Waterproofing', description: 'Waterproofing and membrane installation', unit: 'sqft', category: 'Preparation' },
                { title: 'Tile Work', description: 'Bathroom tile installation', unit: 'sqft', category: 'Installation' },
                { title: 'Fixtures', description: 'Bathroom fixture installation', unit: 'each', category: 'Installation' },
                { title: 'Final Finish', description: 'Final touches and caulking', unit: 'day', category: 'Finishing' }
            ],
            'flooring': [
                { title: 'Floor Preparation', description: 'Subfloor preparation and leveling', unit: 'sqft', category: 'Preparation' },
                { title: 'Material Delivery', description: 'Flooring material delivery', unit: 'load', category: 'Logistics' },
                { title: 'Removal', description: 'Remove existing flooring', unit: 'sqft', category: 'Demolition' },
                { title: 'Subfloor Repair', description: 'Repair and prepare subfloor', unit: 'sqft', category: 'Preparation' },
                { title: 'Installation', description: 'Flooring installation', unit: 'sqft', category: 'Installation' },
                { title: 'Trim Work', description: 'Baseboard and trim installation', unit: 'linear_ft', category: 'Finishing' },
                { title: 'Cleanup', description: 'Final cleanup and debris removal', unit: 'day', category: 'Cleanup' }
            ]
        };
        return projectSpecific[projectType] || [
            { title: 'Site Preparation', description: 'Site setup, protection, and preparation', unit: 'day', category: 'Preparation' },
            { title: 'Permits and Inspections', description: 'Required permits and inspection fees', unit: 'each', category: 'Permits' },
            { title: 'Material Delivery', description: 'Material delivery and handling', unit: 'load', category: 'Logistics' },
            { title: 'Primary Installation', description: 'Main project installation work', unit: 'sqft', category: 'Installation' },
            { title: 'Cleanup and Disposal', description: 'Job site cleanup and waste disposal', unit: 'day', category: 'Cleanup' }
        ];
    };
    static getFallbackQuestions(projectType) {
        // Common questions for all project types
        const commonQuestions = [
            {
                text: 'What is the total square footage of your project?',
                type: 'number',
                variable: 'total_sqft',
                required: true,
                displayOrder: 0,
                category: 'measurements',
                helpText: 'Enter the approximate square footage of the area to be worked on.'
            },
            {
                text: 'What is your preferred timeline for this project?',
                type: 'select',
                options: ['As soon as possible', 'Within 1 month', 'Within 3 months', 'Flexible'],
                variable: 'timeline_preference',
                required: false,
                displayOrder: 1,
                category: 'scheduling'
            },
            {
                text: 'Do you have a specific budget range for this project?',
                type: 'select',
                options: ['Under $5,000', '$5,000-$10,000', '$10,000-$25,000', '$25,000-$50,000', 'Over $50,000'],
                variable: 'budget_range',
                required: false,
                displayOrder: 2,
                category: 'budget'
            },
            {
                text: 'Please provide any additional details about your project:',
                type: 'textarea',
                variable: 'additional_details',
                required: false,
                displayOrder: 3,
                category: 'details'
            }
        ];
        
        // Project-specific questions
        const projectQuestions = {
            'roofing': [
                {
                    text: 'What type of roofing material are you interested in?',
                    type: 'select',
                    options: ['Asphalt shingles', 'Metal roofing', 'Tile', 'Slate', 'Wood shakes'],
                    variable: 'roofing_material',
                    required: true,
                    displayOrder: 4,
                    category: 'materials'
                },
                {
                    text: 'Do you need gutters replaced as well?',
                    type: 'radio',
                    options: ['Yes', 'No'],
                    variable: 'replace_gutters',
                    required: false,
                    displayOrder: 5,
                    category: 'scope'
                }
            ],
            'kitchen-remodel': [
                {
                    text: 'What type of cabinets are you interested in?',
                    type: 'select',
                    options: ['Stock cabinets', 'Semi-custom cabinets', 'Custom cabinets'],
                    variable: 'cabinet_type',
                    required: true,
                    displayOrder: 4,
                    category: 'materials'
                },
                {
                    text: 'What type of countertop material do you prefer?',
                    type: 'select',
                    options: ['Laminate', 'Granite', 'Quartz', 'Marble', 'Butcher block'],
                    variable: 'countertop_material',
                    required: true,
                    displayOrder: 5,
                    category: 'materials'
                }
            ],
            'bathroom-remodel': [
                {
                    text: 'What type of shower/tub configuration do you want?',
                    type: 'select',
                    options: ['Tub only', 'Shower only', 'Tub/shower combo', 'Separate tub and shower'],
                    variable: 'shower_tub_config',
                    required: true,
                    displayOrder: 4,
                    category: 'design'
                },
                {
                    text: 'What type of flooring do you prefer for your bathroom?',
                    type: 'select',
                    options: ['Ceramic tile', 'Porcelain tile', 'Vinyl', 'Natural stone'],
                    variable: 'bathroom_flooring',
                    required: true,
                    displayOrder: 5,
                    category: 'materials'
                }
            ],
            'flooring': [
                {
                    text: 'What type of flooring are you interested in?',
                    type: 'select',
                    options: ['Hardwood', 'Laminate', 'Tile', 'Vinyl', 'Carpet'],
                    variable: 'flooring_type',
                    required: true,
                    displayOrder: 4,
                    category: 'materials'
                },
                {
                    text: 'Do you need the existing flooring removed?',
                    type: 'radio',
                    options: ['Yes', 'No'],
                    variable: 'remove_existing',
                    required: true,
                    displayOrder: 5,
                    category: 'scope'
                }
            ]
        };
        
        // Return combined questions if we have project-specific ones, otherwise just common questions
        if (projectQuestions[projectType]) {
            return [...commonQuestions, ...projectQuestions[projectType]];
        }
        
        return commonQuestions;
    };
    static getStructuredQuestionContainers(estimator) {
        const projectType = EstimatorAI.determineProjectType(estimator);
        const complexity = estimator.complexity || 'medium';
        
        const containers = [
            {
                title: 'Project Overview & Measurements',
                description: 'Basic project information, site conditions, and key measurements',
                orderIndex: 0,
                questions: [
                    {
                        text: 'What is the total square footage of your project?',
                        type: 'number',
                        variable: 'total_sqft',
                        required: true,
                        category: 'measurements',
                        helpText: 'Enter the approximate square footage of the area to be worked on.'
                    },
                    {
                        text: 'What is your approximate linear footage involved?',
                        type: 'number',
                        variable: 'linear_ft',
                        required: false,
                        category: 'measurements',
                        helpText: 'For projects involving perimeter work or linear installations.'
                    },
                    {
                        text: 'How would you describe the site access?',
                        type: 'select',
                        variable: 'site_access',
                        required: true,
                        category: 'site_conditions',
                        options: ['Easy access', 'Moderate difficulty', 'Difficult access', 'Very challenging'],
                        helpText: 'Consider parking, material delivery, and equipment access.'
                    },
                    {
                        text: 'Are there any special site conditions we should know about?',
                        type: 'textarea',
                        variable: 'site_conditions',
                        required: false,
                        category: 'site_conditions',
                        helpText: 'Describe any unique challenges, existing damage, or special requirements.'
                    }
                ]
            },
            {
                title: 'Materials & Quality Specifications',
                description: 'Material selections, quality levels, and technical specifications',
                orderIndex: 1,
                questions: [
                    {
                        text: 'What quality level are you looking for?',
                        type: 'select',
                        variable: 'quality_level',
                        required: true,
                        category: 'materials',
                        options: ['Budget', 'Standard', 'Premium', 'Luxury'],
                        helpText: 'Quality level affects material costs'
                    },
                    {
                        text: 'Do you have specific material preferences?',
                        type: 'textarea',
                        variable: 'material_preferences',
                        required: false,
                        category: 'materials',
                        helpText: 'Any specific brands, colors, or materials'
                    },
                    {
                        text: 'Are you open to value engineering suggestions?',
                        type: 'radio',
                        variable: 'value_engineering',
                        required: false,
                        category: 'materials',
                        options: ['Yes', 'No'],
                        helpText: 'Whether you\'re open to cost-saving alternatives.'
                    },
                    {
                        text: 'Do you need help with material selection?',
                        type: 'radio',
                        variable: 'material_consultation',
                        required: false,
                        category: 'materials',
                        options: ['Yes', 'No'],
                        helpText: 'We can provide guidance on material choices.'
                    }
                ]
            },
            {
                title: 'Timeline & Scheduling',
                description: 'Project timeline, scheduling preferences, and deadline requirements',
                orderIndex: 2,
                questions: [
                    {
                        text: 'What is your preferred timeline for this project?',
                        type: 'select',
                        variable: 'timeline_preference',
                        required: true,
                        category: 'scheduling',
                        options: ['As soon as possible', 'Within 1 month', 'Within 3 months', 'Flexible'],
                        helpText: 'Your timeline preference affects scheduling and pricing.'
                    },
                    {
                        text: 'Do you have any hard deadlines?',
                        type: 'textarea',
                        variable: 'hard_deadlines',
                        required: false,
                        category: 'scheduling',
                        helpText: 'Any specific dates the project must be completed by.'
                    },
                    {
                        text: 'Are there any time restrictions for work hours?',
                        type: 'textarea',
                        variable: 'time_restrictions',
                        required: false,
                        category: 'scheduling',
                        helpText: 'HOA restrictions, noise ordinances, or personal preferences.'
                    },
                    {
                        text: 'Would you prefer to have the work done in phases?',
                        type: 'radio',
                        variable: 'phased_work',
                        required: false,
                        category: 'scheduling',
                        options: ['Yes', 'No', 'Open to suggestions'],
                        helpText: 'Whether you want the project broken into smaller phases.'
                    }
                ]
            },
            {
                title: 'Budget & Financial Considerations',
                description: 'Budget expectations, payment preferences, and financial planning',
                orderIndex: 3,
                questions: [
                    {
                        text: 'What is your approximate budget range for this project?',
                        type: 'select',
                        variable: 'budget_range',
                        required: false,
                        category: 'budget',
                        options: ['Under $5,000', '$5,000-$15,000', '$15,000-$30,000', '$30,000-$50,000', '$50,000-$100,000', 'Over $100,000'],
                        helpText: 'This helps us tailor our recommendations to your budget.'
                    },
                    {
                        text: 'How important is staying within budget vs. getting premium results?',
                        type: 'slider',
                        variable: 'budget_vs_quality',
                        required: false,
                        category: 'budget',
                        helpText: 'Scale from 0 (budget most important) to 100 (quality most important).'
                    },
                    {
                        text: 'Would you like to include a contingency in the estimate?',
                        type: 'radio',
                        variable: 'include_contingency',
                        required: false,
                        category: 'budget',
                        options: ['Yes (10%)', 'Yes (15%)', 'Yes (20%)', 'No'],
                        helpText: 'Contingency covers unexpected issues or changes.'
                    },
                    {
                        text: 'Do you have any financing considerations?',
                        type: 'textarea',
                        variable: 'financing_notes',
                        required: false,
                        category: 'budget',
                        helpText: 'Payment schedule preferences or financing arrangements.'
                    }
                ]
            },
            {
                title: 'Permits & Compliance',
                description: 'Permitting requirements, inspections, and regulatory compliance',
                orderIndex: 4,
                questions: [
                    {
                        text: 'Do you need help obtaining permits?',
                        type: 'radio',
                        variable: 'permit_assistance',
                        required: false,
                        category: 'permits',
                        options: ['Yes', 'No', 'Not sure'],
                        helpText: 'We can handle permit applications and approvals.'
                    },
                    {
                        text: 'Are you aware of any HOA restrictions or requirements?',
                        type: 'textarea',
                        variable: 'hoa_restrictions',
                        required: false,
                        category: 'permits',
                        helpText: 'Any homeowner association rules that might affect the project.'
                    },
                    {
                        text: 'Do you need any specific code compliance certifications?',
                        type: 'textarea',
                        variable: 'code_requirements',
                        required: false,
                        category: 'permits',
                        helpText: 'Special certifications or compliance requirements.'
                    },
                    {
                        text: 'Should we include inspection costs in the estimate?',
                        type: 'radio',
                        variable: 'include_inspections',
                        required: false,
                        category: 'permits',
                        options: ['Yes', 'No'],
                        helpText: 'Whether to include municipal inspection fees.'
                                       }
                ]
            }
        ];

        // Add project-specific containers based on type
        if (projectType === 'roofing') {
            containers.push({
                title: 'Roofing System Specifics',
                description: 'Roof structure, materials, and system requirements',
                orderIndex: 5,
                questions: [
                    {
                        text: 'What type of roofing material are you interested in?',
                        type: 'select',
                        variable: 'roofing_material',
                        required: true,
                        category: 'materials',
                        options: ['Asphalt shingles', 'Metal roofing', 'Tile', 'Slate', 'Wood shakes'],
                        helpText: 'Different materials have varying costs and installation requirements.'
                    },
                    {
                        text: 'How many stories is your home?',
                        type: 'select',
                        variable: 'home_stories',
                        required: true,
                        category: 'measurements',
                        options: ['1 story', '2 stories', '3+ stories'],
                        helpText: 'Height affects labor costs and safety requirements.'
                    },
                    {
                        text: 'What is the current roof condition?',
                        type: 'select',
                        variable: 'roof_condition',
                        required: true,
                        category: 'existing_conditions',
                        options: ['Good condition', 'Minor issues', 'Significant damage', 'Complete replacement needed'],
                        helpText: 'Current condition affects preparation and disposal costs.'
                    },
                    {
                        text: 'Do you need gutters or downspouts replaced?',
                        type: 'radio',
                        variable: 'replace_gutters',
                        required: false,
                        category: 'scope',
                        options: ['Yes', 'No', 'Not sure'],
                        helpText: 'Gutter work can be included in the roofing project.'
                    }
                ]
            });
        } else if (projectType === 'kitchen-remodel') {
            containers.push({
                title: 'Kitchen Design & Layout',
                description: 'Kitchen configuration, appliances, and design preferences',
                orderIndex: 5,
                questions: [
                    {
                        text: 'What type of cabinet work do you need?',
                        type: 'select',
                        variable: 'cabinet_work_type',
                        required: true,
                        category: 'scope',
                        options: ['Refinish existing', 'Replace doors/fronts', 'Complete replacement', 'Custom built'],
                        helpText: 'Different cabinet approaches have very different costs.'
                    },
                    {
                        text: 'What countertop material do you prefer?',
                        type: 'select',
                        variable: 'countertop_material',
                        required: true,
                        category: 'materials',
                        options: ['Laminate', 'Granite', 'Quartz', 'Marble', 'Butcher block', 'Concrete'],
                        helpText: 'Countertop material significantly affects project cost.'
                    },
                    {
                        text: 'Are you planning to relocate any appliances or plumbing?',
                        type: 'radio',
                        variable: 'relocate_utilities',
                        required: true,
                        category: 'scope',
                        options: ['Yes', 'No', 'Maybe'],
                        helpText: 'Moving utilities adds significant cost to the project.'
                    },
                    {
                        text: 'Do you need new appliances included in the project?',
                        type: 'checkbox',
                        variable: 'new_appliances',
                        required: false,
                        category: 'appliances',
                        options: ['Refrigerator', 'Range/Cooktop', 'Oven', 'Dishwasher', 'Microwave', 'Disposal'],
                        helpText: 'We can coordinate appliance installation with the remodel.'
                    }
                ]
            });
        } else if (projectType === 'bathroom-remodel') {
            containers.push({
                title: 'Bathroom Layout & Fixtures',
                description: 'Bathroom configuration, fixtures, and plumbing requirements',
                orderIndex: 5,
                questions: [
                    {
                        text: 'What type of shower/tub configuration do you want?',
                        type: 'select',
                        variable: 'shower_tub_config',
                        required: true,
                        category: 'fixtures',
                        options: ['Keep existing', 'Tub only', 'Shower only', 'Tub/shower combo', 'Separate tub and shower'],
                        helpText: 'Configuration changes affect plumbing and space requirements.'
                    },
                    {
                        text: 'What type of flooring do you prefer?',
                        type: 'select',
                        variable: 'bathroom_flooring',
                        required: true,
                        category: 'materials',
                        options: ['Ceramic tile', 'Porcelain tile', 'Natural stone', 'Luxury vinyl', 'Heated floors'],
                        helpText: 'Bathroom flooring needs to be water-resistant and durable.'
                    },
                    {
                        text: 'Are you planning to relocate any fixtures?',
                        type: 'radio',
                        variable: 'relocate_fixtures',
                        required: true,
                        category: 'scope',
                        options: ['Yes', 'No', 'Maybe'],
                        helpText: 'Moving fixtures requires plumbing changes and increases cost.'
                    },
                    {
                        text: 'Do you need any accessibility features?',
                        type: 'checkbox',
                        variable: 'accessibility_features',
                        required: false,
                        category: 'accessibility',
                        options: ['Grab bars', 'Walk-in shower', 'Comfort height toilet', 'Wider doorway', 'Non-slip surfaces'],
                        helpText: 'Accessibility features can be integrated into the design.'
                    }
                ]
            });
        }

        // Add complexity-based questions for large projects
        if (complexity === 'large' || complexity === 'enterprise') {
            containers.push({
                title: 'Project Management & Coordination',
                description: 'Project coordination, management, and special requirements',
                orderIndex: containers.length,
                questions: [
                    {
                        text: 'Do you need dedicated project management?',
                        type: 'radio',
                        variable: 'dedicated_pm',
                        required: false,
                        category: 'management',
                        options: ['Yes', 'No', 'Depends on scope'],
                        helpText: 'Dedicated PM ensures better coordination and communication.'
                    },
                    {
                        text: 'How many different trades will be involved?',
                        type: 'select',
                        variable: 'trade_count',
                        required: false,
                        category: 'coordination',
                        options: ['1-2 trades', '3-4 trades', '5+ trades'],
                        helpText: 'More trades require better coordination and scheduling.'
                    },
                    {
                        text: 'Do you need regular progress reporting?',
                        type: 'select',
                        variable: 'progress_reporting',
                        required: false,
                        category: 'communication',
                        options: ['Daily updates', 'Weekly reports', 'Milestone updates', 'As needed'],
                        helpText: 'Regular reporting keeps you informed of project progress.'
                    },
                    {
                        text: 'Are there any special coordination requirements?',
                        type: 'textarea',
                        variable: 'special_coordination',
                        required: false,
                        category: 'coordination',
                        helpText: 'Any unique scheduling, security, or coordination needs.'
                    }
                ]
            });
        }

        return containers;
    };
    static getFallbackQuestionsForContainer(containerTitle, projectType) {
        const fallbackQuestions = {
            'Project Overview & Measurements': [
                {
                    text: 'What is the total square footage of the project area?',
                    type: 'number',
                    variable: 'total_sqft',
                    required: true,
                    category: 'measurements',
                    helpText: 'Measure the total area to be worked on'
                },
                {
                    text: 'What is your preferred project timeline?',
                    type: 'select',
                    options: ['ASAP', '1-2 months', '3-6 months', 'Flexible'],
                    variable: 'timeline_preference',
                    required: false,
                    category: 'scheduling'
                },
                {
                    text: 'What is your approximate budget range?',
                    type: 'select',
                    options: ['Under $10k', '$10k-25k', '$25k-50k', '$50k-100k', 'Over $100k'],
                    variable: 'budget_range',
                    required: false,
                    category: 'preferences'
                },
                {
                    text: 'Describe any specific requirements or goals for this project:',
                    type: 'textarea',
                    variable: 'project_goals',
                    required: false,
                    category: 'specifications'
                }
            ],
            'Materials & Specifications': [
                {
                    text: 'What quality level of materials do you prefer?',
                    type: 'select',
                    options: ['Budget', 'Standard', 'Premium', 'Luxury'],
                    variable: 'material_quality',
                    required: true,
                    category: 'materials'
                },
                {
                    text: 'Do you have specific material brands or types in mind?',
                    type: 'textarea',
                    variable: 'material_preferences',
                    required: false,
                    category: 'materials'
                },
                {
                    text: 'Are there any materials you want to avoid?',
                    type: 'textarea',
                    variable: 'material_restrictions',
                    required: false,
                    category: 'materials'
                },
                {
                    text: 'Do you plan to provide any materials yourself?',
                    type: 'radio',
                    options: ['Yes', 'No', 'Maybe'],
                    variable: 'customer_provided_materials',
                    required: false,
                    category: 'materials'
                }
            ],
            'Labor & Installation Requirements': [
                {
                    text: 'How many workers would you prefer on-site daily?',
                    type: 'select',
                    options: ['1-2 workers', '3-4 workers', '5+ workers', 'Whatever works best'],
                    variable: 'crew_size_preference',
                    required: false,
                    category: 'labor'
                },
                {
                    text: 'Are there specific hours when work cannot be done?',
                    type: 'textarea',
                    variable: 'work_hour_restrictions',
                    required: false,
                    category: 'scheduling'
                },
                {
                    text: 'Do you require any specialized installation techniques?',
                    type: 'textarea',
                    variable: 'special_installation_requirements',
                    required: false,
                    category: 'labor'
                },
                {
                    text: 'What level of disruption to daily activities is acceptable?',
                    type: 'select',
                    options: ['Minimal', 'Moderate', 'Significant', 'Complete'],
                    variable: 'disruption_tolerance',
                    required: false,
                    category: 'preferences'
                }
            ],
            'Site Conditions & Access': [
                {
                    text: 'How would you describe site access for materials and equipment?',
                    type: 'select',
                    options: ['Easy', 'Moderate', 'Difficult', 'Very difficult'],
                    variable: 'site_access',
                    required: true,
                    category: 'measurements'
                },
                {
                    text: 'Are there any site hazards or obstacles to be aware of?',
                    type: 'textarea',
                    variable: 'site_hazards',
                    required: false,
                    category: 'specifications'
                },
                {
                    text: 'Will permits be required for this work?',
                    type: 'radio',
                    options: ['Yes', 'No', 'Unsure'],
                    variable: 'permits_required',
                    required: false,
                    category: 'specifications'
                },
                {
                    text: 'Are utilities easily accessible for temporary power/water?',
                    type: 'radio',
                    options: ['Yes', 'No', 'Unsure'],
                    variable: 'utility_access',
                    required: false,
                    category: 'specifications'
                }
            ],
            'Additional Services & Preferences': [
                {
                    text: 'Do you need cleanup and debris removal included?',
                    type: 'radio',
                    options: ['Yes', 'No', 'Partial'],
                    variable: 'cleanup_service',
                    required: false,
                    category: 'preferences'
                },
                {
                    text: 'Would you like a warranty on the work performed?',
                    type: 'select',
                    options: ['1 year', '2 years', '5 years', 'Not needed'],
                    variable: 'warranty_preference',
                    required: false,
                    category: 'preferences'
                },
                {
                    text: 'Any additional services you\'d like included?',
                    type: 'textarea',
                    variable: 'additional_services',
                    required: false,
                    category: 'preferences'
                },
                {
                    text: 'How important is eco-friendly/sustainable practices?',
                    type: 'select',
                    options: ['Very important', 'Somewhat important', 'Not important'],
                    variable: 'sustainability_preference',
                    required: false,
                    category: 'preferences'
                }
            ]
        };

        // Add project-specific questions
        if (projectType === 'roofing') {
            fallbackQuestions['Roofing System Specifics'] = [
                {
                    text: 'What type of roofing material do you prefer?',
                    type: 'select',
                    options: ['Asphalt shingles', 'Metal', 'Tile', 'Slate', 'Other'],
                    variable: 'roofing_material_type',
                    required: true,
                    category: 'materials'
                },
                {
                    text: 'How many stories is your building?',
                    type: 'number',
                    variable: 'building_stories',
                    required: true,
                    category: 'measurements'
                },
                {
                    text: 'What is the roof slope/pitch?',
                    type: 'select',
                    options: ['Low (under 4/12)', 'Medium (4/12 to 8/12)', 'Steep (over 8/12)', 'Unsure'],
                    variable: 'roof_pitch',
                    required: false,
                    category: 'measurements'
                },
                {
                    text: 'Are there skylights, chimneys, or other roof penetrations?',
                    type: 'textarea',
                    variable: 'roof_penetrations',
                    required: false,
                    category: 'specifications'
                }
            ];
        } else if (projectType === 'kitchen-remodel') {
            fallbackQuestions['Kitchen Design & Layout'] = [
                {
                    text: 'What type of cabinet work do you need?',
                    type: 'select',
                    options: ['Refinish existing', 'Replace doors/fronts', 'Complete replacement', 'Custom built'],
                    variable: 'cabinet_work_type',
                    required: true,
                    category: 'scope'
                },
                {
                    text: 'What countertop material do you prefer?',
                    type: 'select',
                    options: ['Laminate', 'Granite', 'Quartz', 'Marble', 'Butcher block', 'Concrete'],
                    variable: 'countertop_material',
                    required: true,
                    category: 'materials'
                },
                {
                    text: 'Are you planning to relocate any appliances or plumbing?',
                    type: 'radio',
                    variable: 'relocate_utilities',
                    required: true,
                    category: 'scope',
                    options: ['Yes', 'No', 'Maybe'],
                    helpText: 'Moving utilities adds significant cost to the project.'
                },
                {
                    text: 'Do you need new appliances included in the project?',
                    type: 'checkbox',
                    variable: 'new_appliances',
                    required: false,
                    category: 'appliances',
                    options: ['Refrigerator', 'Range/Cooktop', 'Oven', 'Dishwasher', 'Microwave', 'Disposal'],
                    helpText: 'We can coordinate appliance installation with the remodel.'
                }
            ];
        } else if (projectType === 'bathroom-remodel') {
            fallbackQuestions['Bathroom Layout & Fixtures'] = [
                {
                    text: 'What type of shower/tub configuration do you want?',
                    type: 'select',
                    variable: 'shower_tub_config',
                    required: true,
                    category: 'fixtures',
                    options: ['Keep existing', 'Tub only', 'Shower only', 'Tub/shower combo', 'Separate tub and shower'],
                    helpText: 'Configuration changes affect plumbing and space requirements.'
                },
                {
                    text: 'What type of flooring do you prefer?',
                    type: 'select',
                    variable: 'bathroom_flooring',
                    required: true,
                    category: 'materials',
                    options: ['Ceramic tile', 'Porcelain tile', 'Natural stone', 'Luxury vinyl', 'Heated floors'],
                    helpText: 'Bathroom flooring needs to be water-resistant and durable.'
                },
                {
                    text: 'Are you planning to relocate any fixtures?',
                    type: 'radio',
                    variable: 'relocate_fixtures',
                    required: true,
                    category: 'scope',
                    options: ['Yes', 'No', 'Maybe'],
                    helpText: 'Moving fixtures requires plumbing changes and increases cost.'
                },
                {
                    text: 'Do you need any accessibility features?',
                    type: 'checkbox',
                    variable: 'accessibility_features',
                    required: false,
                    category: 'accessibility',
                    options: ['Grab bars', 'Walk-in shower', 'Comfort height toilet', 'Wider doorway', 'Non-slip surfaces'],
                    helpText: 'Accessibility features can be integrated into the design.'
                }
            ];
        }

        return fallbackQuestions[containerTitle] || [];
    }
    static async generateQuestionsForContainer(container, estimator, projectType) {
        try {
            const OllamaHelper = require('../helpers/ollama');
            const ollamaHelper = new OllamaHelper();
            
            if (!await ollamaHelper.isServerRunning()) {
                return this.getFallbackQuestionsForContainer(container.title, projectType);
            }

            const prompt = `You are a construction estimating expert. Generate 4-6 specific, actionable questions for the "${container.title}" section of a ${projectType} project estimate.

PROJECT CONTEXT:
- Project: ${estimator.title || 'Construction Project'}
- Type: ${projectType}
- Complexity: ${estimator.complexity || 'medium'}
- Components: ${estimator.components ? estimator.components.join(', ') : 'Various'}

CONTAINER: ${container.title}
DESCRIPTION: ${container.description}

REQUIREMENTS:
1. Generate 4-6 specific questions relevant to this container's purpose
2. Questions should help gather information needed for accurate cost estimation
3. Include mix of measurement, specification, and preference questions
4. Questions should be clear and answerable by a typical customer
5. Avoid technical jargon, use plain language

OUTPUT FORMAT (exactly):
QUESTION: [Question text here]
TYPE: [select|radio|number|text|textarea]
OPTIONS: [For select/radio types, comma-separated list]
VARIABLE: [camelCase_variable_name]
REQUIRED: [true|false]
CATEGORY: [measurements|materials|labor|scheduling|preferences|specifications]
HELP: [Brief helpful explanation]

QUESTION: [Next question...]
TYPE: [type]
[etc...]

Generate questions that specifically relate to "${container.title}" and would be essential for ${projectType} project estimation.`;

            const response = await ollamaHelper.generate(prompt);
            
            if (!response.success) {
                return this.getFallbackQuestionsForContainer(container.title, projectType);
            }

            const questions = this.parseQuestionsFromAI(response.text, projectType);
            
            if (questions.length === 0) {
                return this.getFallbackQuestionsForContainer(container.title, projectType);
            }

            return questions.slice(0, 6); // Limit to 6 questions per container
            
        } catch (error) {
            console.error(`Error generating questions for container "${container.title}":`, error);
            return this.getFallbackQuestionsForContainer(container.title, projectType);
        }
    }
    static getBasicContainerStructure(estimator) {
        // Fallback if everything else fails
        return [
            {
                title: 'Project Information',
                description: 'Basic project details and requirements',
                orderIndex: 0,
                questions: this.getFallbackQuestionsForContainer('Project Overview & Measurements', 'general')
            },
            {
                title: 'Materials & Labor',
                description: 'Material specifications and labor requirements',
                orderIndex: 1,
                questions: this.getFallbackQuestionsForContainer('Materials & Specifications', 'general')
            }
        ];
    }
    static async generateRecommendedQuestions(estimator) {
        try {
            const projectType = EstimatorAI.determineProjectType(estimator);
            const complexity = estimator.complexity || 'medium';
            const targetMarket = estimator.market || 'residential';
            const budgetRange = estimator.budgetRange || 'not specified';
            const components = Array.isArray(estimator.components) ? estimator.components.join(', ') : 'not specified';
            
            const prompt = `You are a construction estimating expert. Generate EXACTLY 4-6 specific questions for a ${projectType} project.
            ## PROJECT DETAILS
            - Project Type: ${projectType}
            - Complexity: ${complexity}
            - Market: ${targetMarket}
            - Budget Range: ${budgetRange}
            - Components: ${components}
            - Description: ${estimator.description || 'not provided'}

            ## QUESTION REQUIREMENTS
            Generate 4-6 questions that are:
            1. Essential for accurate cost estimation
            2. Specific to ${projectType} projects
            3. Asked directly to the customer (use "you/your")
            4. Include appropriate question types and options

            ## QUESTION TYPES TO USE
            - number: for measurements, quantities, counts
            - select: for material choices, quality levels (provide 3-5 options)
            - boolean: for yes/no questions
            - textarea: for open-ended descriptions

            ## OUTPUT FORMAT
            For each question, provide EXACTLY this format:

            QUESTION: [question text in second person]
            TYPE: [number|select|boolean|textarea]
            VARIABLE: [snake_case_variable_name]
            REQUIRED: [true|false]
            CATEGORY: [measurements|materials|design|timeline|regulatory|etc]
            OPTIONS: [comma-separated list for select types only]

            Generate exactly 4-6 questions that are most critical for estimating this specific project type. Focus on measurements, materials, complexity factors, and key specifications.`;

                        const ollamaHelper = new OllamaHelper();
                        const response = await ollamaHelper.generate(prompt);
            
            if (!response.success) {
                return EstimatorAI.getFallbackQuestions(projectType);
            }

            const questions = EstimatorAI.parseQuestionsFromAI(response.text, projectType);
            
            if (questions.length < 3) {
                return EstimatorAI.getFallbackQuestions(projectType);
            }

            return questions;

        } catch (error) {
            console.error('Error generating AI questions:', error);
            return EstimatorAI.getFallbackQuestions(estimator.projectType || 'general');
        }
    };
    static async generateQuestionContainers(estimatorId, questions, components) {
        // Group questions by category
        const questionsByCategory = {};
        questions.forEach(question => {
            const category = question.category || 'general';
            if (!questionsByCategory[category]) {
                questionsByCategory[category] = [];
            }
            questionsByCategory[category].push(question);
        });

        // Create question containers for each category
        for (const [category, categoryQuestions] of Object.entries(questionsByCategory)) {
            const container = await QuestionContainer.create({
                title: category.charAt(0).toUpperCase() + category.slice(1),
                description: `Questions related to ${category}`,
                estimatorId: estimatorId,
                orderIndex: Object.keys(questionsByCategory).indexOf(category)
            });

            // Create questions for this container
            for (let i = 0; i < categoryQuestions.length; i++) {
                const q = categoryQuestions[i];
                await Question.create({
                    questionText: q.text,
                    questionType: q.type,
                    variable: q.variable,
                    isRequired: q.required || false,
                    questionContainerId: container.id,
                    orderIndex: i,
                    options: q.options || null,
                    metadata: {
                        aiGenerated: true,
                        category: category
                    }
                });
            }
        }
    };
    static async generateFormulas(estimatorId, projectType, complexity) {
        try {
            const prompt = `You are a construction cost estimation expert. Generate exactly 5-8 calculation formulas for a ${projectType} project with ${complexity} complexity.

## PROJECT DETAILS
- Project Type: ${projectType}
- Complexity: ${complexity}

## FORMULA REQUIREMENTS
Generate exactly 5-8 formulas that are:
- Essential for cost calculation
- Use {{variable_name}} syntax for variables
- Include material, labor, equipment, and overhead calculations
- Specific to ${projectType} projects
- Mathematical expressions that can be evaluated with real numbers

## CRITICAL OUTPUT FORMAT RULES
1. DO NOT include numbers or bullets (1., 2., etc.) in titles, formulas, or descriptions
2. Use only the exact format shown below
3. Variables must be in {{variable_name}} format
4. Formulas must be valid mathematical expressions

## EXACT OUTPUT FORMAT
For each formula, provide EXACTLY this format with no additional formatting:

TITLE: [Clean formula name without numbers]
FORMULA: [Mathematical expression using {{variable_name}} syntax only]
DESCRIPTION: [Clear description of what this calculates without numbers]

## EXAMPLES
TITLE: Material Cost
FORMULA: {{total_sqft}} * {{material_cost_per_sqft}}
DESCRIPTION: Total material cost calculation

TITLE: Labor Cost  
FORMULA: {{total_sqft}} * {{labor_hours_per_sqft}} * {{hourly_rate}}
DESCRIPTION: Total labor cost based on area and hourly rates

TITLE: Project Subtotal
FORMULA: {{material_cost}} + {{labor_cost}} + {{equipment_cost}}
DESCRIPTION: Sum of all direct costs before overhead

Generate exactly 5-8 formulas following this format precisely.`;

            const ollamaHelper = new OllamaHelper();
            const response = await ollamaHelper.generate(prompt);
            
            let formulas = [];
            if (response.success) {
                formulas = EstimatorAI.parseFormulasFromAI(response.text);
            }
            
            // Fallback to basic formulas if AI fails or insufficient results
            if (formulas.length < 3) {
                formulas = EstimatorAI.getBasicFormulasForProject(projectType, complexity);
            }

            // Create formulas in database
            for (let i = 0; i < formulas.length; i++) {
                await Formula.create({
                    title: formulas[i].title,
                    formula: formulas[i].formula,
                    description: formulas[i].description,
                    estimatorId: estimatorId,
                    orderIndex: i,
                    isActive: true,
                    metadata: {
                        aiGenerated: true
                    }
                });
            }
        } catch (error) {
            console.error('Error generating AI formulas:', error);
            // Fallback to basic formulas
            const formulas = EstimatorAI.getBasicFormulasForProject(projectType, complexity);
            for (let i = 0; i < formulas.length; i++) {
                await Formula.create({
                    title: formulas[i].title,
                    formula: formulas[i].formula,
                    description: formulas[i].description,
                    estimatorId: estimatorId,
                    orderIndex: i,
                    isActive: true,
                    metadata: {
                        aiGenerated: false
                    }
                });
            }
        }
    };
    static async generateLineItems(estimatorId, projectType, components) {
        try {
            const componentsStr = Array.isArray(components) ? components.join(', ') : 'standard components';
            
            const prompt = `You are a construction project manager. Generate 8-12 specific line items for a ${projectType} project.

## PROJECT DETAILS
- Project Type: ${projectType}
- Components: ${componentsStr}

## LINE ITEM REQUIREMENTS
Generate 8-12 line items that are:
1. Specific to ${projectType} projects
2. Cover all major phases of work
3. Include preparation, materials, labor, and finishing
4. Use appropriate units (sqft, linear_ft, each, hour, day, load)

## OUTPUT FORMAT
For each line item, provide EXACTLY this format:

TITLE: [Specific item name]
DESCRIPTION: [What work is included]
UNIT: [sqft, linear_ft, each, hour, day, load, etc.]
CATEGORY: [Preparation, Materials, Labor, Equipment, Finishing, etc.]

Generate 8-12 line items covering all aspects of this project type.`;

            const ollamaHelper = new OllamaHelper();
            const response = await ollamaHelper.generate(prompt);
            
            let lineItems = [];
            if (response.success) {
                lineItems = EstimatorAI.parseLineItemsFromAI(response.text);
            }
            
            // Fallback to basic line items if AI fails or insufficient results
            if (lineItems.length < 5) {
                lineItems = EstimatorAI.getBasicLineItemsForProject(projectType);
            }

            // Create line items in database
            for (let i = 0; i < lineItems.length; i++) {
                await LineItem.create({
                    title: lineItems[i].title,
                    description: lineItems[i].description,
                    unit: lineItems[i].unit,
                    category: lineItems[i].category,
                    estimatorId: estimatorId,
                    orderIndex: i,
                    isActive: true,
                    metadata: {
                        aiGenerated: true
                    }
                });
            }
        } catch (error) {
            console.error('Error generating AI line items:', error);
            // Fallback to basic line items
            const lineItems = EstimatorAI.getBasicLineItemsForProject(projectType);
            for (let i = 0; i < lineItems.length; i++) {
                await LineItem.create({
                    title: lineItems[i].title,
                    description: lineItems[i].description,
                    unit: lineItems[i].unit,
                    category: lineItems[i].category,
                    estimatorId: estimatorId,
                    orderIndex: i,
                    isActive: true,
                    metadata: {
                        aiGenerated: false
                    }
                });
            }
        }
    };
    static async generateQuestionContainersStructure(estimator) {
        try {
            const projectType = EstimatorAI.determineProjectType(estimator);
            const complexity = estimator.complexity || 'medium';
            
            // Base containers for all project types (minimum 5)
            const containers = [
                {
                    title: 'Project Overview & Measurements',
                    description: 'Basic project information, site conditions, and key measurements',
                    orderIndex: 0,
                    questions: []
                },
                {
                    title: 'Materials & Specifications',
                    description: 'Material selections and specifications',
                    orderIndex: 1,
                    questions: []
                },
                {
                    title: 'Labor & Installation Requirements',
                    description: 'Work scope, timeline, and installation complexity factors',
                    orderIndex: 2,
                    questions: []
                },
                {
                    title: 'Site Conditions & Access',
                    description: 'Property access, utilities, permits, and environmental factors',
                    orderIndex: 3,
                    questions: []
                },
                {
                    title: 'Additional Services & Preferences',
                    description: 'Optional upgrades, warranties, and customer preferences',
                    orderIndex: 4,
                    questions: []
                }
            ];

            // Add project-specific containers based on type
            if (projectType === 'roofing') {
                containers.push({
                    title: 'Roofing System Details',
                    description: 'Roof structure, ventilation, drainage, and weatherproofing',
                    orderIndex: 5,
                    questions: []
                });
                containers.push({
                    title: 'Gutters & Exterior Protection',
                    description: 'Gutter systems, downspouts, and exterior weatherization',
                    orderIndex: 6,
                    questions: []
                });
            } else if (projectType === 'kitchen-remodel') {
                containers.push({
                    title: 'Kitchen Layout & Design',
                    description: 'Kitchen configuration, workflow, and design preferences',
                    orderIndex: 5,
                    questions: []
                });
                containers.push({
                    title: 'Appliances & Utilities',
                    description: 'Kitchen appliances, electrical, and plumbing requirements',
                    orderIndex: 6,
                    questions: []
                });
            } else if (projectType === 'bathroom-remodel') {
                containers.push({
                    title: 'Bathroom Layout & Fixtures',
                    description: 'Bathroom configuration, fixtures, and plumbing layout',
                    orderIndex: 5,
                    questions: []
                });
                containers.push({
                    title: 'Finishes & Waterproofing',
                    description: 'Tile work, waterproofing, and finishing materials',
                    orderIndex: 6,
                    questions: []
                });
            } else if (projectType === 'home-construction' || projectType === 'general-construction') {
                containers.push({
                    title: 'Structural & Foundation Work',
                    description: 'Foundation, framing, and structural requirements',
                    orderIndex: 5,
                    questions: []
                });
                containers.push({
                    title: 'Systems & Utilities',
                    description: 'Electrical, plumbing, HVAC, and utility systems',
                    orderIndex: 6,
                    questions: []
                });
                containers.push({
                    title: 'Interior & Exterior Finishes',
                    description: 'Flooring, paint, trim, siding, and finish work',
                    orderIndex: 7,
                    questions: []
                });
            }

            // Add complexity-based container for large projects
            if (complexity === 'large' || complexity === 'enterprise') {
                containers.push({
                    title: 'Project Management & Compliance',
                    description: 'Permits, inspections, project coordination, and regulatory requirements',
                    orderIndex: containers.length,
                    questions: []
                });
            }

            // Generate questions for each container using Ollama
            for (let i = 0; i < containers.length; i++) {
                const container = containers[i];
                try {
                    const questions = await this.generateQuestionsForContainer(container, estimator, projectType);
                    container.questions = questions;
                } catch (error) {
                    console.warn(`   ⚠️  Could not generate questions for "${container.title}":`, error.message);
                    container.questions = this.getFallbackQuestionsForContainer(container.title, projectType);
                }
            }

            return containers;
            
        } catch (error) {
            console.error('Error generating question containers structure:', error);
            return this.getBasicContainerStructure(estimator);
        }
    };
    static async generateFormulasStructure(estimator) {
        try {
            const projectType = EstimatorAI.determineProjectType(estimator);
            const complexity = estimator.complexity || 'medium';
            const eventType = await EventType.findByPk(estimator.eventTypeId);
            
            const projectName = estimator.title || 'Project';
            const projectDescription = estimator.description || 'Not specified';
            const workScope = estimator.details || 'Not specified';
            const targetMarket = estimator.market || 'residential';
            const budgetRange = estimator.budgetRange || 'Not specified';
            const keyComponents = Array.isArray(estimator.components) ? estimator.components.join(', ') : 'Not specified';

            const prompt = `You are a construction cost estimation expert. Generate calculation formulas for the following project:

## PROJECT DETAILS
**Project Type:** ${eventType ? eventType.name : 'General Construction'}
**Project Name:** ${projectName}
**Work Scope:** ${workScope}
**Complexity:** ${complexity}
**Market:** ${targetMarket}
**Budget Range:** ${budgetRange}
**Components:** ${keyComponents}

## FORMULA REQUIREMENTS
Generate exactly 8-15 calculation formulas using {{variable_name}} syntax. Include:
- Material calculations (costs, quantities, waste factors)
- Labor calculations (hours, rates, complexity multipliers)  
- Equipment/tools (rental costs, duration)
- Overhead & profit (business costs, margins)
- Project-specific formulas (unique to this project type)
- Total calculations (subtotals and final totals)

## CRITICAL OUTPUT FORMAT RULES
1. DO NOT include numbers or bullets (1., 2., etc.) in titles, formulas, or descriptions
2. Use only the exact format shown below
3. Variables must be in {{variable_name}} format
4. Formulas must be valid mathematical expressions

## EXACT OUTPUT FORMAT
For each formula, provide EXACTLY this format:

TITLE: [Descriptive name without numbers]
FORMULA: [Using {{variable_name}} syntax only]
DESCRIPTION: [What this calculates without numbers]
CATEGORY: [materials, labor, equipment, overhead, totals]

## EXAMPLES
TITLE: Material Cost with Waste
FORMULA: {{total_sqft}} * {{material_cost_per_sqft}} * (1 + {{waste_percentage}} / 100)
DESCRIPTION: Total material cost including waste factor
CATEGORY: materials

TITLE: Labor Cost
FORMULA: {{total_sqft}} * {{labor_hours_per_sqft}} * {{hourly_rate}}
DESCRIPTION: Total labor cost based on area and hourly rates
CATEGORY: labor

Make formulas specific to "${projectType}" projects in the "${targetMarket}" market. Focus on practical, industry-standard calculations.`;

            const ollamaHelper = new OllamaHelper();
            const response = await ollamaHelper.generate(prompt);
            
            if (!response.success) {
                return EstimatorAI.getBasicFormulas();
            }

            // Parse the AI response to extract formulas
            const formulas = EstimatorAI.parseFormulasFromAI(response.text);
            
            // Ensure we have at least basic formulas if parsing fails
            if (formulas.length < 5) {
                return [...formulas, ...EstimatorAI.getBasicFormulas().slice(formulas.length)];
            }

            return formulas;

        } catch (error) {
            console.error('Error generating formulas with AI:', error);
            return EstimatorAI.getBasicFormulas();
        }
    };
    static async generateQuestionsForVariables(variables, estimator) {
        try {
            const projectType = EstimatorAI.determineProjectType(estimator);
            
            const prompt = `You are a construction estimating expert. Generate specific questions for the following variables needed in cost calculations:

## VARIABLES TO CREATE QUESTIONS FOR:
${variables.map(variable => `- ${variable}`).join('\n')}

## PROJECT CONTEXT:
- Project Type: ${projectType}
- Complexity: ${estimator.complexity || 'medium'}

## REQUIREMENTS:
Generate exactly one question for each variable. Questions should:
- Be clear and specific to construction estimation
- Ask for information that would be needed to calculate costs
- Use appropriate question types (number for measurements/quantities, select for choices, etc.)
- Be asked in second person (you/your)

## QUESTION FORMAT:
For each variable, provide EXACTLY this format:

QUESTION: [Question text asking for the variable value]
TYPE: [number|select|radio|textarea]
VARIABLE: [exact variable name from list]
REQUIRED: [true|false]
CATEGORY: [measurements|materials|labor|equipment|overhead|etc]
OPTIONS: [for select/radio/checkbox types only]
HELP: [Brief explanation of what this affects]

## EXAMPLES:
QUESTION: What is the cost per square foot for materials?
TYPE: number
VARIABLE: material_cost_per_sqft
REQUIRED: true
CATEGORY: materials
HELP: This determines the total material cost calculation

QUESTION: How many hours of labor per square foot do you estimate?
TYPE: number
VARIABLE: labor_hours_per_sqft
REQUIRED: true
CATEGORY: labor
HELP: Used to calculate total labor time and cost

Generate one question for each variable listed above.`;

            const ollamaHelper = new OllamaHelper();
            const response = await ollamaHelper.generate(prompt);
            
            if (!response.success) {
                return EstimatorAI.getFallbackQuestionsForVariables(variables);
            }

            const questions = EstimatorAI.parseVariableQuestionsFromAI(response.text, variables);
            
            if (questions.length < variables.length * 0.5) {
                return EstimatorAI.getFallbackQuestionsForVariables(variables);
            }

            return questions;

        } catch (error) {
            console.error('Error generating questions for variables:', error);
            return EstimatorAI.getFallbackQuestionsForVariables(variables);
        }
    };
    static async analyzeEstimatorRequirements(input) {
        try {
            let estimator = null;
            let estimatorId = null;
            let isNewEstimator = false;

            // Handle different input patterns
            if (typeof input === 'object' && input !== null) {
                // Check if we have an estimator object directly
                if (input.title || input.eventTypeId || input.complexity || input.components) {
                    // This looks like an estimator object
                    estimator = input;
                    estimatorId = estimator.id || estimator.estimatorId || 'new-estimator';
                    isNewEstimator = !estimator.id && !estimator.estimatorId;
                } else if (input.estimator && typeof input.estimator === 'object') {
                    // Wrapped in an estimator property
                    estimator = input.estimator;
                    estimatorId = estimator.id || estimator.estimatorId || 'new-estimator';
                    isNewEstimator = !estimator.id && !estimator.estimatorId;
                } else {
                    // Try to extract ID from various possible object structures
                    estimatorId = input.estimatorId || 
                                 input.id || 
                                 input.estimator?.id ||
                                 input.estimator?.estimatorId ||
                                 input.body?.estimatorId || 
                                 input.body?.id ||
                                 input.body?.estimator?.id ||
                                 input.params?.estimatorId ||
                                 input.params?.id;
                }
            } else {
                // Simple ID input
                estimatorId = input;
            }

            // If we have an estimator object directly, use it
            if (isNewEstimator && estimator) {
                
            } else {
                // Handle existing estimator by ID
                if (!estimatorId || (typeof estimatorId !== 'number' && typeof estimatorId !== 'string')) {
                    throw new Error(`Invalid input provided. Expected estimator object or ID. Got: ${typeof input}. Input: ${JSON.stringify(input)}`);
                }

                // Convert to number if it's a string that looks like a number
                if (typeof estimatorId === 'string' && !isNaN(parseInt(estimatorId))) {
                    estimatorId = parseInt(estimatorId);
                }
                if (typeof estimatorId === 'number' && isNaN(estimatorId)) {
                    throw new Error(`Estimator ID must be a valid number: ${input}`);
                }

                // Get the estimator data from database
                const { models } = require('../config/database');
                estimator = await models.Estimator.findByPk(estimatorId, {
                    where: {
                        isActive: true
                    },
                    include: [
                        {
                            model: models.QuestionContainer,
                            as: 'QuestionContainers',
                            where: { isActive: true },
                            required: false,
                            include: [
                                {
                                    model: models.Question,
                                    as: 'Questions'
                                },
                                {
                                    model: models.Formula,
                                    as: 'Formulas',
                                    where: { isActive: true },
                                    required: false
                                }
                            ]
                        }
                    ]
                });

                if (!estimator) {
                    throw new Error(`Estimator ${estimatorId} not found or inactive`);
                }
                
                isNewEstimator = false;
            }

            // Get formulas and question containers based on whether this is a new or existing estimator
            let allFormulas = [];
            let questionContainers = [];

            if (isNewEstimator) {
                // For new estimators, generate recommended structure
                
                // Generate formulas structure based on estimator data
                try {
                    const formulaStructures = await this.generateFormulasStructure(estimator);
                    allFormulas = formulaStructures || [];
                } catch (error) {
                    console.warn('Could not generate formulas structure:', error.message);
                    allFormulas = [];
                }

                // Generate question containers structure
                try {
                    questionContainers = await this.generateQuestionContainersStructure(estimator);
                } catch (error) {
                    console.warn('Could not generate question containers:', error.message);
                    questionContainers = this.getStructuredQuestionContainers(estimator);
                }
                
            } else {
                // For existing estimators, get data from database
                if (estimator.QuestionContainers) {
                    estimator.QuestionContainers.forEach(container => {
                        if (container.Formulas) {
                            allFormulas.push(...container.Formulas);
                        }
                    });
                }
                questionContainers = estimator.QuestionContainers || [];
            }

            // Validate and complete with detailed analysis
            const updatedContainers = await this.validateAndCompleteFormulaQuestions(
                allFormulas,
                questionContainers
            );

            // Perform final validation
            const validation = {
                estimatorId: estimatorId,
                estimatorName: estimator.title,
                isNewEstimator: isNewEstimator,
                projectType: this.determineProjectType(estimator),
                complexity: estimator.complexity || 'medium',
                formulas: {
                    count: allFormulas.length,
                    list: allFormulas.map(f => ({
                        name: f.name || f.title,
                        formula: f.expression || f.formula,
                        variables: this.extractVariablesFromFormula(f.expression || f.formula || '')
                    }))
                },
                questions: {
                    containerCount: updatedContainers.length,
                    totalQuestions: updatedContainers.reduce((sum, c) => {
                        return sum + (c.Questions?.length || c.questions?.length || 0);
                    }, 0),
                    variableQuestions: updatedContainers.reduce((sum, c) => {
                        const questions = c.Questions || c.questions || [];
                        return sum + (questions.filter(q => q.formulaReference || q.variable)?.length || 0);
                    }, 0)
                },
                validation: {
                    allVariablesHaveQuestions: true,
                    missingVariables: [],
                    orphanedQuestions: [],
                    duplicateVariables: []
                },
                timestamp: new Date().toISOString()
            };

            // Check for missing variables
            const allFormulaVars = new Set();
            allFormulas.forEach(formula => {
                const expression = formula.expression || formula.formula;
                if (expression) {
                    const vars = this.extractVariablesFromFormula(expression);
                    vars.forEach(v => allFormulaVars.add(v));
                }
            });

            const existingVariables = new Set();
            updatedContainers.forEach(container => {
                const questions = container.Questions || container.questions || [];
                questions.forEach(question => {
                    if (question.formulaReference || question.variable) {
                        existingVariables.add(question.formulaReference || question.variable);
                    }
                });
            });

            const missingVars = Array.from(allFormulaVars).filter(v => !existingVariables.has(v));
            validation.validation.missingVariables = missingVars;
            validation.validation.allVariablesHaveQuestions = missingVars.length === 0;

            // Generate line items if this is a new estimator
            let lineItems = [];
            if (isNewEstimator) {
                try {
                    lineItems = await this.generateLineItemsStructure(estimator);
                } catch (error) {
                    console.warn('Could not generate line items:', error.message);
                    lineItems = [];
                }
            }

            return {
                success: true,
                validation: validation,
                questionContainers: updatedContainers,
                formulas: allFormulas.map(f => ({
                    title: f.name || f.title,
                    name: f.name || f.title,  // Keep both for compatibility
                    formula: f.expression || f.formula,
                    description: f.description,
                    category: f.category,
                    variables: this.extractVariablesFromFormula(f.expression || f.formula || '')
                })),
                lineItems: lineItems,
                message: validation.validation.allVariablesHaveQuestions 
                    ? 'All formula variables have corresponding questions'
                    : `Found ${missingVars.length} missing variables`
            };

        } catch (error) {
            console.error('❌ Error analyzing estimator requirements:', error);
            return {
                err: true,
                error: error.message,
                validation: null
            };
        }
    };
    static async determineProjectType(estimator) {
        if (!estimator) return 'general';
        
        try {
            // First, check if the estimator has an associated company with types
            if (estimator.companyId) {
                const { models } = require('../config/database');
                const company = await models.Company.findByPk(estimator.companyId);
                
                if (company && company.types && Array.isArray(company.types.projectTypes)) {
                    // If company has defined project types, use those for matching
                    const projectTypes = company.types.projectTypes;
                    
                    // Use the first project type if only one is defined
                    if (projectTypes.length === 1) {
                        return projectTypes[0];
                    }
                    
                    // If multiple types, try to match based on estimator details
                    if (projectTypes.length > 1 && estimator.details) {
                        const matchedType = await this.matchProjectTypeFromDetails(estimator.details, projectTypes);
                        if (matchedType) {
                            return matchedType;
                        }
                    }
                    
                    // Default to first project type if no specific match
                    return projectTypes[0];
                }
            }
            
            // If no company types, use CompanyTypes model with Ollama to find best match
            return await this.matchProjectTypeWithOllama(estimator);
            
        } catch (error) {
            console.error('Error determining project type:', error);
            // Fallback to original logic
            return this.determineProjectTypeFallback(estimator);
        }
    };
    static async matchProjectTypeFromDetails(details, availableTypes) {
        try {
            const OllamaHelper = require('../helpers/ollama');
            const ollamaHelper = new OllamaHelper();
            
            if (!await ollamaHelper.isServerRunning()) {
                return null;
            }

            const prompt = `You are a project classification expert. Based on the project details provided, determine which project type from the available options best matches.

PROJECT DETAILS:
${details}

AVAILABLE PROJECT TYPES:
${availableTypes.map(type => `- ${type}`).join('\n')}

INSTRUCTIONS:
1. Analyze the project details carefully
2. Match the description to the most appropriate project type from the available options
3. Respond with ONLY the exact project type name from the list
4. If no good match exists, respond with "none"

PROJECT TYPE:`;

            const response = await ollamaHelper.generate(prompt);
            
            if (response.success) {
                const suggestedType = response.text.trim().toLowerCase();
                // Find exact match from available types
                const matchedType = availableTypes.find(type => 
                    type.toLowerCase() === suggestedType || 
                    suggestedType.includes(type.toLowerCase())
                );
                return matchedType || null;
            }
            
            return null;
        } catch (error) {
            console.error('Error matching project type from details:', error);
            return null;
        }
    };
    static async matchProjectTypeWithOllama(estimator) {
        try {
            const { models } = require('../config/database');
            
            // Get all active company types
            const companyTypes = await models.CompanyType.findAll({
                where: { isActive: true },
                attributes: ['name', 'description']
            });
            
            if (companyTypes.length === 0) {
                return this.determineProjectTypeFallback(estimator);
            }

            const OllamaHelper = require('../helpers/ollama');
            const ollamaHelper = new OllamaHelper();
            
            if (!await ollamaHelper.isServerRunning()) {
                return this.determineProjectTypeFallback(estimator);
            }

            const title = estimator.title || '';
            const description = estimator.description || '';
            const details = estimator.details || '';
            const combined = `${title} ${description} ${details}`.trim();

            const prompt = `You are a construction project classification expert. Based on the project information provided, determine which company type from the available options would be the best fit to handle this project.

PROJECT INFORMATION:
Title: ${title}
Description: ${description}
Details: ${details}

AVAILABLE COMPANY TYPES:
${companyTypes.map(ct => `- ${ct.name}: ${ct.description}`).join('\n')}

INSTRUCTIONS:
1. Analyze the project information carefully
2. Match the project to the most appropriate company type that would typically handle this work
3. Consider the scope, complexity, and nature of the work described
4. Respond with ONLY the exact company type name from the list
5. If no good match exists, respond with "General Contractor"

COMPANY TYPE:`;

            const response = await ollamaHelper.generate(prompt);
            
            if (response.success) {
                const suggestedType = response.text.trim();
                
                // Find exact match from company types
                const matchedType = companyTypes.find(ct => 
                    ct.name.toLowerCase() === suggestedType.toLowerCase() ||
                    suggestedType.toLowerCase().includes(ct.name.toLowerCase())
                );
                
                if (matchedType) {
                    // Convert company type name to project type format
                    return this.companyTypeToProjectType(matchedType.name);
                }
            }
            
            return this.determineProjectTypeFallback(estimator);
            
        } catch (error) {
            console.error('Error matching project type with Ollama:', error);
            return this.determineProjectTypeFallback(estimator);
        }
    };
    static companyTypeToProjectType(companyTypeName) {
        // Map company type names to project type identifiers
        const mapping = {
            'General Contractor': 'general-construction',
            'Home Builder': 'home-construction',
            'Commercial Construction': 'commercial-construction',
            'Remodeling Contractor': 'remodeling',
            'Electrical Contractor': 'electrical',
            'Solar Installer': 'solar-installation',
            'Plumbing Contractor': 'plumbing',
            'Water Damage Restoration': 'water-damage-restoration',
            'HVAC Contractor': 'hvac',
            'Ductwork Specialist': 'ductwork',
            'Roofing Contractor': 'roofing',
            'Siding Contractor': 'siding',
            'Gutter Specialist': 'gutters',
            'Window & Door Installer': 'windows-doors',
            'Flooring Contractor': 'flooring',
            'Painting Contractor': 'painting',
            'Cabinet Installer': 'cabinets',
            'Countertop Installer': 'countertops',
            'Landscaping Company': 'landscaping',
            'Lawn Care Service': 'lawn-care',
            'Tree Service': 'tree-service',
            'Hardscaping Contractor': 'hardscaping',
            'Pool Contractor': 'pool-installation',
            'Fence Contractor': 'fencing',
            'Concrete Contractor': 'concrete',
            'Masonry Contractor': 'masonry',
            'Cleaning Service': 'cleaning',
            'Pressure Washing': 'pressure-washing',
            'Handyman Service': 'handyman',
            'Insulation Contractor': 'insulation',
            'Security System Installer': 'security-systems',
            'Pest Control Service': 'pest-control',
            'Appliance Repair': 'appliance-repair',
            'Garage Door Service': 'garage-doors',
            'Moving Company': 'moving',
            'Junk Removal': 'junk-removal',
            'IT Services': 'it-services',
            'Audio/Visual Installer': 'audio-visual',
            'Auto Repair Shop': 'auto-repair',
            'Mobile Mechanic': 'mobile-mechanic',
            'Personal Trainer': 'personal-training',
            'Tutoring Service': 'tutoring',
            'Pet Services': 'pet-services',
            'Event Planner': 'event-planning',
            'Catering Service': 'catering',
            'Photography Service': 'photography'
        };

        return mapping[companyTypeName] || 'general';
    };
    static determineProjectTypeFallback(estimator) {
        // Original logic as fallback
        const title = (estimator.title || '').toLowerCase();
        const description = (estimator.description || '').toLowerCase();
        const components = Array.isArray(estimator.components) ? estimator.components : [];
        const combined = title + ' ' + description;
        
        // Check for comprehensive construction projects first
        const comprehensiveKeywords = [
            'new home', 'home construction', 'house construction', 'residential construction',
            'full build', 'complete construction', 'turnkey', 'new construction',
            'home build', 'custom home', 'residential build'
        ];
        
        const isComprehensive = comprehensiveKeywords.some(keyword => combined.includes(keyword)) ||
                               components.length >= 10; // Many components suggests comprehensive project
        
        if (isComprehensive) {
            // For comprehensive projects, check what type of comprehensive project
            if (combined.includes('home') || combined.includes('house') || combined.includes('residential')) {
                return 'home-construction';
            } else if (combined.includes('commercial') || combined.includes('office') || combined.includes('building')) {
                return 'commercial-construction';
            } else {
                return 'general-construction';
            }
        }
        
        // Check for specific trade projects (only if not comprehensive)
        if (combined.includes('roof') || combined.includes('roofing')) {
            // But check if it's just roofing or part of larger project
            const roofingOnlyKeywords = ['roof replacement', 'roof repair', 'roofing only', 'shingle replacement'];
            if (roofingOnlyKeywords.some(keyword => combined.includes(keyword))) {
                return 'roofing';
            }
        }
        
        if (combined.includes('kitchen') && !combined.includes('home construction')) {
            return 'kitchen-remodel';
        } else if (combined.includes('bathroom') && !combined.includes('home construction')) {
            return 'bathroom-remodel';
        } else if (combined.includes('flooring') && !combined.includes('home construction')) {
            return 'flooring';
        } else if (combined.includes('paint') || combined.includes('painting')) {
            return 'painting';
        } else if (combined.includes('hvac') && !combined.includes('home construction')) {
            return 'hvac';
        } else if (combined.includes('electrical') && !combined.includes('home construction')) {
            return 'electrical';
        } else if (combined.includes('plumb') && !combined.includes('home construction')) {
            return 'plumbing';
        } else if (combined.includes('landscap') || combined.includes('garden')) {
            return 'landscaping';
        } else {
            return 'general';
        }
    };
    static extractVariablesFromFormula(formula) {
        if (!formula || typeof formula !== 'string') {
            return [];
        }
        
        const variables = [];
        
        // Match variable patterns like $variable_name or ${variable_name}
        const dollarPattern = /\$\{?([a-zA-Z_][a-zA-Z0-9_]*)\}?/g;
        let match;
        
        while ((match = dollarPattern.exec(formula)) !== null) {
            const variable = match[1];
            if (!variables.includes(variable)) {
                variables.push(variable);
            }
        }
        
        // Match variable patterns like {{variable_name}}
        const doubleBracePattern = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
        
        while ((match = doubleBracePattern.exec(formula)) !== null) {
            const variable = match[1];
            if (!variables.includes(variable)) {
                variables.push(variable);
            }
        }
        
        return variables;
    };
    static parseQuestionsFromAI(aiText, projectType) {
        const questions = [];
        
        try {
            const lines = aiText.split('\n');
            let currentQuestion = {};
            let questionIndex = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const upperLine = line.toUpperCase();
                
                if (upperLine.startsWith('QUESTION:')) {
                    // Save previous question if it exists
                    if (currentQuestion.text) {
                        currentQuestion.displayOrder = questionIndex;
                        questions.push(currentQuestion);
                        questionIndex++;
                    }
                    
                    // Start new question
                    currentQuestion = {
                        text: line.substring(line.indexOf(':') + 1).trim(),
                        type: 'text',
                        variable: '',
                        required: false,
                        category: 'general',
                        options: null,
                        helpText: '',
                        isVisible: true,
                        isEditable: true
                    };
                } else if (upperLine.startsWith('TYPE:') && currentQuestion.text) {
                    const type = line.substring(line.indexOf(':') + 1).trim().toLowerCase();
                    currentQuestion.type = ['number', 'text', 'textarea', 'select', 'radio', 'checkbox'].includes(type) ? type : 'text';
                } else if (upperLine.startsWith('VARIABLE:') && currentQuestion.text) {
                    currentQuestion.variable = line.substring(line.indexOf(':') + 1).trim();
                } else if (upperLine.startsWith('REQUIRED:') && currentQuestion.text) {
                    const required = line.substring(line.indexOf(':') + 1).trim().toLowerCase();
                    currentQuestion.required = required === 'true';
                } else if (upperLine.startsWith('CATEGORY:') && currentQuestion.text) {
                    currentQuestion.category = line.substring(line.indexOf(':') + 1).trim();
                } else if (upperLine.startsWith('OPTIONS:') && currentQuestion.text) {
                    const optionsText = line.substring(line.indexOf(':') + 1).trim();
                    if (optionsText && optionsText !== 'null' && optionsText !== '') {
                        currentQuestion.options = optionsText.split(',').map(opt => opt.trim());
                    }
                } else if (upperLine.startsWith('HELP:') && currentQuestion.text) {
                    currentQuestion.helpText = line.substring(line.indexOf(':') + 1).trim();
                }
            }
            
            // Add the last question if it exists
            if (currentQuestion.text) {
                currentQuestion.displayOrder = questionIndex;
                questions.push(currentQuestion);
            }
            
            // Additional parsing attempt if no questions found with the standard approach
            if (questions.length === 0) {
                // Try simple question extraction from text
                const questionMatches = aiText.match(/(?:Question|Q):\s*(.+?)(?=\n|$)/gi);
                if (questionMatches) {
                    questionMatches.forEach((match, index) => {
                        const questionText = match.replace(/^(?:Question|Q):\s*/i, '').trim();
                        if (questionText.length > 5) {
                            questions.push({
                                text: questionText,
                                type: 'text',
                                variable: `question_${index + 1}`,
                                required: false,
                                category: 'general',
                                displayOrder: index,
                                isVisible: true,
                                isEditable: true
                            });
                        }
                    });
                }
            }
            
            // Ensure we have at least some questions
            if (questions.length === 0) {
                return this.getFallbackQuestionsForContainer('Project Overview & Measurements', projectType).slice(0, 4);
            }
            
            return questions;
        } catch (error) {
            console.error('Error parsing questions from AI:', error);
            return this.getFallbackQuestionsForContainer('Project Overview & Measurements', projectType).slice(0, 4);
        }
    };
    static parseVariableQuestionsFromAI(aiText, variables) {
        const questions = [];
        const lines = aiText.split('\n');
        
        let currentQuestion = {};
        let questionIndex = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const upperLine = line.toUpperCase();
            
            if (upperLine.startsWith('QUESTION:')) {
                // Save previous question if it exists
                if (currentQuestion.text && currentQuestion.variable) {
                    currentQuestion.displayOrder = questionIndex;
                    questions.push(currentQuestion);
                    questionIndex++;
                }
                
                // Start new question
                currentQuestion = {
                    text: line.substring(line.indexOf(':') + 1).trim(),
                    type: 'number',
                    variable: '',
                    required: false,
                    category: 'calculations',
                    options: null,
                    helpText: '',
                    isVisible: true,
                    isEditable: true,
                    metadata: {
                        aiGenerated: true,
                        addedByValidation: true
                    }
                };
            } else if (upperLine.startsWith('TYPE:') && currentQuestion.text) {
                const type = line.substring(line.indexOf(':') + 1).trim().toLowerCase();
                currentQuestion.type = ['number', 'text', 'textarea', 'select', 'radio'].includes(type) ? type : 'number';
            } else if (upperLine.startsWith('VARIABLE:') && currentQuestion.text) {
                const variable = line.substring(line.indexOf(':') + 1).trim();
                // Only accept variables that are in our expected list
                if (variables.includes(variable)) {
                    currentQuestion.variable = variable;
                }
            } else if (upperLine.startsWith('REQUIRED:') && currentQuestion.text) {
                const required = line.substring(line.indexOf(':') + 1).trim().toLowerCase();
                currentQuestion.required = required === 'true';
            } else if (upperLine.startsWith('CATEGORY:') && currentQuestion.text) {
                currentQuestion.category = line.substring(line.indexOf(':') + 1).trim();
            } else if (upperLine.startsWith('OPTIONS:') && currentQuestion.text) {
                const optionsText = line.substring(line.indexOf(':') + 1).trim();
                if (optionsText && optionsText !== 'null' && optionsText !== '') {
                    currentQuestion.options = optionsText.split(',').map(opt => opt.trim());
                }
            } else if (upperLine.startsWith('HELP:') && currentQuestion.text) {
                currentQuestion.helpText = line.substring(line.indexOf(':') + 1).trim();
            }
        }

        // Add the last question
        if (currentQuestion.text && currentQuestion.variable) {
            currentQuestion.displayOrder = questionIndex;
            questions.push(currentQuestion);
        }

        // Fill in missing variables with fallback questions
        const coveredVariables = new Set(questions.map(q => q.variable));
        const missingVariables = variables.filter(v => !coveredVariables.has(v));
        
        missingVariables.forEach((variable, index) => {
            questions.push({
                text: `What is the value for ${variable.replace(/_/g, ' ')}?`,
                type: 'number',
                variable: variable,
                required: false,
                category: 'calculations',
                helpText: `This variable is used in cost calculations`,
                displayOrder: questions.length,
                isVisible: true,
                isEditable: true,
                metadata: {
                    aiGenerated: true,
                    addedByValidation: true,
                    fallbackGenerated: true
                }
            });
        });

        return questions;
    };
    static getFallbackQuestionsForVariables(variables) {
        return variables.map((variable, index) => ({
            text: `What is the value for ${variable.replace(/_/g, ' ')}?`,
            type: 'number',
            variable: variable,
            required: false,
            category: 'calculations',
            helpText: `This variable is used in cost calculations`,
            displayOrder: index,
            isVisible: true,
            isEditable: true,
            metadata: {
                aiGenerated: true,
                addedByValidation: true,
                fallbackGenerated: true
            }
        }));
    };
    static async validateAndCompleteFormulaQuestions(formulas, questionContainers) {
        try {
            if (!Array.isArray(formulas) || !Array.isArray(questionContainers)) {
                return questionContainers || [];
            }

            // Extract all variables from all formulas
            const allFormulaVars = new Set();
            const formulaVariables = new Map(); // variable -> array of formulas using it
            
            formulas.forEach(formula => {
                // Handle both expression and formula properties
                const formulaExpression = formula.expression || formula.formula;
                if (formulaExpression) {
                    const variables = this.extractVariablesFromFormula(formulaExpression);
                    variables.forEach(variable => {
                        allFormulaVars.add(variable);
                        if (!formulaVariables.has(variable)) {
                            formulaVariables.set(variable, []);
                        }
                        formulaVariables.get(variable).push({
                            name: formula.name || formula.title,
                            formula: formulaExpression
                        });
                    });
                }
            });

            // Check which variables already have questions
            const existingVariables = new Set();
            questionContainers.forEach(container => {
                // Handle both Questions and questions properties
                const questions = container.Questions || container.questions || [];
                questions.forEach(question => {
                    // Check both formulaReference and variable properties
                    const variableName = question.formulaReference || question.variable;
                    if (variableName) {
                        existingVariables.add(variableName);
                    }
                });
            });

            // Find missing variables
            const missingVariables = Array.from(allFormulaVars).filter(variable => !existingVariables.has(variable));
            
            if (missingVariables.length > 0) {
                // Generate questions for missing variables
                const newQuestions = await this.generateQuestionsForVariables(missingVariables, {
                    title: 'New Estimator Analysis',
                    complexity: 'large',
                    projectType: 'construction'
                });

                if (newQuestions.length > 0) {
                    // Find or create a calculation variables container
                    let calculationContainer = questionContainers.find(container => 
                        (container.name && container.name.toLowerCase().includes('calculation')) ||
                        (container.name && container.name.toLowerCase().includes('variable')) ||
                        (container.title && container.title.toLowerCase().includes('calculation')) ||
                        (container.title && container.title.toLowerCase().includes('variable'))
                    );

                    if (!calculationContainer) {
                        calculationContainer = {
                            name: "Calculation Variables",
                            title: "Calculation Variables", 
                            description: "Additional variables needed for cost calculations and formulas",
                            orderIndex: questionContainers.length,
                            questions: []
                        };
                        questionContainers.push(calculationContainer);
                    }

                    // Ensure the container has a questions array
                    if (!calculationContainer.questions) {
                        calculationContainer.questions = [];
                    }

                    // Add new questions to the calculation container
                    newQuestions.forEach((question, index) => {
                        calculationContainer.questions.push({
                            ...question,
                            displayOrder: calculationContainer.questions.length + index,
                            isVisible: true,
                            isEditable: true,
                            validationRules: null,
                            defaultValue: null,
                            metadata: {
                                aiGenerated: true,
                                addedByValidation: true
                            }
                        });
                    });
                }
            } else {
            }

            return questionContainers;

        } catch (error) {
            console.error('❌ Error validating formula questions:', error);
            return questionContainers; // Return original if validation fails
        }
    };
    static parseFormulasFromAI(aiText) {
        const formulas = [];
        const lines = aiText.split('\n');
        let currentFormula = {};
        let orderIndex = 0;

        // Strip numbered prefixes and bullets
        const cleanText = (text) => {
            return text.replace(/^\d+\.\s*/, '').replace(/^[•·-]\s*/, '').trim();
        };

        for (let line of lines) {
            line = line.trim();
            const upperLine = line.toUpperCase();
            
            if (upperLine.startsWith('TITLE:')) {
                // Save previous formula if it exists
                if (currentFormula.title && currentFormula.formula) {
                    currentFormula.orderIndex = orderIndex++;
                    formulas.push(currentFormula);
                }
                
                // Start new formula
                currentFormula = {
                    title: cleanText(line.substring(line.indexOf(':') + 1)),
                    name: cleanText(line.substring(line.indexOf(':') + 1)),
                    formula: '',
                    description: '',
                    category: 'general'
                };
            } else if (upperLine.startsWith('FORMULA:') && currentFormula.title) {
                currentFormula.formula = line.substring(line.indexOf(':') + 1).trim();
                currentFormula.expression = currentFormula.formula; // Add both for compatibility
            } else if (upperLine.startsWith('DESCRIPTION:') && currentFormula.title) {
                currentFormula.description = cleanText(line.substring(line.indexOf(':') + 1));
            } else if (upperLine.startsWith('CATEGORY:') && currentFormula.title) {
                currentFormula.category = line.substring(line.indexOf(':') + 1).trim().toLowerCase();
            }
        }

        // Add the last formula
        if (currentFormula.title && currentFormula.formula) {
            currentFormula.orderIndex = orderIndex;
            formulas.push(currentFormula);
        }

        // Validate and clean up formulas
        const validFormulas = formulas.filter(formula => {
            return formula.title && 
                   formula.formula && 
                   formula.formula.includes('{{') && 
                   formula.formula.includes('}}');
        });

        return validFormulas;
    };
    static parseLineItemsFromAI(aiText) {
        const lineItems = [];
        const lines = aiText.split('\n');
        let currentItem = {};
        let orderIndex = 0;

        for (let line of lines) {
            line = line.trim();
            const upperLine = line.toUpperCase();
            
            if (upperLine.startsWith('TITLE:')) {
                // Save previous item if it exists
                if (currentItem.title && currentItem.description) {
                    currentItem.orderIndex = orderIndex++;
                    lineItems.push(currentItem);
                }
                
                // Start new item
                currentItem = {
                    title: line.substring(line.indexOf(':') + 1).trim(),
                    description: '',
                    unit: 'each',
                    category: 'General'
                };
            } else if (upperLine.startsWith('DESCRIPTION:') && currentItem.title) {
                currentItem.description = line.substring(line.indexOf(':') + 1).trim();
            } else if (upperLine.startsWith('UNIT:') && currentItem.title) {
                currentItem.unit = line.substring(line.indexOf(':') + 1).trim();
            } else if (upperLine.startsWith('CATEGORY:') && currentItem.title) {
                currentItem.category = line.substring(line.indexOf(':') + 1).trim();
            }
        }

        // Add the last item
        if (currentItem.title && currentItem.description) {
            currentItem.orderIndex = orderIndex;
            lineItems.push(currentItem);
        }

        return lineItems;
    };
    static async generateLineItemsStructure(estimator) {
        try {
            const projectType = EstimatorAI.determineProjectType(estimator);
            const complexity = estimator.complexity || 'medium';
            const components = Array.isArray(estimator.components) ? estimator.components.join(', ') : 'standard components';
            
            const prompt = `You are a construction project manager. Generate 8-12 specific line items for a ${projectType} project.

## PROJECT DETAILS
- Project Type: ${projectType}
- Complexity: ${complexity}
- Components: ${components}

## LINE ITEM REQUIREMENTS
Generate 8-12 line items that are:
1. Specific to ${projectType} projects
2. Cover all major phases of work
3. Include preparation, materials, labor, and finishing
4. Use appropriate units (sqft, linear_ft, each, hour, day, load)

## OUTPUT FORMAT
For each line item, provide EXACTLY this format:

TITLE: [Specific item name]
DESCRIPTION: [What work is included]
UNIT: [sqft, linear_ft, each, hour, day, load, etc.]
CATEGORY: [Preparation, Materials, Labor, Equipment, Finishing, etc.]

Generate 8-12 line items covering all aspects of this project type.`;

            const ollamaHelper = new OllamaHelper();
            const response = await ollamaHelper.generate(prompt);
            
            let lineItems = [];
            if (response.success) {
                lineItems = EstimatorAI.parseLineItemsFromAI(response.text);
            }
            
            // Fallback to basic line items if AI fails or insufficient results
            if (lineItems.length < 5) {
                lineItems = EstimatorAI.getBasicLineItemsForProject(projectType);
            }

            return lineItems;

        } catch (error) {
            console.error('Error generating line items structure:', error);
            return EstimatorAI.getBasicLineItemsForProject(estimator.projectType || 'general');
        }
    };
}
async function classifyEstimateRow(description) {
    try {
        const ollamaHelper = new OllamaHelper();
        
        // Check if Ollama is available
        if (!await ollamaHelper.isServerRunning()) {
            return 'item';
        }

        const prompt = `Classify this construction/installation cost item into one of three categories:
        ITEM: Individual materials, supplies, or components (e.g., "2x4 lumber", "gallon of paint", "door handle", "tile adhesive")
        LINE_ITEM: Complete services or project phases that group multiple items (e.g., "Install hardwood flooring", "Kitchen cabinet installation", "Bathroom renovation")
        LABOR: Labor costs, worker time, or installation services (e.g., "Installation labor", "Carpenter time", "Labor to install")

        Description: "${description}"

        Respond with only one word: "item", "line_item", or "labor"`;

        const response = await ollamaHelper.generate(prompt);
        
        if (!response.success) {
            return 'item';
        }
        
        const classification = response.text.toLowerCase().trim();
        
        // Validate response
        if (['item', 'line_item', 'labor'].includes(classification)) {
            return classification;
        } else {
            return 'item';
        }
        
    } catch (error) {
        console.error('Error classifying estimate row:', error.message);        
        return 'item'; // Default fallback
    }
};

module.exports = {
    EstimatorAI,
    classifyEstimateRow,
    validateSystem: EstimatorAI.validateSystem,
    analyzeEstimatorRequirements: async (req, res) => {
        try {
            // Extract estimator data from request body
            // Support both: {estimator: {...}} and {estimatorId: 123}
            let inputData;
            
            if (req.body.estimator) {
                // New estimator object or ID in estimator field
                inputData = req.body.estimator;
            } else if (req.body.estimatorId || req.body.id) {
                // Direct estimator ID
                inputData = req.body.estimatorId || req.body.id;
            } else {
                // Assume the body itself is the estimator data
                inputData = req.body;
            }
            
            if (!inputData) {
                return res.status(400).json({
                    err: true,
                    error: 'Estimator data or ID is required',
                    message: 'Please provide estimator data or estimatorId in request body'
                });
            }

            // Call the analysis method with the input data
            const result = await EstimatorAI.analyzeEstimatorRequirements(inputData);
            
            return res.status(200).json(result);
            
        } catch (error) {
            console.error('Error in analyzeEstimatorRequirements route:', error);
            return res.status(500).json({
                err: true,
                error: error.message,
                message: 'Error analyzing estimator requirements'
            });
        }
    },
};
