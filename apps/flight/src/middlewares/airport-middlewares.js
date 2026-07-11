const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils/common/index');
const AppError = require('../utils/errors/app-error');

function validateCreateRequest(req, res, next) {
    if (!req.body.name) {
        ErrorResponse.message = 'Something went wrong while creating the airport';
        ErrorResponse.error = new AppError(
            ['"name" field is missing or not provided in the correct format in the incoming request'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!req.body.code) {
        ErrorResponse.message = 'Something went wrong while creating the airport';
        ErrorResponse.error = new AppError(
            ['"code" field is missing or not provided in the correct format in the incoming request'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (!req.body.cityId) {
        ErrorResponse.message = 'Something went wrong while creating the airport';
        ErrorResponse.error = new AppError(
            ['"cityId" field is missing or not provided in the correct format in the incoming request'],
            StatusCodes.BAD_REQUEST
        );
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    next();
}

module.exports = {
    validateCreateRequest,
};