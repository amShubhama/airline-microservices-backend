const { BOOKING_SERVICE_URL } = require("../config/serverConfig");
const createServiceProxy = require("./createServiceProxy");

module.exports = createServiceProxy(
    "BOOKING_SERVICE",
    BOOKING_SERVICE_URL,
    {
        pathRewrite: (path, req) => req.originalUrl
    }
)