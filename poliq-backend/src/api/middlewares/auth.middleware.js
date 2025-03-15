// src/api/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const config = require('../../config');

exports.auth = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({
      error: 'Authorization denied, no token provided',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Add user from payload to request
    req.user = {
      id: decoded.id,
      role: decoded.role, // Include role
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Invalid token',
    });
  }
};
