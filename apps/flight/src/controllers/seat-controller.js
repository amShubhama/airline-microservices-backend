const { StatusCodes } = require('http-status-codes');
const { SeatService } = require('../services');
const { successResponse } = require('../utils/common/response');
const { MESSAGES } = require('../constants');

async function getSeatsByAirplane(req, res, next) {
  try {
    const airplaneId = req.params.airplaneId || req.query.airplaneId;
    const seats = await SeatService.getSeatsByAirplane(airplaneId);
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.SEAT.FETCHED_ALL, seats));
  } catch (error) {
    next(error);
  }
}

async function createSeat(req, res, next) {
  try {
    const seat = await SeatService.createSeat(req.body);
    return res.status(StatusCodes.CREATED).json(successResponse(MESSAGES.SEAT.CREATED, seat));
  } catch (error) {
    next(error);
  }
}

async function bulkCreateSeats(req, res, next) {
  try {
    const airplaneId = req.params.airplaneId;
    const seats = await SeatService.generateAirplaneSeats(airplaneId, req.body.seats);
    return res.status(StatusCodes.CREATED).json(successResponse(MESSAGES.SEAT.BATCH_CREATED, seats));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSeatsByAirplane,
  createSeat,
  bulkCreateSeats,
};
