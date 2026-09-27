const { z } = require('zod');

/**
 * Standard pagination and sorting query schema
 */
const paginationQuerySchema = z.object({
  query: z.object({
    limit: z.coerce
      .number()
      .int('limit must be an integer')
      .min(1, 'limit must be at least 1')
      .max(100, 'limit cannot exceed 100')
      .default(20),
    offset: z.coerce.number().int('offset must be an integer').min(0, 'offset must be at least 0').default(0),
    sort: z.string().trim().optional(),
  }),
});

module.exports = {
  paginationQuerySchema,
};
