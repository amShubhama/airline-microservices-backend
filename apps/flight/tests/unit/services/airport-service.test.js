const { AirportService } = require('../../../src/services');
const { AirportRepository, CityRepository } = require('../../../src/repositories');
const { AppError } = require('../../../src/utils/errors');

describe('AirportService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createAirport', () => {
    it('should throw 404 if city does not exist', async () => {
      jest.spyOn(CityRepository.prototype, 'get').mockResolvedValue(null);

      await expect(
        AirportService.createAirport({
          name: 'Indira Gandhi International',
          code: 'DEL',
          cityId: 999,
        }),
      ).rejects.toThrow(AppError);
    });

    it('should create airport record', async () => {
      jest.spyOn(CityRepository.prototype, 'get').mockResolvedValue({ id: 1, name: 'Delhi' });
      const mockAirport = { id: 1, name: 'Indira Gandhi International', code: 'DEL', cityId: 1 };
      jest.spyOn(AirportRepository.prototype, 'create').mockResolvedValue(mockAirport);

      const result = await AirportService.createAirport({
        name: 'Indira Gandhi International',
        code: 'DEL',
        address: 'Terminal 3',
        cityId: 1,
      });

      expect(AirportRepository.prototype.create).toHaveBeenCalledWith({
        name: 'Indira Gandhi International',
        code: 'DEL',
        address: 'Terminal 3',
        cityId: 1,
      });
      expect(result).toBe(mockAirport);
    });
  });

  describe('getAirports and getAirport', () => {
    it('should return all airports ordered by code', async () => {
      const mockAirports = [
        { id: 1, code: 'BOM' },
        { id: 2, code: 'DEL' },
      ];
      jest.spyOn(AirportRepository.prototype, 'getAll').mockResolvedValue(mockAirports);

      const result = await AirportService.getAirports();
      expect(AirportRepository.prototype.getAll).toHaveBeenCalledWith({
        order: [['code', 'ASC']],
      });
      expect(result).toBe(mockAirports);
    });

    it('should return single airport by id', async () => {
      const mockAirport = { id: 1, code: 'DEL' };
      jest.spyOn(AirportRepository.prototype, 'get').mockResolvedValue(mockAirport);

      const result = await AirportService.getAirport(1);
      expect(result).toBe(mockAirport);
    });

    it('should throw 404 when airport is not found by id', async () => {
      jest.spyOn(AirportRepository.prototype, 'get').mockResolvedValue(null);

      await expect(AirportService.getAirport(999)).rejects.toThrow(AppError);
    });
  });

  describe('getAirportByCode', () => {
    it('should throw 404 when airport is not found by code', async () => {
      jest.spyOn(AirportRepository.prototype, 'findByCode').mockResolvedValue(null);

      await expect(AirportService.getAirportByCode('XYZ')).rejects.toThrow(AppError);
    });

    it('should return airport record when found by code', async () => {
      const mockAirport = { id: 1, code: 'DEL' };
      jest.spyOn(AirportRepository.prototype, 'findByCode').mockResolvedValue(mockAirport);

      const result = await AirportService.getAirportByCode('DEL');
      expect(result).toBe(mockAirport);
    });
  });

  describe('updateAirport and destroyAirport', () => {
    it('should throw 404 when airport to update does not exist', async () => {
      jest.spyOn(AirportRepository.prototype, 'get').mockResolvedValue(null);

      await expect(AirportService.updateAirport(999, { code: 'BOM' })).rejects.toThrow(AppError);
    });

    it('should throw 404 if updated cityId does not exist', async () => {
      jest.spyOn(AirportRepository.prototype, 'get').mockResolvedValue({ id: 1, code: 'DEL' });
      jest.spyOn(CityRepository.prototype, 'get').mockResolvedValue(null);

      await expect(AirportService.updateAirport(1, { cityId: 999 })).rejects.toThrow(AppError);
    });

    it('should update airport record passing record to repository', async () => {
      const mockExisting = { id: 1, code: 'DEL' };
      jest.spyOn(AirportRepository.prototype, 'get').mockResolvedValue(mockExisting);
      jest.spyOn(CityRepository.prototype, 'get').mockResolvedValue({ id: 2 });
      const mockUpdated = { id: 1, code: 'BOM', cityId: 2 };
      jest.spyOn(AirportRepository.prototype, 'update').mockResolvedValue(mockUpdated);

      const result = await AirportService.updateAirport(1, { code: 'BOM', cityId: 2 });
      expect(AirportRepository.prototype.update).toHaveBeenCalledWith(mockExisting, {
        code: 'BOM',
        cityId: 2,
      });
      expect(result).toBe(mockUpdated);
    });

    it('should throw 404 when airport to destroy does not exist', async () => {
      jest.spyOn(AirportRepository.prototype, 'get').mockResolvedValue(null);

      await expect(AirportService.destroyAirport(999)).rejects.toThrow(AppError);
    });

    it('should throw 400 if airport has scheduled or existing flights', async () => {
      const mockAirport = { id: 1, code: 'DEL' };
      jest.spyOn(AirportRepository.prototype, 'get').mockResolvedValue(mockAirport);
      jest.spyOn(AirportRepository.prototype, 'hasFlights').mockResolvedValue(true);

      await expect(AirportService.destroyAirport(1)).rejects.toThrow('Cannot delete airport with scheduled flights');
    });

    it('should destroy airport by id when no flights exist', async () => {
      const mockAirport = { id: 1, code: 'DEL' };
      jest.spyOn(AirportRepository.prototype, 'get').mockResolvedValue(mockAirport);
      jest.spyOn(AirportRepository.prototype, 'hasFlights').mockResolvedValue(false);
      jest.spyOn(AirportRepository.prototype, 'destroy').mockResolvedValue(true);

      const result = await AirportService.destroyAirport(1);
      expect(result).toBe(true);
    });
  });
});
