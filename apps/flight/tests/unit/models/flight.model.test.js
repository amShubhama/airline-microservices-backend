const db = require('../../../src/models');
const { Flight } = db;
const { FLIGHT_STATUS } = require('../../../src/utils/common/enums');

describe('Flight Model', () => {
  const baseValidFlight = {
    flightNumber: 'AI-202',
    airplaneId: 1,
    departureAirportCode: 'DEL',
    arrivalAirportCode: 'BOM',
    departureTime: new Date(Date.now() + 3600000), // 1 hour from now
    arrivalTime: new Date(Date.now() + 10800000), // 3 hours from now
    price: 4500,
    boardingGate: '12A',
    totalSeats: 180,
  };

  it('should auto-populate remainingSeats with totalSeats in beforeValidate hook', async () => {
    const flight = Flight.build({ ...baseValidFlight });
    await flight.validate();

    expect(flight.remainingSeats).toBe(180);
    expect(flight.status).toBe(FLIGHT_STATUS.SCHEDULED);
  });

  it('should uppercase departure and arrival airport codes', async () => {
    const flight = Flight.build({
      ...baseValidFlight,
      departureAirportCode: 'del',
      arrivalAirportCode: 'bom',
    });
    await flight.validate();

    expect(flight.departureAirportCode).toBe('DEL');
    expect(flight.arrivalAirportCode).toBe('BOM');
  });

  it('should fail validation when departure and arrival airport codes are identical', async () => {
    const flight = Flight.build({
      ...baseValidFlight,
      departureAirportCode: 'DEL',
      arrivalAirportCode: 'DEL',
    });

    await expect(flight.validate()).rejects.toThrow('Departure and arrival airports cannot be identical');
  });

  it('should fail validation when arrivalTime is earlier than departureTime', async () => {
    const flight = Flight.build({
      ...baseValidFlight,
      departureTime: new Date(Date.now() + 10800000),
      arrivalTime: new Date(Date.now() + 3600000),
    });

    await expect(flight.validate()).rejects.toThrow('Arrival time must be strictly later than departure time');
  });

  it('should fail validation when remainingSeats exceeds totalSeats', async () => {
    const flight = Flight.build({
      ...baseValidFlight,
      totalSeats: 150,
      remainingSeats: 160,
    });

    await expect(flight.validate()).rejects.toThrow('Remaining seats cannot exceed total seats');
  });
});
