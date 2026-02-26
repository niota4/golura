'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('estimates', 'firstViewedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('estimates', 'lastViewedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('estimates', 'viewCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('estimates', 'firstViewedAt');
    await queryInterface.removeColumn('estimates', 'lastViewedAt');
    await queryInterface.removeColumn('estimates', 'viewCount');
  }
};
