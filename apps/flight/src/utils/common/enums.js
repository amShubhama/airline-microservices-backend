const SEAT_TYPE = Object.freeze({
  BUSINESS: 'business',
  ECONOMY: 'economy',
  PREMIUM_ECONOMY: 'premium-economy',
  FIRST_CLASS: 'first-class',
});

const FLIGHT_STATUS = Object.freeze({
  SCHEDULED: 'SCHEDULED',
  ON_TIME: 'ON_TIME',
  DELAYED: 'DELAYED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
});

module.exports = {
  SEAT_TYPE,
  FLIGHT_STATUS,
};
