'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AlertConfigs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AlertConfigs.init({
    alertGasEnable: DataTypes.BOOLEAN,
    gasActivateThreshold: DataTypes.FLOAT,
    gasDeactivateThreshold: DataTypes.FLOAT,
    alertWaterEnable: DataTypes.BOOLEAN,
    waterActivateThreshold: DataTypes.FLOAT,
    waterDeactivateThreshold: DataTypes.FLOAT,
    alertTempEnable: DataTypes.BOOLEAN,
    tempActivateThreshold: DataTypes.FLOAT,
    tempDeactivateThreshold: DataTypes.FLOAT,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'AlertConfigs',
  });
  return AlertConfigs;
};