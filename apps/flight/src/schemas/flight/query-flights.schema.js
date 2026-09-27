const { z } = require('zod');
const { flightStatusValues } = require('./create-flight.schema');

const queryFlightsSchema = z
  .object({
    query: z.object({
      trips: z
        .string()
        .regex(/^[A-Za-z]{3}-[A-Za-z]{3}$/, 'Trips must be in origin-destination format (e.g. DEL-BOM)')
        .optional(),
      departureAirportCode: z
        .string()
        .length(3, 'departureAirportCode must be 3 letters')
        .regex(/^[A-Za-z]{3}$/, 'departureAirportCode must be 3 letters')
        .transform((val) => val.toUpperCase())
        .optional(),
      arrivalAirportCode: z
        .string()
        .length(3, 'arrivalAirportCode must be 3 letters')
        .regex(/^[A-Za-z]{3}$/, 'arrivalAirportCode must be 3 letters')
        .transform((val) => val.toUpperCase())
        .optional(),
      price: z
        .string()
        .regex(/^[0-9]+-[0-9]+$/, 'Price range must be min-max (e.g. 2000-8000)')
        .optional(),
      minPrice: z.coerce.number().min(0, 'minPrice must be non-negative').optional(),
      maxPrice: z.coerce.number().positive('maxPrice must be positive').optional(),
      travellers: z.coerce
        .number()
        .int('travellers must be an integer')
        .min(1, 'travellers must be at least 1')
        .max(9, 'Cannot search for more than 9 travellers')
        .optional(),
      tripDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'tripDate must be in YYYY-MM-DD format')
        .optional(),
      status: z
        .preprocess((val) => (typeof val === 'string' ? val.toUpperCase() : val), z.enum(flightStatusValues))
        .optional(),
      sort: z.string().trim().optional(),
      limit: z.coerce
        .number()
        .int('limit must be an integer')
        .min(1, 'limit must be at least 1')
        .max(100, 'limit cannot exceed 100')
        .default(20),
      offset: z.coerce.number().int('offset must be an integer').min(0, 'offset must be at least 0').default(0),
    }),
  })
  .refine(
    (data) => {
      if (data.query && data.query.trips && data.query.trips.includes('-')) {
        const [dep, arr] = data.query.trips.split('-');
        if (dep && arr) {
          return dep.toUpperCase() !== arr.toUpperCase();
        }
      }
      return true;
    },
    {
      message: 'Origin and destination airports in trips cannot be identical',
      path: ['query', 'trips'],
    },
  )
  .refine(
    (data) => {
      if (data.query && data.query.departureAirportCode && data.query.arrivalAirportCode) {
        return data.query.departureAirportCode !== data.query.arrivalAirportCode;
      }
      return true;
    },
    {
      message: 'departureAirportCode and arrivalAirportCode cannot be identical',
      path: ['query', 'arrivalAirportCode'],
    },
  )
  .refine(
    (data) => {
      if (data.query && data.query.minPrice !== undefined && data.query.maxPrice !== undefined) {
        return data.query.minPrice <= data.query.maxPrice;
      }
      return true;
    },
    {
      message: 'minPrice cannot be greater than maxPrice',
      path: ['query', 'minPrice'],
    },
  );

module.exports = queryFlightsSchema;
