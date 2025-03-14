const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const apiRoutes = require('./api/routes');
const { logger } = require('./utils/logger');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PoliQ Backend API' });
});

// API Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

module.exports = app;
