function validateDifferentAirports(departureAirportId, arrivalAirportId, res) {
    if (departureAirportId === arrivalAirportId) {
        return false;
    }
    return true;
}

module.exports = {
    validateDifferentAirports,
};