const AirportRepository = require('../../../src/repositories/airport-repository');
const { Airport, Flight } = require('../../../src/models');

describe('AirportRepository', () => {
  let airportRepo;

  beforeEach(() => {
    airportRepo = new AirportRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findByCode', () => {
    it('should query Airport.findOne with code and eager loaded city', async () => {
      const mockAirport = { id: 1, code: 'DEL', name: 'Indira Gandhi' };
      jest.spyOn(Airport, 'findOne').mockResolvedValue(mockAirport);

      const result = await airportRepo.findByCode('DEL');
      expect(Airport.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { code: 'DEL' },
          include: expect.any(Object),
        }),
      );
      expect(result).toBe(mockAirport);
    });
  });

  describe('getAll', () => {
    it('should call super.getAll with default include when none provided', async () => {
      const mockAirports = [{ id: 1, code: 'DEL' }];
      jest.spyOn(Airport, 'findAll').mockResolvedValue(mockAirports);

      const result = await airportRepo.getAll({ order: [['code', 'ASC']] });
      expect(Airport.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['code', 'ASC']],
          include: expect.any(Array),
        }),
      );
      expect(result).toEqual(mockAirports);
    });
  });

  describe('hasFlights', () => {
    it('should return true when airport has departing or arriving flights', async () => {
      jest.spyOn(Flight, 'count').mockResolvedValue(3);

      const result = await airportRepo.hasFlights('DEL');
      expect(Flight.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
        }),
      );
      expect(result).toBe(true);
    });

    it('should return false when airport has zero flights', async () => {
      jest.spyOn(Flight, 'count').mockResolvedValue(0);

      const result = await airportRepo.hasFlights('DEL');
      expect(result).toBe(false);
    });
  });
});
