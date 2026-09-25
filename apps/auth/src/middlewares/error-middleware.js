const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { errorResponse } = require('../utils/common/response');
const { MESSAGES } = require('../constants');

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof AppError) {
        return res
            .status(err.statusCode)
            .json(errorResponse(err.message, {
                statusCode: err.statusCode,
                explanation: err.explanation
            }));
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        const explanation = err.errors ? err.errors.map(e => e.message) : [MESSAGES.AUTH.USER_ALREADY_EXISTS];
        return res
            .status(StatusCodes.CONFLICT)
            .json(errorResponse(MESSAGES.AUTH.USER_ALREADY_EXISTS, {
                statusCode: StatusCodes.CONFLICT,
                explanation
            }));
    }

    if (err.name === 'SequelizeValidationError') {
        const explanation = err.errors ? err.errors.map(e => e.message) : ['Database validation failed'];
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(errorResponse(MESSAGES.VALIDATION.VALIDATION_ERROR, {
                statusCode: StatusCodes.BAD_REQUEST,
                explanation
            }));
    }

    if (err.name === 'JsonWebTokenError') {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(errorResponse(MESSAGES.AUTH.TOKEN_INVALID, {
                statusCode: StatusCodes.UNAUTHORIZED,
                explanation: err.message
            }));
    }

    if (err.name === 'TokenExpiredError') {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(errorResponse(MESSAGES.AUTH.TOKEN_EXPIRED, {
                statusCode: StatusCodes.UNAUTHORIZED,
                explanation: 'Token has expired'
            }));
    }
    
    console.error('Unhandled Server Error:', err);

    return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse(MESSAGES.SYSTEM.INTERNAL_SERVER_ERROR, {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            explanation: process.env.NODE_ENV === 'production' ? MESSAGES.SYSTEM.INTERNAL_SERVER_ERROR : (err.message || String(err))
        }));
}

module.exports = errorHandler;
