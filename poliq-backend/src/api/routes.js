// src/api/routes.js
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth/auth.routes');
const adminRoutes = require('./admin/admin.routes');

// Basic route to test
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Mount auth routes
router.use('/auth', authRoutes);

// Mount admin routes
router.use('/admin', adminRoutes);

module.exports = router;
