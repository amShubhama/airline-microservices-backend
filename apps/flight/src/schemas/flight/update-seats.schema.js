const { z } = require('zod');

const updateFlightSeatsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Flight ID must be a positive integer'),
  }),
  body: z
    .object({
      seats: z.coerce
        .number({ required_error: 'Seat quantity is required' })
        .int('Seat quantity must be an integer')
        .positive('Seat quantity must be at least 1')
        .max(9, 'Cannot reserve more than 9 seats in a single transaction'),
      dec: z
        .union([z.boolean(), z.string(), z.number()])
        .optional()
        .default(true)
        .transform((val) => val === true || val === 'true' || val === 1 || val === '1'),
    })
    .strict('Unknown fields are not allowed in seat update payload'),
});

module.exports = updateFlightSeatsSchema;
