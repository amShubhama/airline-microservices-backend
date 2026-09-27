const { StatusCodes } = require('http-status-codes');
const errorHandler = require('../../../src/middlewares/error-middleware');
const { AppError } = require('../../../src/utils/errors');
const { MESSAGES } = require('../../../src/constants');

describe('Error Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should delegate to next if headersSent is true', () => {
    res.headersSent = true;
    const err = new Error('Already sent');

    errorHandler(err, req, res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should format AppError correctly', () => {
    const err = new AppError('Custom error', StatusCodes.BAD_REQUEST, 'Custom explanation');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Custom error',
        error: {
          statusCode: StatusCodes.BAD_REQUEST,
          explanation: 'Custom explanation',
        },
      }),
    );
  });

  it('should format SequelizeUniqueConstraintError with 409 Conflict', () => {
    const err = {
      name: 'SequelizeUniqueConstraintError',
      errors: [{ message: 'City name must be unique' }],
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Resource conflict',
      }),
    );
  });

  it('should format general SequelizeForeignKeyConstraintError with 400', () => {
    const err = {
      name: 'SequelizeForeignKeyConstraintError',
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid relational reference',
      }),
    );
  });

  it('should format restricted parent delete SequelizeForeignKeyConstraintError with informative message', () => {
    const err = {
      name: 'SequelizeForeignKeyConstraintError',
      parent: {
        code: 'ER_ROW_IS_REFERENCED_2',
        message: 'Cannot delete or update a parent row: a foreign key constraint fails',
      },
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Cannot delete or modify record due to foreign key restriction',
      }),
    );
  });

  it('should format SequelizeValidationError with 400', () => {
    const err = {
      name: 'SequelizeValidationError',
      errors: [{ message: 'Validation failed on field' }],
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: MESSAGES.VALIDATION.VALIDATION_ERROR,
      }),
    );
  });

  it('should format unhandled errors as 500 Internal Server Error', () => {
    const err = new Error('Unexpected catastrophic crash');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: MESSAGES.SYSTEM.INTERNAL_SERVER_ERROR,
      }),
    );
  });
});
