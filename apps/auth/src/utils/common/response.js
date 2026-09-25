function successResponse(message = 'Success', data = {}) {
  return {
    success: true,
    message,
    data,
    error: {},
  };
}

function errorResponse(message = 'Failure', error = {}) {
  return {
    success: false,
    message,
    data: {},
    error: typeof error === 'string' ? { explanation: error } : error,
  };
}

module.exports = {
  successResponse,
  errorResponse,
};
