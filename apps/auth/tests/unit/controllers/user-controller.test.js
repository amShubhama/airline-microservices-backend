const { StatusCodes } = require('http-status-codes');
const { mockUser } = require('../../fixtures/user.fixture');

jest.mock('../../../src/services/user-service');
const UserService = require('../../../src/services/user-service');
const UserController = require('../../../src/controllers/user-controller');

describe('UserController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      headers: {},
      token: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return 201 with created user data on success', async () => {
      req.body = { email: 'user@test.com', password: 'Password@123' };
      UserService.prototype.create.mockResolvedValue(mockUser);

      await UserController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUser,
        }),
      );
    });

    it('should pass error to next if service throws', async () => {
      const err = new Error('Service error');
      UserService.prototype.create.mockRejectedValue(err);

      await UserController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('signIn', () => {
    it('should return 200 with token and user details on valid credentials', async () => {
      req.body = { email: 'user@test.com', password: 'Password@123' };
      const loginResult = { token: 'mock-token', user: mockUser };
      UserService.prototype.signIn.mockResolvedValue(loginResult);

      await UserController.signIn(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: loginResult,
        }),
      );
    });

    it('should pass error to next if sign in fails', async () => {
      const err = new Error('Invalid credentials');
      UserService.prototype.signIn.mockRejectedValue(err);

      await UserController.signIn(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('isAuthenticated', () => {
    it('should return 200 with authenticated user info when req.token is present', async () => {
      req.token = 'valid-token';
      UserService.prototype.isAuthenticated.mockResolvedValue(mockUser);

      await UserController.isAuthenticated(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUser,
        }),
      );
    });

    it('should extract token from authorization header when req.token is missing', async () => {
      req.token = null;
      req.headers['authorization'] = 'Bearer extracted-auth-token';
      UserService.prototype.isAuthenticated.mockResolvedValue(mockUser);

      await UserController.isAuthenticated(req, res, next);

      expect(UserService.prototype.isAuthenticated).toHaveBeenCalledWith('extracted-auth-token');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should extract token from x-access-token header when req.token is missing', async () => {
      req.token = null;
      req.headers['x-access-token'] = 'extracted-header-token';
      UserService.prototype.isAuthenticated.mockResolvedValue(mockUser);

      await UserController.isAuthenticated(req, res, next);

      expect(UserService.prototype.isAuthenticated).toHaveBeenCalledWith('extracted-header-token');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should pass error to next when verification fails', async () => {
      req.token = 'invalid-token';
      const err = new Error('Token verification failed');
      UserService.prototype.isAuthenticated.mockRejectedValue(err);

      await UserController.isAuthenticated(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('isAdmin', () => {
    it('should return 200 with isAdmin boolean status when req.token is present', async () => {
      req.token = 'admin-token';
      UserService.prototype.isAdmin.mockResolvedValue(true);

      await UserController.isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { isAdmin: true },
        }),
      );
    });

    it('should extract token from authorization header when req.token is missing', async () => {
      req.token = null;
      req.headers['authorization'] = 'Bearer admin-bearer-token';
      UserService.prototype.isAdmin.mockResolvedValue(true);

      await UserController.isAdmin(req, res, next);

      expect(UserService.prototype.isAdmin).toHaveBeenCalledWith('admin-bearer-token');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should extract token from x-access-token header when req.token is missing', async () => {
      req.token = null;
      req.headers['x-access-token'] = 'admin-raw-token';
      UserService.prototype.isAdmin.mockResolvedValue(true);

      await UserController.isAdmin(req, res, next);

      expect(UserService.prototype.isAdmin).toHaveBeenCalledWith('admin-raw-token');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should pass error to next if check admin fails', async () => {
      req.token = 'bad-token';
      const err = new Error('Admin check error');
      UserService.prototype.isAdmin.mockRejectedValue(err);

      await UserController.isAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
