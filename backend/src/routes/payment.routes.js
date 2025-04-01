import express from 'express';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import {
  createSubscription,
  getSubscriptionStatus,
  cancelSubscription,
  getSubscriptionPlans
} from '../controllers/payment.controller.js';

const router = express.Router();

// Get available subscription plans
router.get('/plans', getSubscriptionPlans);

// Get user's subscription status
router.get('/status', isAuthenticated, getSubscriptionStatus);

// Create new subscription
router.post('/subscribe', isAuthenticated, createSubscription);

// Cancel subscription
router.post('/cancel', isAuthenticated, cancelSubscription);

export default router;