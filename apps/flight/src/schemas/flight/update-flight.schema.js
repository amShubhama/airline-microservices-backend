const { z } = require('zod');
const { flightStatusValues } = require('./create-flight.schema');

const updateFlightSchema = z
  .object({
    params: z.object({
      id: z.coerce.number().int().positive('Flight ID must be a positive integer'),
    }),
    body: z
      .object({
        flightNumber: z
          .string()
          .trim()
          .min(3, 'Flight number must be at least 3 characters')
          .max(10, 'Flight number cannot exceed 10 characters')
          .regex(/^[A-Za-z0-9]{2}-?[0-9]{1,4}$/, 'Flight number must match IATA standard (e.g. AI-202, 6E-501)')
          .transform((val) => val.toUpperCase())
          .optional(),
        airplaneId: z.coerce.number().int().positive().optional(),
        departureAirportCode: z
          .string()
          .trim()
          .length(3, 'Airport code must be exactly 3 letters')
          .regex(/^[A-Za-z]{3}$/, 'Airport code must be 3 letters')
          .transform((val) => val.toUpperCase())
          .optional(),
        arrivalAirportCode: z
          .string()
          .trim()
          .length(3, 'Airport code must be exactly 3 letters')
          .regex(/^[A-Za-z]{3}$/, 'Airport code must be 3 letters')
          .transform((val) => val.toUpperCase())
          .optional(),
        departureTime: z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), {
            message: 'departureTime must be a valid date string',
          })
          .optional(),
        arrivalTime: z
          .string()
          .refine((val) => !isNaN(Date.parse(val)), {
            message: 'arrivalTime must be a valid date string',
          })
          .optional(),
        price: z.coerce.number().int().min(100, 'Price must be at least 100').optional(),
        boardingGate: z.string().trim().max(20).optional().nullable(),
        status: z.enum(flightStatusValues).optional(),
      })
      .strict('Unknown fields are not allowed in flight update payload')
      .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
      }),
  })
  .refine(
    (data) => {
      if (data.body.departureAirportCode && data.body.arrivalAirportCode) {
        return data.body.departureAirportCode !== data.body.arrivalAirportCode;
      }
      return true;
    },
    {
      message: 'departureAirportCode and arrivalAirportCode cannot be identical',
      path: ['body', 'arrivalAirportCode'],
    },
  )
  .refine(
    (data) => {
      if (data.body.departureTime && data.body.arrivalTime) {
        return new Date(data.body.arrivalTime).getTime() > new Date(data.body.departureTime).getTime();
      }
      return true;
    },
    {
      message: 'arrivalTime must be strictly later than departureTime',
      path: ['body', 'arrivalTime'],
    },
  );

module.exports = updateFlightSchema;
