const { flightStatusValues, createFlightSchema } = require('./create-flight.schema');
const updateFlightSchema = require('./update-flight.schema');
const updateFlightSeatsSchema = require('./update-seats.schema');
const queryFlightsSchema = require('./query-flights.schema');

module.exports = {
  flightStatusValues,
  createFlightSchema,
  updateFlightSchema,
  updateFlightSeatsSchema,
  queryFlightsSchema,
};
