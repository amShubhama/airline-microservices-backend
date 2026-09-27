const AirplaneService = require('./airplane-service');
const CityService = require('./city-service');
const AirportService = require('./airport-service');
const FlightService = require('./flight-service');
const SeatService = require('./seat-service');

module.exports = {
  AirplaneService: new AirplaneService(),
  CityService: new CityService(),
  AirportService: new AirportService(),
  FlightService: new FlightService(),
  SeatService: new SeatService(),
};
