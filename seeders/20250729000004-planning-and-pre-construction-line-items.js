"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('lineItems', [
      // 📋 Planning & Pre-Construction
      {
        name: "Architectural Drawings",
        description: "Creation of detailed architectural plans and drawings to guide the construction process.",
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
        name: "Building Permit Fees",
        description: "Fees required to obtain permits for construction from local authorities.",
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
        name: "Site Survey (if needed)",
        description: "Assessment of the site to determine boundaries, topography, and other critical details.",
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
        name: "HOA Approval (if applicable)",
        description: "Submission and approval of plans by the Homeowners Association, if required.",
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
        name: "Dumpster & Site Setup",
        description: "Provision of a dumpster and setup of the construction site for waste management and organization.",
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
      // 🚜 Site Work & Foundation
      {
        name: "Foundation Footings",
        description: "Construction of footings to support the foundation and distribute the load of the structure.",
        rate: 1800.00,
        unit: "each",
        subTotal: 1800.00,
        total: 1800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Concrete Slab or Crawlspace",
        description: "Pouring of a concrete slab or preparation of a crawlspace as the base of the structure.",
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
      // 🧱 Framing & Structural
      {
        name: "Floor Framing & Subfloor",
        description: "Installation of floor framing and subflooring to create a stable base for the structure.",
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
        name: "Wall Framing (Exterior & Interior)",
        description: "Construction of both exterior and interior walls to define spaces and provide structural support.",
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
        name: "Structural Beams/Headers",
        description: "Installation of structural beams and headers to support loads above openings such as doors and windows.",
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
      // 🧰 Mechanical, Electrical & Plumbing (if applicable)
      {
        name: "Lighting & Outlet Installation",
        description: "Installation of lighting fixtures and electrical outlets throughout the structure.",
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
        name: "Mini Split System (optional)",
        description: "Installation of a mini split HVAC system for heating and cooling specific areas.",
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
        name: "Low-Voltage / Smart Wiring",
        description: "Installation of low-voltage wiring for smart home systems, including internet and security.",
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
      // 🪟 Exterior Envelope
      {
        name: "Windows (2–3 units)",
        description: "Supply and installation of 2–3 windows, including framing and sealing.",
        rate: 1800.00,
        unit: "each",
        subTotal: 1800.00,
        total: 1800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Exterior Door (if needed)",
        description: "Supply and installation of an exterior door, including hardware and weatherproofing.",
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
        name: "House Wrap",
        description: "Application of house wrap to protect the structure from moisture and improve energy efficiency.",
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
      {
        name: "Insulation (Walls & Ceiling)",
        description: "Installation of insulation in walls and ceilings to improve thermal efficiency.",
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
      // 🎨 Interior Construction
      {
        name: "Closet System (if bedroom/office)",
        description: "Installation of a closet system for storage in bedrooms or offices.",
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
        name: "Light Fixtures & Ceiling Fan",
        description: "Installation of light fixtures and ceiling fans for illumination and ventilation.",
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
      // 🛁 Optional Bathroom Add-On
      {
        name: "Vanity & Sink",
        description: "Supply and installation of a bathroom vanity and sink for functionality and storage.",
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
        name: "Toilet",
        description: "Supply and installation of a toilet for the bathroom.",
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
      {
        name: "Bathroom Ventilation",
        description: "Installation of a ventilation system to remove moisture and odors from the bathroom.",
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
      // 🧹 Final Steps
      {
        name: "Client Walkthrough & Sign-off",
        description: "Final walkthrough with the client to ensure satisfaction and obtain sign-off on the project.",
        rate: 200.00,
        unit: "each",
        subTotal: 200.00,
        total: 200.00,
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
    await queryInterface.bulkDelete('lineItems', null, {});
  }
};
