const express = require('express');

const { AirplaneController } = require('../../controllers/index');
const { AirplaneMiddlewares } = require('../../middlewares/index');

const router = express.Router();

// /api/v1/airplanes POST
router.post('/',
    AirplaneMiddlewares.validateCreateRequest,
    AirplaneController.createAirplane);

// /api/v1/airplanes GET
router.get('/',
    AirplaneController.getAirplanes);

// /api/v1/airplanes/:id GET
router.get('/:id',
    AirplaneController.getAirplane);

// /api/v1/airplanes/:id DELETE
router.delete('/:id',
    AirplaneController.destroyAirplane);

module.exports = router;