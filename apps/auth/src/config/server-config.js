const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  PORT: process.env.PORT,
  JWT_KEY: process.env.JWT_KEY,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  SALT_ROUNDS: 10,
};
