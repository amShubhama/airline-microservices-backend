'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Airport extends Model {
    static associate(models) {
      this.belongsTo(models.City, {
        foreignKey: 'cityId',
        as: 'city',
        onDelete: 'RESTRICT',
      });
      this.hasMany(models.Flight, {
        foreignKey: 'departureAirportCode',
        sourceKey: 'code',
        as: 'departingFlights',
        onDelete: 'RESTRICT',
      });
      this.hasMany(models.Flight, {
        foreignKey: 'arrivalAirportCode',
        sourceKey: 'code',
        as: 'arrivingFlights',
        onDelete: 'RESTRICT',
      });
    }
  }

  Airport.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      code: {
        type: DataTypes.STRING(3),
        allowNull: false,
        unique: true,
        validate: {
          isUppercase: true,
          len: [3, 3],
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },
    },
    {
      sequelize,
      modelName: 'Airport',
      hooks: {
        beforeValidate: (airport) => {
          if (airport.code) {
            airport.code = airport.code.trim().toUpperCase();
          }
        },
      },
    },
  );

  return Airport;
};
