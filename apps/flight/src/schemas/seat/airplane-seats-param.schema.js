const { z } = require('zod');

const airplaneSeatsParamSchema = z.object({
  params: z.object({
    airplaneId: z.coerce
      .number({ required_error: 'airplaneId is required in URL parameter' })
      .int('airplaneId must be an integer')
      .positive('airplaneId must be a positive integer'),
  }),
});

module.exports = airplaneSeatsParamSchema;
