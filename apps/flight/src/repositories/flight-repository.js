const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const CrudRepository = require('./crud-repository');
const { Flight, Airplane, Airport, City } = require('../models');
const db = require('../models');
const { AppError } = require('../utils/errors');
const { MESSAGES } = require('../constants');
const { FLIGHT_STATUS } = require('../utils/common/enums');

class FlightRepository extends CrudRepository {
  constructor() {
    super(Flight);
  }

  async getAllFlights(filter = {}, sort = [], pagination = {}) {
    const { limit, offset } = pagination;

    return await Flight.findAll({
      where: filter,
      order: sort,
      limit,
      offset,
      include: [
        {
          model: Airplane,
          required: false,
          as: 'airplaneDetail',
        },
        {
          model: Airport,
          required: false,
          as: 'departureAirport',
          include: {
            model: City,
            as: 'city',
            required: false,
          },
        },
        {
          model: Airport,
          required: false,
          as: 'arrivalAirport',
          include: {
            model: City,
            as: 'city',
            required: false,
          },
        },
      ],
    });
  }

  async findOverlappingFlight(airplaneId, departureTime, arrivalTime, excludeFlightId = null) {
    const where = {
      airplaneId,
      status: { [Op.ne]: FLIGHT_STATUS.CANCELLED },
      departureTime: { [Op.lt]: new Date(arrivalTime) },
      arrivalTime: { [Op.gt]: new Date(departureTime) },
    };

    if (excludeFlightId) {
      where.id = { [Op.ne]: excludeFlightId };
    }

    return await Flight.findOne({ where });
  }

  async getActiveFlightsByAirplane(airplaneId) {
    return await Flight.findAll({
      where: {
        airplaneId,
        status: {
          [Op.in]: [FLIGHT_STATUS.SCHEDULED, FLIGHT_STATUS.ON_TIME, FLIGHT_STATUS.DELAYED],
        },
        departureTime: {
          [Op.gt]: new Date(),
        },
      },
      attributes: ['id', 'flightNumber', 'totalSeats', 'remainingSeats', 'departureTime'],
    });
  }

  async getFlightDetail(id) {
    return await Flight.findByPk(id, {
      include: [
        {
          model: Airplane,
          as: 'airplaneDetail',
        },
        {
          model: Airport,
          as: 'departureAirport',
          include: {
            model: City,
            as: 'city',
          },
        },
        {
          model: Airport,
          as: 'arrivalAirport',
          include: {
            model: City,
            as: 'city',
          },
        },
      ],
    });
  }

  async updateRemainingSeats(flightId, seats, dec = true) {
    const transaction = await db.sequelize.transaction();
    try {
      const flight = await Flight.findByPk(flightId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!flight) {
        throw new AppError(MESSAGES.FLIGHT.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.FLIGHT.NOT_FOUND);
      }

      const seatsToModify = Number(seats);
      if (isNaN(seatsToModify) || seatsToModify <= 0) {
        throw new AppError('Invalid seat count provided', StatusCodes.BAD_REQUEST, 'Seats must be a positive integer');
      }

      const shouldDecrement = Boolean(dec);

      if (shouldDecrement) {
        if (flight.status === FLIGHT_STATUS.CANCELLED) {
          throw new AppError(
            'Cannot reserve seats on a cancelled flight',
            StatusCodes.BAD_REQUEST,
            'Flight is cancelled',
          );
        }

        if (flight.status === FLIGHT_STATUS.COMPLETED || new Date(flight.departureTime) < new Date()) {
          throw new AppError(
            'Cannot modify seats on a departed or completed flight',
            StatusCodes.BAD_REQUEST,
            'Flight has already departed',
          );
        }

        if (flight.remainingSeats < seatsToModify) {
          throw new AppError(
            MESSAGES.FLIGHT.INSUFFICIENT_SEATS,
            StatusCodes.BAD_REQUEST,
            MESSAGES.FLIGHT.INSUFFICIENT_SEATS,
          );
        }
        await flight.decrement('remainingSeats', {
          by: seatsToModify,
          transaction,
        });
      } else {
        if (
          flight.status === FLIGHT_STATUS.COMPLETED ||
          (flight.status !== FLIGHT_STATUS.CANCELLED && new Date(flight.departureTime) < new Date())
        ) {
          throw new AppError(
            'Cannot modify seats on a departed or completed flight',
            StatusCodes.BAD_REQUEST,
            'Flight has already departed',
          );
        }

        await flight.increment('remainingSeats', {
          by: seatsToModify,
          transaction,
        });
      }

      await flight.reload({ transaction });

      // Cap at totalSeats in case of release over-increment
      if (flight.remainingSeats > flight.totalSeats) {
        flight.remainingSeats = flight.totalSeats;
        await flight.save({ transaction });
      }

      await transaction.commit();
      return flight;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = FlightRepository;
