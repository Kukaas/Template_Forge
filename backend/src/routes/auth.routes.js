import { Router } from 'express';
import {
  loginSuccess,
  loginFailed,
  logout,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  checkPremiumStatus
} from '../controllers/auth.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = Router();

// Google Auth Routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// GitHub Auth Routes
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);

// Auth Status
router.get('/login/success', loginSuccess);
router.get('/login/failed', loginFailed);
router.get('/logout', logout);

// Add the new premium check route with authentication middleware
router.get('/check-premium', isAuthenticated, checkPremiumStatus);

export default router;