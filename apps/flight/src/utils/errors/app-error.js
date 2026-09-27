const { StatusCodes } = require('http-status-codes');

class AppError extends Error {
  constructor(
    message = 'Something went wrong',
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
    explanation = 'An unexpected internal error occurred',
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.explanation = explanation;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
