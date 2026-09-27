const { StatusCodes } = require('http-status-codes');
const { FlightService } = require('../services');
const { successResponse } = require('../utils/common/response');
const { MESSAGES } = require('../constants');

async function createFlight(req, res, next) {
  try {
    const flight = await FlightService.createFlight({
      flightNumber: req.body.flightNumber,
      airplaneId: req.body.airplaneId,
      departureAirportCode: req.body.departureAirportCode,
      arrivalAirportCode: req.body.arrivalAirportCode,
      departureTime: req.body.departureTime,
      arrivalTime: req.body.arrivalTime,
      price: req.body.price,
      boardingGate: req.body.boardingGate,
      totalSeats: req.body.totalSeats,
      remainingSeats: req.body.remainingSeats,
      status: req.body.status,
    });
    return res.status(StatusCodes.CREATED).json(successResponse(MESSAGES.FLIGHT.CREATED, flight));
  } catch (error) {
    next(error);
  }
}

async function getAllFlights(req, res, next) {
  try {
    const flights = await FlightService.getAllFlights(req.query);
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.FLIGHT.FETCHED_ALL, flights));
  } catch (error) {
    next(error);
  }
}

async function getFlight(req, res, next) {
  try {
    const flight = await FlightService.getFlight(req.params.id);
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.FLIGHT.FETCHED, flight));
  } catch (error) {
    next(error);
  }
}

async function updateFlight(req, res, next) {
  try {
    const flight = await FlightService.updateFlight(req.params.id, req.body);
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.FLIGHT.UPDATED, flight));
  } catch (error) {
    next(error);
  }
}

async function destroyFlight(req, res, next) {
  try {
    const response = await FlightService.destroyFlight(req.params.id);
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.FLIGHT.DELETED, response));
  } catch (error) {
    next(error);
  }
}

async function updateSeats(req, res, next) {
  try {
    const flight = await FlightService.updateSeats({
      flightId: req.params.id,
      seats: req.body.seats,
      dec: req.body.dec,
    });
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.FLIGHT.SEATS_UPDATED, flight));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createFlight,
  getAllFlights,
  getFlight,
  updateFlight,
  destroyFlight,
  updateSeats,
};
