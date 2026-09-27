const { StatusCodes } = require('http-status-codes');
const { AirportRepository, CityRepository } = require('../repositories');
const { AppError } = require('../utils/errors');
const { MESSAGES } = require('../constants');

const airportRepository = new AirportRepository();
const cityRepository = new CityRepository();

class AirportService {
  async createAirport(data) {
    const city = await cityRepository.get(data.cityId);
    if (!city) {
      throw new AppError(MESSAGES.CITY.NOT_FOUND, StatusCodes.NOT_FOUND, `City with id ${data.cityId} does not exist`);
    }

    return await airportRepository.create({
      name: data.name,
      code: data.code,
      address: data.address ?? null,
      cityId: data.cityId,
    });
  }

  async getAirports() {
    return await airportRepository.getAll({
      order: [['code', 'ASC']],
    });
  }

  async getAirport(id) {
    const airport = await airportRepository.get(id);
    if (!airport) {
      throw new AppError(MESSAGES.AIRPORT.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.AIRPORT.NOT_FOUND);
    }
    return airport;
  }

  async getAirportByCode(code) {
    const airport = await airportRepository.findByCode(code);
    if (!airport) {
      throw new AppError(MESSAGES.AIRPORT.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.AIRPORT.NOT_FOUND);
    }
    return airport;
  }

  async updateAirport(id, data) {
    const airport = await airportRepository.get(id);
    if (!airport) {
      throw new AppError(MESSAGES.AIRPORT.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.AIRPORT.NOT_FOUND);
    }
    if (data.cityId) {
      const city = await cityRepository.get(data.cityId);
      if (!city) {
        throw new AppError(
          MESSAGES.CITY.NOT_FOUND,
          StatusCodes.NOT_FOUND,
          `City with id ${data.cityId} does not exist`,
        );
      }
    }
    return await airportRepository.update(airport, data);
  }

  async destroyAirport(id) {
    const airport = await airportRepository.get(id);
    if (!airport) {
      throw new AppError(MESSAGES.AIRPORT.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.AIRPORT.NOT_FOUND);
    }

    const hasFlights = await airportRepository.hasFlights(airport.code);
    if (hasFlights) {
      throw new AppError(
        'Cannot delete airport with scheduled flights',
        StatusCodes.BAD_REQUEST,
        `Airport '${airport.code}' cannot be deleted because it is referenced by existing or scheduled flights`,
      );
    }

    return await airportRepository.destroy(id);
  }
}

module.exports = AirportService;
