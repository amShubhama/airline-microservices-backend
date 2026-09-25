'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../config/server-config');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.belongsToMany(models.Role, {
        through: 'User_Roles',
        foreignKey: 'UserId',
        otherKey: 'RoleId',
      });
    }

    /**
     * Omit password field when converting model instance to JSON.
     */
    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      return values;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [6, 100],
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ['password'] },
        },
      },
    },
  );

  User.beforeCreate(async (user) => {
    const encryptedPassword = await bcrypt.hash(user.password, SALT_ROUNDS || 10);
    user.password = encryptedPassword;
  });

  return User;
};
