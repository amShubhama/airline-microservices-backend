const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserService = require('../../../src/services/user-service');
const AppError = require('../../../src/utils/errors/app-error');
const { mockUser, mockAdminUser } = require('../../fixtures/user.fixture');

jest.mock('../../../src/repositories/user-repository');

describe('UserService', () => {
  let userService;
  let mockUserRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService();
    mockUserRepo = userService.userRepository;
  });

  describe('create', () => {
    it('should call userRepository.create and return created user', async () => {
      const signupData = { email: 'new@airline.com', password: 'Password@123' };
      mockUserRepo.create = jest.fn().mockResolvedValue(mockUser);

      const result = await userService.create(signupData);

      expect(mockUserRepo.create).toHaveBeenCalledWith(signupData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('signIn', () => {
    it('should normalize email by trimming and lowercasing', async () => {
      mockUserRepo.getByEmail = jest.fn().mockResolvedValue(null);

      await expect(userService.signIn('   TEST@AIRLINE.COM   ', 'Password@123')).rejects.toThrow(AppError);

      expect(mockUserRepo.getByEmail).toHaveBeenCalledWith('test@airline.com', true);
    });

    it('should handle null or undefined email gracefully', async () => {
      mockUserRepo.getByEmail = jest.fn().mockResolvedValue(null);

      await expect(userService.signIn(null, 'Password@123')).rejects.toThrow(AppError);

      expect(mockUserRepo.getByEmail).toHaveBeenCalledWith('', true);
    });

    it('should throw AppError 401 if user is not found by email', async () => {
      mockUserRepo.getByEmail = jest.fn().mockResolvedValue(null);

      await expect(userService.signIn('nonexistent@airline.com', 'Password@123')).rejects.toThrow(AppError);
    });

    it('should throw AppError 401 if password does not match', async () => {
      mockUserRepo.getByEmail = jest.fn().mockResolvedValue({
        ...mockUser,
        password: 'hashedPassword',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(userService.signIn('test@airline.com', 'WrongPassword')).rejects.toThrow(AppError);
    });

    it('should throw AppError 401 if plain password is null or empty', async () => {
      mockUserRepo.getByEmail = jest.fn().mockResolvedValue({
        ...mockUser,
        password: 'hashedPassword',
      });

      await expect(userService.signIn('test@airline.com', '')).rejects.toThrow(AppError);
    });

    it('should successfully return token and user details if credentials are valid', async () => {
      mockUserRepo.getByEmail = jest.fn().mockResolvedValue({
        ...mockUser,
        password: 'hashedPassword',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const response = await userService.signIn('test@airline.com', 'Password@123');

      expect(response).toHaveProperty('token');
      expect(typeof response.token).toBe('string');
      expect(response.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        Roles: mockUser.Roles,
      });
    });

    it('should handle user with undefined or empty Roles gracefully upon signin', async () => {
      mockUserRepo.getByEmail = jest.fn().mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        password: 'hashedPassword',
        Roles: null,
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const response = await userService.signIn('test@airline.com', 'Password@123');

      expect(response.user.Roles).toEqual([]);
    });
  });

  describe('isAuthenticated', () => {
    it('should throw AppError 401 if token is missing or falsy', async () => {
      await expect(userService.isAuthenticated(null)).rejects.toThrow(AppError);
      await expect(userService.isAuthenticated('')).rejects.toThrow(AppError);
    });

    it('should throw AppError 401 if token is invalid or malformed', async () => {
      await expect(userService.isAuthenticated('invalid.token.here')).rejects.toThrow(AppError);
    });

    it('should throw AppError 401 if token has expired', async () => {
      const expiredToken = jwt.sign({ id: mockUser.id, email: mockUser.email }, process.env.JWT_KEY, {
        expiresIn: '-1s',
      });

      await expect(userService.isAuthenticated(expiredToken)).rejects.toThrow(AppError);
    });

    it('should throw AppError 401 if user no longer exists in DB', async () => {
      const validToken = jwt.sign({ id: mockUser.id, email: mockUser.email }, process.env.JWT_KEY, {
        expiresIn: '1h',
      });
      mockUserRepo.getById = jest.fn().mockResolvedValue(null);

      await expect(userService.isAuthenticated(validToken)).rejects.toThrow(AppError);
    });

    it('should return user when token is valid and user exists', async () => {
      const validToken = jwt.sign({ id: mockUser.id, email: mockUser.email }, process.env.JWT_KEY, {
        expiresIn: '1h',
      });
      mockUserRepo.getById = jest.fn().mockResolvedValue(mockUser);

      const result = await userService.isAuthenticated(validToken);

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.getById).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('isAdmin', () => {
    it('should throw AppError 401 if token is missing', async () => {
      await expect(userService.isAdmin(null)).rejects.toThrow(AppError);
    });

    it('should throw AppError 401 if token does not contain a user id', async () => {
      const badToken = jwt.sign({ noId: true }, process.env.JWT_KEY, { expiresIn: '1h' });

      await expect(userService.isAdmin(badToken)).rejects.toThrow(AppError);
    });

    it('should throw AppError 401 if user does not exist in DB', async () => {
      const validToken = jwt.sign({ id: mockUser.id }, process.env.JWT_KEY, { expiresIn: '1h' });
      mockUserRepo.checkAdminStatus = jest.fn().mockResolvedValue({
        userExists: false,
        isAdmin: false,
        roles: [],
      });

      await expect(userService.isAdmin(validToken)).rejects.toThrow(AppError);
    });

    it('should return true if user has ADMIN role', async () => {
      const validToken = jwt.sign({ id: mockAdminUser.id }, process.env.JWT_KEY, {
        expiresIn: '1h',
      });
      mockUserRepo.checkAdminStatus = jest.fn().mockResolvedValue({
        userExists: true,
        isAdmin: true,
        roles: ['ADMIN'],
      });

      const result = await userService.isAdmin(validToken);

      expect(result).toBe(true);
      expect(mockUserRepo.checkAdminStatus).toHaveBeenCalledWith(mockAdminUser.id);
    });

    it('should return false if user does not have ADMIN role', async () => {
      const validToken = jwt.sign({ id: mockUser.id }, process.env.JWT_KEY, { expiresIn: '1h' });
      mockUserRepo.checkAdminStatus = jest.fn().mockResolvedValue({
        userExists: true,
        isAdmin: false,
        roles: ['CUSTOMER'],
      });

      const result = await userService.isAdmin(validToken);

      expect(result).toBe(false);
    });
  });
});
