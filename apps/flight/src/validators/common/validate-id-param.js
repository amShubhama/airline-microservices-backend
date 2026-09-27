const validateRequest = require('./validate-request');
const { idParamSchema, createNamedIdParamSchema } = require('../../schemas/common');

/**
 * General reusable validator for route parameter :id (positive integer)
 */
const validateIdParam = validateRequest(idParamSchema);

/**
 * Factory to generate a reusable validator for any named ID route parameter (e.g. :airplaneId)
 */
function validateNamedIdParam(paramName) {
  return validateRequest(createNamedIdParamSchema(paramName));
}

module.exports = {
  validateIdParam,
  validateNamedIdParam,
};
