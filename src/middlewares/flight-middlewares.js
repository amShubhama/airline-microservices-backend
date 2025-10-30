const { StatusCodes } = require('http-status-codes');

const { ErrorResponse } = require('../utils/common');
const AppError = require('../utils/errors/app-error');
const { compareTime, validateDifferentAirports } = require('../utils/helpers/');

function validateCreateRequest(req, res, next) {
    if (!req.body.flightNumber) {
        ErrorResponse.message = 'Something went wrong while creating the flight';
        ErrorResponse.error = new AppError(
            ['"flightNumber" field is missing or not provided in the correct format in the incoming request'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!req.body.airplaneId) {
        ErrorResponse.message = 'Something went wrong while creating the flight';
        ErrorResponse.error = new AppError(
            ['"airplaneId" field is missing or not provided in the correct format in the incoming request'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!req.body.departureAirportId) {
        ErrorResponse.message = 'Something went wrong while creating the flight';
        ErrorResponse.error = new AppError(
            ['"departureAirportId" field is missing or not provided in the correct format in the incoming request'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!req.body.arrivalAirportId) {
        ErrorResponse.message = 'Something went wrong while creating the flight';
        ErrorResponse.error = new AppError(
            ['"arrivalAirportId" field is missing or not provided in the correct format in the incoming request'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!validateDifferentAirports(req.body.departureAirportId, req.body.arrivalAirportId)) {
        ErrorResponse.message = 'Invalid flight route';
        ErrorResponse.error = new AppError(
            ['"departureAirportId" and "arrivalAirportId" cannot be the same'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!req.body.arrivalTime) {
        ErrorResponse.message = 'Something went wrong while creating the flight';
        ErrorResponse.error = new AppError(
            ['"arrivalTime" field is missing or not provided in the correct format in the incoming request'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!req.body.departureTime) {
        ErrorResponse.message = 'Something went wrong while creating the flight';
        ErrorResponse.error = new AppError(
            ['"departureTime" field is missing or not provided in the correct format in the incoming request'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!compareTime(req.body.arrivalTime, req.body.departureTime)) {
        ErrorResponse.message = 'Invalid time configuration for the flight';
        ErrorResponse.error = new AppError(
            ['"arrivalTime" must be later than "departureTime"'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!req.body.price) {
        ErrorResponse.message = 'Something went wrong while creating the flight';
        ErrorResponse.error = new AppError(
            ['"price" field is missing or not provided in the correct format in the incoming request'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!req.body.totalSeats) {
        ErrorResponse.message = 'Something went wrong while creating the flight';
        ErrorResponse.error = new AppError(
            ['"totalSeats" field is missing or not provided in the correct format in the incoming request'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    next();
}

function validateUpdateSeatsRequest(req, res, next) {
    if (!req.body.seats) {
        ErrorResponse.message = 'Something went wrong while updating seats';
        ErrorResponse.error = new AppError(
            ['"seats" field is missing or not provided in the correct format in the incoming request'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

module.exports = {
    validateCreateRequest,
    validateUpdateSeatsRequest
};