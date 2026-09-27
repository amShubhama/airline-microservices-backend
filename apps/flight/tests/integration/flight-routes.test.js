const request = require('supertest');
const { StatusCodes } = require('http-status-codes');
const app = require('../../src/app');
const { FlightService } = require('../../src/services');

describe('Flight Routes Integration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/v1/flights', () => {
    it('should return 200 with list of flights', async () => {
      jest
        .spyOn(FlightService, 'getAllFlights')
        .mockResolvedValue([{ id: 1, flightNumber: 'AI-202', departureAirportCode: 'DEL', arrivalAirportCode: 'BOM' }]);

      const res = await request(app).get('/api/v1/flights?trips=DEL-BOM');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 400 for malformed trips query param', async () => {
      const res = await request(app).get('/api/v1/flights?trips=INVALID_FORMAT');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.error.explanation[0]).toContain('query.trips');
    });

    it('should return 400 if trips has identical departure and arrival codes', async () => {
      const res = await request(app).get('/api/v1/flights?trips=DEL-DEL');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.error.explanation[0]).toContain('query.trips');
    });

    it('should return 400 if minPrice exceeds maxPrice', async () => {
      const res = await request(app).get('/api/v1/flights?minPrice=8000&maxPrice=3000');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.error.explanation[0]).toContain('query.minPrice');
    });

    it('should return 400 if travellers exceeds 9', async () => {
      const res = await request(app).get('/api/v1/flights?travellers=15');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.error.explanation[0]).toContain('query.travellers');
    });

    it('should default limit to 20 and offset to 0 when omitted', async () => {
      const spy = jest.spyOn(FlightService, 'getAllFlights').mockResolvedValue([]);

      const res = await request(app).get('/api/v1/flights?trips=DEL-BOM');

      expect(res.status).toBe(StatusCodes.OK);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 20,
          offset: 0,
        }),
      );
    });

    it('should pass custom limit and offset to service', async () => {
      const spy = jest.spyOn(FlightService, 'getAllFlights').mockResolvedValue([]);

      const res = await request(app).get('/api/v1/flights?limit=50&offset=15');

      expect(res.status).toBe(StatusCodes.OK);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 50,
          offset: 15,
        }),
      );
    });

    it('should return 400 if limit is less than 1', async () => {
      const res = await request(app).get('/api/v1/flights?limit=0');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.error.explanation[0]).toContain('limit must be at least 1');
    });

    it('should return 400 if limit exceeds 100', async () => {
      const res = await request(app).get('/api/v1/flights?limit=101');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.error.explanation[0]).toContain('limit cannot exceed 100');
    });

    it('should return 400 if offset is negative', async () => {
      const res = await request(app).get('/api/v1/flights?offset=-5');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.error.explanation[0]).toContain('offset must be at least 0');
    });
  });

  describe('POST /api/v1/flights', () => {
    const validPayload = {
      flightNumber: 'AI-202',
      airplaneId: 1,
      departureAirportCode: 'DEL',
      arrivalAirportCode: 'BOM',
      departureTime: '2026-10-15T06:00:00.000Z',
      arrivalTime: '2026-10-15T08:15:00.000Z',
      price: 4500,
    };

    it('should return 403 if called by non-admin', async () => {
      const res = await request(app).post('/api/v1/flights').send(validPayload);

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return 400 if departure and arrival airports are identical', async () => {
      const res = await request(app)
        .post('/api/v1/flights')
        .set('x-user-role', 'ADMIN')
        .send({
          ...validPayload,
          arrivalAirportCode: 'DEL',
        });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.error.explanation[0]).toContain('body.arrivalAirportCode');
    });

    it('should return 400 if arrivalTime is earlier than departureTime', async () => {
      const res = await request(app)
        .post('/api/v1/flights')
        .set('x-user-role', 'ADMIN')
        .send({
          ...validPayload,
          arrivalTime: '2026-10-15T05:00:00.000Z',
        });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.error.explanation[0]).toContain('body.arrivalTime');
    });

    it('should return 201 when admin creates flight with valid parameters', async () => {
      jest.spyOn(FlightService, 'createFlight').mockResolvedValue({
        id: 1,
        ...validPayload,
        totalSeats: 180,
        remainingSeats: 180,
      });

      const res = await request(app).post('/api/v1/flights').set('x-user-role', 'ADMIN').send(validPayload);

      expect(res.status).toBe(StatusCodes.CREATED);
      expect(res.body.success).toBe(true);
      expect(res.body.data.flightNumber).toBe('AI-202');
    });

    it('should return 400 when aircraft has an overlapping flight schedule', async () => {
      const { AppError } = require('../../src/utils/errors');
      jest
        .spyOn(FlightService, 'createFlight')
        .mockRejectedValue(
          new AppError(
            'Airplane is already scheduled on another flight during this timeframe',
            StatusCodes.BAD_REQUEST,
            "Airplane with id 1 is already scheduled on flight 'AI-101' during this timeframe",
          ),
        );

      const res = await request(app).post('/api/v1/flights').set('x-user-role', 'ADMIN').send(validPayload);

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Airplane is already scheduled on another flight during this timeframe');
    });
  });

  describe('PATCH /api/v1/flights/:id/seats', () => {
    it('should return 400 if seats exceeds max batch of 9', async () => {
      const res = await request(app).patch('/api/v1/flights/1/seats').send({ seats: 10, dec: true });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.error.explanation[0]).toContain('body.seats');
    });

    it('should return 200 when updating seats successfully', async () => {
      jest.spyOn(FlightService, 'updateSeats').mockResolvedValue({
        id: 1,
        remainingSeats: 178,
      });

      const res = await request(app).patch('/api/v1/flights/1/seats').send({ seats: 2, dec: true });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.remainingSeats).toBe(178);
    });
  });

  describe('GET /api/v1/flights/:id', () => {
    it('should return 200 with flight detail', async () => {
      jest.spyOn(FlightService, 'getFlight').mockResolvedValue({
        id: 1,
        flightNumber: 'AI-202',
        departureAirportCode: 'DEL',
        arrivalAirportCode: 'BOM',
      });

      const res = await request(app).get('/api/v1/flights/1');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.flightNumber).toBe('AI-202');
    });
  });

  describe('PATCH /api/v1/flights/:id', () => {
    it('should return 403 if called by non-admin', async () => {
      const res = await request(app).patch('/api/v1/flights/1').send({ price: 5000 });

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return 200 when admin updates flight', async () => {
      jest.spyOn(FlightService, 'updateFlight').mockResolvedValue({
        id: 1,
        price: 5000,
      });

      const res = await request(app).patch('/api/v1/flights/1').set('x-user-role', 'ADMIN').send({ price: 5000 });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(5000);
    });
  });

  describe('DELETE /api/v1/flights/:id', () => {
    it('should return 403 if called by non-admin', async () => {
      const res = await request(app).delete('/api/v1/flights/1');

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return 200 when admin deletes flight', async () => {
      jest.spyOn(FlightService, 'destroyFlight').mockResolvedValue(true);

      const res = await request(app).delete('/api/v1/flights/1').set('x-user-role', 'ADMIN');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
    });
  });
});
