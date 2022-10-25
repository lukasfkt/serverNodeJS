'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'MeasureConfigs',
        'supEnable',
        {
          type: Sequelize.BOOLEAN
        }
      ),
      queryInterface.addColumn(
        'MeasureConfigs',
        'percentage',
        {
          type: Sequelize.FLOAT
        }
      ),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.removeColumn('MeasureConfigs', 'supEnable', 'percentage');
  }
};
