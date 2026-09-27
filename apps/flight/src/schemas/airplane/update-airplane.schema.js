const { z } = require('zod');

const updateAirplaneSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Airplane ID must be a positive integer'),
  }),
  body: z
    .object({
      modelNumber: z
        .string()
        .trim()
        .min(2, 'Model number must be at least 2 characters')
        .max(50, 'Model number cannot exceed 50 characters')
        .optional(),
      capacity: z.coerce
        .number()
        .int('Capacity must be an integer')
        .min(1, 'Capacity must be at least 1')
        .max(1000, 'Capacity cannot exceed 1000 seats')
        .optional(),
    })
    .strict('Unknown fields are not allowed in airplane update payload')
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

module.exports = updateAirplaneSchema;
