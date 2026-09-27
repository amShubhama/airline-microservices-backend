const { z } = require('zod');
const { SEAT_TYPE } = require('../../utils/common/enums');

const seatTypeValues = [SEAT_TYPE.BUSINESS, SEAT_TYPE.ECONOMY, SEAT_TYPE.PREMIUM_ECONOMY, SEAT_TYPE.FIRST_CLASS];

const createSeatSchema = z.object({
  body: z
    .object({
      airplaneId: z.coerce
        .number({ required_error: 'airplaneId is required' })
        .int()
        .positive('airplaneId must be a positive integer'),
      row: z.coerce
        .number({ required_error: 'Row number is required' })
        .int()
        .min(1, 'Row must be at least 1')
        .max(100, 'Row cannot exceed 100'),
      col: z
        .string({ required_error: 'Column letter is required' })
        .trim()
        .length(1, 'Column must be a single letter')
        .regex(/^[A-Ka-k]$/, 'Seat column must be a letter between A and K')
        .transform((val) => val.toUpperCase()),
      type: z
        .preprocess((val) => (typeof val === 'string' ? val.toLowerCase() : val), z.enum(seatTypeValues))
        .optional()
        .default(SEAT_TYPE.ECONOMY),
    })
    .strict('Unknown fields are not allowed in seat create payload'),
});

module.exports = {
  seatTypeValues,
  createSeatSchema,
};
