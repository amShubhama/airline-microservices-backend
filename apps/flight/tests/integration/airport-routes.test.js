const request = require('supertest');
const { StatusCodes } = require('http-status-codes');
const app = require('../../src/app');
const { AirportService } = require('../../src/services');

describe('Airport Routes Integration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/v1/airports', () => {
    it('should return 200 with list of airports', async () => {
      jest
        .spyOn(AirportService, 'getAirports')
        .mockResolvedValue([{ id: 1, name: 'Indira Gandhi International Airport', code: 'DEL' }]);

      const res = await request(app).get('/api/v1/airports');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/airports/code/:code', () => {
    it('should return 400 if IATA code is not 3 alphabetic letters', async () => {
      const res = await request(app).get('/api/v1/airports/code/12');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
    });

    it('should return 200 for valid code format', async () => {
      jest.spyOn(AirportService, 'getAirportByCode').mockResolvedValue({
        id: 1,
        name: 'Indira Gandhi International Airport',
        code: 'DEL',
      });

      const res = await request(app).get('/api/v1/airports/code/del');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('DEL');
    });
  });

  describe('POST /api/v1/airports', () => {
    it('should return 403 if called by non-admin', async () => {
      const res = await request(app)
        .post('/api/v1/airports')
        .send({ name: 'Chhatrapati Shivaji', code: 'BOM', cityId: 1 });

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return 400 if IATA code is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/airports')
        .set('x-user-role', 'ADMIN')
        .send({ name: 'Test Airport', code: 'TOOLONG', cityId: 1 });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.error.explanation[0]).toContain('body.code');
    });

    it('should return 201 when admin creates valid airport', async () => {
      jest.spyOn(AirportService, 'createAirport').mockResolvedValue({
        id: 1,
        name: 'Indira Gandhi International',
        code: 'DEL',
        cityId: 1,
      });

      const res = await request(app)
        .post('/api/v1/airports')
        .set('x-user-role', 'ADMIN')
        .send({ name: 'Indira Gandhi International', code: 'del', cityId: 1 });

      expect(res.status).toBe(StatusCodes.CREATED);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/airports/:id', () => {
    it('should return 200 with airport detail', async () => {
      jest.spyOn(AirportService, 'getAirport').mockResolvedValue({
        id: 1,
        name: 'Indira Gandhi International',
        code: 'DEL',
      });

      const res = await request(app).get('/api/v1/airports/1');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('DEL');
    });
  });

  describe('PATCH /api/v1/airports/:id', () => {
    it('should return 403 if called by non-admin', async () => {
      const res = await request(app).patch('/api/v1/airports/1').send({ name: 'Updated Airport' });

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return 200 when admin updates airport', async () => {
      jest.spyOn(AirportService, 'updateAirport').mockResolvedValue({
        id: 1,
        name: 'Updated Airport',
      });

      const res = await request(app)
        .patch('/api/v1/airports/1')
        .set('x-user-role', 'ADMIN')
        .send({ name: 'Updated Airport' });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Airport');
    });
  });

  describe('DELETE /api/v1/airports/:id', () => {
    it('should return 403 if called by non-admin', async () => {
      const res = await request(app).delete('/api/v1/airports/1');

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return 200 when admin deletes airport', async () => {
      jest.spyOn(AirportService, 'destroyAirport').mockResolvedValue(true);

      const res = await request(app).delete('/api/v1/airports/1').set('x-user-role', 'ADMIN');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 when airport has scheduled flights', async () => {
      const { AppError } = require('../../src/utils/errors');
      jest
        .spyOn(AirportService, 'destroyAirport')
        .mockRejectedValue(
          new AppError(
            'Cannot delete airport with scheduled flights',
            StatusCodes.BAD_REQUEST,
            "Airport 'DEL' cannot be deleted because it is referenced by existing or scheduled flights",
          ),
        );

      const res = await request(app).delete('/api/v1/airports/1').set('x-user-role', 'ADMIN');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Cannot delete airport with scheduled flights');
    });
  });
});
