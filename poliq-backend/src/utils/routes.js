// src/api/routes.ts
import { Router } from 'react-router-dom';
import authRoutes from './auth/auth.routes';
import adminRoutes from './admin/admin.routes'; // Import admin routes

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Admin routes
router.use('/admin', adminRoutes);

export default router;
