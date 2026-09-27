const { StatusCodes } = require('http-status-codes');
const { CityRepository } = require('../repositories');
const { AppError } = require('../utils/errors');
const { MESSAGES } = require('../constants');

const cityRepository = new CityRepository();

class CityService {
  async createCity(data) {
    return await cityRepository.create({ name: data.name });
  }

  async getCities() {
    return await cityRepository.getAll({
      order: [['name', 'ASC']],
    });
  }

  async getCity(id) {
    const city = await cityRepository.getWithAirports(id);
    if (!city) {
      throw new AppError(MESSAGES.CITY.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.CITY.NOT_FOUND);
    }
    return city;
  }

  async updateCity(id, data) {
    const city = await cityRepository.get(id);
    if (!city) {
      throw new AppError(MESSAGES.CITY.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.CITY.NOT_FOUND);
    }
    return await cityRepository.update(city, { name: data.name });
  }

  async destroyCity(id) {
    const city = await cityRepository.getWithAirports(id);
    if (!city) {
      throw new AppError(MESSAGES.CITY.NOT_FOUND, StatusCodes.NOT_FOUND, MESSAGES.CITY.NOT_FOUND);
    }

    if (city.airports && city.airports.length > 0) {
      throw new AppError(
        'Cannot delete city with registered airports',
        StatusCodes.BAD_REQUEST,
        `City '${city.name}' cannot be deleted because it has ${city.airports.length} registered airport(s). Delete or reassign airports first.`,
      );
    }

    return await cityRepository.destroy(id);
  }
}

module.exports = CityService;
