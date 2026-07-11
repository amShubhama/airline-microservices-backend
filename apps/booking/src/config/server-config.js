const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    PORT: process.env.PORT,
    FLIGHT_SERVICE: process.env.FLIGHT_SERVICE,
    USER_SERVICE: process.env.USER_SERVICE,
    MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
    EXCHANGE_NAME: process.env.EXCHANGE_NAME,
    REMAINDER_BINDING_KEY: process.env.REMAINDER_BINDING_KEY
}