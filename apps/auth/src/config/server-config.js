const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_KEY: process.env.JWT_KEY,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  SALT_ROUNDS: 10,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || null,
  DB_NAME: process.env.DB_NAME || 'auth_db',
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_DIALECT: process.env.DB_DIALECT || 'mysql',
};
