const { z } = require('zod');

const createAirportSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Airport name is required' })
        .trim()
        .min(3, 'Airport name must be at least 3 characters')
        .max(150, 'Airport name cannot exceed 150 characters'),
      code: z
        .string({ required_error: 'Airport IATA code is required' })
        .trim()
        .length(3, 'Airport code must be exactly 3 characters (e.g. DEL, BOM)')
        .regex(/^[A-Za-z]{3}$/, 'Airport code must contain only 3 alphabetic letters')
        .transform((val) => val.toUpperCase()),
      cityId: z.coerce
        .number({ required_error: 'cityId is required' })
        .int()
        .positive('cityId must be a positive integer'),
      address: z.string().trim().max(255).optional().nullable(),
    })
    .strict('Unknown fields are not allowed in airport create payload'),
});

module.exports = createAirportSchema;
