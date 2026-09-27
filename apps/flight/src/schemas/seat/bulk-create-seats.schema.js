const { z } = require('zod');
const { seatTypeValues } = require('./create-seat.schema');

const bulkCreateSeatsSchema = z.object({
  params: z.object({
    airplaneId: z.coerce
      .number({ required_error: 'airplaneId is required in URL parameter' })
      .int()
      .positive('airplaneId must be a positive integer'),
  }),
  body: z
    .object({
      seats: z
        .array(
          z
            .object({
              row: z.coerce.number().int().min(1).max(100),
              col: z
                .string()
                .trim()
                .length(1)
                .regex(/^[A-Ka-k]$/, 'Seat column must be a letter between A and K')
                .transform((val) => val.toUpperCase()),
              type: z
                .preprocess((val) => (typeof val === 'string' ? val.toLowerCase() : val), z.enum(seatTypeValues))
                .optional()
                .default(seatTypeValues[1]), // ECONOMY
            })
            .strict('Unknown fields are not allowed in seat item payload'),
        )
        .min(1, 'At least one seat must be provided'),
    })
    .strict('Unknown fields are not allowed in batch seats payload'),
});

module.exports = bulkCreateSeatsSchema;
