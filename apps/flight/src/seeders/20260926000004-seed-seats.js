'use strict';

const { SEAT_TYPE } = require('../utils/common/enums');
const { BUSINESS, PREMIUM_ECONOMY, ECONOMY } = SEAT_TYPE;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const seats = [];

    // Generate full seat layout for Airplane 1 (Airbus A320neo - 180 seats)
    // Rows 1 - 3: Business Class (A, C, D, F) = 12 seats
    for (let r = 1; r <= 3; r++) {
      for (const col of ['A', 'C', 'D', 'F']) {
        seats.push({
          airplaneId: 1,
          row: r,
          col,
          type: BUSINESS,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Rows 4 - 6: Premium Economy (A, B, C, D, E, F) = 18 seats
    for (let r = 4; r <= 6; r++) {
      for (const col of ['A', 'B', 'C', 'D', 'E', 'F']) {
        seats.push({
          airplaneId: 1,
          row: r,
          col,
          type: PREMIUM_ECONOMY,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Rows 7 - 31: Economy (A, B, C, D, E, F) = 25 rows * 6 = 150 seats
    for (let r = 7; r <= 31; r++) {
      for (const col of ['A', 'B', 'C', 'D', 'E', 'F']) {
        seats.push({
          airplaneId: 1,
          row: r,
          col,
          type: ECONOMY,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Generate sample seats for Airplane 3 (Boeing 737 MAX 8)
    for (let r = 1; r <= 5; r++) {
      for (const col of ['A', 'B', 'C', 'D', 'E', 'F']) {
        seats.push({
          airplaneId: 3,
          row: r,
          col,
          type: r <= 2 ? BUSINESS : ECONOMY,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await queryInterface.bulkInsert('Seats', seats);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Seats', null, {});
  },
};
