const { z } = require('zod');

const createAirplaneSchema = z.object({
  body: z
    .object({
      modelNumber: z
        .string({ required_error: 'Model number is required' })
        .trim()
        .min(2, 'Model number must be at least 2 characters')
        .max(50, 'Model number cannot exceed 50 characters'),
      capacity: z.coerce
        .number({ required_error: 'Capacity is required' })
        .int('Capacity must be an integer')
        .min(1, 'Capacity must be at least 1')
        .max(1000, 'Capacity cannot exceed 1000 seats'),
    })
    .strict('Unknown fields are not allowed in airplane create payload'),
});

module.exports = createAirplaneSchema;
