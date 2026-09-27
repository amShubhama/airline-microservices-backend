const { z } = require('zod');

const updateAirportSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Airport ID must be a positive integer'),
  }),
  body: z
    .object({
      name: z.string().trim().min(3, 'Airport name must be at least 3 characters').max(150).optional(),
      code: z
        .string()
        .trim()
        .length(3, 'Airport code must be exactly 3 characters')
        .regex(/^[A-Za-z]{3}$/, 'Airport code must be 3 alphabetic letters')
        .transform((val) => val.toUpperCase())
        .optional(),
      cityId: z.coerce.number().int().positive('cityId must be a positive integer').optional(),
      address: z.string().trim().max(255).optional().nullable(),
    })
    .strict('Unknown fields are not allowed in airport update payload')
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

module.exports = updateAirportSchema;
