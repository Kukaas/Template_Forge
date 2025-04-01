import { UserModel } from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';

export const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = UserModel.SUBSCRIPTION_PLANS;
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting subscription plans'
    });
  }
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    const status = await UserModel.getSubscriptionStatus(req.user.id);
    res.json(status);
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting subscription status'
    });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const { planType } = req.body;
    const userId = req.user.id;

    // For now, we'll simulate a successful payment
    const paymentId = `sim_${uuidv4()}`;

    const subscription = await UserModel.createSubscription(
      userId,
      planType,
      paymentId
    );

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription',
      error: error.message
    });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    await UserModel.cancelSubscription(req.user.id);
    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription'
    });
  }
};