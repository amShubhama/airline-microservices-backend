const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize');
const { FlightRepository, AirplaneRepository, AirportRepository } = require('../repositories');
const { AppError } = require('../utils/errors');
const { MESSAGES } = require('../constants');
const { FLIGHT_STATUS } = require('../utils/common/enums');
const { validateDifferentAirports, compareTime } = require('../utils/helpers');

const flightRepository = new FlightRepository();
const airplaneRepository = new AirplaneRepository();
const airportRepository = new AirportRepository();

class FlightService {
  async createFlight(data) {
    if (!validateDifferentAirports(data.departureAirportCode, data.arrivalAirportCode)) {
      throw new AppError(MESSAGES.FLIGHT.SAME_AIRPORTS, StatusCodes.BAD_REQUEST, MESSAGES.FLIGHT.SAME_AIRPORTS);
    }

    const [departureAirport, arrivalAirport] = await Promise.all([
      airportRepository.findByCode(data.departureAirportCode),
      airportRepository.findByCode(data.arrivalAirportCode),
    ]);

    if (!departureAirport) {
      throw new AppError(
        `Departure airport '${data.departureAirportCode}' not found`,
        StatusCodes.NOT_FOUND,
        `No airport registered with code '${data.departureAirportCode}'`,
      );
    }

    if (!arrivalAirport) {
      throw new AppError(
        `Arrival airport '${data.arrivalAirportCode}' not found`,
        StatusCodes.NOT_FOUND,
        `No airport registered with code '${data.arrivalAirportCode}'`,
      );
    }

    const airplane = await airplaneRepository.get(data.airplaneId);
    if (!airplane) {
      throw new AppError(MESSAGES.AIRPLANE.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.AIRPLANE.NOT_FOUND);
    }

    if (data.totalSeats && data.totalSeats > airplane.capacity) {
      throw new AppError(
        `Flight totalSeats (${data.totalSeats}) cannot exceed aircraft capacity (${airplane.capacity})`,
        StatusCodes.BAD_REQUEST,
      );
    }

    const totalSeats = data.totalSeats || airplane.capacity;
    const remainingSeats = data.remainingSeats !== undefined ? data.remainingSeats : totalSeats;

    if (!compareTime(data.arrivalTime, data.departureTime)) {
      throw new AppError(MESSAGES.FLIGHT.INVALID_TIME, StatusCodes.BAD_REQUEST, MESSAGES.FLIGHT.INVALID_TIME);
    }

    const overlappingFlight = await flightRepository.findOverlappingFlight(
      data.airplaneId,
      data.departureTime,
      data.arrivalTime,
    );

    if (overlappingFlight) {
      throw new AppError(
        MESSAGES.FLIGHT.SCHEDULE_OVERLAP,
        StatusCodes.BAD_REQUEST,
        `Airplane with id ${data.airplaneId} is already scheduled on flight '${overlappingFlight.flightNumber}' during this timeframe`,
      );
    }

    return await flightRepository.create({
      flightNumber: data.flightNumber,
      airplaneId: data.airplaneId,
      departureAirportCode: data.departureAirportCode,
      arrivalAirportCode: data.arrivalAirportCode,
      departureTime: new Date(data.departureTime),
      arrivalTime: new Date(data.arrivalTime),
      price: data.price,
      boardingGate: data.boardingGate ?? null,
      totalSeats,
      remainingSeats,
      status: data.status,
    });
  }

