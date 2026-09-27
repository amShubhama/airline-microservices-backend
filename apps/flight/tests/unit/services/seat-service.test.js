const { SeatService } = require('../../../src/services');
const { SeatRepository, AirplaneRepository } = require('../../../src/repositories');
const { AppError } = require('../../../src/utils/errors');
const { SEAT_TYPE } = require('../../../src/utils/common/enums');

describe('SeatService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSeatsByAirplane', () => {
    it('should throw 404 if airplane does not exist', async () => {
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue(null);

      await expect(SeatService.getSeatsByAirplane(999)).rejects.toThrow(AppError);
    });

    it('should return seats when airplane exists', async () => {
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue({ id: 1 });
      const mockSeats = [{ id: 1, airplaneId: 1, row: 1, col: 'A', type: SEAT_TYPE.BUSINESS }];
      jest.spyOn(SeatRepository.prototype, 'getSeatsByAirplaneId').mockResolvedValue(mockSeats);

      const result = await SeatService.getSeatsByAirplane(1);
      expect(result).toBe(mockSeats);
    });
  });

  describe('createSeat', () => {
    it('should throw 404 if airplane does not exist', async () => {
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue(null);

      await expect(SeatService.createSeat({ airplaneId: 999, row: 1, col: 'A' })).rejects.toThrow(AppError);
    });

    it('should throw 400 when seat count reaches airplane capacity', async () => {
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue({ id: 1, capacity: 100 });
      jest.spyOn(SeatRepository.prototype, 'getSeatsCountByAirplaneId').mockResolvedValue(100);

      await expect(SeatService.createSeat({ airplaneId: 1, row: 10, col: 'A' })).rejects.toThrow(AppError);
    });

    it('should throw 409 if seat already exists for aircraft', async () => {
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue({ id: 1, capacity: 100 });
      jest.spyOn(SeatRepository.prototype, 'getSeatsCountByAirplaneId').mockResolvedValue(50);
      jest.spyOn(SeatRepository.prototype, 'findByCoordinate').mockResolvedValue({
        id: 1,
        airplaneId: 1,
        row: 1,
        col: 'A',
      });

      await expect(SeatService.createSeat({ airplaneId: 1, row: 1, col: 'A' })).rejects.toThrow(AppError);
    });

    it('should create seat successfully', async () => {
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue({ id: 1, capacity: 100 });
      jest.spyOn(SeatRepository.prototype, 'getSeatsCountByAirplaneId').mockResolvedValue(50);
      jest.spyOn(SeatRepository.prototype, 'findByCoordinate').mockResolvedValue(null);
      const mockCreated = { id: 10, airplaneId: 1, row: 2, col: 'B', type: SEAT_TYPE.ECONOMY };
      jest.spyOn(SeatRepository.prototype, 'create').mockResolvedValue(mockCreated);

      const result = await SeatService.createSeat({ airplaneId: 1, row: 2, col: 'B', type: SEAT_TYPE.ECONOMY });
      expect(SeatRepository.prototype.create).toHaveBeenCalledWith({
        airplaneId: 1,
        row: 2,
        col: 'B',
        type: SEAT_TYPE.ECONOMY,
      });
      expect(result).toBe(mockCreated);
    });
  });

  describe('generateAirplaneSeats', () => {
    it('should throw 404 if airplane does not exist', async () => {
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue(null);

      await expect(SeatService.generateAirplaneSeats(999, [{ row: 1, col: 'A' }])).rejects.toThrow(AppError);
    });

    it('should throw 400 when generated seats exceed remaining airplane capacity', async () => {
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue({ id: 1, capacity: 50 });
      jest.spyOn(SeatRepository.prototype, 'getSeatsCountByAirplaneId').mockResolvedValue(48);

      await expect(
        SeatService.generateAirplaneSeats(1, [
          { row: 1, col: 'A' },
          { row: 1, col: 'B' },
          { row: 1, col: 'C' },
        ]),
      ).rejects.toThrow(AppError);
    });

    it('should bulk create sanitized seats', async () => {
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue({ id: 1, capacity: 100 });
      jest.spyOn(SeatRepository.prototype, 'getSeatsCountByAirplaneId').mockResolvedValue(10);
      jest
        .spyOn(SeatRepository.prototype, 'bulkCreateSeats')
        .mockResolvedValue([{ id: 1, airplaneId: 1, row: 1, col: 'A', type: SEAT_TYPE.BUSINESS }]);

      const result = await SeatService.generateAirplaneSeats(1, [{ row: 1, col: 'A', type: SEAT_TYPE.BUSINESS }]);

      expect(SeatRepository.prototype.bulkCreateSeats).toHaveBeenCalledWith(
        [{ airplaneId: 1, row: 1, col: 'A', type: SEAT_TYPE.BUSINESS }],
        { validate: true, ignoreDuplicates: true },
      );
      expect(result.length).toBe(1);
    });
  });
});
