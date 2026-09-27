const { requireAdmin } = require('../../../src/middlewares/role-middleware');
const { AppError } = require('../../../src/utils/errors');
const { StatusCodes } = require('http-status-codes');

describe('Role Middleware', () => {
  describe('requireAdmin', () => {
    it('should forward an AppError with 403 if x-user-role is not ADMIN', () => {
      const req = { headers: { 'x-user-role': 'CUSTOMER' } };
      const res = {};
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    it('should forward an AppError with 403 if x-user-role header is missing', () => {
      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(StatusCodes.FORBIDDEN);
    });

    it('should call next() if x-user-role is ADMIN', () => {
      const req = { headers: { 'x-user-role': 'ADMIN' } };
      const res = {};
      const next = jest.fn();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });
});
