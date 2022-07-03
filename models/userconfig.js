'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserConfig extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserConfig.init({
    gasCozinha: DataTypes.FLOAT,
    fluxoAgua: DataTypes.FLOAT,
    fumaca: DataTypes.FLOAT,
    temperatura: DataTypes.FLOAT,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserConfig',
  });
  return UserConfig;
};