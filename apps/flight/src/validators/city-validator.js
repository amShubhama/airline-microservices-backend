const { validateRequest } = require('./common');
const { createCitySchema, updateCitySchema } = require('../schemas/city');

const validateCreateCity = validateRequest(createCitySchema);
const validateUpdateCity = validateRequest(updateCitySchema);

module.exports = {
  validateCreateCity,
  validateUpdateCity,
};
