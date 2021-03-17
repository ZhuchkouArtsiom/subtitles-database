'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Snippets', 'cover', {
      type: Sequelize.TEXT,
      unique: true,
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Snippets', 'cover');
  },
};
