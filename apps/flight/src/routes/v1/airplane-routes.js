const express = require('express');
const { AirplaneController } = require('../../controllers');
const { AirplaneValidators, validateIdParam } = require('../../validators');
const { requireAdmin } = require('../../middlewares/role-middleware');

const router = express.Router();

/**
 * @route   GET /api/v1/airplanes
 */
router.get('/', AirplaneController.getAirplanes);

/**
 * @route   GET /api/v1/airplanes/:id
 */
router.get('/:id', validateIdParam, AirplaneController.getAirplane);

/**
 * @route   POST /api/v1/airplanes
 */
router.post('/', requireAdmin, AirplaneValidators.validateCreateAirplane, AirplaneController.createAirplane);

/**
 * @route   PATCH /api/v1/airplanes/:id
 */
router.patch(
  '/:id',
  requireAdmin,
  validateIdParam,
  AirplaneValidators.validateUpdateAirplane,
  AirplaneController.updateAirplane,
);

/**
 * @route   DELETE /api/v1/airplanes/:id
 */
router.delete('/:id', requireAdmin, validateIdParam, AirplaneController.destroyAirplane);

module.exports = router;
