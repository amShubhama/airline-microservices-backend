const { validateAuthToken } = require('../../../src/middlewares/auth-request-validator');
const AppError = require('../../../src/utils/errors/app-error');

describe('auth-request-validator middleware', () => {
  describe('validateAuthToken', () => {
    it('should return AppError 401 if authorization and x-access-token headers are missing', () => {
      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      validateAuthToken(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
    });

    it('should extract Bearer token from authorization header and attach to req.token', () => {
      const token = 'sample-jwt-token-value';
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = {};
      const next = jest.fn();

      validateAuthToken(req, res, next);

      expect(req.token).toBe(token);
      expect(next).toHaveBeenCalledWith();
    });

    it('should extract raw token from x-access-token header and attach to req.token', () => {
      const token = 'sample-jwt-token-value';
      const req = {
        headers: {
          'x-access-token': token,
        },
      };
      const res = {};
      const next = jest.fn();

      validateAuthToken(req, res, next);

      expect(req.token).toBe(token);
      expect(next).toHaveBeenCalledWith();
    });

    it('should fail with AppError 401 when token header is malformed', () => {
      const req = {
        headers: {
          authorization: 'Bearer',
        },
      };
      const res = {};
      const next = jest.fn();

      validateAuthToken(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
    });
  });
});
