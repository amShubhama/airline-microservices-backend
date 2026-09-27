'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { NODE_ENV, DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT, DB_DIALECT } = require('../config/server-config');

const basename = path.basename(__filename);
const env = NODE_ENV || 'development';
const fileConfig = require(path.join(__dirname, '../config/config.json'))[env];

const config = {
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  logging: false,
};

const db = {};

let sequelize;
if (fileConfig.use_env_variable && process.env[fileConfig.use_env_variable]) {
  sequelize = new Sequelize(process.env[fileConfig.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js' && file.indexOf('.test.js') === -1;
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
