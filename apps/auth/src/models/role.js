'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      this.belongsToMany(models.User, {
        through: 'User_Roles',
        foreignKey: 'RoleId',
        otherKey: 'UserId',
      });
    }
  }
  Role.init(
    {
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Role',
    },
  );
  return Role;
};
