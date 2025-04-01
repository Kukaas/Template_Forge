import { Router } from 'express';
import {
  loginSuccess,
  loginFailed,
  logout,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback
} from '../controllers/auth.controller.js';

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

export default router;