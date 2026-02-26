'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("days", [
      { name: "Sunday", abbreviation: "Sun"},
      { name: "Monday", abbreviation: "Mon"},
      { name: "Tuesday", abbreviation: "Tues"},
      { name: "Wednesday", abbreviation: "Wed"},
      { name: "Thursday", abbreviation: "Thurs"},
      { name: "Friday", abbreviation: "Fri"},
      { name: "Saturday", abbreviation: "Sat"}
    ], {});
 },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("days", null, {});
  }
};