// src/api/middlewares/admin.middleware.js
// Middleware to ensure the user is an admin
exports.adminAuth = (req, res, next) => {
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
