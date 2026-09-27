const { successResponse, errorResponse } = require('../../../src/utils/common/response');

describe('Response Utility', () => {
  describe('successResponse', () => {
    it('should return a formatted success response object with default message', () => {
      const response = successResponse();
      expect(response).toEqual({
        success: true,
        message: 'Success',
        data: {},
        error: {},
      });
    });

    it('should include custom message and data payload', () => {
      const payload = { flightId: 101, flightNumber: 'AI-202' };
      const response = successResponse('Flight fetched', payload);

      expect(response).toEqual({
        success: true,
        message: 'Flight fetched',
        data: payload,
        error: {},
      });
    });

    it('should return a new object reference on every invocation (no singleton mutation)', () => {
      const res1 = successResponse('First', { a: 1 });
      const res2 = successResponse('Second', { b: 2 });

      expect(res1).not.toBe(res2);
      expect(res1.data).not.toBe(res2.data);
    });
  });

  describe('errorResponse', () => {
    it('should return a formatted error response object with default values', () => {
      const response = errorResponse();
      expect(response).toEqual({
        success: false,
        message: 'Failure',
        data: {},
        error: {},
      });
    });

    it('should wrap string error into an explanation object', () => {
      const response = errorResponse('Bad Request', 'Invalid flight number');
      expect(response).toEqual({
        success: false,
        message: 'Bad Request',
        data: {},
        error: { explanation: 'Invalid flight number' },
      });
    });

    it('should preserve structured error objects', () => {
      const errorObj = { statusCode: 400, explanation: ['Field missing'] };
      const response = errorResponse('Validation Failed', errorObj);
      expect(response).toEqual({
        success: false,
        message: 'Validation Failed',
        data: {},
        error: errorObj,
      });
    });
  });
});
