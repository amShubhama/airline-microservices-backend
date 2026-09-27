'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('Cities', [
      { id: 1, name: 'Delhi', createdAt: now, updatedAt: now },
      { id: 2, name: 'Mumbai', createdAt: now, updatedAt: now },
      { id: 3, name: 'Bengaluru', createdAt: now, updatedAt: now },
      { id: 4, name: 'Hyderabad', createdAt: now, updatedAt: now },
      { id: 5, name: 'Chennai', createdAt: now, updatedAt: now },
      { id: 6, name: 'Kolkata', createdAt: now, updatedAt: now },
      { id: 7, name: 'Goa', createdAt: now, updatedAt: now },
      { id: 8, name: 'Ahmedabad', createdAt: now, updatedAt: now },
      { id: 9, name: 'Dubai', createdAt: now, updatedAt: now },
      { id: 10, name: 'London', createdAt: now, updatedAt: now },
      { id: 11, name: 'Singapore', createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Cities', null, {});
  },
};
