const { idParamSchema, createNamedIdParamSchema } = require('./id-param.schema');
const { paginationQuerySchema } = require('./pagination.schema');

module.exports = {
  idParamSchema,
  createNamedIdParamSchema,
  paginationQuerySchema,
};
