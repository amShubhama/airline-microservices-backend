const { z } = require('zod');

const querySeatsSchema = z.object({
  query: z.object({
    airplaneId: z.coerce
      .number({ required_error: 'airplaneId query parameter is required' })
      .int()
      .positive('airplaneId must be a positive integer'),
  }),
});

module.exports = querySeatsSchema;
