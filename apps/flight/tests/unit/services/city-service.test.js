const { CityService } = require('../../../src/services');
const { CityRepository } = require('../../../src/repositories');
const { AppError } = require('../../../src/utils/errors');

describe('CityService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createCity', () => {
    it('should create city record with provided name', async () => {
      const mockCity = { id: 1, name: 'Mumbai' };
      jest.spyOn(CityRepository.prototype, 'create').mockResolvedValue(mockCity);

      const result = await CityService.createCity({ name: 'Mumbai' });
      expect(CityRepository.prototype.create).toHaveBeenCalledWith({ name: 'Mumbai' });
      expect(result).toBe(mockCity);
    });
  });

  describe('getCities and getCity', () => {
    it('should get all cities ordered by name', async () => {
      const mockCities = [
        { id: 1, name: 'Delhi' },
        { id: 2, name: 'Mumbai' },
      ];
      jest.spyOn(CityRepository.prototype, 'getAll').mockResolvedValue(mockCities);

      const result = await CityService.getCities();
      expect(CityRepository.prototype.getAll).toHaveBeenCalledWith({
        order: [['name', 'ASC']],
      });
      expect(result).toBe(mockCities);
    });

    it('should get city with eager-loaded airports when available', async () => {
      const mockCityWithAirports = { id: 1, name: 'Delhi', airports: [{ code: 'DEL' }] };
      jest.spyOn(CityRepository.prototype, 'getWithAirports').mockResolvedValue(mockCityWithAirports);

      const result = await CityService.getCity(1);
      expect(result).toBe(mockCityWithAirports);
    });

    it('should throw 404 when city is not found', async () => {
      jest.spyOn(CityRepository.prototype, 'getWithAirports').mockResolvedValue(null);

      await expect(CityService.getCity(999)).rejects.toThrow(AppError);
    });
  });

  describe('updateCity and destroyCity', () => {
    it('should throw 404 when city to update does not exist', async () => {
      jest.spyOn(CityRepository.prototype, 'get').mockResolvedValue(null);

      await expect(CityService.updateCity(999, { name: 'New' })).rejects.toThrow(AppError);
    });

    it('should update city by passing fetched record to repository', async () => {
      const mockExisting = { id: 1, name: 'Bengaluru' };
      const mockUpdated = { id: 1, name: 'Bengaluru' };
      jest.spyOn(CityRepository.prototype, 'get').mockResolvedValue(mockExisting);
      jest.spyOn(CityRepository.prototype, 'update').mockResolvedValue(mockUpdated);

      const result = await CityService.updateCity(1, { name: 'Bengaluru' });
      expect(CityRepository.prototype.update).toHaveBeenCalledWith(mockExisting, { name: 'Bengaluru' });
      expect(result).toBe(mockUpdated);
    });

    it('should throw 404 when city to destroy does not exist', async () => {
      jest.spyOn(CityRepository.prototype, 'getWithAirports').mockResolvedValue(null);

      await expect(CityService.destroyCity(999)).rejects.toThrow(AppError);
    });

    it('should throw 400 if city has registered airports', async () => {
      const mockCityWithAirports = {
        id: 1,
        name: 'Delhi',
        airports: [{ id: 1, code: 'DEL' }],
      };
      jest.spyOn(CityRepository.prototype, 'getWithAirports').mockResolvedValue(mockCityWithAirports);

      await expect(CityService.destroyCity(1)).rejects.toThrow('Cannot delete city with registered airports');
    });

    it('should destroy city by id when no airports exist', async () => {
      const mockCityWithoutAirports = { id: 1, name: 'Delhi', airports: [] };
      jest.spyOn(CityRepository.prototype, 'getWithAirports').mockResolvedValue(mockCityWithoutAirports);
      jest.spyOn(CityRepository.prototype, 'destroy').mockResolvedValue(true);

      const result = await CityService.destroyCity(1);
      expect(result).toBe(true);
    });
  });
});
