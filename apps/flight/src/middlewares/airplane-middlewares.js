const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils/common/index');
const AppError = require('../utils/errors/app-error');

function validateCreateRequest(req, res, next) {
    if (!req.body.modelNumber) {
        ErrorResponse.message = 'Something went wrong while creating the airplane';
        ErrorResponse.error = new AppError(
            ['"modelNumber" not found in the incoming request or provided in an incorrect format'],
            StatusCodes.BAD_REQUEST
        );
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(ErrorResponse);
    }
    next();
}

module.exports = {
    validateCreateRequest,
};