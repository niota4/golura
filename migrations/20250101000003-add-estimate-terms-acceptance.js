'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('estimates', 'termsAccepted', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: 'Whether the client has accepted the terms and conditions'
    });

    await queryInterface.addColumn('estimates', 'termsAcceptedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when terms were accepted'
    });

    await queryInterface.addColumn('estimates', 'termsAcceptedByIp', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'IP address of the client who accepted terms'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('estimates', 'termsAccepted');
    await queryInterface.removeColumn('estimates', 'termsAcceptedAt');
    await queryInterface.removeColumn('estimates', 'termsAcceptedByIp');
  }
};
