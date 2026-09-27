const express = require('express');
const { SeatController } = require('../../controllers');
const { SeatValidators } = require('../../validators');
const { requireAdmin } = require('../../middlewares/role-middleware');

const router = express.Router();

/**
 * @route   GET /api/v1/seats
 */
router.get('/', SeatValidators.validateQuerySeats, SeatController.getSeatsByAirplane);

/**
 * @route   GET /api/v1/seats/airplanes/:airplaneId
 */
router.get('/airplanes/:airplaneId', SeatValidators.validateAirplaneSeatsParam, SeatController.getSeatsByAirplane);

/**
 * @route   POST /api/v1/seats
 */
router.post('/', requireAdmin, SeatValidators.validateCreateSeat, SeatController.createSeat);

/**
 * @route   POST /api/v1/seats/airplanes/:airplaneId/batch
 */
router.post(
  '/airplanes/:airplaneId/batch',
  requireAdmin,
  SeatValidators.validateBulkCreateSeats,
  SeatController.bulkCreateSeats,
);

module.exports = router;
