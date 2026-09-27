const errorHandler = require('./error-middleware');
const { requireAdmin } = require('./role-middleware');

module.exports = {
  errorHandler,
  requireAdmin,
};
