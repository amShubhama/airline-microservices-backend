const validateRequest = require('./validate-request');
const { validateIdParam, validateNamedIdParam } = require('./validate-id-param');
const { validatePaginationQuery } = require('./validate-pagination');

module.exports = {
  validateRequest,
  validateIdParam,
  validateNamedIdParam,
  validatePaginationQuery,
};