  buildCustomFilter(query = {}) {
    const customFilter = {};

    if (query.trips) {
      const [dep, arr] = query.trips.split('-');
      if (dep) customFilter.departureAirportCode = dep.toUpperCase();
      if (arr) customFilter.arrivalAirportCode = arr.toUpperCase();
    } else {
      if (query.departureAirportCode) {
        customFilter.departureAirportCode = query.departureAirportCode;
      }
      if (query.arrivalAirportCode) {
        customFilter.arrivalAirportCode = query.arrivalAirportCode;
      }
    }

    if (query.price) {
      const [minStr, maxStr] = query.price.split('-');
      const p1 = parseFloat(minStr);
      const p2 = maxStr !== undefined ? parseFloat(maxStr) : undefined;
      const min = !isNaN(p1) ? p1 : 0;
      const max = p2 !== undefined && !isNaN(p2) ? p2 : 1000000;
      customFilter.price = {
        [Op.between]: [Math.min(min, max), Math.max(min, max)],
      };
    } else if (query.minPrice !== undefined && query.maxPrice !== undefined) {
      customFilter.price = {
        [Op.between]: [Math.min(query.minPrice, query.maxPrice), Math.max(query.minPrice, query.maxPrice)],
      };
    } else if (query.minPrice !== undefined) {
      customFilter.price = { [Op.gte]: query.minPrice };
    } else if (query.maxPrice !== undefined) {
      customFilter.price = { [Op.lte]: query.maxPrice };
    }

    if (query.travellers) {
      customFilter.remainingSeats = { [Op.gte]: query.travellers };
    }

    if (query.tripDate) {
      const startOfDay = new Date(`${query.tripDate}T00:00:00.000Z`);
      const endOfDay = new Date(`${query.tripDate}T23:59:59.999Z`);
      if (!isNaN(startOfDay.getTime()) && !isNaN(endOfDay.getTime())) {
        customFilter.departureTime = {
          [Op.between]: [startOfDay, endOfDay],
        };
      }
    }

    if (query.status) {
      customFilter.status = query.status;
    } else {
      customFilter.status = {
        [Op.in]: [FLIGHT_STATUS.SCHEDULED, FLIGHT_STATUS.ON_TIME, FLIGHT_STATUS.DELAYED],
      };
    }

    return customFilter;
  }

  buildSortFilter(sortQuery) {
    const defaultSort = [['departureTime', 'ASC']];
    if (!sortQuery || typeof sortQuery !== 'string') {
      return defaultSort;
    }

    const ALLOWED_SORT_FIELDS = ['price', 'departureTime', 'arrivalTime', 'remainingSeats', 'totalSeats', 'createdAt'];
    const ALLOWED_DIRECTIONS = ['ASC', 'DESC'];

    const sortParams = sortQuery.split(',');
    const sanitizedSort = [];

    for (const param of sortParams) {
      const parts = param.trim().split('_');
      const field = parts[0];
      const direction = (parts[1] || 'asc').toUpperCase();

      if (ALLOWED_SORT_FIELDS.includes(field) && ALLOWED_DIRECTIONS.includes(direction)) {
        sanitizedSort.push([field, direction]);
      }
    }

    return sanitizedSort.length > 0 ? sanitizedSort : defaultSort;
  }

  async getAllFlights(query = {}) {
    const customFilter = this.buildCustomFilter(query);
    const sortFilter = this.buildSortFilter(query.sort);
    return await flightRepository.getAllFlights(customFilter, sortFilter, {
      limit: query.limit,
      offset: query.offset,
    });
  }

  async getFlight(id) {
    const flight = await flightRepository.getFlightDetail(id);
    if (!flight) {
      throw new AppError(MESSAGES.FLIGHT.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.FLIGHT.NOT_FOUND);
    }
    return flight;
  }

