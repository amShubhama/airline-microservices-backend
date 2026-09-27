const express = require('express');
const { AirportController } = require('../../controllers');
const { AirportValidators, validateIdParam } = require('../../validators');
const { requireAdmin } = require('../../middlewares/role-middleware');

const router = express.Router();

/**
 * @route   GET /api/v1/airports
 */
router.get('/', AirportController.getAirports);

/**
 * @route   GET /api/v1/airports/code/:code
 */
router.get('/code/:code', AirportValidators.validateAirportCodeParam, AirportController.getAirportByCode);

/**
 * @route   GET /api/v1/airports/:id
 */
router.get('/:id', validateIdParam, AirportController.getAirport);

/**
 * @route   POST /api/v1/airports
 */
router.post('/', requireAdmin, AirportValidators.validateCreateAirport, AirportController.createAirport);

/**
 * @route   PATCH /api/v1/airports/:id
 */
router.patch(
  '/:id',
  requireAdmin,
  validateIdParam,
  AirportValidators.validateUpdateAirport,
  AirportController.updateAirport,
);

/**
 * @route   DELETE /api/v1/airports/:id
 */
router.delete('/:id', requireAdmin, validateIdParam, AirportController.destroyAirport);

module.exports = router;
