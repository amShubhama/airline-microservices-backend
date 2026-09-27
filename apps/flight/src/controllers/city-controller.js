const { StatusCodes } = require('http-status-codes');
const { CityService } = require('../services');
const { successResponse } = require('../utils/common/response');
const { MESSAGES } = require('../constants');

async function createCity(req, res, next) {
  try {
    const city = await CityService.createCity({
      name: req.body.name,
    });
    return res.status(StatusCodes.CREATED).json(successResponse(MESSAGES.CITY.CREATED, city));
  } catch (error) {
    next(error);
  }
}

async function getCities(req, res, next) {
  try {
    const cities = await CityService.getCities();
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.CITY.FETCHED_ALL, cities));
  } catch (error) {
    next(error);
  }
}

async function getCity(req, res, next) {
  try {
    const city = await CityService.getCity(req.params.id);
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.CITY.FETCHED, city));
  } catch (error) {
    next(error);
  }
}

async function updateCity(req, res, next) {
  try {
    const city = await CityService.updateCity(req.params.id, {
      name: req.body.name,
    });
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.CITY.UPDATED, city));
  } catch (error) {
    next(error);
  }
}

async function destroyCity(req, res, next) {
  try {
    const response = await CityService.destroyCity(req.params.id);
    return res.status(StatusCodes.OK).json(successResponse(MESSAGES.CITY.DELETED, response));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCity,
  getCities,
  getCity,
  updateCity,
  destroyCity,
};