  async updateFlight(id, data) {
    const existingFlight = await flightRepository.get(id);
    if (!existingFlight) {
      throw new AppError(MESSAGES.FLIGHT.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.FLIGHT.NOT_FOUND);
    }

    const {
      flightNumber,
      airplaneId,
      departureAirportCode,
      arrivalAirportCode,
      departureTime,
      arrivalTime,
      price,
      boardingGate,
      status,
    } = data;

    const safePayload = Object.fromEntries(
      Object.entries({
        flightNumber,
        airplaneId,
        departureAirportCode,
        arrivalAirportCode,
        departureTime,
        arrivalTime,
        price,
        boardingGate,
        status,
      }).filter(([, v]) => v !== undefined),
    );

    if (safePayload.departureAirportCode || safePayload.arrivalAirportCode) {
      const effectiveDep = safePayload.departureAirportCode || existingFlight.departureAirportCode;
      const effectiveArr = safePayload.arrivalAirportCode || existingFlight.arrivalAirportCode;

      if (!validateDifferentAirports(effectiveDep, effectiveArr)) {
        throw new AppError(MESSAGES.FLIGHT.SAME_AIRPORTS, StatusCodes.BAD_REQUEST, MESSAGES.FLIGHT.SAME_AIRPORTS);
      }

      if (safePayload.departureAirportCode) {
        const departureAirport = await airportRepository.findByCode(safePayload.departureAirportCode);
        if (!departureAirport) {
          throw new AppError(
            `Departure airport '${safePayload.departureAirportCode}' not found`,
            StatusCodes.NOT_FOUND,
            `No airport registered with code '${safePayload.departureAirportCode}'`,
          );
        }
      }

      if (safePayload.arrivalAirportCode) {
        const arrivalAirport = await airportRepository.findByCode(safePayload.arrivalAirportCode);
        if (!arrivalAirport) {
          throw new AppError(
            `Arrival airport '${safePayload.arrivalAirportCode}' not found`,
            StatusCodes.NOT_FOUND,
            `No airport registered with code '${safePayload.arrivalAirportCode}'`,
          );
        }
      }
    }

    if (safePayload.airplaneId) {
      const airplane = await airplaneRepository.get(safePayload.airplaneId);
      if (!airplane) {
        throw new AppError(MESSAGES.AIRPLANE.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.AIRPLANE.NOT_FOUND);
      }

      if (existingFlight.totalSeats > airplane.capacity) {
        throw new AppError(
          `Flight total seats (${existingFlight.totalSeats}) exceeds the new aircraft capacity (${airplane.capacity})`,
          StatusCodes.BAD_REQUEST,
        );
      }
    }

    if (safePayload.airplaneId || safePayload.departureTime || safePayload.arrivalTime) {
      const resolvedAirplaneId = safePayload.airplaneId || existingFlight.airplaneId;
      const resolvedDepartureTime = safePayload.departureTime || existingFlight.departureTime;
      const resolvedArrivalTime = safePayload.arrivalTime || existingFlight.arrivalTime;

      if (!compareTime(resolvedArrivalTime, resolvedDepartureTime)) {
        throw new AppError(MESSAGES.FLIGHT.INVALID_TIME, StatusCodes.BAD_REQUEST, MESSAGES.FLIGHT.INVALID_TIME);
      }

      const overlappingFlight = await flightRepository.findOverlappingFlight(
        resolvedAirplaneId,
        resolvedDepartureTime,
        resolvedArrivalTime,
        id,
      );

      if (overlappingFlight) {
        throw new AppError(
          MESSAGES.FLIGHT.SCHEDULE_OVERLAP,
          StatusCodes.BAD_REQUEST,
          `Airplane with id ${resolvedAirplaneId} is already scheduled on flight '${overlappingFlight.flightNumber}' during this timeframe`,
        );
      }

      if (safePayload.departureTime) {
        safePayload.departureTime = new Date(safePayload.departureTime);
      }
      if (safePayload.arrivalTime) {
        safePayload.arrivalTime = new Date(safePayload.arrivalTime);
      }
    }

    return await flightRepository.update(existingFlight, safePayload);
  }

  async destroyFlight(id) {
    const flight = await flightRepository.get(id);
    if (!flight) {
      throw new AppError(MESSAGES.FLIGHT.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.FLIGHT.NOT_FOUND);
    }
    return await flightRepository.destroy(id);
  }

  async updateSeats(data) {
    return await flightRepository.updateRemainingSeats(data.flightId, data.seats, data.dec);
  }
}

module.exports = FlightService;
