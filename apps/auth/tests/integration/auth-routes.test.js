const request = require('supertest');
const { StatusCodes } = require('http-status-codes');
const { mockUser, validSignupPayload, validSigninPayload } = require('../fixtures/user.fixture');

jest.mock('../../src/services/user-service');
const UserService = require('../../src/services/user-service');
const app = require('../../src/app');

describe('Auth API Routes Integration (/api/v1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/signup', () => {
    it('should return 400 if email is invalid', async () => {
      const response = await request(app).post('/api/v1/signup').send({
        email: 'not-an-email',
        password: 'Password@123',
      });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('explanation');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app).post('/api/v1/signup').send({
        email: 'user@airline.com',
      });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBe(false);
    });

    it('should return 201 on valid signup payload', async () => {
      UserService.prototype.create.mockResolvedValue(mockUser);

      const response = await request(app).post('/api/v1/signup').send(validSignupPayload);

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
    });
  });

  describe('POST /api/v1/signin', () => {
    it('should return 400 if email or password missing', async () => {
      const response = await request(app).post('/api/v1/signin').send({});

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBe(false);
    });

    it('should return 200 with JWT token on valid credentials', async () => {
      const signinResult = {
        token: 'mock-jwt-token',
        user: mockUser,
      };
      UserService.prototype.signIn.mockResolvedValue(signinResult);

      const response = await request(app).post('/api/v1/signin').send(validSigninPayload);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(signinResult);
    });
  });

  describe('GET /api/v1/verify', () => {
    it('should return 401 when authorization header is absent', async () => {
      const response = await request(app).get('/api/v1/verify');

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
    });

    it('should return 200 when valid Bearer token is provided', async () => {
      UserService.prototype.isAuthenticated.mockResolvedValue(mockUser);

      const response = await request(app).get('/api/v1/verify').set('Authorization', 'Bearer valid-jwt-token');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
    });

    it('should accept x-access-token header', async () => {
      UserService.prototype.isAuthenticated.mockResolvedValue(mockUser);

      const response = await request(app).get('/api/v1/verify').set('x-access-token', 'valid-jwt-token');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
    });
  });

  describe('GET /api/v1/isAdmin', () => {
    it('should return 401 when token is missing', async () => {
      const response = await request(app).get('/api/v1/isAdmin');

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
    });

    it('should return 200 with isAdmin status when authorized', async () => {
      UserService.prototype.isAdmin.mockResolvedValue(true);

      const response = await request(app).get('/api/v1/isAdmin').set('Authorization', 'Bearer valid-admin-jwt');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ isAdmin: true });
    });
  });
});
