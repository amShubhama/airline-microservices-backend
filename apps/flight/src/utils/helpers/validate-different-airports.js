function validateDifferentAirports(departureAirportCode, arrivalAirportCode) {
  if (!departureAirportCode || !arrivalAirportCode) {
    return false;
  }
  return departureAirportCode.trim().toUpperCase() !== arrivalAirportCode.trim().toUpperCase();
}

module.exports = validateDifferentAirports;
