'use strict';
const { Enums } = require('../utils/common/index');
const { BUSINESS, ECONOMY, PREMIUM_ECONOMY, FIRST_CLASS } = Enums.SEAT_TYPE;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Seats', [
      // Airplane 1
      { airplaneId: 1, row: 1, col: 'A', type: BUSINESS, createdAt: new Date(), updatedAt: new Date() },
      { airplaneId: 1, row: 1, col: 'B', type: BUSINESS, createdAt: new Date(), updatedAt: new Date() },
      { airplaneId: 1, row: 2, col: 'A', type: ECONOMY, createdAt: new Date(), updatedAt: new Date() },
      { airplaneId: 1, row: 2, col: 'B', type: ECONOMY, createdAt: new Date(), updatedAt: new Date() },

      // Airplane 2
      { airplaneId: 2, row: 1, col: 'A', type: FIRST_CLASS, createdAt: new Date(), updatedAt: new Date() },
      { airplaneId: 2, row: 1, col: 'B', type: FIRST_CLASS, createdAt: new Date(), updatedAt: new Date() },
      { airplaneId: 2, row: 2, col: 'A', type: PREMIUM_ECONOMY, createdAt: new Date(), updatedAt: new Date() },
      { airplaneId: 2, row: 2, col: 'B', type: PREMIUM_ECONOMY, createdAt: new Date(), updatedAt: new Date() },

      // Airplane 3
      { airplaneId: 3, row: 1, col: 'A', type: ECONOMY, createdAt: new Date(), updatedAt: new Date() },
      { airplaneId: 3, row: 1, col: 'B', type: ECONOMY, createdAt: new Date(), updatedAt: new Date() },
      { airplaneId: 3, row: 2, col: 'A', type: ECONOMY, createdAt: new Date(), updatedAt: new Date() },
      { airplaneId: 3, row: 2, col: 'B', type: ECONOMY, createdAt: new Date(), updatedAt: new Date() },
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
