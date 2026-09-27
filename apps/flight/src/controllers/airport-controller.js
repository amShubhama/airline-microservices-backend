const { StatusCodes } = require('http-status-codes');
const { AirportService } = require('../services');
const { successResponse } = require('../utils/common/response');
const { MESSAGES } = require('../constants');

async function createAirport(req, res, next) {
  try {
    const airport = await AirportService.createAirport({
      name: req.body.name,
      code: req.body.code,
      address: req.body.address,
      cityId: req.body.cityId,
    });
    return res.status(StatusCodes.CREATED).json(successResponse(MESSAGES.AIRPORT.CREATED, airport));
  } catch (error) {
    next(error);
  }
}

async function getAirports(req, res, next) {
  try {
    const airports = await AirportService.getAirports();
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.AIRPORT.FETCHED_ALL, airports));
  } catch (error) {
    next(error);
  }
}

async function getAirport(req, res, next) {
  try {
    const airport = await AirportService.getAirport(req.params.id);
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.AIRPORT.FETCHED, airport));
  } catch (error) {
    next(error);
  }
}

async function getAirportByCode(req, res, next) {
  try {
    const airport = await AirportService.getAirportByCode(req.params.code);
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.AIRPORT.FETCHED, airport));
  } catch (error) {
    next(error);
  }
}

async function updateAirport(req, res, next) {
  try {
    const airport = await AirportService.updateAirport(req.params.id, req.body);
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.AIRPORT.UPDATED, airport));
  } catch (error) {
    next(error);
  }
}

async function destroyAirport(req, res, next) {
  try {
    const response = await AirportService.destroyAirport(req.params.id);
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.AIRPORT.DELETED, response));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAirport,
  getAirports,
  getAirport,
  getAirportByCode,
  updateAirport,
  destroyAirport,
};
