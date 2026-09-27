const { validateRequest, validateIdParam, validateNamedIdParam, validatePaginationQuery } = require('./common');

const CityValidators = require('./city-validator');
const AirportValidators = require('./airport-validator');
const AirplaneValidators = require('./airplane-validator');
const FlightValidators = require('./flight-validator');
const SeatValidators = require('./seat-validator');

module.exports = {
  validateRequest,
  validateIdParam,
  validateNamedIdParam,
  validatePaginationQuery,
  CityValidators,
  AirportValidators,
  AirplaneValidators,
  FlightValidators,
  SeatValidators,
};
