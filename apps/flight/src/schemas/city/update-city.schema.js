const { z } = require('zod');

const updateCitySchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('City ID must be a positive integer'),
  }),
  body: z
    .object({
      name: z
        .string({ required_error: 'City name is required' })
        .trim()
        .min(2, 'City name must be at least 2 characters')
        .max(100, 'City name cannot exceed 100 characters')
        .regex(/^[a-zA-Z\s-]+$/, 'City name can only contain letters, spaces, and hyphens'),
    })
    .strict('Unknown fields are not allowed in city update payload'),
});

module.exports = updateCitySchema;
