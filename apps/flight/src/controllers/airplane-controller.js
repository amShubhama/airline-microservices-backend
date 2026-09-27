const { StatusCodes } = require('http-status-codes');
const { AirplaneService } = require('../services');
const { successResponse } = require('../utils/common/response');
const { MESSAGES } = require('../constants');

async function createAirplane(req, res, next) {
  try {
    const airplane = await AirplaneService.createAirplane({
      modelNumber: req.body.modelNumber,
      capacity: req.body.capacity,
    });
    return res.status(StatusCodes.CREATED).json(successResponse(MESSAGES.AIRPLANE.CREATED, airplane));
  } catch (error) {
    next(error);
  }
}

async function getAirplanes(req, res, next) {
  try {
    const airplanes = await AirplaneService.getAirplanes();
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.AIRPLANE.FETCHED_ALL, airplanes));
  } catch (error) {
    next(error);
  }
}

async function getAirplane(req, res, next) {
  try {
    const airplane = await AirplaneService.getAirplane(req.params.id);
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.AIRPLANE.FETCHED, airplane));
  } catch (error) {
    next(error);
  }
}

async function updateAirplane(req, res, next) {
  try {
    const airplane = await AirplaneService.updateAirplane(req.params.id, req.body);
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.AIRPLANE.UPDATED, airplane));
  } catch (error) {
    next(error);
  }
}

async function destroyAirplane(req, res, next) {
  try {
    const response = await AirplaneService.destroyAirplane(req.params.id);
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.AIRPLANE.DELETED, response));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAirplane,
  getAirplanes,
  getAirplane,
  updateAirplane,
  destroyAirplane,
};
