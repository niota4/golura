"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('lineItems', [
      // 📍 Pre-Construction & Permitting
      {
        name: "Land Survey",
        description: "A professional assessment of the property boundaries and topography to ensure accurate planning and compliance with local regulations.",
        rate: 800.00,
        unit: "each",
        subTotal: 800.00,
        total: 800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Soil Testing",
        description: "Analysis of soil composition and stability to determine its suitability for construction and identify any necessary treatments.",
        rate: 500.00,
        unit: "each",
        subTotal: 500.00,
        total: 500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Architectural Plans",
        description: "Detailed blueprints and designs created by architects to outline the structure, layout, and aesthetic of the building.",
        rate: 3500.00,
        unit: "each",
        subTotal: 3500.00,
        total: 3500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Engineering (Structural, MEP)",
        description: "Comprehensive engineering services covering structural integrity, mechanical systems, electrical layouts, and plumbing designs.",
        rate: 2000.00,
        unit: "each",
        subTotal: 2000.00,
        total: 2000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Permits & Fees",
        description: "Costs associated with obtaining the necessary permits and approvals from local authorities to begin construction.",
        rate: 2000.00,
        unit: "each",
        subTotal: 2000.00,
        total: 2000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Temporary Utilities Setup",
        description: "Installation of temporary water, electricity, and other utilities required to support construction activities on-site.",
        rate: 1000.00,
        unit: "each",
        subTotal: 1000.00,
        total: 1000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 🚜 Site Preparation & Foundation
      {
        name: "Site Clearing & Grading",
        description: "Preparation of the construction site by removing vegetation, debris, and leveling the ground to ensure a stable foundation.",
        rate: 3000.00,
        unit: "each",
        subTotal: 3000.00,
        total: 3000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Excavation",
        description: "Digging and removal of soil to create space for the foundation, basements, or other underground structures.",
        rate: 2500.00,
        unit: "each",
        subTotal: 2500.00,
        total: 2500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Foundation Formwork",
        description: "Construction of temporary molds to shape and support the concrete foundation until it sets and gains strength.",
        rate: 4000.00,
        unit: "each",
        subTotal: 4000.00,
        total: 4000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Concrete Pouring (Slab/Basement)",
        description: "Pouring and leveling of concrete to create a solid and durable base for the building, including slabs or basements.",
        rate: 6000.00,
        unit: "each",
        subTotal: 6000.00,
        total: 6000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Waterproofing",
        description: "Application of materials and techniques to prevent water penetration and protect the foundation and basement from moisture damage.",
        rate: 1200.00,
        unit: "each",
        subTotal: 1200.00,
        total: 1200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Backfill & Compaction",
        description: "Filling excavated areas with soil and compacting it to provide stability and support for the foundation.",
        rate: 1000.00,
        unit: "each",
        subTotal: 1000.00,
        total: 1000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 🧱 Framing & Structural
      {
        name: "Floor Joists & Subfloor",
        description: "Installation of floor joists and subflooring to create a sturdy and level base for the upper floors.",
        rate: 3500.00,
        unit: "each",
        subTotal: 3500.00,
        total: 3500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Wall Framing (Labor + Materials)",
        description: "Construction of walls including framing, sheathing, and bracing to provide structural support and define spaces.",
        rate: 15000.00,
        unit: "each",
        subTotal: 15000.00,
        total: 15000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Roof Framing & Sheathing",
        description: "Framing the roof structure and installing sheathing to support the roofing material and provide insulation.",
        rate: 8000.00,
        unit: "each",
        subTotal: 8000.00,
        total: 8000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Structural Beams/LVLs",
        description: "Installation of engineered wood beams or laminated veneer lumber (LVL) for added structural support in walls and roofs.",
        rate: 2000.00,
        unit: "each",
        subTotal: 2000.00,
        total: 2000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Framing Hardware & Nails",
        description: "Hardware and nails required for framing, including joist hangers, hurricane ties, and other connectors.",
        rate: 700.00,
        unit: "each",
        subTotal: 700.00,
        total: 700.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 🧰 Mechanical, Electrical & Plumbing (MEP)
      {
        name: "Plumbing Rough-In",
        description: "Installation of plumbing pipes and fixtures before walls are closed up.",
        rate: 9000.00,
        unit: "each",
        subTotal: 9000.00,
        total: 9000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Electrical Rough-In",
        description: "Installation of electrical wiring, outlets, and breaker panels before walls are closed up.",
        rate: 8000.00,
        unit: "each",
        subTotal: 8000.00,
        total: 8000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "HVAC Rough-In",
        description: "Installation of heating, ventilation, and air conditioning systems before walls are closed up.",
        rate: 6500.00,
        unit: "each",
        subTotal: 6500.00,
        total: 6500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Ventilation & Ducting",
        description: "Installation of ductwork and ventilation systems for HVAC.",
        rate: 2500.00,
        unit: "each",
        subTotal: 2500.00,
        total: 2500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Gas Line Installation",
        description: "Installation of gas lines for appliances and heating systems.",
        rate: 1200.00,
        unit: "each",
        subTotal: 1200.00,
        total: 1200.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Smart Home Pre-Wire",
        description: "Pre-wiring for smart home systems, including security, lighting, and audio.",
        rate: 1000.00,
        unit: "each",
        subTotal: 1000.00,
        total: 1000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 🪟 Exterior Shell
      {
        name: "Roofing (Shingles/Metal)",
        description: "Installation of roofing materials, including shingles or metal panels.",
        rate: 7500.00,
        unit: "each",
        subTotal: 7500.00,
        total: 7500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "House Wrap & Insulation",
        description: "Application of house wrap and insulation to improve energy efficiency.",
        rate: 2000.00,
        unit: "each",
        subTotal: 2000.00,
        total: 2000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Windows & Installation",
        description: "Supply and installation of windows, including framing and sealing.",
        rate: 7000.00,
        unit: "each",
        subTotal: 7000.00,
        total: 7000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Exterior Doors",
        description: "Supply and installation of exterior doors, including hardware.",
        rate: 2000.00,
        unit: "each",
        subTotal: 2000.00,
        total: 2000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Siding or Stucco",
        description: "Installation of siding or stucco for the exterior of the building.",
        rate: 8000.00,
        unit: "each",
        subTotal: 8000.00,
        total: 8000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Gutters & Downspouts",
        description: "Installation of gutters and downspouts for water drainage.",
        rate: 1500.00,
        unit: "each",
        subTotal: 1500.00,
        total: 1500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 🧱 Interior Construction
      {
        name: "Insulation (Blown-in/Batt)",
        description: "Installation of insulation materials to improve thermal efficiency and reduce energy costs.",
        rate: 3000.00,
        unit: "each",
        subTotal: 3000.00,
        total: 3000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Drywall (Hang, Tape, Texture)",
        description: "Installation and finishing of drywall to create smooth and durable interior walls and ceilings.",
        rate: 8000.00,
        unit: "each",
        subTotal: 8000.00,
        total: 8000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Interior Painting",
        description: "Application of paint to interior walls, ceilings, and trim for aesthetic and protective purposes.",
        rate: 4000.00,
        unit: "each",
        subTotal: 4000.00,
        total: 4000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Trim & Baseboards",
        description: "Installation of trim and baseboards to enhance the interior finish and cover gaps between walls and floors.",
        rate: 2000.00,
        unit: "each",
        subTotal: 2000.00,
        total: 2000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Interior Doors & Hardware",
        description: "Supply and installation of interior doors and associated hardware such as handles and hinges.",
        rate: 2000.00,
        unit: "each",
        subTotal: 2000.00,
        total: 2000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Stairs & Railings (if multi-story)",
        description: "Construction and installation of stairs and railings for multi-story buildings.",
        rate: 3000.00,
        unit: "each",
        subTotal: 3000.00,
        total: 3000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 🛁 Interior Fixtures & Finishes
      {
        name: "Kitchen Cabinetry",
        description: "Supply and installation of kitchen cabinets for storage and functionality.",
        rate: 9000.00,
        unit: "each",
        subTotal: 9000.00,
        total: 9000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Kitchen Countertops",
        description: "Installation of durable and aesthetically pleasing countertops in the kitchen.",
        rate: 5000.00,
        unit: "each",
        subTotal: 5000.00,
        total: 5000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Bathroom Vanities",
        description: "Supply and installation of bathroom vanities, including sinks and storage.",
        rate: 2500.00,
        unit: "each",
        subTotal: 2500.00,
        total: 2500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Tile (Bath, Kitchen Backsplash)",
        description: "Installation of tiles in bathrooms and as kitchen backsplashes for durability and style.",
        rate: 4000.00,
        unit: "each",
        subTotal: 4000.00,
        total: 4000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Plumbing Fixtures",
        description: "Installation of plumbing fixtures such as faucets, showerheads, and toilets.",
        rate: 3000.00,
        unit: "each",
        subTotal: 3000.00,
        total: 3000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Electrical Fixtures (Lights, Fans)",
        description: "Installation of electrical fixtures including lighting and ceiling fans.",
        rate: 2500.00,
        unit: "each",
        subTotal: 2500.00,
        total: 2500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Flooring (LVP/Hardwood/Tile)",
        description: "Installation of flooring materials such as luxury vinyl plank, hardwood, or tile.",
        rate: 10000.00,
        unit: "each",
        subTotal: 10000.00,
        total: 10000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Appliances",
        description: "Supply and installation of kitchen and laundry appliances such as refrigerators, ovens, and washers.",
        rate: 6000.00,
        unit: "each",
        subTotal: 6000.00,
        total: 6000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 🏡 Exterior Finishes & Landscaping
      {
        name: "Driveway / Walkway Concrete",
        description: "Pouring and finishing of concrete for driveways and walkways.",
        rate: 4500.00,
        unit: "each",
        subTotal: 4500.00,
        total: 4500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Garage Door & Opener",
        description: "Installation of garage doors and automatic openers for convenience and security.",
        rate: 2000.00,
        unit: "each",
        subTotal: 2000.00,
        total: 2000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Deck or Patio",
        description: "Construction of outdoor decks or patios for additional living space.",
        rate: 5000.00,
        unit: "each",
        subTotal: 5000.00,
        total: 5000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Fencing",
        description: "Installation of fencing for privacy and security around the property.",
        rate: 3000.00,
        unit: "each",
        subTotal: 3000.00,
        total: 3000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Sod / Landscaping",
        description: "Installation of sod and landscaping to enhance the property's curb appeal.",
        rate: 3500.00,
        unit: "each",
        subTotal: 3500.00,
        total: 3500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Irrigation System",
        description: "Installation of an irrigation system to maintain landscaping and gardens.",
        rate: 2000.00,
        unit: "each",
        subTotal: 2000.00,
        total: 2000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 🧾 Final Steps & Close-Out
      {
        name: "Final Clean",
        description: "Thorough cleaning of the property to prepare it for occupancy.",
        rate: 800.00,
        unit: "each",
        subTotal: 800.00,
        total: 800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Final Inspections",
        description: "Completion of final inspections to ensure compliance with building codes and standards.",
        rate: 500.00,
        unit: "each",
        subTotal: 500.00,
        total: 500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Punch List Completion",
        description: "Addressing and resolving any remaining issues or defects identified during the final walkthrough.",
        rate: 1000.00,
        unit: "each",
        subTotal: 1000.00,
        total: 1000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Warranty Documentation & Client Walkthrough",
        description: "Providing warranty documentation and conducting a final walkthrough with the client to explain features and maintenance.",
        rate: 500.00,
        unit: "each",
        subTotal: 500.00,
        total: 500.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Contingency Allowance (5-10%)",
        description: "A contingency fund to cover unexpected expenses or changes during the construction process.",
        rate: 10000.00,
        unit: "each",
        subTotal: 10000.00,
        total: 10000.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DELETE FROM "lineItems" WHERE "name" IN (' +
      "'Land Survey', 'Soil Testing', 'Architectural Plans', 'Engineering (Structural, MEP)', 'Permits & Fees', 'Temporary Utilities Setup', " +
      "'Site Clearing & Grading', 'Excavation', 'Foundation Formwork', 'Concrete Pouring (Slab/Basement)', 'Waterproofing', 'Backfill & Compaction', " +
      "'Floor Joists & Subfloor', 'Wall Framing (Labor + Materials)', 'Roof Framing & Sheathing', 'Structural Beams/LVLs', 'Framing Hardware & Nails', " +
      "'Plumbing Rough-In', 'Electrical Rough-In', 'HVAC Rough-In', 'Ventilation & Ducting', 'Gas Line Installation', 'Smart Home Pre-Wire', " +
      "'Roofing (Shingles/Metal)', 'House Wrap & Insulation', 'Windows & Installation', 'Exterior Doors', 'Siding or Stucco', 'Gutters & Downspouts', " +
      "'Insulation (Blown-in/Batt)', 'Drywall (Hang, Tape, Texture)', 'Interior Painting', 'Trim & Baseboards', 'Interior Doors & Hardware', " +
      "'Stairs & Railings (if multi-story)', 'Kitchen Cabinetry', 'Kitchen Countertops', 'Bathroom Vanities', 'Tile (Bath, Kitchen Backsplash)', " +
      "'Plumbing Fixtures', 'Electrical Fixtures (Lights, Fans)', 'Flooring (LVP/Hardwood/Tile)', 'Appliances', 'Driveway / Walkway Concrete', " +
      "'Garage Door & Opener', 'Deck or Patio', 'Fencing', 'Sod / Landscaping', 'Irrigation System', 'Final Clean', ");
  }
};
