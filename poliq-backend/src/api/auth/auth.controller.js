// src/api/auth/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const JsonFileAdapter = require('../../models/jsonFileAdapter');
const userAdapter = new JsonFileAdapter('users');

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, username, displayName } = req.body;

    // Check if user exists
    const existingUser = await userAdapter.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email',
      });
    }

    // Check if username is taken
    const existingUsername = await userAdapter.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        error: 'Username is already taken',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await userAdapter.create({
      email,
      password: hashedPassword,
      username,
      displayName,
      role: 'user', // Default role for new users
      verificationStatus: 'unverified',
      isActive: true,
      accountType: 'standard_user'
    });

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role }, // Include role in token
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Return user info and token
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        verificationStatus: user.verificationStatus,
        role: user.role, // Include role in response
      },
    });
  } catch (error) {
    console.error('Error in register controller:', error);
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await userAdapter.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await userAdapter.update(user.id, { lastLoginAt: new Date() });

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role }, // Include role in token
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Return user info and token
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        verificationStatus: user.verificationStatus,
        role: user.role, // Include role in response
      },
    });
  } catch (error) {
    console.error('Error in login controller:', error);
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    // User is attached to request in auth middleware
    if (!req.user) {
      return res.status(401).json({
        error: 'Not authenticated',
      });
    }
    
    const user = await userAdapter.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      verificationStatus: user.verificationStatus,
      role: user.role, // Include role in response
    });
  } catch (error) {
    console.error('Error in getMe controller:', error);
    next(error);
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Admin privileges required.',
      });
    }
    
    const users = await userAdapter.findAll();
    
    // Return users without passwords
    const safeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      verificationStatus: user.verificationStatus,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    }));

    res.json(safeUsers);
  } catch (error) {
    console.error('Error in getAllUsers controller:', error);
    next(error);
  }
};
