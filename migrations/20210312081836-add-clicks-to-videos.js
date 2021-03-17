'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Videos', 'clicks', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Videos', 'clicks');
  },
};
