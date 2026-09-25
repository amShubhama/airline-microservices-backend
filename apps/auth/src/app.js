const express = require('express');
const { StatusCodes } = require('http-status-codes');
const apiRoutes = require('./routes/index');
const { errorHandler } = require('./middlewares');
const { errorResponse } = require('./utils');
const { MESSAGES } = require('./constants');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  return res.status(StatusCodes.OK).json({
    status: 'healthy',
    service: 'Auth Service',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  return res.status(StatusCodes.NOT_FOUND).json(
    errorResponse(`Cannot ${req.method} ${req.originalUrl}`, {
      statusCode: StatusCodes.NOT_FOUND,
      explanation: MESSAGES.SYSTEM.NOT_FOUND,
    }),
  );
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
