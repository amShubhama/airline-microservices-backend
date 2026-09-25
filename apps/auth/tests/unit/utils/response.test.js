const { successResponse, errorResponse } = require('../../../src/utils/common/response');

describe('response utility', () => {
  describe('successResponse', () => {
    it('should format default success response structure', () => {
      const res = successResponse();
      expect(res).toEqual({
        success: true,
        message: 'Success',
        data: {},
        error: {},
      });
    });

    it('should format custom message and payload', () => {
      const data = { id: 1, name: 'Alice' };
      const res = successResponse('User fetched successfully', data);
      expect(res).toEqual({
        success: true,
        message: 'User fetched successfully',
        data,
        error: {},
      });
    });
  });

  describe('errorResponse', () => {
    it('should format default error response structure', () => {
      const res = errorResponse();
      expect(res).toEqual({
        success: false,
        message: 'Failure',
        data: {},
        error: {},
      });
    });

    it('should handle string error as explanation', () => {
      const res = errorResponse('Invalid request', 'Email is required');
      expect(res).toEqual({
        success: false,
        message: 'Invalid request',
        data: {},
        error: { explanation: 'Email is required' },
      });
    });

    it('should handle object error parameter', () => {
      const errorDetails = { statusCode: 400, explanation: ['Password too short'] };
      const res = errorResponse('Validation failed', errorDetails);
      expect(res).toEqual({
        success: false,
        message: 'Validation failed',
        data: {},
        error: errorDetails,
      });
    });
  });
});
