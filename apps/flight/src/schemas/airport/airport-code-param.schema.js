const { z } = require('zod');

const airportCodeParamSchema = z.object({
  params: z.object({
    code: z
      .string()
      .trim()
      .length(3)
      .regex(/^[A-Za-z]{3}$/, 'Airport code must be 3 letters')
      .transform((val) => val.toUpperCase()),
  }),
});

module.exports = airportCodeParamSchema;
