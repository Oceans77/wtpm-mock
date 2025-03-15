// src/api/admin/admin.controller.js
const { getActiveSessions, readLogs } = require('../../utils/connectionLogger');

// Get active sessions
exports.getActiveSessions = (req, res) => {
  const sessions = getActiveSessions();
  
  // Return summary stats with the sessions
  const stats = {
    totalSessions: sessions.length,
    deviceBreakdown: sessions.reduce((acc, session) => {
      acc[session.device] = (acc[session.device] || 0) + 1;
      return acc;
    }, {}),
    browserBreakdown: sessions.reduce((acc, session) => {
      acc[session.browser] = (acc[session.browser] || 0) + 1;
      return acc;
    }, {}),
    countryBreakdown: sessions.reduce((acc, session) => {
      acc[session.location.country] = (acc[session.location.country] || 0) + 1;
      return acc;
    }, {})
  };
  
  res.json({
    stats,
    sessions
  });
};

// Get recent logs
exports.getRecentLogs = (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 100;
  const logs = readLogs(limit);
  
  // Group logs by type for easier analysis
  const groupedLogs = {
    newSessions: logs.filter(log => log.type === 'new_session'),
    requests: logs.filter(log => log.type === 'request'),
    responses: logs.filter(log => log.type === 'response')
  };
  
  res.json({
    total: logs.length,
    groupedLogs
  });
};

// Get log summary
exports.getLogSummary = (req, res) => {
  const logs = readLogs(1000); // Get a significant sample
  
  // Calculate common metrics
  const summary = {
    totalRequests: logs.filter(log => log.type === 'request').length,
    uniqueIPs: new Set(logs.map(log => log.ip)).size,
    averageResponseTime: logs.filter(log => log.type === 'response')
      .reduce((sum, log) => sum + parseFloat(log.responseTime || 0), 0) / 
      logs.filter(log => log.type === 'response').length || 0,
    popularEndpoints: logs.filter(log => log.type === 'request')
      .reduce((acc, log) => {
        acc[log.url] = (acc[log.url] || 0) + 1;
        return acc;
      }, {}),
    statusCodes: logs.filter(log => log.type === 'response')
      .reduce((acc, log) => {
        acc[log.statusCode] = (acc[log.statusCode] || 0) + 1;
        return acc;
      }, {})
  };
  
  // Transform popularEndpoints into sorted array
  const sortedEndpoints = Object.entries(summary.popularEndpoints)
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  summary.popularEndpoints = sortedEndpoints;
  
  res.json(summary);
};

// src/api/admin/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { auth } = require('../middlewares/auth.middleware');
const { adminAuth } = require('../middlewares/admin.middleware');

// Protect all admin routes with authentication middleware
router.use(auth);
router.use(adminAuth);

// Connection logs routes
router.get('/connections/active', adminController.getActiveSessions);
router.get('/connections/logs', adminController.getRecentLogs);
router.get('/connections/summary', adminController.getLogSummary);

module.exports = router;

// src/api/middlewares/admin.middleware.js
// Middleware to ensure the user is an admin
exports.adminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied. Admin privileges required.'
    });
  }
  
  next();
};
