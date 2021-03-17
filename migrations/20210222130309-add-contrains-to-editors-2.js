'use strict';

module.exports = {
  up: async (queryInterface) => {
    queryInterface.addConstraint('Interests', {
      type: 'FOREIGN KEY',
      name: 'FK_Interests_Editors', // useful if using queryInterface.removeConstraint
      fields: ['creator'],
      references: {
        table: 'Editors',
        field: 'id',
      },
      onDelete: 'no action',
      onUpdate: 'no action',
    });
  },

  down: async (queryInterface) => {
    queryInterface.removeConstraint('Interests', {
      type: 'FOREIGN KEY',
      name: 'FK_Interests_Editors', // useful if using queryInterface.removeConstraint
      fields: ['creator'],
      references: {
        table: 'Editors',
        field: 'id',
      },
      onDelete: 'no action',
      onUpdate: 'no action',
    });
  },
};
