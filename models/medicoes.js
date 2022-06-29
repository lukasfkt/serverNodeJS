'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class medicoes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  medicoes.init({
    type: DataTypes.STRING,
    time: DataTypes.DATE,
    medDate: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'medicoes',
  });
  return medicoes;
};