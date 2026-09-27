const request = require('supertest');
const { StatusCodes } = require('http-status-codes');
const app = require('../../src/app');
const { CityService } = require('../../src/services');

describe('City Routes Integration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/v1/cities', () => {
    it('should return 200 with list of cities', async () => {
      jest.spyOn(CityService, 'getCities').mockResolvedValue([
        { id: 1, name: 'Mumbai' },
        { id: 2, name: 'Delhi' },
      ]);

      const res = await request(app).get('/api/v1/cities');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('POST /api/v1/cities', () => {
    it('should return 403 if x-user-role is not ADMIN', async () => {
      const res = await request(app).post('/api/v1/cities').set('x-user-role', 'CUSTOMER').send({ name: 'Pune' });

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if name is missing or too short', async () => {
      const res = await request(app).post('/api/v1/cities').set('x-user-role', 'ADMIN').send({ name: 'A' });

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.error.explanation[0]).toContain('body.name');
    });

    it('should return 201 when admin creates valid city', async () => {
      jest.spyOn(CityService, 'createCity').mockResolvedValue({ id: 12, name: 'Pune' });

      const res = await request(app).post('/api/v1/cities').set('x-user-role', 'ADMIN').send({ name: 'Pune' });

      expect(res.status).toBe(StatusCodes.CREATED);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({ id: 12, name: 'Pune' });
    });
  });

  describe('DELETE /api/v1/cities/:id', () => {
    it('should return 403 if called by non-admin', async () => {
      const res = await request(app).delete('/api/v1/cities/1');

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if ID is invalid', async () => {
      const res = await request(app).delete('/api/v1/cities/abc').set('x-user-role', 'ADMIN');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
    });

    it('should return 200 when admin deletes city', async () => {
      jest.spyOn(CityService, 'destroyCity').mockResolvedValue(true);

      const res = await request(app).delete('/api/v1/cities/1').set('x-user-role', 'ADMIN');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 when city has registered airports', async () => {
      const { AppError } = require('../../src/utils/errors');
      jest
        .spyOn(CityService, 'destroyCity')
        .mockRejectedValue(
          new AppError(
            'Cannot delete city with registered airports',
            StatusCodes.BAD_REQUEST,
            "City 'Delhi' cannot be deleted because it has registered airports",
          ),
        );

      const res = await request(app).delete('/api/v1/cities/1').set('x-user-role', 'ADMIN');

      expect(res.status).toBe(StatusCodes.BAD_REQUEST);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Cannot delete city with registered airports');
    });
  });

  describe('GET /api/v1/cities/:id', () => {
    it('should return 200 with city detail', async () => {
      jest.spyOn(CityService, 'getCity').mockResolvedValue({ id: 1, name: 'Mumbai' });

      const res = await request(app).get('/api/v1/cities/1');

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Mumbai');
    });
  });

  describe('PATCH /api/v1/cities/:id', () => {
    it('should return 403 if called by non-admin', async () => {
      const res = await request(app).patch('/api/v1/cities/1').send({ name: 'Navi Mumbai' });

      expect(res.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return 200 when admin updates city', async () => {
      jest.spyOn(CityService, 'updateCity').mockResolvedValue({ id: 1, name: 'Navi Mumbai' });

      const res = await request(app)
        .patch('/api/v1/cities/1')
        .set('x-user-role', 'ADMIN')
        .send({ name: 'Navi Mumbai' });

      expect(res.status).toBe(StatusCodes.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Navi Mumbai');
    });
  });
});
