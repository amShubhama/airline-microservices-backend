'use strict';
const { Model } = require('sequelize');
const { SEAT_TYPE } = require('../utils/common/enums');
const { BUSINESS, PREMIUM_ECONOMY, FIRST_CLASS, ECONOMY } = SEAT_TYPE;

module.exports = (sequelize, DataTypes) => {
  class Seat extends Model {
    static associate(models) {
      this.belongsTo(models.Airplane, {
        foreignKey: 'airplaneId',
        as: 'airplane',
      });
    }
  }

  Seat.init(
    {
      airplaneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },
      row: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },
      col: {
        type: DataTypes.STRING(1),
        allowNull: false,
        validate: {
          isUppercase: true,
          len: [1, 1],
        },
      },
      type: {
        type: DataTypes.ENUM,
        values: [BUSINESS, ECONOMY, PREMIUM_ECONOMY, FIRST_CLASS],
        defaultValue: ECONOMY,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Seat',
      indexes: [
        {
          unique: true,
          name: 'unique_airplane_seat_coordinate',
          fields: ['airplaneId', 'row', 'col'],
        },
      ],
      hooks: {
        beforeValidate: (seat) => {
          if (seat.col) {
            seat.col = seat.col.trim().toUpperCase();
          }
        },
      },
    },
  );

  return Seat;
};
