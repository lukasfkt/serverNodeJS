'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MeasureConfigs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      timeToMeasure: {
        type: Sequelize.INTEGER
      },
      timeToSup: {
        type: Sequelize.INTEGER
      },
      supGasActivateThreshold: {
        type: Sequelize.FLOAT
      },
      supGasDeactivateThreshold: {
        type: Sequelize.FLOAT
      },
      supTempActivateThreshold: {
        type: Sequelize.FLOAT
      },
      supTempDeactivateThreshold: {
        type: Sequelize.FLOAT
      },
      supWaterActivateThreshold: {
        type: Sequelize.FLOAT
      },
      supWaterDeactivateThreshold: {
        type: Sequelize.FLOAT
      },
      userId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MeasureConfigs');
  }
};