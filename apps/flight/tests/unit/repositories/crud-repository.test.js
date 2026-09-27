const CrudRepository = require('../../../src/repositories/crud-repository');

describe('CrudRepository Base Class', () => {
  let mockModel;
  let crudRepo;

  beforeEach(() => {
    mockModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
      destroy: jest.fn(),
    };
    crudRepo = new CrudRepository(mockModel);
  });

  describe('create', () => {
    it('should call model.create with data and return created record', async () => {
      const payload = { name: 'Test' };
      mockModel.create.mockResolvedValue({ id: 1, ...payload });

      const result = await crudRepo.create(payload);
      expect(mockModel.create).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ id: 1, ...payload });
    });
  });

  describe('get', () => {
    it('should return record if found by primary key', async () => {
      mockModel.findByPk.mockResolvedValue({ id: 5, name: 'Sample' });

      const result = await crudRepo.get(5);
      expect(mockModel.findByPk).toHaveBeenCalledWith(5);
      expect(result).toEqual({ id: 5, name: 'Sample' });
    });

    it('should return null if record is not found', async () => {
      mockModel.findByPk.mockResolvedValue(null);

      const result = await crudRepo.get(999);
      expect(mockModel.findByPk).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should call model.findAll with options and return array of records', async () => {
      const records = [{ id: 1 }, { id: 2 }];
      mockModel.findAll.mockResolvedValue(records);

      const result = await crudRepo.getAll({ order: [['id', 'ASC']] });
      expect(mockModel.findAll).toHaveBeenCalledWith({ order: [['id', 'ASC']] });
      expect(result).toEqual(records);
    });
  });

  describe('update', () => {
    it('should call update on the passed record instance and return updated record', async () => {
      const mockRecord = {
        id: 1,
        name: 'Old',
        update: jest.fn().mockImplementation(function (data) {
          Object.assign(this, data);
          return Promise.resolve(this);
        }),
      };

      const result = await crudRepo.update(mockRecord, { name: 'New' });
      expect(mockRecord.update).toHaveBeenCalledWith({ name: 'New' });
      expect(result.name).toBe('New');
    });
  });

  describe('destroy', () => {
    it('should call model.destroy with where id clause and return true when deleted', async () => {
      mockModel.destroy.mockResolvedValue(1);

      const result = await crudRepo.destroy(1);
      expect(mockModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(true);
    });

    it('should return false when no rows were deleted', async () => {
      mockModel.destroy.mockResolvedValue(0);

      const result = await crudRepo.destroy(999);
      expect(mockModel.destroy).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(result).toBe(false);
    });
  });
});
