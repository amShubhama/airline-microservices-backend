const { z } = require('zod');

/**
 * Schema for standard positive integer route param :id
 */
const idParamSchema = z.object({
  params: z.object({
    id: z.coerce
      .number({ required_error: 'ID is required' })
      .int('ID must be an integer')
      .positive('ID must be a positive integer'),
  }),
});

/**
 * Factory to generate a route param schema for any named ID parameter
 * @param {string} paramName e.g. 'airplaneId', 'cityId'
 */
function createNamedIdParamSchema(paramName) {
  return z.object({
    params: z.object({
      [paramName]: z.coerce
        .number({ required_error: `${paramName} is required in URL parameter` })
        .int(`${paramName} must be an integer`)
        .positive(`${paramName} must be a positive integer`),
    }),
  });
}

module.exports = {
  idParamSchema,
  createNamedIdParamSchema,
};
