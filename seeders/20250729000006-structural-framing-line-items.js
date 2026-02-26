"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      // Inspection & Prep
      {
        name: "Site Visit & Structural Inspection",
        description: "On-site inspection to assess structural integrity and identify necessary repairs or reinforcements.",
        rate: 250.00,
        unit: "each",
        subTotal: 250.00,
        total: 250.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Structural Engineer Report / Drawing (if needed)",
        description: "Preparation of detailed structural engineering reports or drawings for compliance and planning.",
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
        name: "Demolition / Tear-Out of Existing Framing",
        description: "Removal of existing framing to prepare for new construction or repairs.",
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
      {
        name: "Temporary Shoring / Support Walls",
        description: "Installation of temporary shoring or support walls to maintain structural stability during construction.",
        rate: 600.00,
        unit: "each",
        subTotal: 600.00,
        total: 600.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 🧱 Load-Bearing & Structural Elements
      {
        name: "Beam Installation (LVL or Glulam)",
        description: "Installation of laminated veneer lumber (LVL) or glulam beams for load-bearing support, including demo and placement.",
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
        name: "Header Install (Door/Window Openings)",
        description: "Installation of headers above door or window openings to distribute structural loads.",
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
        name: "Sistering Joists / Reinforcement",
        description: "Reinforcement of existing joists by attaching additional joists for added strength.",
        rate: 30.00,
        unit: "each",
        subTotal: 30.00,
        total: 30.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Structural Post Replacement",
        description: "Replacement of structural posts to restore or enhance load-bearing capacity.",
        rate: 750.00,
        unit: "each",
        subTotal: 750.00,
        total: 750.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Foundation-to-Framing Connectors (Seismic)",
        description: "Installation of connectors to secure framing to the foundation, enhancing seismic resistance.",
        rate: 600.00,
        unit: "each",
        subTotal: 600.00,
        total: 600.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Roof Truss Repair / Replacement",
        description: "Repair or replacement of roof trusses to ensure structural integrity and support.",
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
      // 🛠 Hardware & Fasteners
      {
        name: "Simpson Strong-Tie Installation",
        description: "Installation of Simpson Strong-Tie hardware for enhanced structural connections.",
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
        name: "Anchor Bolts / Hold Downs",
        description: "Installation of anchor bolts or hold downs to secure framing to the foundation.",
        rate: 400.00,
        unit: "each",
        subTotal: 400.00,
        total: 400.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 🪵 Sheathing & Subfloor
      {
        name: "Blocking & Fire Stops",
        description: "Installation of blocking and fire stops to enhance safety and structural stability.",
        rate: 300.00,
        unit: "each",
        subTotal: 300.00,
        total: 300.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 🧰 Optional Add-Ons
      {
        name: "Floor Plan Reconfiguration (wall removal + framing)",
        description: "Reconfiguration of the floor plan by removing walls and adding new framing as needed.",
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
      {
        name: "Attic Floor Reinforcement for Storage",
        description: "Reinforcement of attic flooring to support storage loads safely.",
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
        name: "Roof Over-Framing (changing pitch)",
        description: "Construction of over-framing to modify the roof pitch for aesthetic or functional purposes.",
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
        name: "Structural Water Damage Repair",
        description: "Repair of structural elements damaged by water to restore integrity and safety.",
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
        name: "Crawlspace Access Framing / Hatch",
        description: "Construction of framing and a hatch for crawlspace access.",
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
      // 🧹 Finalization
      {
        name: "Framing Inspection Scheduling",
        description: "Coordination and scheduling of framing inspections to ensure compliance with building codes.",
        rate: 150.00,
        unit: "each",
        subTotal: 150.00,
        total: 150.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Cleanup & Disposal",
        description: "Removal and disposal of construction debris to maintain a clean and safe worksite.",
        rate: 300.00,
        unit: "each",
        subTotal: 300.00,
        total: 300.00,
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
    await queryInterface.bulkDelete("lineItems", null, {});
  }
};
