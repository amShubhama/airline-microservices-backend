const { StatusCodes } = require('http-status-codes');
const { AirplaneRepository, SeatRepository, FlightRepository } = require('../repositories');
const { AppError } = require('../utils/errors');
const { MESSAGES } = require('../constants');

const airplaneRepository = new AirplaneRepository();
const seatRepository = new SeatRepository();
const flightRepository = new FlightRepository();

class AirplaneService {
  async createAirplane(data) {
    return await airplaneRepository.create({
      modelNumber: data.modelNumber,
      capacity: data.capacity,
    });
  }

  async getAirplanes() {
    return await airplaneRepository.getAll({
      order: [['modelNumber', 'ASC']],
    });
  }

  async getAirplane(id) {
    const airplane = await airplaneRepository.get(id);
    if (!airplane) {
      throw new AppError(MESSAGES.AIRPLANE.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.AIRPLANE.NOT_FOUND);
    }
    return airplane;
  }

  async getAirplaneWithSeats(id) {
    const airplane = await airplaneRepository.getWithSeats(id);
    if (!airplane) {
      throw new AppError(MESSAGES.AIRPLANE.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.AIRPLANE.NOT_FOUND);
    }
    return airplane;
  }

  async updateAirplane(id, data) {
    const airplane = await airplaneRepository.get(id);
    if (!airplane) {
      throw new AppError(MESSAGES.AIRPLANE.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.AIRPLANE.NOT_FOUND);
    }

    if (data.capacity !== undefined) {
      const newCapacity = data.capacity;

      const configuredSeats = await seatRepository.getSeatsCountByAirplaneId(id);
      if (newCapacity < configuredSeats) {
        throw new AppError(
          MESSAGES.AIRPLANE.CAPACITY_BELOW_SEATS,
          StatusCodes.BAD_REQUEST,
          `Cannot reduce capacity to ${newCapacity}. Airplane currently has ${configuredSeats} physical seats configured.`,
        );
      }

      const activeFlights = await flightRepository.getActiveFlightsByAirplane(id);
      for (const flight of activeFlights) {
        if (newCapacity < flight.totalSeats) {
          const booked = flight.totalSeats - flight.remainingSeats;
          throw new AppError(
            MESSAGES.AIRPLANE.CAPACITY_BELOW_BOOKINGS,
            StatusCodes.BAD_REQUEST,
            `Cannot reduce capacity to ${newCapacity}. Active flight '${flight.flightNumber}' is scheduled for ${flight.totalSeats} seats (${booked} already booked).`,
          );
        }
      }
    }

    return await airplaneRepository.update(airplane, data);
  }

  async destroyAirplane(id) {
    const airplane = await airplaneRepository.get(id);
    if (!airplane) {
      throw new AppError(MESSAGES.AIRPLANE.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.AIRPLANE.NOT_FOUND);
    }

    const hasFlights = await airplaneRepository.hasFlights(id);
    if (hasFlights) {
      throw new AppError(
        'Cannot delete airplane with scheduled or existing flights',
        StatusCodes.BAD_REQUEST,
        `Airplane '${airplane.modelNumber}' (id: ${id}) cannot be deleted because it is assigned to existing flights`,
      );
    }

    return await airplaneRepository.destroy(id);
  }
}

module.exports = AirplaneService;
