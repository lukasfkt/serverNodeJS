'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MeasureConfigs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MeasureConfigs.init({
    timeToMeasure: DataTypes.INTEGER,
    timeToSup: DataTypes.INTEGER,
    supGasActivateThreshold: DataTypes.FLOAT,
    supGasDeactivateThreshold: DataTypes.FLOAT,
    supTempActivateThreshold: DataTypes.FLOAT,
    supTempDeactivateThreshold: DataTypes.FLOAT,
    supWaterActivateThreshold: DataTypes.FLOAT,
    supWaterDeactivateThreshold: DataTypes.FLOAT,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'MeasureConfigs',
  });
  return MeasureConfigs;
};