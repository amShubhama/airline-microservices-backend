const AppError = require('./app-error');
const { StatusCodes } = require('http-status-codes');
const { MESSAGES } = require('../../constants');

class ValidationError extends AppError {
    constructor(errorDetails, message = MESSAGES.VALIDATION.VALIDATION_ERROR) {
        let explanation = [];

        // Check if error is from Zod
        if (errorDetails && Array.isArray(errorDetails.issues)) {
            explanation = errorDetails.issues.map((issue) => {
                const field = issue.path.join('.');
                return field ? `${field}: ${issue.message}` : issue.message;
            });
        }
        // Check if error is from Sequelize (SequelizeValidationError / SequelizeUniqueConstraintError)
        else if (errorDetails && Array.isArray(errorDetails.errors)) {
            explanation = errorDetails.errors.map((err) => err.message);
        }
        // If passed as array of strings
        else if (Array.isArray(errorDetails)) {
            explanation = errorDetails;
        }
        // Single string or object
        else if (typeof errorDetails === 'string') {
            explanation = [errorDetails];
        } else {
            explanation = ['Invalid request payload'];
        }

        super(message, StatusCodes.BAD_REQUEST, explanation);
        this.explanation = explanation;
    }
}

module.exports = ValidationError;
