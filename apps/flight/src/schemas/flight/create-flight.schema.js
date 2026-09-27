const { z } = require('zod');
const { FLIGHT_STATUS } = require('../../utils/common/enums');

const flightStatusValues = [
  FLIGHT_STATUS.SCHEDULED,
  FLIGHT_STATUS.ON_TIME,
  FLIGHT_STATUS.DELAYED,
  FLIGHT_STATUS.CANCELLED,
  FLIGHT_STATUS.COMPLETED,
];

const createFlightSchema = z
  .object({
    body: z
      .object({
        flightNumber: z
          .string({ required_error: 'Flight number is required' })
          .trim()
          .min(3, 'Flight number must be at least 3 characters')
          .max(10, 'Flight number cannot exceed 10 characters')
          .regex(/^[A-Za-z0-9]{2}-?[0-9]{1,4}$/, 'Flight number must match IATA standard (e.g. AI-202, 6E-501)')
          .transform((val) => val.toUpperCase()),
        airplaneId: z.coerce
          .number({ required_error: 'airplaneId is required' })
          .int()
          .positive('airplaneId must be a positive integer'),
        departureAirportCode: z
          .string({ required_error: 'departureAirportCode is required' })
          .trim()
          .length(3, 'Airport code must be exactly 3 letters')
          .regex(/^[A-Za-z]{3}$/, 'Airport code must be 3 letters')
          .transform((val) => val.toUpperCase()),
        arrivalAirportCode: z
          .string({ required_error: 'arrivalAirportCode is required' })
          .trim()
          .length(3, 'Airport code must be exactly 3 letters')
          .regex(/^[A-Za-z]{3}$/, 'Airport code must be 3 letters')
          .transform((val) => val.toUpperCase()),
        departureTime: z
          .string({ required_error: 'departureTime is required' })
          .refine((val) => !isNaN(Date.parse(val)), {
            message: 'departureTime must be a valid ISO date/time string',
          }),
        arrivalTime: z.string({ required_error: 'arrivalTime is required' }).refine((val) => !isNaN(Date.parse(val)), {
          message: 'arrivalTime must be a valid ISO date/time string',
        }),
        price: z.coerce
          .number({ required_error: 'price is required' })
          .int('price must be an integer')
          .min(100, 'Price must be at least 100'),
        boardingGate: z.string().trim().max(20).optional().nullable(),
        totalSeats: z.coerce.number().int().positive().optional(),
        remainingSeats: z.coerce.number().int().min(0).optional(),
        status: z.enum(flightStatusValues).optional().default(FLIGHT_STATUS.SCHEDULED),
      })
      .strict('Unknown fields are not allowed in flight create payload'),
  })
  .refine((data) => data.body.departureAirportCode !== data.body.arrivalAirportCode, {
    message: 'departureAirportCode and arrivalAirportCode cannot be the same',
    path: ['body', 'arrivalAirportCode'],
  })
  .refine((data) => new Date(data.body.arrivalTime).getTime() > new Date(data.body.departureTime).getTime(), {
    message: 'arrivalTime must be strictly later than departureTime',
    path: ['body', 'arrivalTime'],
  });

module.exports = {
  flightStatusValues,
  createFlightSchema,
};
