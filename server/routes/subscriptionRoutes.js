import express from 'express';
import { SubscriptionController } from '../controllers/subscriptionController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get available plans (public)
router.get('/plans', SubscriptionController.getPlans);

// Protected routes - require authentication
router.use(authenticateUser);

// Create subscription plan
router.post('/create-plan', SubscriptionController.createPlan);

// Create subscription for user
router.post('/create-subscription', SubscriptionController.createSubscription);

// Get subscription status
router.get('/status/:userId', SubscriptionController.getSubscriptionStatus);
router.get('/status', SubscriptionController.getSubscriptionStatus);

// Cancel subscription
router.post('/cancel', SubscriptionController.cancelSubscription);

export default router;
