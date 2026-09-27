const { validateRequest } = require('./common');
const {
  createSeatSchema,
  bulkCreateSeatsSchema,
  querySeatsSchema,
  airplaneSeatsParamSchema,
} = require('../schemas/seat');

const validateCreateSeat = validateRequest(createSeatSchema);
const validateBulkCreateSeats = validateRequest(bulkCreateSeatsSchema);
const validateQuerySeats = validateRequest(querySeatsSchema);
const validateAirplaneSeatsParam = validateRequest(airplaneSeatsParamSchema);

module.exports = {
  validateCreateSeat,
  validateBulkCreateSeats,
  validateQuerySeats,
  validateAirplaneSeatsParam,
};
