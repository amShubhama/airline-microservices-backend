const { ValidationError } = require('../../utils/errors');
const { MESSAGES } = require('../../constants');

/**
 * Higher-order middleware factory to validate incoming requests against a Zod schema
 */
function validateRequest(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // assign parsed/sanitized/trimmed data back to request
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) {
        Object.defineProperty(req, 'query', {
          value: parsed.query,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      if (parsed.params !== undefined) req.params = parsed.params;

      next();
    } catch (error) {
      next(new ValidationError(error, MESSAGES.VALIDATION.VALIDATION_ERROR));
    }
  };
}

module.exports = validateRequest;
