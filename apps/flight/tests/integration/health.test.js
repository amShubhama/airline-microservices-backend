const request = require('supertest');
const { StatusCodes } = require('http-status-codes');
const app = require('../../src/app');

describe('Health & Global Routes Integration', () => {
  describe('GET /health', () => {
    it('should return 200 with flight service health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual({
        status: 'healthy',
        service: 'Flight Service',
        timestamp: expect.any(String),
      });
    });
  });

  describe('404 Not Found Handler', () => {
    it('should return 404 for unhandled route with standard error envelope', async () => {
      const response = await request(app).get('/api/v1/unknown-endpoint');

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Cannot GET /api/v1/unknown-endpoint');
      expect(response.body.error).toHaveProperty('statusCode', StatusCodes.NOT_FOUND);
    });
  });
});
