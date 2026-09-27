const FlightRepository = require('../../../src/repositories/flight-repository');
const db = require('../../../src/models');
const { Flight } = db;
const { AppError } = require('../../../src/utils/errors');
const { FLIGHT_STATUS } = require('../../../src/utils/common/enums');

describe('FlightRepository', () => {
  let flightRepo;

  beforeEach(() => {
    flightRepo = new FlightRepository();
  });

  describe('updateRemainingSeats', () => {
    let mockTransaction;

    beforeEach(() => {
      mockTransaction = {
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
        LOCK: { UPDATE: 'UPDATE' },
      };
      jest.spyOn(db.sequelize, 'transaction').mockResolvedValue(mockTransaction);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should throw 404 when flight is not found', async () => {
      jest.spyOn(Flight, 'findByPk').mockResolvedValue(null);

      await expect(flightRepo.updateRemainingSeats(999, 2, true)).rejects.toThrow(AppError);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw 400 if flight is CANCELLED when decrementing seats', async () => {
      const mockFlight = {
        id: 1,
        status: FLIGHT_STATUS.CANCELLED,
        departureTime: new Date(Date.now() + 3600000),
      };
      jest.spyOn(Flight, 'findByPk').mockResolvedValue(mockFlight);

      await expect(flightRepo.updateRemainingSeats(1, 2, true)).rejects.toThrow(
        'Cannot reserve seats on a cancelled flight',
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should successfully release seats (increment) when flight is CANCELLED', async () => {
      const mockFlight = {
        id: 1,
        status: FLIGHT_STATUS.CANCELLED,
        departureTime: new Date(Date.now() - 3600000), // departed in past
        remainingSeats: 50,
        totalSeats: 180,
        increment: jest.fn().mockImplementation(function () {
          this.remainingSeats += 2;
        }),
        reload: jest.fn().mockResolvedValue(),
        save: jest.fn().mockResolvedValue(),
      };
      jest.spyOn(Flight, 'findByPk').mockResolvedValue(mockFlight);

      const result = await flightRepo.updateRemainingSeats(1, 2, false);

      expect(mockFlight.increment).toHaveBeenCalledWith('remainingSeats', {
        by: 2,
        transaction: mockTransaction,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toBe(mockFlight);
    });

    it('should throw 400 when incrementing seats on a COMPLETED flight', async () => {
      const mockFlight = {
        id: 1,
        status: FLIGHT_STATUS.COMPLETED,
        departureTime: new Date(Date.now() - 3600000),
      };
      jest.spyOn(Flight, 'findByPk').mockResolvedValue(mockFlight);

      await expect(flightRepo.updateRemainingSeats(1, 2, false)).rejects.toThrow(
        'Cannot modify seats on a departed or completed flight',
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw 400 if flight has already departed', async () => {
      const mockFlight = {
        id: 1,
        status: FLIGHT_STATUS.SCHEDULED,
        departureTime: new Date(Date.now() - 3600000), // In the past
      };
      jest.spyOn(Flight, 'findByPk').mockResolvedValue(mockFlight);

      await expect(flightRepo.updateRemainingSeats(1, 2, true)).rejects.toThrow(
        'Cannot modify seats on a departed or completed flight',
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should throw 400 if requested seats exceed remainingSeats', async () => {
      const mockFlight = {
        id: 1,
        status: FLIGHT_STATUS.SCHEDULED,
        departureTime: new Date(Date.now() + 3600000),
        remainingSeats: 3,
        totalSeats: 180,
      };
      jest.spyOn(Flight, 'findByPk').mockResolvedValue(mockFlight);

      await expect(flightRepo.updateRemainingSeats(1, 5, true)).rejects.toThrow(AppError);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('should successfully decrement seats, commit transaction, and return flight', async () => {
      const mockFlight = {
        id: 1,
        status: FLIGHT_STATUS.SCHEDULED,
        departureTime: new Date(Date.now() + 3600000),
        remainingSeats: 50,
        totalSeats: 180,
        decrement: jest.fn().mockImplementation(function () {
          this.remainingSeats -= 2;
        }),
        reload: jest.fn().mockResolvedValue(),
        save: jest.fn().mockResolvedValue(),
      };
      jest.spyOn(Flight, 'findByPk').mockResolvedValue(mockFlight);

      const result = await flightRepo.updateRemainingSeats(1, 2, true);

      expect(mockFlight.decrement).toHaveBeenCalledWith('remainingSeats', {
        by: 2,
        transaction: mockTransaction,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toBe(mockFlight);
    });
  });

  describe('getAllFlights', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should query Flight.findAll with limit and offset', async () => {
      jest.spyOn(Flight, 'findAll').mockResolvedValue([]);

      await flightRepo.getAllFlights({ departureAirportCode: 'DEL' }, [['departureTime', 'ASC']], {
        limit: 20,
        offset: 0,
      });

      expect(Flight.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { departureAirportCode: 'DEL' },
          order: [['departureTime', 'ASC']],
          limit: 20,
          offset: 0,
        }),
      );
    });

    it('should query Flight.findAll with custom limit and offset', async () => {
      jest.spyOn(Flight, 'findAll').mockResolvedValue([]);

      await flightRepo.getAllFlights({ departureAirportCode: 'DEL' }, [['price', 'DESC']], { limit: 50, offset: 25 });

      expect(Flight.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { departureAirportCode: 'DEL' },
          order: [['price', 'DESC']],
          limit: 50,
          offset: 25,
        }),
      );
    });
  });

  describe('findOverlappingFlight', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should query Flight.findOne with overlap time interval excluding CANCELLED flights', async () => {
      const mockFlight = { id: 1, flightNumber: 'AI-202' };
      jest.spyOn(Flight, 'findOne').mockResolvedValue(mockFlight);

      const dep = new Date('2026-10-15T10:00:00.000Z');
      const arr = new Date('2026-10-15T12:00:00.000Z');

      const result = await flightRepo.findOverlappingFlight(1, dep, arr);

      expect(Flight.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            airplaneId: 1,
            status: expect.anything(),
            departureTime: expect.anything(),
            arrivalTime: expect.anything(),
          }),
        }),
      );
      expect(result).toBe(mockFlight);
    });

    it('should exclude specified flight id on update check', async () => {
      jest.spyOn(Flight, 'findOne').mockResolvedValue(null);

      const dep = new Date('2026-10-15T10:00:00.000Z');
      const arr = new Date('2026-10-15T12:00:00.000Z');

      const result = await flightRepo.findOverlappingFlight(1, dep, arr, 5);

      expect(Flight.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: expect.anything(),
          }),
        }),
      );
      expect(result).toBe(null);
    });
  });

  describe('getActiveFlightsByAirplane', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should query Flight.findAll for active, future flights', async () => {
      const mockFlights = [{ id: 1, flightNumber: 'AI-202', totalSeats: 180, remainingSeats: 120 }];
      jest.spyOn(Flight, 'findAll').mockResolvedValue(mockFlights);

      const result = await flightRepo.getActiveFlightsByAirplane(1);

      expect(Flight.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            airplaneId: 1,
            status: expect.anything(),
            departureTime: expect.anything(),
          }),
          attributes: ['id', 'flightNumber', 'totalSeats', 'remainingSeats', 'departureTime'],
        }),
      );
      expect(result).toBe(mockFlights);
    });
  });

  describe('getFlightDetail', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should query Flight.findByPk with associations and return flight', async () => {
      const mockFlight = { id: 1, flightNumber: 'AI-202' };
      jest.spyOn(Flight, 'findByPk').mockResolvedValue(mockFlight);

      const result = await flightRepo.getFlightDetail(1);

      expect(Flight.findByPk).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          include: expect.any(Array),
        }),
      );
      expect(result).toBe(mockFlight);
    });

    it('should return null when flight is not found', async () => {
      jest.spyOn(Flight, 'findByPk').mockResolvedValue(null);

      const result = await flightRepo.getFlightDetail(999);
      expect(result).toBe(null);
    });
  });
});
