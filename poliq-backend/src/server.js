const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const winston = require('winston');

// Create logger
const { format, createLogger, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        logFormat
      ),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PoliQ Backend API' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
