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
    await queryInterface.bulkInsert('Airplanes', [
      { modelNumber: 'Boeing 737', capacity: 180, createdAt: now, updatedAt: now },
      { modelNumber: 'Airbus A320', capacity: 160, createdAt: now, updatedAt: now },
      { modelNumber: 'Embraer 190', capacity: 100, createdAt: now, updatedAt: now },
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
