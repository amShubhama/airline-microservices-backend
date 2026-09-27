const validateRequest = require('./validate-request');
const { paginationQuerySchema } = require('../../schemas/common');

/**
 * General reusable validator for pagination & sorting query parameters (limit, offset, sort)
 */
const validatePaginationQuery = validateRequest(paginationQuerySchema);

module.exports = {
  validatePaginationQuery,
};
