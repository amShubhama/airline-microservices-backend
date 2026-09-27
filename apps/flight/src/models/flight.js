'use strict';
const { Model } = require('sequelize');
const { FLIGHT_STATUS } = require('../utils/common/enums');
const { SCHEDULED, ON_TIME, DELAYED, CANCELLED, COMPLETED } = FLIGHT_STATUS;

module.exports = (sequelize, DataTypes) => {
  class Flight extends Model {
    static associate(models) {
      this.belongsTo(models.Airplane, {
        foreignKey: 'airplaneId',
        as: 'airplaneDetail',
        onDelete: 'RESTRICT',
      });
      this.belongsTo(models.Airport, {
        foreignKey: 'departureAirportCode',
        targetKey: 'code',
        as: 'departureAirport',
        onDelete: 'RESTRICT',
      });
      this.belongsTo(models.Airport, {
        foreignKey: 'arrivalAirportCode',
        targetKey: 'code',
        as: 'arrivalAirport',
        onDelete: 'RESTRICT',
      });
    }
  }

  Flight.init(
    {
      flightNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      airplaneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },
      departureAirportCode: {
        type: DataTypes.STRING(3),
        allowNull: false,
        validate: {
          isUppercase: true,
          len: [3, 3],
        },
      },
      arrivalAirportCode: {
        type: DataTypes.STRING(3),
        allowNull: false,
        validate: {
          isUppercase: true,
          len: [3, 3],
        },
      },
      departureTime: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
        },
      },
      arrivalTime: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
        },
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      boardingGate: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      totalSeats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      remainingSeats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      status: {
        type: DataTypes.ENUM,
        values: [SCHEDULED, ON_TIME, DELAYED, CANCELLED, COMPLETED],
        defaultValue: SCHEDULED,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Flight',
      validate: {
        validateDifferentAirports() {
          if (
            this.departureAirportCode &&
            this.arrivalAirportCode &&
            this.departureAirportCode === this.arrivalAirportCode
          ) {
            throw new Error('Departure and arrival airports cannot be identical');
          }
        },
        validateChronologicalTimes() {
          if (
            this.departureTime &&
            this.arrivalTime &&
            new Date(this.arrivalTime).getTime() <= new Date(this.departureTime).getTime()
          ) {
            throw new Error('Arrival time must be strictly later than departure time');
          }
        },
        validateSeatBounds() {
          if (this.remainingSeats !== undefined && this.totalSeats !== undefined) {
            if (this.remainingSeats > this.totalSeats) {
              throw new Error('Remaining seats cannot exceed total seats');
            }
          }
        },
      },
      hooks: {
        beforeValidate: (flight) => {
          if (flight.departureAirportCode) {
            flight.departureAirportCode = flight.departureAirportCode.trim().toUpperCase();
          }
          if (flight.arrivalAirportCode) {
            flight.arrivalAirportCode = flight.arrivalAirportCode.trim().toUpperCase();
          }
          // Default remainingSeats to totalSeats on creation if not specified
          if (flight.remainingSeats === undefined || flight.remainingSeats === null) {
            flight.remainingSeats = flight.totalSeats;
          }
        },
      },
    },
  );

  return Flight;
};
