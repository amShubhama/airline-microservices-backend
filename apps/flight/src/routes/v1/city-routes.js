const express = require('express');

const { CityController } = require('../../controllers/index');
const { CityMiddlewares } = require('../../middlewares/index');

const router = express.Router();

// /api/v1/cities POST
router.post('/',
    CityMiddlewares.validateCreateRequest,
    CityController.createCity
);


module.exports = router;