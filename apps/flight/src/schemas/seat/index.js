const { seatTypeValues, createSeatSchema } = require('./create-seat.schema');
const bulkCreateSeatsSchema = require('./bulk-create-seats.schema');
const querySeatsSchema = require('./query-seats.schema');
const airplaneSeatsParamSchema = require('./airplane-seats-param.schema');

module.exports = {
  seatTypeValues,
  createSeatSchema,
  bulkCreateSeatsSchema,
  querySeatsSchema,
  airplaneSeatsParamSchema,
};
