'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AlertConfigs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      alertGasEnable: {
        type: Sequelize.BOOLEAN
      },
      gasActivateThreshold: {
        type: Sequelize.FLOAT
      },
      gasDeactivateThreshold: {
        type: Sequelize.FLOAT
      },
      alertWaterEnable: {
        type: Sequelize.BOOLEAN
      },
      waterActivateThreshold: {
        type: Sequelize.FLOAT
      },
      waterDeactivateThreshold: {
        type: Sequelize.FLOAT
      },
      alertTempEnable: {
        type: Sequelize.BOOLEAN
      },
      tempActivateThreshold: {
        type: Sequelize.FLOAT
      },
      tempDeactivateThreshold: {
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
    await queryInterface.dropTable('AlertConfigs');
  }
};