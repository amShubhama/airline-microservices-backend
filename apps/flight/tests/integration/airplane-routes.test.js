const request = require('supertest');
const { StatusCodes } = require('http-status-codes');
const app = require('../../src/app');
const { AirplaneService } = require('../../src/services');

describe('Airplane Routes Integration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/v1/airplanes', () => {
    it('should return 200 with list of airplanes', async () => {
      jest
        .spyOn(AirplaneService, 'getAirplanes')
        .mockResolvedValue([{ id: 1, modelNumber: 'Airbus A320neo', capacity: 180 }]);

      const res = await request(app).get('/api/v1/airplanes');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/airplanes', () => {
    it('should return 403 if called by non-admin', async () => {
      const res = await request(app).post('/api/v1/airplanes').send({ modelNumber: 'Boeing 737', capacity: 189 });

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return 400 if capacity is less than 1 or exceeds 1000', async () => {
      const res = await request(app)
        .post('/api/v1/airplanes')
        .set('x-user-role', 'ADMIN')
        .send({ modelNumber: 'Boeing 737', capacity: 0 });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.error.explanation[0]).toContain('body.capacity');
    });

    it('should return 201 when admin creates valid airplane', async () => {
      jest.spyOn(AirplaneService, 'createAirplane').mockResolvedValue({
        id: 1,
        modelNumber: 'Boeing 737 MAX 8',
        capacity: 189,
      });

      const res = await request(app)
        .post('/api/v1/airplanes')
        .set('x-user-role', 'ADMIN')
        .send({ modelNumber: 'Boeing 737 MAX 8', capacity: 189 });

      expect(res.status).toBe(StatusCodes.CREATED);
      expect(res.body.success).toBe(true);
      expect(res.body.data.capacity).toBe(189);
    });
  });

  describe('GET /api/v1/airplanes/:id', () => {
    it('should return 200 with airplane detail', async () => {
      jest.spyOn(AirplaneService, 'getAirplane').mockResolvedValue({
        id: 1,
        modelNumber: 'Boeing 777',
        capacity: 350,
      });

      const res = await request(app).get('/api/v1/airplanes/1');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
    });
  });

  describe('PATCH /api/v1/airplanes/:id', () => {
    it('should return 403 if called by non-admin', async () => {
      const res = await request(app).patch('/api/v1/airplanes/1').send({ capacity: 200 });

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return 200 when admin updates airplane', async () => {
      jest.spyOn(AirplaneService, 'updateAirplane').mockResolvedValue({
        id: 1,
        capacity: 200,
      });

      const res = await request(app).patch('/api/v1/airplanes/1').set('x-user-role', 'ADMIN').send({ capacity: 200 });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.capacity).toBe(200);
    });

    it('should return 400 when capacity is below configured seat count', async () => {
      const { AppError } = require('../../src/utils/errors');
      jest
        .spyOn(AirplaneService, 'updateAirplane')
        .mockRejectedValue(
          new AppError(
            'Cannot reduce airplane capacity below configured seat count',
            StatusCodes.BAD_REQUEST,
            'Cannot reduce airplane capacity to 80 because 120 physical seats are already configured',
          ),
        );

      const res = await request(app).patch('/api/v1/airplanes/1').set('x-user-role', 'ADMIN').send({ capacity: 80 });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Cannot reduce airplane capacity below configured seat count');
    });

    it('should return 400 when capacity is below existing flight bookings', async () => {
      const { AppError } = require('../../src/utils/errors');
      jest
        .spyOn(AirplaneService, 'updateAirplane')
        .mockRejectedValue(
          new AppError(
            'Cannot reduce airplane capacity below existing flight bookings',
            StatusCodes.BAD_REQUEST,
            'Cannot reduce airplane capacity to 80 because 110 seats are already booked',
          ),
        );

      const res = await request(app).patch('/api/v1/airplanes/1').set('x-user-role', 'ADMIN').send({ capacity: 80 });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Cannot reduce airplane capacity below existing flight bookings');
    });
  });

  describe('DELETE /api/v1/airplanes/:id', () => {
    it('should return 403 if called by non-admin', async () => {
      const res = await request(app).delete('/api/v1/airplanes/1');

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return 200 when admin deletes airplane', async () => {
      jest.spyOn(AirplaneService, 'destroyAirplane').mockResolvedValue(true);

      const res = await request(app).delete('/api/v1/airplanes/1').set('x-user-role', 'ADMIN');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 when airplane has scheduled or existing flights', async () => {
      const { AppError } = require('../../src/utils/errors');
      jest
        .spyOn(AirplaneService, 'destroyAirplane')
        .mockRejectedValue(
          new AppError(
            'Cannot delete airplane with scheduled or existing flights',
            StatusCodes.BAD_REQUEST,
            "Airplane 'Boeing 777' cannot be deleted because it is assigned to existing flights",
          ),
        );

      const res = await request(app).delete('/api/v1/airplanes/1').set('x-user-role', 'ADMIN');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Cannot delete airplane with scheduled or existing flights');
    });
  });
});
