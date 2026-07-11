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
    await queryInterface.bulkInsert('Airports', [
      { name: 'Chhatrapati Shivaji', code: 'BOM', address: 'Mumbai', cityId: 1, createdAt: now, updatedAt: now },
      { name: 'Indira Gandhi', code: 'DEL', address: 'Delhi', cityId: 2, createdAt: now, updatedAt: now },
      { name: 'Kempegowda', code: 'BLR', address: 'Bangalore', cityId: 3, createdAt: now, updatedAt: now },
      { name: 'Chennai Intl', code: 'MAA', address: 'Chennai', cityId: 4, createdAt: now, updatedAt: now },
      { name: 'Netaji Subhash', code: 'CCU', address: 'Kolkata', cityId: 5, createdAt: now, updatedAt: now },
      { name: 'Rajiv Gandhi', code: 'HYD', address: 'Hyderabad', cityId: 6, createdAt: now, updatedAt: now },
      { name: 'Goa Intl', code: 'GOI', address: 'Goa', cityId: 7, createdAt: now, updatedAt: now },
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
