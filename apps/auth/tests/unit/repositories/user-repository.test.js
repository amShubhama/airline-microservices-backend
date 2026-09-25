const UserRepository = require('../../../src/repositories/user-repository');
const AppError = require('../../../src/utils/errors/app-error');

jest.mock('../../../src/models/index', () => {
  return {
    User: {
      create: jest.fn(),
      destroy: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      scope: jest.fn(),
    },
    Role: {
      findOne: jest.fn(),
    },
    sequelize: {
      transaction: jest.fn(),
    },
  };
});

const { User, Role, sequelize } = require('../../../src/models/index');

describe('UserRepository', () => {
  let userRepository;
  let mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction = {
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
    };
    sequelize.transaction.mockResolvedValue(mockTransaction);
    userRepository = new UserRepository();
  });

  describe('create', () => {
    it('should create user and associate default role within a transaction', async () => {
      const roleObj = { id: 1, role: 'CUSTOMER' };
      const createdUserInstance = {
        id: 'uuid-1',
        email: 'test@airline.com',
        addRole: jest.fn().mockResolvedValue(),
        toJSON: jest.fn().mockReturnValue({ id: 'uuid-1', email: 'test@airline.com' }),
      };

      Role.findOne.mockResolvedValue(roleObj);
      User.create.mockResolvedValue(createdUserInstance);

      const result = await userRepository.create({ email: 'test@airline.com', password: 'hash' });

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(Role.findOne).toHaveBeenCalledWith({
        where: { role: 'CUSTOMER' },
        transaction: mockTransaction,
      });
      expect(User.create).toHaveBeenCalledWith(
        { email: 'test@airline.com', password: 'hash' },
        { transaction: mockTransaction },
      );
      expect(createdUserInstance.addRole).toHaveBeenCalledWith(roleObj, {
        transaction: mockTransaction,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toHaveProperty('Roles');
      expect(result.Roles).toEqual([{ id: 1, role: 'CUSTOMER' }]);
    });

    it('should rollback transaction and throw AppError if default role does not exist', async () => {
      Role.findOne.mockResolvedValue(null);

      await expect(userRepository.create({ email: 'test@airline.com' })).rejects.toThrow(AppError);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('should rollback and rethrow if user creation fails', async () => {
      const dbError = new Error('DB write failed');
      Role.findOne.mockResolvedValue({ id: 1, role: 'CUSTOMER' });
      User.create.mockRejectedValue(dbError);

      await expect(userRepository.create({ email: 'test@airline.com' })).rejects.toThrow('DB write failed');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should return true when rows are deleted', async () => {
      User.destroy.mockResolvedValue(1);

      const result = await userRepository.destroy('user-1');

      expect(result).toBe(true);
      expect(User.destroy).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should return false when no rows are deleted', async () => {
      User.destroy.mockResolvedValue(0);

      const result = await userRepository.destroy('user-unknown');

      expect(result).toBe(false);
    });
  });

  describe('getById', () => {
    it('should find user by primary key including roles', async () => {
      const mockUserRecord = { id: 'user-1', email: 'user@airline.com' };
      User.findByPk.mockResolvedValue(mockUserRecord);

      const result = await userRepository.getById('user-1');

      expect(User.findByPk).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          include: expect.any(Array),
        }),
      );
      expect(result).toEqual(mockUserRecord);
    });
  });

  describe('getByEmail', () => {
    it('should query standard User model when includePassword is false', async () => {
      User.findOne.mockResolvedValue({ id: 'user-1', email: 'user@airline.com' });

      const result = await userRepository.getByEmail('user@airline.com', false);

      expect(User.scope).not.toHaveBeenCalled();
      expect(User.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'user@airline.com' },
        }),
      );
      expect(result).toEqual({ id: 'user-1', email: 'user@airline.com' });
    });

    it('should query withPassword scope when includePassword is true', async () => {
      const scopedModel = {
        findOne: jest.fn().mockResolvedValue({ id: 'user-1', password: 'hash' }),
      };
      User.scope.mockReturnValue(scopedModel);

      const result = await userRepository.getByEmail('user@airline.com', true);

      expect(User.scope).toHaveBeenCalledWith('withPassword');
      expect(scopedModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'user@airline.com' },
        }),
      );
      expect(result).toEqual({ id: 'user-1', password: 'hash' });
    });
  });

  describe('checkAdminStatus', () => {
    it('should return userExists: false if user is not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const result = await userRepository.checkAdminStatus('missing-id');

      expect(result).toEqual({ userExists: false, isAdmin: false, roles: [] });
    });

    it('should return isAdmin: true if ADMIN role is present', async () => {
      User.findByPk.mockResolvedValue({
        id: 'admin-id',
        Roles: [{ role: 'CUSTOMER' }, { role: 'ADMIN' }],
      });

      const result = await userRepository.checkAdminStatus('admin-id');

      expect(result).toEqual({
        userExists: true,
        isAdmin: true,
        roles: ['CUSTOMER', 'ADMIN'],
      });
    });

    it('should return isAdmin: false if ADMIN role is absent', async () => {
      User.findByPk.mockResolvedValue({
        id: 'customer-id',
        Roles: [{ role: 'CUSTOMER' }],
      });

      const result = await userRepository.checkAdminStatus('customer-id');

      expect(result).toEqual({
        userExists: true,
        isAdmin: false,
        roles: ['CUSTOMER'],
      });
    });
  });
});
