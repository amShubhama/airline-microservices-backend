const { StatusCodes } = require('http-status-codes');
const UserService = require('../services/user-service');
const { successResponse } = require('../utils/common/response');
const { extractToken } = require('../utils/helpers/token-helper');
const { MESSAGES } = require('../constants');

const userService = new UserService();

/**
 * @route POST /api/v1/signup
 */
const create = async (req, res, next) => {
  try {
    const response = await userService.create({
      email: req.body.email,
      password: req.body.password,
    });

    return res.status(StatusCodes.CREATED).json(successResponse(MESSAGES.AUTH.SIGNUP_SUCCESS, response));
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/v1/signin
 */
const signIn = async (req, res, next) => {
  try {
    const response = await userService.signIn(req.body.email, req.body.password);

    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.AUTH.SIGNIN_SUCCESS, response));
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/v1/verify
 */
const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.token || extractToken(req.headers['x-access-token'] || req.headers['authorization']);
    const response = await userService.isAuthenticated(token);

    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.AUTH.VERIFY_SUCCESS, response));
  } catch (error) {
    next(error);
  }
};

/**
 * Checks whether the authenticated user has the ADMIN role.
 * Uses only the token from headers to verify.
 * @route GET /api/v1/isAdmin
 */
const isAdmin = async (req, res, next) => {
  try {
    const token = req.token || extractToken(req.headers['x-access-token'] || req.headers['authorization']);
    const response = await userService.isAdmin(token);

    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.AUTH.ADMIN_STATUS_FETCHED, { isAdmin: response }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  signIn,
  isAuthenticated,
  isAdmin,
};
