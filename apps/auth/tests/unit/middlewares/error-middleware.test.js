const errorHandler = require('../../../src/middlewares/error-middleware');
const AppError = require('../../../src/utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { MESSAGES } = require('../../../src/constants');

describe('errorHandler middleware', () => {
  let req, res, next;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    req = {};
    res = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  it('should delegate to default Express handler if res.headersSent is true', () => {
    res.headersSent = true;
    const err = new Error('Already sent');

    errorHandler(err, req, res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should handle AppError with its specified status code and explanation', () => {
    const appError = new AppError('Unauthorized access', StatusCodes.UNAUTHORIZED, 'Invalid credentials');

    errorHandler(appError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Unauthorized access',
        error: expect.objectContaining({
          statusCode: StatusCodes.UNAUTHORIZED,
          explanation: 'Invalid credentials',
        }),
      }),
    );
  });

  it('should handle SequelizeUniqueConstraintError with error messages array', () => {
    const uniqueErr = {
      name: 'SequelizeUniqueConstraintError',
      errors: [{ message: 'email must be unique' }],
    };

    errorHandler(uniqueErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          statusCode: StatusCodes.CONFLICT,
          explanation: ['email must be unique'],
        }),
      }),
    );
  });

  it('should handle SequelizeUniqueConstraintError when errors array is missing', () => {
    const uniqueErr = {
      name: 'SequelizeUniqueConstraintError',
    };

    errorHandler(uniqueErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          statusCode: StatusCodes.CONFLICT,
          explanation: [MESSAGES.AUTH.USER_ALREADY_EXISTS],
        }),
      }),
    );
  });

  it('should handle SequelizeValidationError with error messages array', () => {
    const valErr = {
      name: 'SequelizeValidationError',
      errors: [{ message: 'Validation isEmail on email failed' }],
    };

    errorHandler(valErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          statusCode: StatusCodes.BAD_REQUEST,
          explanation: ['Validation isEmail on email failed'],
        }),
      }),
    );
  });

  it('should handle SequelizeValidationError when errors array is missing', () => {
    const valErr = {
      name: 'SequelizeValidationError',
    };

    errorHandler(valErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          statusCode: StatusCodes.BAD_REQUEST,
          explanation: ['Database validation failed'],
        }),
      }),
    );
  });

  it('should handle JsonWebTokenError', () => {
    const jwtErr = {
      name: 'JsonWebTokenError',
      message: 'jwt malformed',
    };

    errorHandler(jwtErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          statusCode: StatusCodes.UNAUTHORIZED,
          explanation: 'jwt malformed',
        }),
      }),
    );
  });

  it('should handle TokenExpiredError', () => {
    const expiredErr = {
      name: 'TokenExpiredError',
    };

    errorHandler(expiredErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          statusCode: StatusCodes.UNAUTHORIZED,
          explanation: 'Token has expired',
        }),
      }),
    );
  });

  it('should hide internal error details in production environment', () => {
    process.env.NODE_ENV = 'production';
    const genericErr = new Error('Database password failed');

    errorHandler(genericErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          explanation: MESSAGES.SYSTEM.INTERNAL_SERVER_ERROR,
        }),
      }),
    );
  });

  it('should expose error details in development / test environment', () => {
    process.env.NODE_ENV = 'development';
    const genericErr = new Error('Database connection failed');

    errorHandler(genericErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          explanation: 'Database connection failed',
        }),
      }),
    );
  });
});
