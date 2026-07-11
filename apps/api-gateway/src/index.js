const express = require("express");
const helmet = require("helmet");
const cors = require("cors")
const morgan = require("morgan");
const authProxy = require('./proxy/authProxy')
const { PORT, ENV } = require('./config/serverConfig');
const flightProxy = require("./proxy/flightProxy");
const bookingProxy = require("./proxy/bookingProxy");


const setupAndStartServer = async () => {
    const app = express();

    app.use(helmet());

    app.use(cors());

    app.use(morgan("dev"));

    app.get("/", (req, res) => {
        return res.status(200).json({
            success: true,
            service: "API Gateway",
            status: "healthy",
            environment: ENV,
            timestamp: new Date().toISOString(),
        });
    });

    app.use("/api/v1/auth", authProxy);
    app.use(
        [
            "/api/v1/flights",
            "/api/v1/airports",
            "/api/v1/airplanes",
            "/api/v1/cities",
        ],
        flightProxy
    );
    app.use('/api/v1/bookings', bookingProxy)

    app.use((req, res) => {
        return res.status(404).json({
            success: false,
            message: `Cannot ${req.method} ${req.originalUrl}`,
        });
    });

    app.listen(PORT, () => {
        console.log(`APIGateway Service is running on ${PORT}`)
    });
}

setupAndStartServer()