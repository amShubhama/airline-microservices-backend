const SeatRepository = require('../../../src/repositories/seat-repository');
const { Seat } = require('../../../src/models');

describe('SeatRepository', () => {
  let seatRepo;

  beforeEach(() => {
    seatRepo = new SeatRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSeatsByAirplaneId', () => {
    it('should query Seat.findAll ordered by row and col', async () => {
      const mockSeats = [{ id: 1, airplaneId: 1, row: 1, col: 'A' }];
      jest.spyOn(Seat, 'findAll').mockResolvedValue(mockSeats);

      const result = await seatRepo.getSeatsByAirplaneId(1);
      expect(Seat.findAll).toHaveBeenCalledWith({
        where: { airplaneId: 1 },
        order: [
          ['row', 'ASC'],
          ['col', 'ASC'],
        ],
      });
      expect(result).toBe(mockSeats);
    });
  });

  describe('findByCoordinate', () => {
    it('should query Seat.findOne with airplaneId, row, and col', async () => {
      const mockSeat = { id: 1, airplaneId: 1, row: 1, col: 'A' };
      jest.spyOn(Seat, 'findOne').mockResolvedValue(mockSeat);

      const result = await seatRepo.findByCoordinate(1, 1, 'A');
      expect(Seat.findOne).toHaveBeenCalledWith({
        where: {
          airplaneId: 1,
          row: 1,
          col: 'A',
        },
      });
      expect(result).toBe(mockSeat);
    });
  });

  describe('bulkCreateSeats', () => {
    it('should call Seat.bulkCreate with seats array and options', async () => {
      const seats = [{ airplaneId: 1, row: 1, col: 'A' }];
      jest.spyOn(Seat, 'bulkCreate').mockResolvedValue(seats);

      const result = await seatRepo.bulkCreateSeats(seats, { validate: true });
      expect(Seat.bulkCreate).toHaveBeenCalledWith(seats, { validate: true });
      expect(result).toBe(seats);
    });
  });

  describe('getSeatsCountByAirplaneId', () => {
    it('should query Seat.count for given airplaneId', async () => {
      jest.spyOn(Seat, 'count').mockResolvedValue(150);

      const result = await seatRepo.getSeatsCountByAirplaneId(1);
      expect(Seat.count).toHaveBeenCalledWith({
        where: { airplaneId: 1 },
      });
      expect(result).toBe(150);
    });
  });
});
