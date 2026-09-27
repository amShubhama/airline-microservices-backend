const { StatusCodes } = require('http-status-codes');
const { SeatRepository, AirplaneRepository } = require('../repositories');
const { AppError } = require('../utils/errors');
const { MESSAGES } = require('../constants');

const seatRepository = new SeatRepository();
const airplaneRepository = new AirplaneRepository();

class SeatService {
  async getSeatsByAirplane(airplaneId) {
    const airplane = await airplaneRepository.get(airplaneId);
    if (!airplane) {
      throw new AppError(MESSAGES.AIRPLANE.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.AIRPLANE.NOT_FOUND);
    }
    return await seatRepository.getSeatsByAirplaneId(airplaneId);
  }

  async createSeat(data) {
    const airplane = await airplaneRepository.get(data.airplaneId);
    if (!airplane) {
      throw new AppError(MESSAGES.AIRPLANE.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.AIRPLANE.NOT_FOUND);
    }

    const currentSeatsCount = await seatRepository.getSeatsCountByAirplaneId(data.airplaneId);
    if (currentSeatsCount >= airplane.capacity) {
      throw new AppError(
        MESSAGES.SEAT.CAPACITY_EXCEEDED,
        StatusCodes.BAD_REQUEST,
        `Cannot add seat. Aircraft capacity of ${airplane.capacity} seats has already been reached`,
      );
    }

    const existingSeat = await seatRepository.findByCoordinate(data.airplaneId, data.row, data.col);

    if (existingSeat) {
      throw new AppError(
        MESSAGES.SEAT.ALREADY_EXISTS,
        StatusCodes.CONFLICT,
        `Seat at Row ${data.row} Col ${data.col} already exists for this aircraft`,
      );
    }

    return await seatRepository.create({
      airplaneId: data.airplaneId,
      row: data.row,
      col: data.col,
      type: data.type,
    });
  }

  async generateAirplaneSeats(airplaneId, seatsPayload) {
    const airplane = await airplaneRepository.get(airplaneId);
    if (!airplane) {
      throw new AppError(MESSAGES.AIRPLANE.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.AIRPLANE.NOT_FOUND);
    }

    const currentSeatsCount = await seatRepository.getSeatsCountByAirplaneId(airplaneId);
    if (currentSeatsCount + seatsPayload.length > airplane.capacity) {
      const availableSlots = Math.max(0, airplane.capacity - currentSeatsCount);
      throw new AppError(
        MESSAGES.SEAT.CAPACITY_EXCEEDED,
        StatusCodes.BAD_REQUEST,
        `Cannot generate ${seatsPayload.length} seats. Aircraft capacity is ${airplane.capacity}, currently has ${currentSeatsCount} seats (${availableSlots} remaining slots)`,
      );
    }

    const sanitizedSeats = seatsPayload.map((seat) => ({
      airplaneId,
      row: seat.row,
      col: seat.col,
      type: seat.type,
    }));

    return await seatRepository.bulkCreateSeats(sanitizedSeats, {
      validate: true,
      ignoreDuplicates: true,
    });
  }
}

module.exports = SeatService;
