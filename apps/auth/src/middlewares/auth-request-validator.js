const { StatusCodes } = require('http-status-codes');
const validateRequest = require('./validate-request');
const { signupSchema, signinSchema } = require('../schemas/user-schemas');
const AppError = require('../utils/errors/app-error');
const { extractToken } = require('../utils/helpers/token-helper');
const { MESSAGES } = require('../constants');

const validateSignup = validateRequest(signupSchema);
const validateSignin = validateRequest(signinSchema);

/**
 * Validates request for protected routes.
 * Ensures an authentication token is present in request headers and attaches `req.token`.
 */
const validateAuthToken = (req, res, next) => {
    const rawToken = (req.headers['authorization'] || req.headers['x-access-token'] || '').trim();
    const token = extractToken(rawToken);

    if (!token) {
        return next(
            new AppError(
                MESSAGES.AUTH.TOKEN_MISSING,
                StatusCodes.UNAUTHORIZED,
                MESSAGES.AUTH.TOKEN_MISSING
            )
        );
    }

    req.token = token;
    next();
};

module.exports = {
    validateSignup,
    validateSignin,
    validateAuthToken,
};