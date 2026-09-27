const express = require('express');
const { FlightController } = require('../../controllers');
const { FlightValidators, validateIdParam } = require('../../validators');
const { requireAdmin } = require('../../middlewares/role-middleware');

const router = express.Router();

/**
 * @route   GET /api/v1/flights
 */
router.get('/', FlightValidators.validateQueryFlights, FlightController.getAllFlights);

/**
 * @route   GET /api/v1/flights/:id
 */
router.get('/:id', validateIdParam, FlightController.getFlight);

/**
 * @route   PATCH /api/v1/flights/:id/seats
 */
router.patch('/:id/seats', validateIdParam, FlightValidators.validateUpdateFlightSeats, FlightController.updateSeats);

/**
 * @route   POST /api/v1/flights
 */
router.post('/', requireAdmin, FlightValidators.validateCreateFlight, FlightController.createFlight);

/**
 * @route   PATCH /api/v1/flights/:id
 */
router.patch(
  '/:id',
  requireAdmin,
  validateIdParam,
  FlightValidators.validateUpdateFlight,
  FlightController.updateFlight,
);

/**
 * @route   DELETE /api/v1/flights/:id
 */
router.delete('/:id', requireAdmin, validateIdParam, FlightController.destroyFlight);

module.exports = router;
