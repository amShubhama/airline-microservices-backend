const CrudRepository = require('./crud-repository');
const { Airplane, Seat, Flight } = require('../models');

class AirplaneRepository extends CrudRepository {
  constructor() {
    super(Airplane);
  }

  async findByModelNumber(modelNumber) {
    return await Airplane.findOne({
      where: { modelNumber },
    });
  }

  async getWithSeats(id) {
    return await Airplane.findByPk(id, {
      include: {
        model: Seat,
        as: 'seats',
      },
      order: [
        [{ model: Seat, as: 'seats' }, 'row', 'ASC'],
        [{ model: Seat, as: 'seats' }, 'col', 'ASC'],
      ],
    });
  }

  async hasFlights(airplaneId) {
    const count = await Flight.count({
      where: { airplaneId },
    });
    return count > 0;
  }
}

module.exports = AirplaneRepository;
