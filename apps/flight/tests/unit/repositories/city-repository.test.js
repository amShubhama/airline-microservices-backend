const CityRepository = require('../../../src/repositories/city-repository');
const { City } = require('../../../src/models');

describe('CityRepository', () => {
  let cityRepo;

  beforeEach(() => {
    cityRepo = new CityRepository();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getWithAirports', () => {
    it('should query City.findByPk with eager loaded airports', async () => {
      const mockCityWithAirports = { id: 1, name: 'Delhi', airports: [{ code: 'DEL' }] };
      jest.spyOn(City, 'findByPk').mockResolvedValue(mockCityWithAirports);

      const result = await cityRepo.getWithAirports(1);
      expect(City.findByPk).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          include: expect.any(Object),
        }),
      );
      expect(result).toBe(mockCityWithAirports);
    });
  });

  describe('findByName', () => {
    it('should query City.findOne with name', async () => {
      const mockCity = { id: 1, name: 'Mumbai' };
      jest.spyOn(City, 'findOne').mockResolvedValue(mockCity);

      const result = await cityRepo.findByName('Mumbai');
      expect(City.findOne).toHaveBeenCalledWith({
        where: { name: 'Mumbai' },
      });
      expect(result).toBe(mockCity);
    });
  });
});
