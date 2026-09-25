const request = require('supertest');
const app = require('../../src/app');
const { StatusCodes } = require('http-status-codes');

describe('Health & Global Routes Integration', () => {
  describe('GET /health', () => {
    it('should return 200 with service health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual({
        status: 'healthy',
        service: 'Auth Service',
        timestamp: expect.any(String),
      });
    });
  });

  describe('404 Not Found Handler', () => {
    it('should return 404 for unhandled route', async () => {
      const response = await request(app).get('/api/v1/unknown-endpoint');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Cannot GET /api/v1/unknown-endpoint');
    });
  });
});
