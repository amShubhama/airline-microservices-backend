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
    await queryInterface.bulkInsert('Cities', [
      { name: 'Mumbai', createdAt: now, updatedAt: now },
      { name: 'Delhi', createdAt: now, updatedAt: now },
      { name: 'Bangalore', createdAt: now, updatedAt: now },
      { name: 'Chennai', createdAt: now, updatedAt: now },
      { name: 'Kolkata', createdAt: now, updatedAt: now },
      { name: 'Hyderabad', createdAt: now, updatedAt: now },
      { name: 'Goa', createdAt: now, updatedAt: now },
    ]
      , {});
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
