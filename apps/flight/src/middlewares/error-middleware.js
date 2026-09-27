const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../utils/errors');
const { errorResponse } = require('../utils/common/response');
const { MESSAGES } = require('../constants');

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      errorResponse(err.message, {
        statusCode: err.statusCode,
        explanation: err.explanation,
      }),
    );
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const explanation = err.errors
      ? err.errors.map((e) => e.message)
      : ['Record with this unique value already exists'];
    return res.status(StatusCodes.CONFLICT).json(
      errorResponse('Resource conflict', {
        statusCode: StatusCodes.CONFLICT,
        explanation,
      }),
    );
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const isRestrictedParent =
      err.parent &&
      (err.parent.code === 'ER_ROW_IS_REFERENCED' ||
        err.parent.code === 'ER_ROW_IS_REFERENCED_2' ||
        (err.parent.message && err.parent.message.includes('parent row')));

    const message = isRestrictedParent
      ? 'Cannot delete or modify record due to foreign key restriction'
      : 'Invalid relational reference';

    const explanation = isRestrictedParent
      ? ['Record cannot be deleted because dependent records still reference it']
      : ['Referenced record does not exist in the associated table'];

    return res.status(StatusCodes.BAD_REQUEST).json(
      errorResponse(message, {
        statusCode: StatusCodes.BAD_REQUEST,
        explanation,
      }),
    );
  }

  if (err.name === 'SequelizeValidationError') {
    const explanation = err.errors ? err.errors.map((e) => e.message) : ['Database validation failed'];
    return res.status(StatusCodes.BAD_REQUEST).json(
      errorResponse(MESSAGES.VALIDATION.VALIDATION_ERROR, {
        statusCode: StatusCodes.BAD_REQUEST,
        explanation,
      }),
    );
  }

  console.error('Unhandled Flight Service Error:', err);

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
    errorResponse(MESSAGES.SYSTEM.INTERNAL_SERVER_ERROR, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      explanation:
        process.env.NODE_ENV === 'production' ? MESSAGES.SYSTEM.INTERNAL_SERVER_ERROR : err.message || String(err),
    }),
  );
}

module.exports = errorHandler;
