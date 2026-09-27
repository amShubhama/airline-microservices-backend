'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Airplane extends Model {
    static associate(models) {
      this.hasMany(models.Flight, {
        foreignKey: 'airplaneId',
        as: 'flights',
        onDelete: 'RESTRICT',
      });
      this.hasMany(models.Seat, {
        foreignKey: 'airplaneId',
        as: 'seats',
        onDelete: 'CASCADE',
      });
    }
  }

  Airplane.init(
    {
      modelNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 1,
          max: 1000,
        },
      },
    },
    {
      sequelize,
      modelName: 'Airplane',
    },
  );

  return Airplane;
};
