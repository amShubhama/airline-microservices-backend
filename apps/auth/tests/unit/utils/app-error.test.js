const AppError = require('../../../src/utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

describe('AppError utility', () => {
  it('should initialize with default parameters when no arguments are passed', () => {
    const err = new AppError();

    expect(err.message).toBe('Something went wrong');
    expect(err.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(err.explanation).toBe('An unexpected internal error occurred');
    expect(err.name).toBe('AppError');
    expect(err.stack).toBeDefined();
  });

  it('should initialize with customized message, statusCode, and explanation', () => {
    const err = new AppError('Forbidden action', StatusCodes.FORBIDDEN, 'Insufficient permissions');

    expect(err.message).toBe('Forbidden action');
    expect(err.statusCode).toBe(StatusCodes.FORBIDDEN);
    expect(err.explanation).toBe('Insufficient permissions');
  });
});
