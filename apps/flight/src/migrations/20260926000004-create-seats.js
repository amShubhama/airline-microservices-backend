'use strict';

const { SEAT_TYPE } = require('../utils/common/enums');
const { BUSINESS, PREMIUM_ECONOMY, FIRST_CLASS, ECONOMY } = SEAT_TYPE;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Seats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      airplaneId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Airplanes',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      row: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      col: {
        type: Sequelize.STRING(1),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM,
        values: [BUSINESS, ECONOMY, PREMIUM_ECONOMY, FIRST_CLASS],
        defaultValue: ECONOMY,
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

    // Add unique constraint on seat coordinate per airplane
    await queryInterface.addIndex('Seats', ['airplaneId', 'row', 'col'], {
      unique: true,
      name: 'unique_airplane_seat_coordinate',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Seats');
  },
};
