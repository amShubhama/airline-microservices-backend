'use strict';

const { FLIGHT_STATUS } = require('../utils/common/enums');
const { SCHEDULED, ON_TIME, DELAYED, CANCELLED, COMPLETED } = FLIGHT_STATUS;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Flights', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      flightNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      airplaneId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Airplanes',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      departureAirportCode: {
        type: Sequelize.STRING(3),
        allowNull: false,
        references: {
          model: 'Airports',
          key: 'code',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      arrivalAirportCode: {
        type: Sequelize.STRING(3),
        allowNull: false,
        references: {
          model: 'Airports',
          key: 'code',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      departureTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      arrivalTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      boardingGate: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      totalSeats: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      remainingSeats: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: [SCHEDULED, ON_TIME, DELAYED, CANCELLED, COMPLETED],
        defaultValue: SCHEDULED,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add composite index for high-performance flight search queries
    await queryInterface.addIndex('Flights', ['departureAirportCode', 'arrivalAirportCode', 'departureTime'], {
      name: 'flights_search_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Flights');
  },
};
