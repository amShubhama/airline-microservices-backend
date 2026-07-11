const createServiceProxy = require("./createServiceProxy");
const { AUTH_SERVICE_URL } = require("../config/serverConfig");

module.exports = createServiceProxy(
    "AUTH_SERVICE",
    AUTH_SERVICE_URL,
    {
        "^/": "/api/v1/"
    }
);