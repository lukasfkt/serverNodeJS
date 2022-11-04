'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Alerts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Alerts.init({
    userId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    init_timestamp: DataTypes.INTEGER,
    end_timestamp: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Alerts',
  });
  return Alerts;
};