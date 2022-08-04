'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserConfigs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      gasCozinha: {
        type: Sequelize.FLOAT
      },
      fluxoAgua: {
        type: Sequelize.FLOAT
      },
      fumaca: {
        type: Sequelize.FLOAT
      },
      temperatura: {
        type: Sequelize.FLOAT
      },
      userId: {
        type: Sequelize.INTEGER
      },
      active: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('UserConfigs');
  }
};