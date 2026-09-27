const CrudRepository = require('./crud-repository');
const { City, Airport } = require('../models');

class CityRepository extends CrudRepository {
  constructor() {
    super(City);
  }

  async getWithAirports(id) {
    return await City.findByPk(id, {
      include: {
        model: Airport,
        as: 'airports',
      },
    });
  }

  async findByName(name) {
    return await City.findOne({
      where: { name },
    });
  }
}

module.exports = CityRepository;
