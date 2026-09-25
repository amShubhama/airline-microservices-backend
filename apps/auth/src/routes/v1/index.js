const express = require('express');
const UserController = require('../../controllers/user-controller');
const { AuthRequestValidators } = require('../../middlewares/index');

const router = express.Router();

/**
 * @route   POST /api/v1/signup
 */
router.post(
    '/signup',
    AuthRequestValidators.validateSignup,
    UserController.create
);

/**
 * @route   POST /api/v1/signin
 */
router.post(
    '/signin',
    AuthRequestValidators.validateSignin,
    UserController.signIn
);

/**
 * @route   GET /api/v1/verify
 */
router.get(
    '/verify',
    AuthRequestValidators.validateAuthToken,
    UserController.isAuthenticated
);

/**
 * @route   GET /api/v1/isAdmin
 */
router.get(
    '/isAdmin',
    AuthRequestValidators.validateAuthToken,
    UserController.isAdmin
);

module.exports = router;