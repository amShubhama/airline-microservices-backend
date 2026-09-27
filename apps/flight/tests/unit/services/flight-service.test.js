const { FlightService } = require('../../../src/services');
const { FlightRepository, AirplaneRepository, AirportRepository } = require('../../../src/repositories');
const { AppError } = require('../../../src/utils/errors');
const { MESSAGES } = require('../../../src/constants');
const { FLIGHT_STATUS } = require('../../../src/utils/common/enums');
const { Op } = require('sequelize');

describe('FlightService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createFlight', () => {
    const validData = {
      flightNumber: 'AI-202',
      airplaneId: 1,
      departureAirportCode: 'DEL',
      arrivalAirportCode: 'BOM',
      departureTime: new Date(Date.now() + 3600000).toISOString(),
      arrivalTime: new Date(Date.now() + 10800000).toISOString(),
      price: 4500,
      status: FLIGHT_STATUS.SCHEDULED,
    };

    it('should throw 400 if departure and arrival airports are identical', async () => {
      try {
        await FlightService.createFlight({
          ...validData,
          departureAirportCode: 'DEL',
          arrivalAirportCode: 'DEL',
        });
        throw new Error('Expected createFlight to throw AppError');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.message).toBe(MESSAGES.FLIGHT.SAME_AIRPORTS);
      }
    });

    it('should throw 404 if departure airport does not exist', async () => {
      jest.spyOn(AirportRepository.prototype, 'findByCode').mockResolvedValue(null);

      try {
        await FlightService.createFlight(validData);
        throw new Error('Expected createFlight to throw AppError');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
      }
    });

    it('should throw 404 if airplane does not exist', async () => {
      jest.spyOn(AirportRepository.prototype, 'findByCode').mockImplementation(async (code) => ({ code }));

      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue(null);

      try {
        await FlightService.createFlight(validData);
        throw new Error('Expected createFlight to throw AppError');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
      }
    });

    it('should throw 400 if arrivalTime is earlier than departureTime', async () => {
      jest.spyOn(AirportRepository.prototype, 'findByCode').mockImplementation(async (code) => ({ code }));

      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue({
        id: 1,
        capacity: 180,
      });

      try {
        await FlightService.createFlight({
          ...validData,
          departureTime: new Date(Date.now() + 10800000).toISOString(),
          arrivalTime: new Date(Date.now() + 3600000).toISOString(),
        });
        throw new Error('Expected createFlight to throw AppError');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
      }
    });

    it('should throw 400 if airplane is already scheduled on an overlapping flight', async () => {
      jest.spyOn(AirportRepository.prototype, 'findByCode').mockImplementation(async (code) => ({ code }));

      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue({
        id: 1,
        capacity: 180,
      });

      jest.spyOn(FlightRepository.prototype, 'findOverlappingFlight').mockResolvedValue({
        id: 99,
        flightNumber: 'AI-101',
      });

      try {
        await FlightService.createFlight(validData);
        throw new Error('Expected createFlight to throw AppError');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.message).toBe(MESSAGES.FLIGHT.SCHEDULE_OVERLAP);
      }
    });

    it('should successfully create a flight defaulting seats to aircraft capacity', async () => {
      jest.spyOn(AirportRepository.prototype, 'findByCode').mockImplementation(async (code) => ({ code }));

      jest.spyOn(AirplaneRepository.prototype, 'get').mockResolvedValue({
        id: 1,
        capacity: 180,
      });

      jest.spyOn(FlightRepository.prototype, 'findOverlappingFlight').mockResolvedValue(null);

      const mockCreated = { id: 10, ...validData, totalSeats: 180, remainingSeats: 180 };
      jest.spyOn(FlightRepository.prototype, 'create').mockResolvedValue(mockCreated);

      const result = await FlightService.createFlight(validData);

      expect(FlightRepository.prototype.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalSeats: 180,
          remainingSeats: 180,
          status: FLIGHT_STATUS.SCHEDULED,
        }),
      );
      expect(result).toBe(mockCreated);
    });
  });

  describe('buildCustomFilter', () => {
    it('should build filter from trips parameter', () => {
      const filter = FlightService.buildCustomFilter({ trips: 'del-bom' });

      expect(filter.departureAirportCode).toBe('DEL');
      expect(filter.arrivalAirportCode).toBe('BOM');
    });

    it('should build filter from explicit airport codes when trips is omitted', () => {
      const filter = FlightService.buildCustomFilter({
        departureAirportCode: 'blr',
        arrivalAirportCode: 'hyd',
      });

      expect(filter.departureAirportCode).toBe('blr');
      expect(filter.arrivalAirportCode).toBe('hyd');
    });

    it('should correctly build price between filter from price range string', () => {
      const filter = FlightService.buildCustomFilter({ price: '2000-8000' });

      expect(filter.price[Op.between]).toEqual([2000, 8000]);
    });

    it('should handle inverted price range correctly (min > max)', () => {
      const filter = FlightService.buildCustomFilter({ price: '9000-3000' });

      expect(filter.price[Op.between]).toEqual([3000, 9000]);
    });

    it('should build price filter from minPrice and maxPrice parameters', () => {
      const filter = FlightService.buildCustomFilter({ minPrice: 3500, maxPrice: 7500 });

      expect(filter.price[Op.between]).toEqual([3500, 7500]);
    });

    it('should build price filter for only minPrice or only maxPrice', () => {
      const filterMin = FlightService.buildCustomFilter({ minPrice: 4000 });
      expect(filterMin.price[Op.gte]).toBe(4000);

      const filterMax = FlightService.buildCustomFilter({ maxPrice: 8000 });
      expect(filterMax.price[Op.lte]).toBe(8000);
    });

    it('should filter remainingSeats based on travellers headcount', () => {
      const filter = FlightService.buildCustomFilter({ travellers: '4' });

      expect(filter.remainingSeats[Op.gte]).toBe('4');
    });

    it('should build UTC start and end boundaries for tripDate', () => {
      const filter = FlightService.buildCustomFilter({ tripDate: '2026-11-20' });

      expect(filter.departureTime[Op.between]).toEqual([
        new Date('2026-11-20T00:00:00.000Z'),
        new Date('2026-11-20T23:59:59.999Z'),
      ]);
    });

    it('should filter by specific status when provided', () => {
      const filter = FlightService.buildCustomFilter({ status: 'CANCELLED' });

      expect(filter.status).toBe('CANCELLED');
    });

    it('should default status to bookable flights when status is omitted', () => {
      const filter = FlightService.buildCustomFilter({});

      expect(filter.status[Op.in]).toEqual([FLIGHT_STATUS.SCHEDULED, FLIGHT_STATUS.ON_TIME, FLIGHT_STATUS.DELAYED]);
    });
  });

  describe('buildSortFilter', () => {
    it('should return default sort on departureTime ASC when no sort query provided', () => {
      const sort = FlightService.buildSortFilter();

      expect(sort).toEqual([['departureTime', 'ASC']]);
    });

    it('should parse valid sort criteria', () => {
      const sort = FlightService.buildSortFilter('price_desc,departureTime_asc');

      expect(sort).toEqual([
        ['price', 'DESC'],
        ['departureTime', 'ASC'],
      ]);
    });

    it('should filter out unwhitelisted fields and directions', () => {
      const sort = FlightService.buildSortFilter('maliciousColumn_desc,price_invalidDirection');

      expect(sort).toEqual([['departureTime', 'ASC']]);
    });
  });

  describe('getAllFlights', () => {
    it('should delegate customFilter, sortFilter, and pagination to repository', async () => {
      jest.spyOn(FlightRepository.prototype, 'getAllFlights').mockResolvedValue([]);

      await FlightService.getAllFlights({
        trips: 'DEL-BOM',
        travellers: 2,
        price: '3000-8000',
        sort: 'price_asc',
        limit: 20,
        offset: 0,
      });

      expect(FlightRepository.prototype.getAllFlights).toHaveBeenCalledWith(
        expect.objectContaining({
          departureAirportCode: 'DEL',
          arrivalAirportCode: 'BOM',
          remainingSeats: expect.anything(),
        }),
        [['price', 'ASC']],
        { limit: 20, offset: 0 },
      );
    });

    it('should pass custom limit and offset to repository', async () => {
      jest.spyOn(FlightRepository.prototype, 'getAllFlights').mockResolvedValue([]);

      await FlightService.getAllFlights({
        trips: 'DEL-BOM',
        limit: 50,
        offset: 10,
      });

      expect(FlightRepository.prototype.getAllFlights).toHaveBeenCalledWith(
        expect.objectContaining({
          departureAirportCode: 'DEL',
          arrivalAirportCode: 'BOM',
        }),
        [['departureTime', 'ASC']],
        { limit: 50, offset: 10 },
      );
    });
  });

  describe('updateFlight', () => {
    const existingFlight = {
      id: 1,
      flightNumber: 'AI-202',
      airplaneId: 1,
      departureTime: new Date(Date.now() + 3600000).toISOString(),
      arrivalTime: new Date(Date.now() + 10800000).toISOString(),
    };

    it('should throw 400 if updated arrivalTime is earlier than departureTime', async () => {
      jest.spyOn(FlightRepository.prototype, 'get').mockResolvedValue(existingFlight);

      try {
        await FlightService.updateFlight(1, {
          departureTime: new Date(Date.now() + 7200000).toISOString(),
          arrivalTime: new Date(Date.now() + 3600000).toISOString(),
        });
        throw new Error('Expected updateFlight to throw AppError');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
      }
    });

    it('should throw 400 if updated schedule overlaps with another flight on the airplane', async () => {
      jest.spyOn(FlightRepository.prototype, 'get').mockResolvedValue(existingFlight);
      jest.spyOn(FlightRepository.prototype, 'findOverlappingFlight').mockResolvedValue({
        id: 2,
        flightNumber: 'AI-303',
      });

      try {
        await FlightService.updateFlight(1, {
          departureTime: new Date(Date.now() + 4000000).toISOString(),
        });
        throw new Error('Expected updateFlight to throw AppError');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.message).toBe(MESSAGES.FLIGHT.SCHEDULE_OVERLAP);
      }
    });

    it('should throw 404 when flight to update does not exist', async () => {
      jest.spyOn(FlightRepository.prototype, 'get').mockResolvedValue(null);

      try {
        await FlightService.updateFlight(999, { price: 5000 });
        throw new Error('Expected updateFlight to throw AppError');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
      }
    });

    it('should successfully update flight when no schedule overlap exists', async () => {
      jest.spyOn(FlightRepository.prototype, 'get').mockResolvedValue(existingFlight);
      jest.spyOn(FlightRepository.prototype, 'findOverlappingFlight').mockResolvedValue(null);
      const mockUpdated = { ...existingFlight, price: 5000 };
      jest.spyOn(FlightRepository.prototype, 'update').mockResolvedValue(mockUpdated);

      const result = await FlightService.updateFlight(1, { price: 5000 });
      expect(FlightRepository.prototype.update).toHaveBeenCalledWith(existingFlight, { price: 5000 });
      expect(result).toBe(mockUpdated);
    });
  });

  describe('getFlight', () => {
    it('should return flight details when flight exists', async () => {
      const mockFlight = { id: 1, flightNumber: 'AI-202' };
      jest.spyOn(FlightRepository.prototype, 'getFlightDetail').mockResolvedValue(mockFlight);

      const result = await FlightService.getFlight(1);
      expect(result).toBe(mockFlight);
    });

    it('should throw 404 when flight does not exist', async () => {
      jest.spyOn(FlightRepository.prototype, 'getFlightDetail').mockResolvedValue(null);

      try {
        await FlightService.getFlight(999);
        throw new Error('Expected getFlight to throw AppError');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
      }
    });
  });

  describe('destroyFlight', () => {
    it('should throw 404 when flight to destroy does not exist', async () => {
      jest.spyOn(FlightRepository.prototype, 'get').mockResolvedValue(null);

      try {
        await FlightService.destroyFlight(999);
        throw new Error('Expected destroyFlight to throw AppError');
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
      }
    });

    it('should call repository destroy and return true when flight exists', async () => {
      const mockFlight = { id: 1, flightNumber: 'AI-202' };
      jest.spyOn(FlightRepository.prototype, 'get').mockResolvedValue(mockFlight);
      jest.spyOn(FlightRepository.prototype, 'destroy').mockResolvedValue(true);

      const result = await FlightService.destroyFlight(1);
      expect(result).toBe(true);
    });
  });
});
