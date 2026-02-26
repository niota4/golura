'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Make pageId nullable
    await queryInterface.changeColumn('userOnboards', 'pageId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'pages',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    // Add subPage column
    await queryInterface.addColumn('userOnboards', 'subPage', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Make pageId NOT NULL again
    await queryInterface.changeColumn('userOnboards', 'pageId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'pages',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    // Remove subPage column
    await queryInterface.removeColumn('userOnboards', 'subPage');
  }
};
