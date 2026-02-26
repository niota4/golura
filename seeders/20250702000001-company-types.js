'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const companyTypes = [
      // Construction & General Contractors
      {
        name: 'General Contractor',
        description: 'Full-service construction contractors handling residential and commercial projects from start to finish',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Home Builder',
        description: 'Specialized in new home construction and custom residential building projects',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Commercial Construction',
        description: 'Large-scale commercial and industrial construction projects',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Remodeling Contractor',
        description: 'Home renovation and remodeling specialists for kitchens, bathrooms, and whole-home projects',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Electrical Contractors
      {
        name: 'Electrical Contractor',
        description: 'Licensed electricians for residential and commercial electrical installation, repair, and maintenance',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Solar Installer',
        description: 'Solar panel installation and renewable energy system specialists',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Plumbing Contractors
      {
        name: 'Plumbing Contractor',
        description: 'Licensed plumbers for installation, repair, and maintenance of plumbing systems',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Water Damage Restoration',
        description: 'Emergency water damage cleanup and restoration services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // HVAC Contractors
      {
        name: 'HVAC Contractor',
        description: 'Heating, ventilation, and air conditioning installation and service',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ductwork Specialist',
        description: 'Ductwork installation, cleaning, and air quality improvement services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Roofing & Exterior
      {
        name: 'Roofing Contractor',
        description: 'Roof installation, repair, and maintenance for residential and commercial properties',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Siding Contractor',
        description: 'Exterior siding installation and repair services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gutter Specialist',
        description: 'Gutter installation, cleaning, and repair services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Window & Door Installer',
        description: 'Window and door replacement and installation services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Flooring & Interior
      {
        name: 'Flooring Contractor',
        description: 'Hardwood, tile, carpet, and luxury vinyl flooring installation',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Painting Contractor',
        description: 'Interior and exterior painting services for residential and commercial properties',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cabinet Installer',
        description: 'Kitchen and bathroom cabinet installation and refinishing',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Countertop Installer',
        description: 'Granite, quartz, and stone countertop fabrication and installation',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Landscaping & Outdoor
      {
        name: 'Landscaping Company',
        description: 'Landscape design, installation, and maintenance services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lawn Care Service',
        description: 'Regular lawn maintenance, mowing, fertilization, and pest control',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tree Service',
        description: 'Tree removal, trimming, stump grinding, and arborist services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Hardscaping Contractor',
        description: 'Patios, walkways, retaining walls, and outdoor living space construction',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pool Contractor',
        description: 'Swimming pool installation, renovation, and maintenance services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fence Contractor',
        description: 'Residential and commercial fence installation and repair',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Concrete & Masonry
      {
        name: 'Concrete Contractor',
        description: 'Concrete pouring, driveways, foundations, and decorative concrete work',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Masonry Contractor',
        description: 'Brick, stone, and block work for walls, fireplaces, and outdoor features',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Cleaning & Maintenance
      {
        name: 'Cleaning Service',
        description: 'Residential and commercial cleaning services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pressure Washing',
        description: 'Exterior cleaning for homes, driveways, and commercial buildings',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Handyman Service',
        description: 'General repair and maintenance services for homes and businesses',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Specialty Services
      {
        name: 'Insulation Contractor',
        description: 'Attic, wall, and basement insulation installation and energy efficiency services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Security System Installer',
        description: 'Home and business security system installation and monitoring',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pest Control Service',
        description: 'Residential and commercial pest control and extermination services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Appliance Repair',
        description: 'Home appliance installation, repair, and maintenance services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Garage Door Service',
        description: 'Garage door installation, repair, and opener services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Moving & Logistics
      {
        name: 'Moving Company',
        description: 'Residential and commercial moving and relocation services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Junk Removal',
        description: 'Debris removal, cleanout services, and waste management',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Technology Services
      {
        name: 'IT Services',
        description: 'Computer repair, network installation, and technology support',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Audio/Visual Installer',
        description: 'Home theater, sound system, and smart home technology installation',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Automotive Services
      {
        name: 'Auto Repair Shop',
        description: 'Vehicle maintenance, repair, and automotive services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mobile Mechanic',
        description: 'On-site automotive repair and maintenance services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Personal Services
      {
        name: 'Personal Trainer',
        description: 'Fitness training and wellness coaching services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tutoring Service',
        description: 'Educational tutoring and academic support services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pet Services',
        description: 'Pet grooming, walking, sitting, and care services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Event Services
      {
        name: 'Event Planner',
        description: 'Wedding planning, corporate events, and party coordination services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Catering Service',
        description: 'Food service for events, parties, and corporate functions',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Photography Service',
        description: 'Wedding, portrait, and commercial photography services',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('companyTypes', companyTypes);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('companyTypes', null, {});
  }
};
