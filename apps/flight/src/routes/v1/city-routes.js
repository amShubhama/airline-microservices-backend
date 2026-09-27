const express = require('express');
const { CityController } = require('../../controllers');
const { CityValidators, validateIdParam } = require('../../validators');
const { requireAdmin } = require('../../middlewares/role-middleware');

const router = express.Router();

/**
 * @route   GET /api/v1/cities
 */
router.get('/', CityController.getCities);

/**
 * @route   GET /api/v1/cities/:id
 */
router.get('/:id', validateIdParam, CityController.getCity);

/**
 * @route   POST /api/v1/cities
 */
router.post('/', requireAdmin, CityValidators.validateCreateCity, CityController.createCity);

/**
 * @route   PATCH /api/v1/cities/:id
 */
router.patch('/:id', requireAdmin, validateIdParam, CityValidators.validateUpdateCity, CityController.updateCity);

/**
 * @route   DELETE /api/v1/cities/:id
 */
router.delete('/:id', requireAdmin, validateIdParam, CityController.destroyCity);

module.exports = router;
