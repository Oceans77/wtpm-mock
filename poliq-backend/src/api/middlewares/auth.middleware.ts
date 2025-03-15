// src/api/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config';

// Update interface for decoded token with role
interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
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
    const decoded = jwt.verify(token, config.jwt.secret) as DecodedToken;
    
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
