const { validateRequest } = require('./common');
const { createAirplaneSchema, updateAirplaneSchema } = require('../schemas/airplane');

const validateCreateAirplane = validateRequest(createAirplaneSchema);
const validateUpdateAirplane = validateRequest(updateAirplaneSchema);

module.exports = {
  validateCreateAirplane,
  validateUpdateAirplane,
};
