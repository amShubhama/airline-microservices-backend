'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('Airplanes', [
      { id: 1, modelNumber: 'Airbus A320neo', capacity: 180, createdAt: now, updatedAt: now },
      { id: 2, modelNumber: 'Airbus A321neo', capacity: 220, createdAt: now, updatedAt: now },
      { id: 3, modelNumber: 'Boeing 737 MAX 8', capacity: 189, createdAt: now, updatedAt: now },
      { id: 4, modelNumber: 'Boeing 787-9 Dreamliner', capacity: 296, createdAt: now, updatedAt: now },
      { id: 5, modelNumber: 'Boeing 777-300ER', capacity: 396, createdAt: now, updatedAt: now },
      { id: 6, modelNumber: 'Airbus A350-900', capacity: 325, createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Airplanes', null, {});
  },
};
