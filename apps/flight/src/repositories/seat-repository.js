const CrudRepository = require('./crud-repository');
const { Seat } = require('../models');

class SeatRepository extends CrudRepository {
  constructor() {
    super(Seat);
  }

  async getSeatsByAirplaneId(airplaneId) {
    return await Seat.findAll({
      where: { airplaneId },
      order: [
        ['row', 'ASC'],
        ['col', 'ASC'],
      ],
    });
  }

  async findByCoordinate(airplaneId, row, col) {
    return await Seat.findOne({
      where: {
        airplaneId,
        row,
        col,
      },
    });
  }

  async bulkCreateSeats(seats, options = {}) {
    return await Seat.bulkCreate(seats, options);
  }

  async getSeatsCountByAirplaneId(airplaneId) {
    return await Seat.count({
      where: { airplaneId },
    });
  }
}

module.exports = SeatRepository;
