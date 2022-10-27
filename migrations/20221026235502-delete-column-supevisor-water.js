'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('MeasureConfigs', 'supWaterActivateThreshold'),
      queryInterface.removeColumn('MeasureConfigs', 'supWaterDeactivateThreshold')
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'MeasureConfigs',
        'supWaterActivateThreshold',
        {
          type: Sequelize.FLOAT
        }
      ),
      queryInterface.addColumn(
        'MeasureConfigs',
        'supWaterDeactivateThreshold',
        {
          type: Sequelize.FLOAT
        }
      ),
    ]);
  }
};
