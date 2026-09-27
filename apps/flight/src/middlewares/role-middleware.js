const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../utils/errors');
const { MESSAGES } = require('../constants');

function requireAdmin(req, res, next) {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'ADMIN') {
    return next(new AppError(MESSAGES.AUTH.FORBIDDEN_ADMIN, StatusCodes.FORBIDDEN, MESSAGES.AUTH.FORBIDDEN_ADMIN));
  }
  next();
}

module.exports = {
  requireAdmin,
};
