/**
 * Centralized static messages for Auth Service
 */
const MESSAGES = Object.freeze({
    AUTH: {
        SIGNUP_SUCCESS: 'Successfully created a new user',
        SIGNIN_SUCCESS: 'Successfully signed in',
        VERIFY_SUCCESS: 'User is authenticated and token is valid',
        ADMIN_STATUS_FETCHED: 'Successfully fetched whether user is admin or not',
        INVALID_CREDENTIALS: 'Invalid email or password',
        INCORRECT_PASSWORD: 'Incorrect password',
        USER_NOT_FOUND: 'No user found with the provided identifier',
        USER_ALREADY_EXISTS: 'User already exists with this email address',
        TOKEN_MISSING: 'Authentication token is missing. Please provide it in x-access-token or Authorization Bearer header',
        TOKEN_INVALID: 'Invalid or malformed authentication token',
        TOKEN_EXPIRED: 'Authentication token has expired. Please sign in again',
        DEFAULT_ROLE_NOT_FOUND: 'Default CUSTOMER role not found in the system',
    },
    VALIDATION: {
        VALIDATION_ERROR: 'Validation failed for request data',
        EMAIL_REQUIRED: 'Email is required',
        INVALID_EMAIL: 'Please provide a valid email address',
        PASSWORD_REQUIRED: 'Password is required',
        PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters long',
        PASSWORD_MAX_LENGTH: 'Password cannot exceed 100 characters',
    },
    SYSTEM: {
        INTERNAL_SERVER_ERROR: 'An unexpected internal server error occurred',
        NOT_FOUND: 'Requested resource not found',
        DB_ERROR: 'Database operation failed',
    }
});

module.exports = MESSAGES;
