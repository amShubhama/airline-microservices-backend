'use strict';

const { FLIGHT_STATUS } = require('../utils/common/enums');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    // Helper to generate dates relative to current time
    const futureDate = (daysAhead, hours, minutes) => {
      const d = new Date(now);
      d.setDate(d.getDate() + daysAhead);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    const flights = [
      // Flight 1: Delhi -> Mumbai (Morning Business Rush)
      {
        flightNumber: 'AI-101',
        airplaneId: 1, // Airbus A320neo (180 seats)
        departureAirportCode: 'DEL',
        arrivalAirportCode: 'BOM',
        departureTime: futureDate(1, 6, 0),
        arrivalTime: futureDate(1, 8, 15),
        price: 5200,
        boardingGate: 'Gate 14A',
        totalSeats: 180,
        remainingSeats: 180,
        status: FLIGHT_STATUS.SCHEDULED,
        createdAt: now,
        updatedAt: now,
      },
      // Flight 2: Delhi -> Mumbai (Evening)
      {
        flightNumber: 'AI-103',
        airplaneId: 2, // Airbus A321neo (220 seats)
        departureAirportCode: 'DEL',
        arrivalAirportCode: 'BOM',
        departureTime: futureDate(1, 18, 30),
        arrivalTime: futureDate(1, 20, 45),
        price: 5800,
        boardingGate: 'Gate 16B',
        totalSeats: 220,
        remainingSeats: 220,
        status: FLIGHT_STATUS.SCHEDULED,
        createdAt: now,
        updatedAt: now,
      },
      // Flight 3: Mumbai -> Bengaluru
      {
        flightNumber: '6E-402',
        airplaneId: 3, // Boeing 737 MAX 8 (189 seats)
        departureAirportCode: 'BOM',
        arrivalAirportCode: 'BLR',
        departureTime: futureDate(1, 9, 30),
        arrivalTime: futureDate(1, 11, 15),
        price: 4300,
        boardingGate: 'Gate 4C',
        totalSeats: 189,
        remainingSeats: 189,
        status: FLIGHT_STATUS.SCHEDULED,
        createdAt: now,
        updatedAt: now,
      },
      // Flight 4: Bengaluru -> Delhi
      {
        flightNumber: '6E-601',
        airplaneId: 1, // Airbus A320neo
        departureAirportCode: 'BLR',
        arrivalAirportCode: 'DEL',
        departureTime: futureDate(1, 14, 0),
        arrivalTime: futureDate(1, 16, 45),
        price: 6100,
        boardingGate: 'Gate 2A',
        totalSeats: 180,
        remainingSeats: 180,
        status: FLIGHT_STATUS.SCHEDULED,
        createdAt: now,
        updatedAt: now,
      },
      // Flight 5: Delhi -> Dubai (International Long-Haul)
      {
        flightNumber: 'EK-511',
        airplaneId: 5, // Boeing 777-300ER (396 seats)
        departureAirportCode: 'DEL',
        arrivalAirportCode: 'DXB',
        departureTime: futureDate(2, 10, 0),
        arrivalTime: futureDate(2, 12, 30),
        price: 18500,
        boardingGate: 'Gate T3-08',
        totalSeats: 396,
        remainingSeats: 396,
        status: FLIGHT_STATUS.SCHEDULED,
        createdAt: now,
        updatedAt: now,
      },
      // Flight 6: Mumbai -> London Heathrow
      {
        flightNumber: 'BA-138',
        airplaneId: 4, // Boeing 787-9 Dreamliner (296 seats)
        departureAirportCode: 'BOM',
        arrivalAirportCode: 'LHR',
        departureTime: futureDate(2, 2, 15),
        arrivalTime: futureDate(2, 7, 30),
        price: 48000,
        boardingGate: 'Gate T2-42',
        totalSeats: 296,
        remainingSeats: 296,
        status: FLIGHT_STATUS.SCHEDULED,
        createdAt: now,
        updatedAt: now,
      },
      // Flight 7: Hyderabad -> Goa
      {
        flightNumber: '6E-722',
        airplaneId: 1, // Airbus A320neo
        departureAirportCode: 'HYD',
        arrivalAirportCode: 'GOI',
        departureTime: futureDate(1, 11, 45),
        arrivalTime: futureDate(1, 13, 10),
        price: 3600,
        boardingGate: 'Gate 8',
        totalSeats: 180,
        remainingSeats: 180,
        status: FLIGHT_STATUS.SCHEDULED,
        createdAt: now,
        updatedAt: now,
      },
      // Flight 8: Chennai -> Singapore
      {
        flightNumber: 'SQ-529',
        airplaneId: 6, // Airbus A350-900 (325 seats)
        departureAirportCode: 'MAA',
        arrivalAirportCode: 'SIN',
        departureTime: futureDate(2, 23, 15),
        arrivalTime: futureDate(3, 5, 45),
        price: 22000,
        boardingGate: 'Gate 11',
        totalSeats: 325,
        remainingSeats: 325,
        status: FLIGHT_STATUS.SCHEDULED,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.bulkInsert('Flights', flights);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Flights', null, {});
  },
};
