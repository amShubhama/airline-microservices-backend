const { StatusCodes } = require('http-status-codes');
const AppError = require('../../../src/utils/errors/app-error');

describe('AppError Class', () => {
  it('should initialize with default parameters', () => {
    const error = new AppError();

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AppError');
    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(error.explanation).toBe('An unexpected internal error occurred');
    expect(error.stack).toBeDefined();
  });

  it('should accept custom message, statusCode, and explanation', () => {
    const error = new AppError('Airplane not found', StatusCodes.NOT_FOUND, 'No airplane with id 99');

    expect(error.name).toBe('AppError');
    expect(error.message).toBe('Airplane not found');
    expect(error.statusCode).toBe(StatusCodes.NOT_FOUND);
    expect(error.explanation).toBe('No airplane with id 99');
  });
});
