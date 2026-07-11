const createServiceProxy = require("./createServiceProxy");
const { FLIGHT_SERVICE_URL } = require("../config/serverConfig");

module.exports = createServiceProxy(
    "FLIGHT_SERVICE",
    FLIGHT_SERVICE_URL,
    {
        pathRewrite: (path, req) => req.originalUrl
    }
);