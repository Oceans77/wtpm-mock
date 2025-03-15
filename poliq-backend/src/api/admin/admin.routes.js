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
