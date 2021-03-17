'use strict';

module.exports = {
  up: async (queryInterface) => {
    queryInterface.addConstraint('Videos', {
      type: 'FOREIGN KEY',
      name: 'FK_VIdeos_Editors', // useful if using queryInterface.removeConstraint
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
    queryInterface.removeConstraint('Videos', {
      type: 'FOREIGN KEY',
      name: 'FK_VIdeos_Editors', // useful if using queryInterface.removeConstraint
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
