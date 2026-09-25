const ValidationError = require('../../../src/utils/errors/validation-error');
const { StatusCodes } = require('http-status-codes');

describe('ValidationError utility', () => {
  it('should handle Sequelize validation error array', () => {
    const err = new ValidationError({
      errors: [{ message: 'Email must be unique' }, { message: 'Invalid format' }],
    });

    expect(err.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(err.explanation).toEqual(['Email must be unique', 'Invalid format']);
  });

  it('should handle raw array of strings', () => {
    const err = new ValidationError(['First error', 'Second error']);
    expect(err.explanation).toEqual(['First error', 'Second error']);
  });

  it('should handle a single string error', () => {
    const err = new ValidationError('Simple error message');
    expect(err.explanation).toEqual(['Simple error message']);
  });

  it('should fallback to default explanation for null or unknown object', () => {
    const err = new ValidationError(null);
    expect(err.explanation).toEqual(['Invalid request payload']);
  });
});
