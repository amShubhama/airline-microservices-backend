const CrudRepository = require('./crud-repository');
const { Airport, City } = require('../models');
const { Flight } = require('../models');
const { Op } = require('sequelize');
class AirportRepository extends CrudRepository {
  constructor() {
    super(Airport);
  }

  async findByCode(code) {
    return await Airport.findOne({
      where: { code },
      include: {
        model: City,
        as: 'city',
      },
    });
  }

  async getAll(options = {}) {
    const defaultInclude = [{ model: City, as: 'city' }];
    return await super.getAll({
      ...options,
      include: options.include || defaultInclude,
    });
  }

  async hasFlights(code) {
    const count = await Flight.count({
      where: {
        [Op.or]: [{ departureAirportCode: code }, { arrivalAirportCode: code }],
      },
    });
    return count > 0;
  }
}

module.exports = AirportRepository;
