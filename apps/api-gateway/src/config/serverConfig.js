const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    PORT: process.env.PORT,
    ENV: process.env.NODE_ENV,
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL
}