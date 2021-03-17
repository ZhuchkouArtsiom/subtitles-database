'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Videos', 'priority', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 999999,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Videos', 'priority');
  },
};
