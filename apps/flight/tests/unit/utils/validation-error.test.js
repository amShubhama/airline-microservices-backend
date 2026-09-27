const { StatusCodes } = require('http-status-codes');
const ValidationError = require('../../../src/utils/errors/validation-error');
const AppError = require('../../../src/utils/errors/app-error');

describe('ValidationError Class', () => {
  it('should inherit from AppError with 400 Bad Request', () => {
    const error = new ValidationError('Bad payload');
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(error.explanation).toEqual(['Bad payload']);
  });

  it('should parse Zod error issues into formatted field explanations', () => {
    const mockZodError = {
      issues: [
        { path: ['body', 'flightNumber'], message: 'flightNumber is required' },
        { path: ['body', 'price'], message: 'price must be positive' },
      ],
    };

    const error = new ValidationError(mockZodError);
    expect(error.explanation).toEqual([
      'body.flightNumber: flightNumber is required',
      'body.price: price must be positive',
    ]);
  });

  it('should parse Sequelize validation errors', () => {
    const mockSequelizeError = {
      errors: [{ message: 'modelNumber cannot be null' }, { message: 'capacity must be greater than 0' }],
    };

    const error = new ValidationError(mockSequelizeError);
    expect(error.explanation).toEqual(['modelNumber cannot be null', 'capacity must be greater than 0']);
  });
});
