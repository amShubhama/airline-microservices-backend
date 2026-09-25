const ValidationError = require('../utils/errors/validation-error');
const { MESSAGES } = require('../constants');

function validateRequest(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // If schema transformed/trimmed values, assign them back to the request
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      next();
    } catch (error) {
      next(new ValidationError(error, MESSAGES.VALIDATION.VALIDATION_ERROR));
    }
  };
}

module.exports = validateRequest;
