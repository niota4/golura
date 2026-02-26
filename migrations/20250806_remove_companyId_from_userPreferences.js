module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('userPreferences', 'companyId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('userPreferences', 'companyId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id',
      },
    });
  },
};
