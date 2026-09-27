const { AirplaneService } = require('../../../src/services');
const { AirplaneRepository, SeatRepository, FlightRepository } = require('../../../src/repositories');
const { AppError } = require('../../../src/utils/errors');
const { MESSAGES } = require('../../../src/constants');

describe('AirplaneService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createAirplane', () => {
    it('should create airplane record', async () => {
      const mockAirplane = { id: 1, modelNumber: 'Boeing 777', capacity: 350 };
      jest.spyOn(AirplaneRepository.prototype, 'create').mockResolvedValue(mockAirplane);

      const result = await AirplaneService.createAirplane({
        modelNumber: 'Boeing 777',
        capacity: 350,
      });

      expect(AirplaneRepository.prototype.create).toHaveBeenCalledWith({
        modelNumber: 'Boeing 777',
        capacity: 350,
      });
      expect(result).toBe(mockAirplane);
    });
  });

  describe('getAirplanes and getAirplane', () => {
    it('should get all airplanes ordered by modelNumber', async () => {
      const mockAirplanes = [{ id: 1, modelNumber: 'Airbus A320' }];
      jest.spyOn(AirplaneRepository.prototype, 'getAll').mockResolvedValue(mockAirplanes);

      const result = await AirplaneService.getAirplanes();
      expect(AirplaneRepository.prototype.getAll).toHaveBeenCalledWith({
        order: [['modelNumber', 'ASC']],
      });
      expect(result).toBe(mockAirplanes);
    });

    it('should get single airplane by id', async () => {
      const mockAirplane = { id: 1, modelNumber: 'Airbus A320' };
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue(mockAirplane);

      const result = await AirplaneService.getAirplane(1);
      expect(result).toBe(mockAirplane);
    });

    it('should throw 404 when airplane is not found by id', async () => {
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue(null);

      await expect(AirplaneService.getAirplane(999)).rejects.toThrow(AppError);
    });

    it('should get airplane with eager-loaded seats', async () => {
      const mockAirplaneWithSeats = { id: 1, modelNumber: 'Airbus A320', seats: [] };
      jest.spyOn(AirplaneRepository.prototype, 'getWithSeats').mockResolvedValue(mockAirplaneWithSeats);

      const result = await AirplaneService.getAirplaneWithSeats(1);
      expect(result).toBe(mockAirplaneWithSeats);
    });

    it('should throw 404 when airplane with seats is not found by id', async () => {
      jest.spyOn(AirplaneRepository.prototype, 'getWithSeats').mockResolvedValue(null);

      await expect(AirplaneService.getAirplaneWithSeats(999)).rejects.toThrow(AppError);
    });
  });

  describe('updateAirplane and destroyAirplane', () => {
    it('should throw 404 when airplane to update does not exist', async () => {
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue(null);

      await expect(AirplaneService.updateAirplane(999, { capacity: 150 })).rejects.toThrow(AppError);
    });

    it('should throw 400 if capacity is less than configured physical seats', async () => {
      const mockAirplane = { id: 1, modelNumber: 'Airbus A320', capacity: 180 };
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue(mockAirplane);
      jest.spyOn(SeatRepository.prototype, 'getSeatsCountByAirplaneId').mockResolvedValue(180);

      await expect(AirplaneService.updateAirplane(1, { capacity: 150 })).rejects.toThrow(
        MESSAGES.AIRPLANE.CAPACITY_BELOW_SEATS,
      );
    });

    it('should throw 400 if capacity is less than active flight scheduled capacity', async () => {
      const mockAirplane = { id: 1, modelNumber: 'Airbus A320', capacity: 180 };
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue(mockAirplane);
      jest.spyOn(SeatRepository.prototype, 'getSeatsCountByAirplaneId').mockResolvedValue(100);
      jest.spyOn(FlightRepository.prototype, 'getActiveFlightsByAirplane').mockResolvedValue([
        {
          flightNumber: 'AI-202',
          totalSeats: 180,
          remainingSeats: 130,
        },
      ]);

      await expect(AirplaneService.updateAirplane(1, { capacity: 150 })).rejects.toThrow(
        MESSAGES.AIRPLANE.CAPACITY_BELOW_BOOKINGS,
      );
    });

    it('should successfully update airplane when capacity meets all constraints', async () => {
      const mockAirplane = { id: 1, modelNumber: 'Airbus A320', capacity: 180 };
      const mockUpdated = { id: 1, modelNumber: 'Airbus A320', capacity: 160 };

      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue(mockAirplane);
      jest.spyOn(SeatRepository.prototype, 'getSeatsCountByAirplaneId').mockResolvedValue(120);
      jest.spyOn(FlightRepository.prototype, 'getActiveFlightsByAirplane').mockResolvedValue([
        {
          flightNumber: 'AI-202',
          totalSeats: 150,
          remainingSeats: 120,
        },
      ]);
      jest.spyOn(AirplaneRepository.prototype, 'update').mockResolvedValue(mockUpdated);

      const result = await AirplaneService.updateAirplane(1, { capacity: 160 });
      expect(AirplaneRepository.prototype.update).toHaveBeenCalledWith(mockAirplane, { capacity: 160 });
      expect(result).toBe(mockUpdated);
    });

    it('should update airplane without capacity checks if capacity is not in payload', async () => {
      const mockAirplane = { id: 1, modelNumber: 'Airbus A320', capacity: 180 };
      const mockUpdated = { id: 1, modelNumber: 'Airbus A320neo', capacity: 180 };

      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue(mockAirplane);
      const seatsSpy = jest.spyOn(SeatRepository.prototype, 'getSeatsCountByAirplaneId');
      jest.spyOn(AirplaneRepository.prototype, 'update').mockResolvedValue(mockUpdated);

      const result = await AirplaneService.updateAirplane(1, { modelNumber: 'Airbus A320neo' });
      expect(seatsSpy).not.toHaveBeenCalled();
      expect(result).toBe(mockUpdated);
    });

    it('should throw 404 when airplane to destroy does not exist', async () => {
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue(null);

      await expect(AirplaneService.destroyAirplane(999)).rejects.toThrow(AppError);
    });

    it('should throw 400 if airplane has scheduled or existing flights', async () => {
      const mockAirplane = { id: 1, modelNumber: 'Airbus A320' };
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue(mockAirplane);
      jest.spyOn(AirplaneRepository.prototype, 'hasFlights').mockResolvedValue(true);

      await expect(AirplaneService.destroyAirplane(1)).rejects.toThrow(
        'Cannot delete airplane with scheduled or existing flights',
      );
    });

    it('should destroy airplane by id when no flights exist', async () => {
      const mockAirplane = { id: 1, modelNumber: 'Airbus A320' };
      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue(mockAirplane);
      jest.spyOn(AirplaneRepository.prototype, 'hasFlights').mockResolvedValue(false);
      jest.spyOn(AirplaneRepository.prototype, 'destroy').mockResolvedValue(true);

      const result = await AirplaneService.destroyAirplane(1);
      expect(result).toBe(true);
    });
  });
});
