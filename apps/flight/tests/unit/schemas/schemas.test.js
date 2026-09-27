const {
  CommonSchemas,
  AirplaneSchemas,
  AirportSchemas,
  CitySchemas,
  FlightSchemas,
  SeatSchemas,
} = require('../../../src/schemas');

describe('Domain Schemas Unit Tests', () => {
  describe('Airplane Schemas', () => {
    it('should validate valid createAirplane payload', () => {
      const result = AirplaneSchemas.createAirplaneSchema.safeParse({
        body: { modelNumber: 'Boeing 737', capacity: 180 },
      });
      expect(result.success).toBe(true);
    });

    it('should fail createAirplane when capacity is invalid', () => {
      const result = AirplaneSchemas.createAirplaneSchema.safeParse({
        body: { modelNumber: 'Boeing 737', capacity: 0 },
      });
      expect(result.success).toBe(false);
    });

    it('should fail updateAirplane when body is empty', () => {
      const result = AirplaneSchemas.updateAirplaneSchema.safeParse({
        params: { id: 1 },
        body: {},
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Airport Schemas', () => {
    it('should validate valid createAirport payload and uppercase code', () => {
      const result = AirportSchemas.createAirportSchema.safeParse({
        body: { name: 'Indira Gandhi', code: 'del', cityId: 1 },
      });
      expect(result.success).toBe(true);
      expect(result.data.body.code).toBe('DEL');
    });

    it('should fail createAirport when code is not 3 characters', () => {
      const result = AirportSchemas.createAirportSchema.safeParse({
        body: { name: 'Indira Gandhi', code: 'DE', cityId: 1 },
      });
      expect(result.success).toBe(false);
    });

    it('should validate airportCodeParamSchema and uppercase code', () => {
      const result = AirportSchemas.airportCodeParamSchema.safeParse({
        params: { code: 'bom' },
      });
      expect(result.success).toBe(true);
      expect(result.data.params.code).toBe('BOM');
    });
  });

  describe('City Schemas', () => {
    it('should validate valid createCity payload', () => {
      const result = CitySchemas.createCitySchema.safeParse({
        body: { name: 'Mumbai' },
      });
      expect(result.success).toBe(true);
    });

    it('should fail createCity with invalid characters', () => {
      const result = CitySchemas.createCitySchema.safeParse({
        body: { name: 'City123!' },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Flight Schemas', () => {
    const validFlightBody = {
      flightNumber: 'AI-202',
      airplaneId: 1,
      departureAirportCode: 'DEL',
      arrivalAirportCode: 'BOM',
      departureTime: new Date(Date.now() + 3600000).toISOString(),
      arrivalTime: new Date(Date.now() + 7200000).toISOString(),
      price: 5000,
    };

    it('should validate valid createFlight payload', () => {
      const result = FlightSchemas.createFlightSchema.safeParse({
        body: validFlightBody,
      });
      expect(result.success).toBe(true);
    });

    it('should fail createFlight when departure and arrival codes are the same', () => {
      const result = FlightSchemas.createFlightSchema.safeParse({
        body: { ...validFlightBody, arrivalAirportCode: 'DEL' },
      });
      expect(result.success).toBe(false);
    });

    it('should fail createFlight when arrivalTime is before departureTime', () => {
      const result = FlightSchemas.createFlightSchema.safeParse({
        body: {
          ...validFlightBody,
          departureTime: new Date(Date.now() + 7200000).toISOString(),
          arrivalTime: new Date(Date.now() + 3600000).toISOString(),
        },
      });
      expect(result.success).toBe(false);
    });

    it('should validate updateFlightSeatsSchema and coerce dec', () => {
      const result = FlightSchemas.updateFlightSeatsSchema.safeParse({
        params: { id: 1 },
        body: { seats: 2, dec: 'true' },
      });
      expect(result.success).toBe(true);
      expect(result.data.body.dec).toBe(true);
    });

    it('should fail updateFlightSeatsSchema when seats exceeds 9', () => {
      const result = FlightSchemas.updateFlightSeatsSchema.safeParse({
        params: { id: 1 },
        body: { seats: 10 },
      });
      expect(result.success).toBe(false);
    });

    it('should validate queryFlightsSchema and default limit & offset', () => {
      const result = FlightSchemas.queryFlightsSchema.safeParse({
        query: { trips: 'DEL-BOM' },
      });
      expect(result.success).toBe(true);
      expect(result.data.query.limit).toBe(20);
      expect(result.data.query.offset).toBe(0);
    });
  });

  describe('Seat Schemas', () => {
    it('should validate createSeat payload and format col to uppercase', () => {
      const result = SeatSchemas.createSeatSchema.safeParse({
        body: { airplaneId: 1, row: 12, col: 'a', type: 'BUSINESS' },
      });
      expect(result.success).toBe(true);
      expect(result.data.body.col).toBe('A');
    });

    it('should fail createSeat when column is out of range', () => {
      const result = SeatSchemas.createSeatSchema.safeParse({
        body: { airplaneId: 1, row: 12, col: 'Z' },
      });
      expect(result.success).toBe(false);
    });

    it('should validate bulkCreateSeatsSchema', () => {
      const result = SeatSchemas.bulkCreateSeatsSchema.safeParse({
        params: { airplaneId: 1 },
        body: {
          seats: [{ row: 1, col: 'b', type: 'ECONOMY' }],
        },
      });
      expect(result.success).toBe(true);
      expect(result.data.body.seats[0].col).toBe('B');
    });
  });

  describe('Common Schemas', () => {
    it('should validate idParamSchema for positive integers', () => {
      const result = CommonSchemas.idParamSchema.safeParse({
        params: { id: '15' },
      });
      expect(result.success).toBe(true);
      expect(result.data.params.id).toBe(15);
    });

    it('should fail idParamSchema for negative numbers', () => {
      const result = CommonSchemas.idParamSchema.safeParse({
        params: { id: '-5' },
      });
      expect(result.success).toBe(false);
    });
  });
});
