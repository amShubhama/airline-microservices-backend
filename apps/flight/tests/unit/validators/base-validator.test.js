const { z } = require('zod');
const {
  validateRequest,
  validateIdParam,
  validateNamedIdParam,
  validatePaginationQuery,
} = require('../../../src/validators/common');
const ValidationError = require('../../../src/utils/errors/validation-error');

describe('Common Validators Middleware', () => {
  describe('validateRequest', () => {
    const testSchema = z.object({
      body: z.object({
        name: z.string().min(2),
        age: z.number().positive(),
      }),
      query: z.object({
        limit: z.coerce.number().default(10),
      }),
    });

    it('should call next() with no errors and attach parsed values on valid payload', async () => {
      const middleware = validateRequest(testSchema);
      const req = {
        body: { name: 'Airbus', age: 10 },
        query: { limit: '25' },
        params: {},
      };
      const res = {};
      const next = jest.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(req.query.limit).toBe(25);
    });

    it('should call next with ValidationError when payload fails validation', async () => {
      const middleware = validateRequest(testSchema);
      const req = {
        body: { name: 'A', age: -5 },
        query: {},
        params: {},
      };
      const res = {};
      const next = jest.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const errorArg = next.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(ValidationError);
      expect(errorArg.statusCode).toBe(400);
    });
  });

  describe('validateIdParam', () => {
    it('should pass validation when params.id is a positive integer', async () => {
      const req = { params: { id: '42' } };
      const res = {};
      const next = jest.fn();

      await validateIdParam(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
      expect(req.params.id).toBe(42);
    });

    it('should call next with ValidationError when params.id is invalid or non-numeric', async () => {
      const req = { params: { id: 'abc' } };
      const res = {};
      const next = jest.fn();

      await validateIdParam(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const errorArg = next.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(ValidationError);
      expect(errorArg.statusCode).toBe(400);
      expect(errorArg.explanation[0]).toContain('params.id');
    });

    it('should call next with ValidationError when params.id is negative or zero', async () => {
      const req = { params: { id: '0' } };
      const res = {};
      const next = jest.fn();

      await validateIdParam(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const errorArg = next.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(ValidationError);
      expect(errorArg.statusCode).toBe(400);
    });
  });

  describe('validateNamedIdParam', () => {
    it('should validate custom named param e.g. airplaneId', async () => {
      const middleware = validateNamedIdParam('airplaneId');
      const req = { params: { airplaneId: '5' } };
      const res = {};
      const next = jest.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.params.airplaneId).toBe(5);
    });

    it('should reject invalid custom named param', async () => {
      const middleware = validateNamedIdParam('airplaneId');
      const req = { params: { airplaneId: '-1' } };
      const res = {};
      const next = jest.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const errorArg = next.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(ValidationError);
      expect(errorArg.explanation[0]).toContain('params.airplaneId');
    });
  });

  describe('validatePaginationQuery', () => {
    it('should apply defaults for pagination query parameters', async () => {
      const req = { query: {} };
      const res = {};
      const next = jest.fn();

      await validatePaginationQuery(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.query.limit).toBe(20);
      expect(req.query.offset).toBe(0);
    });
  });
});
