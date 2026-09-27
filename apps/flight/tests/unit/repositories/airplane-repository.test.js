const AirplaneRepository = require('../../../src/repositories/airplane-repository');
const { Airplane, Flight } = require('../../../src/models');

describe('AirplaneRepository', () => {
  let airplaneRepo;

  beforeEach(() => {
    airplaneRepo = new AirplaneRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findByModelNumber', () => {
    it('should query Airplane.findOne with modelNumber', async () => {
      const mockAirplane = { id: 1, modelNumber: 'Airbus A320' };
      jest.spyOn(Airplane, 'findOne').mockResolvedValue(mockAirplane);

      const result = await airplaneRepo.findByModelNumber('Airbus A320');
      expect(Airplane.findOne).toHaveBeenCalledWith({
        where: { modelNumber: 'Airbus A320' },
      });
      expect(result).toBe(mockAirplane);
    });
  });

  describe('getWithSeats', () => {
    it('should query Airplane.findByPk with eager loaded seats', async () => {
      const mockAirplaneWithSeats = { id: 1, modelNumber: 'Airbus A320', seats: [] };
      jest.spyOn(Airplane, 'findByPk').mockResolvedValue(mockAirplaneWithSeats);

      const result = await airplaneRepo.getWithSeats(1);
      expect(Airplane.findByPk).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          include: expect.any(Object),
          order: expect.any(Array),
        }),
      );
      expect(result).toBe(mockAirplaneWithSeats);
    });
  });

  describe('hasFlights', () => {
    it('should return true when airplane has scheduled flights', async () => {
      jest.spyOn(Flight, 'count').mockResolvedValue(2);

      const result = await airplaneRepo.hasFlights(1);
      expect(Flight.count).toHaveBeenCalledWith({
        where: { airplaneId: 1 },
      });
      expect(result).toBe(true);
    });

    it('should return false when airplane has zero flights', async () => {
      jest.spyOn(Flight, 'count').mockResolvedValue(0);

      const result = await airplaneRepo.hasFlights(1);
      expect(result).toBe(false);
    });
  });
});
