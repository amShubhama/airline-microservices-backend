const { validateRequest } = require('./common');
const { createAirportSchema, updateAirportSchema, airportCodeParamSchema } = require('../schemas/airport');

const validateCreateAirport = validateRequest(createAirportSchema);
const validateUpdateAirport = validateRequest(updateAirportSchema);
const validateAirportCodeParam = validateRequest(airportCodeParamSchema);

module.exports = {
  validateCreateAirport,
  validateUpdateAirport,
  validateAirportCodeParam,
};
