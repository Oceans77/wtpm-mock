// src/api/middlewares/admin.middleware.ts
import { Request, Response, NextFunction } from 'express';

// Middleware to ensure the user is an admin
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authorization denied, user not authenticated',
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied. Admin privileges required.',
    });
  }
  
  next();
};
