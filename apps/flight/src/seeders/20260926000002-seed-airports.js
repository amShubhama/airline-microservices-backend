'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('Airports', [
      {
        id: 1,
        name: 'Indira Gandhi International Airport',
        code: 'DEL',
        address: 'Palam, New Delhi',
        cityId: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: 'Chhatrapati Shivaji Maharaj International Airport',
        code: 'BOM',
        address: 'Sahar, Mumbai',
        cityId: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        name: 'Kempegowda International Airport',
        code: 'BLR',
        address: 'Devanahalli, Bengaluru',
        cityId: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        name: 'Rajiv Gandhi International Airport',
        code: 'HYD',
        address: 'Shamshabad, Hyderabad',
        cityId: 4,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        name: 'Chennai International Airport',
        code: 'MAA',
        address: 'Meenambakkam, Chennai',
        cityId: 5,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 6,
        name: 'Netaji Subhash Chandra Bose International Airport',
        code: 'CCU',
        address: 'Dum Dum, Kolkata',
        cityId: 6,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 7,
        name: 'Dabolim Airport',
        code: 'GOI',
        address: 'Dabolim, Goa',
        cityId: 7,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 8,
        name: 'Sardar Vallabhbhai Patel International Airport',
        code: 'AMD',
        address: 'Hansol, Ahmedabad',
        cityId: 8,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 9,
        name: 'Dubai International Airport',
        code: 'DXB',
        address: 'Al Garhoud, Dubai',
        cityId: 9,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 10,
        name: 'London Heathrow Airport',
        code: 'LHR',
        address: 'Hounslow, London',
        cityId: 10,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 11,
        name: 'Singapore Changi Airport',
        code: 'SIN',
        address: 'Changi, Singapore',
        cityId: 11,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Airports', null, {});
  },
};
