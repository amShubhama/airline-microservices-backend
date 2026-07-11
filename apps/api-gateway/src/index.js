const express = require("express");
const helmet = require("helmet");
const cors = require("cors")
const morgan = require("morgan");

const { PORT, ENV } = require('./config/serverConfig');

const setupAndStartServer = async () => {
    const app = express();

    app.use(helmet());

    app.use(cors());

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

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