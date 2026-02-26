"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("lineItems", [
      {
        name: "Architectural Design & Layout",
        description: "Development of architectural designs and layouts tailored for the garage conversion project.",
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
        name: "Permit Application & Fees",
        description: "Submission of permit applications and payment of associated fees to local authorities.",
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
        name: "Stem Wall (if needed)",
        description: "Construction of a stem wall to elevate the foundation and provide additional structural support.",
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
        name: "Vapor Barrier & Gravel Base",
        description: "Installation of a vapor barrier and gravel base to prevent moisture intrusion and stabilize the foundation.",
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
      // 🧱 Framing & Shell
      {
        name: "Garage Door Framing",
        description: "Framing the opening for the garage door to ensure proper fit and structural integrity.",
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
      // 🪟 Doors, Windows, and Garage Door
      {
        name: "Garage Door (8x7 or 16x7)",
        description: "Supply and installation of a standard-sized garage door, including hardware.",
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
        name: "Garage Door Opener & Install",
        description: "Installation of an automatic garage door opener for convenience and security.",
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
        name: "Side Entry Door",
        description: "Supply and installation of a side entry door for additional access to the garage.",
        rate: 450.00,
        unit: "each",
        subTotal: 450.00,
        total: 450.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Window Trim & Sealing",
        description: "Installation of trim and sealing around windows to ensure a weatherproof and finished appearance.",
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
      // 🧰 MEP (Mechanical, Electrical, Plumbing)
      {
        name: "Electrical Rough-In & Panel Tie-In",
        description: "Wiring and connection of electrical systems to the main panel for the garage conversion.",
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
        name: "Mini-Split HVAC (optional for conversion)",
        description: "Installation of a mini-split HVAC system to provide heating and cooling for the converted space.",
        rate: 2800.00,
        unit: "each",
        subTotal: 2800.00,
        total: 2800.00,
        taxable: true,
        markup: 0.00,
        adHoc: true,
        userId: 1, // Replace with appropriate userId
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // 🧱 Exterior Finishes
      {
        name: "Exterior Trim",
        description: "Installation of exterior trim to enhance the appearance and protect edges from weather damage.",
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
      // 🪚 Interior Finishes (For Garage Conversion)
      {
        name: "Closet Installation (if bedroom)",
        description: "Construction and installation of a closet system for storage in the converted bedroom.",
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
        name: "Framing for Bathroom",
        description: "Framing the walls and structure for a bathroom addition in the garage conversion.",
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
        name: "Vanity, Sink, Toilet, Shower",
        description: "Supply and installation of bathroom fixtures, including a vanity, sink, toilet, and shower.",
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
        name: "Vent Fan & Lighting",
        description: "Installation of a ventilation fan and lighting for the bathroom to ensure proper airflow and illumination.",
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
      // 🧹 Finalization
      {
        name: "City/County Inspections",
        description: "Coordination and completion of inspections by city or county officials to ensure compliance with building codes.",
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
        name: "Final Cleaning",
        description: "Thorough cleaning of the converted garage space to prepare it for occupancy.",
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
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("lineItems", null, {});
  }
};
