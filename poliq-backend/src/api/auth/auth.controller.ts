// src/api/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { User } from '../../models/user.model';
import { logger } from '../../utils/logger';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, username, displayName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email',
      });
    }

    // Check if username is taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        error: 'Username is already taken',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      displayName,
      role: 'user', // Default role for new users
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save user to database
    const user = await newUser.save();

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
    logger.error('Error in register controller:', error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
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
    await user.save();

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
    logger.error('Error in login controller:', error);
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // User is attached to request in auth middleware
    if (!req.user) {
      return res.status(401).json({
        error: 'Not authenticated',
      });
    }
    
    const user = await User.findById(req.user.id);
    
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
    logger.error('Error in getMe controller:', error);
    next(error);
  }
};
