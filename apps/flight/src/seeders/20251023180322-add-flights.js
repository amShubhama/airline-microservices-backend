'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const now = new Date();
    await queryInterface.bulkInsert('Flights', [
      {
        flightNumber: 'AI101',
        airplaneId: 1,
        departureAirportId: 'DEL',
        arrivalAirportId: 'BOM',
        departureTime: new Date('2025-10-25T06:00:00'),
        arrivalTime: new Date('2025-10-25T08:00:00'),
        price: 5000,
        boardingGate: 'A1',
        totalSeats: 180,
        createdAt: now,
        updatedAt: now
      },
      {
        flightNumber: 'AI102',
        airplaneId: 2,
        departureAirportId: 'BOM',
        arrivalAirportId: 'BLR',
        departureTime: new Date('2025-10-25T09:00:00'),
        arrivalTime: new Date('2025-10-25T11:00:00'),
        price: 4500,
        boardingGate: 'B2',
        totalSeats: 160,
        createdAt: now,
        updatedAt: now
      },
      {
        flightNumber: 'AI103',
        airplaneId: 3,
        departureAirportId: 'BLR',
        arrivalAirportId: 'MAA',
        departureTime: new Date('2025-10-25T12:00:00'),
        arrivalTime: new Date('2025-10-25T13:30:00'),
        price: 4000,
        boardingGate: 'C3',
        totalSeats: 100,
        createdAt: now,
        updatedAt: now
      },
      {
        flightNumber: 'AI104',
        airplaneId: 1,
        departureAirportId: 'MAA',
        arrivalAirportId: 'CCU',
        departureTime: new Date('2025-10-25T14:00:00'),
        arrivalTime: new Date('2025-10-25T16:00:00'),
        price: 5500,
        boardingGate: 'D4',
        totalSeats: 180,
        createdAt: now,
        updatedAt: now
      },
      {
        flightNumber: 'AI105',
        airplaneId: 2,
        departureAirportId: 'CCU',
        arrivalAirportId: 'HYD',
        departureTime: new Date('2025-10-25T17:00:00'),
        arrivalTime: new Date('2025-10-25T19:00:00'),
        price: 4800,
        boardingGate: 'E5',
        totalSeats: 160,
        createdAt: now,
        updatedAt: now
      },
      {
        flightNumber: 'AI106',
        airplaneId: 3,
        departureAirportId: 'HYD',
        arrivalAirportId: 'GOI',
        departureTime: new Date('2025-10-25T20:00:00'),
        arrivalTime: new Date('2025-10-25T21:30:00'),
        price: 4200,
        boardingGate: 'F6',
        totalSeats: 100,
        createdAt: now,
        updatedAt: now
      },
      {
        flightNumber: 'AI107',
        airplaneId: 1,
        departureAirportId: 'GOI',
        arrivalAirportId: 'DEL',
        departureTime: new Date('2025-10-25T22:00:00'),
        arrivalTime: new Date('2025-10-26T00:00:00'),
        price: 6000,
        boardingGate: 'A1',
        totalSeats: 180,
        createdAt: now,
        updatedAt: now
      },
    ]);
  },
  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
