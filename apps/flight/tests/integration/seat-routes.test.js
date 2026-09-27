const request = require('supertest');
const { StatusCodes } = require('http-status-codes');
const app = require('../../src/app');
const { SeatService } = require('../../src/services');

describe('Seat Routes Integration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/v1/seats', () => {
    it('should return 400 if airplaneId query param is missing', async () => {
      const res = await request(app).get('/api/v1/seats');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.error.explanation[0]).toContain('query.airplaneId');
    });

    it('should return 200 with list of seats for airplane', async () => {
      jest
        .spyOn(SeatService, 'getSeatsByAirplane')
        .mockResolvedValue([{ id: 1, airplaneId: 1, row: 1, col: 'A', type: 'ECONOMY' }]);

      const res = await request(app).get('/api/v1/seats?airplaneId=1');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/seats', () => {
    it('should return 403 if called by non-admin', async () => {
      const res = await request(app).post('/api/v1/seats').send({ airplaneId: 1, row: 1, col: 'A' });

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return 400 if column is not between A and K', async () => {
      const res = await request(app)
        .post('/api/v1/seats')
        .set('x-user-role', 'ADMIN')
        .send({ airplaneId: 1, row: 1, col: 'Z' });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.error.explanation[0]).toContain('body.col');
    });

    it('should return 201 when admin creates seat', async () => {
      jest.spyOn(SeatService, 'createSeat').mockResolvedValue({
        id: 1,
        airplaneId: 1,
        row: 1,
        col: 'A',
        type: 'BUSINESS',
      });

      const res = await request(app)
        .post('/api/v1/seats')
        .set('x-user-role', 'ADMIN')
        .send({ airplaneId: 1, row: 1, col: 'a', type: 'BUSINESS' });

      expect(res.status).toBe(StatusCodes.CREATED);
      expect(res.body.success).toBe(true);
      expect(res.body.data.col).toBe('A');
    });

    it('should return 400 when airplane capacity is exceeded', async () => {
      const { AppError } = require('../../src/utils/errors');
      jest
        .spyOn(SeatService, 'createSeat')
        .mockRejectedValue(
          new AppError(
            'Total seats exceed airplane capacity',
            StatusCodes.BAD_REQUEST,
            'Cannot add seat. Aircraft capacity of 180 seats has already been reached',
          ),
        );

      const res = await request(app)
        .post('/api/v1/seats')
        .set('x-user-role', 'ADMIN')
        .send({ airplaneId: 1, row: 1, col: 'A', type: 'ECONOMY' });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Total seats exceed airplane capacity');
    });
  });

  describe('GET /api/v1/seats/airplanes/:airplaneId', () => {
    it('should return 400 if airplaneId in URL parameter is non-numeric', async () => {
      const res = await request(app).get('/api/v1/seats/airplanes/abc');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.error.explanation[0]).toContain('params.airplaneId');
    });

    it('should return 400 if airplaneId in URL parameter is less than 1', async () => {
      const res = await request(app).get('/api/v1/seats/airplanes/0');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.error.explanation[0]).toContain('airplaneId must be a positive integer');
    });

    it('should return 200 with airplane seats', async () => {
      jest
        .spyOn(SeatService, 'getSeatsByAirplane')
        .mockResolvedValue([{ id: 1, airplaneId: 1, row: 1, col: 'A', type: 'BUSINESS' }]);

      const res = await request(app).get('/api/v1/seats/airplanes/1');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/seats/airplanes/:airplaneId/batch', () => {
    it('should return 403 if called by non-admin', async () => {
      const res = await request(app)
        .post('/api/v1/seats/airplanes/1/batch')
        .send({ seats: [{ row: 1, col: 'A', type: 'ECONOMY' }] });

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return 201 when admin batch-creates seats', async () => {
      jest
        .spyOn(SeatService, 'generateAirplaneSeats')
        .mockResolvedValue([{ id: 1, airplaneId: 1, row: 1, col: 'A', type: 'economy' }]);

      const res = await request(app)
        .post('/api/v1/seats/airplanes/1/batch')
        .set('x-user-role', 'ADMIN')
        .send({ seats: [{ row: 1, col: 'a', type: 'economy' }] });

      expect(res.status).toBe(StatusCodes.CREATED);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 400 when batch payload exceeds airplane capacity', async () => {
      const { AppError } = require('../../src/utils/errors');
      jest
        .spyOn(SeatService, 'generateAirplaneSeats')
        .mockRejectedValue(
          new AppError(
            'Total seats exceed airplane capacity',
            StatusCodes.BAD_REQUEST,
            'Cannot generate 10 seats. Aircraft capacity is 180, currently has 175 seats (5 remaining slots)',
          ),
        );

      const res = await request(app)
        .post('/api/v1/seats/airplanes/1/batch')
        .set('x-user-role', 'ADMIN')
        .send({ seats: [{ row: 1, col: 'a', type: 'economy' }] });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Total seats exceed airplane capacity');
    });
  });
});
