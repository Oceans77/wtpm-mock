import { Router } from 'express';
import { register, login, getMe } from './auth.controller';
import { validateRegister, validateLogin } from './auth.validation';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

// Register new user
router.post('/register', validateRegister, register);

// Login user
router.post('/login', validateLogin, login);

// Get current user
router.get('/me', auth, getMe);

export default router;
