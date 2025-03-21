// poliq-backend/src/app.js (Updated version)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const { connectionLogger } = require('./utils/connectionLogger');
const apiRoutes = require('./api/routes');
const { logger } = require('./utils/logger');

// Create Express app
const app = express();

// CORS configuration - IMPORTANT: Use specific origin instead of wildcard
app.use(cors({
  // Use your frontend URL instead of * 
  origin: 'http://100.101.244.103:5173',
  // Enable credentials for cookies and auth headers
  credentials: true,
  // Allow these HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Allow these headers
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Other middleware
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(connectionLogger);
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