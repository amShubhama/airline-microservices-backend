const { z } = require('zod');

const createCitySchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'City name is required' })
        .trim()
        .min(2, 'City name must be at least 2 characters')
        .max(100, 'City name cannot exceed 100 characters')
        .regex(/^[a-zA-Z\s-]+$/, 'City name can only contain letters, spaces, and hyphens'),
    })
    .strict('Unknown fields are not allowed in city create payload'),
});

module.exports = createCitySchema;
