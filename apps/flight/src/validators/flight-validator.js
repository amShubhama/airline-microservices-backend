const { validateRequest } = require('./common');
const {
  createFlightSchema,
  updateFlightSchema,
  updateFlightSeatsSchema,
  queryFlightsSchema,
} = require('../schemas/flight');

const validateCreateFlight = validateRequest(createFlightSchema);
const validateUpdateFlight = validateRequest(updateFlightSchema);
const validateUpdateFlightSeats = validateRequest(updateFlightSeatsSchema);
const validateQueryFlights = validateRequest(queryFlightsSchema);

module.exports = {
  validateCreateFlight,
  validateUpdateFlight,
  validateUpdateFlightSeats,
  validateQueryFlights,
};
