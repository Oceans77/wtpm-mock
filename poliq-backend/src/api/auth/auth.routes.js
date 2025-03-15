// src/api/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { auth } = require('../middlewares/auth.middleware');

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user
router.get('/me', auth, authController.getMe);

// Get all users (admin only)
router.get('/users', auth, authController.getAllUsers);

module.exports = router;
