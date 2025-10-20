import { preApprovalPlan, preApproval } from '../utils/mercadoPagoClient.js';
import { SubscriptionModel } from '../models/subscriptionModel.js';

// Plan configurations
const PLANS = {
  monthly: {
    name: 'Premium Mensual',
    price: 12000,
    frequency: 1,
    frequency_type: 'months',
    billing_day: 1,
    repetitions: 12 // 1 year of monthly payments
  },
  annual: {
    name: 'Premium Anual',
    price: 120000,
    frequency: 1,
    frequency_type: 'months',
    billing_day: 1,
    repetitions: 1 // Single annual payment
  }
};

export const SubscriptionController = {
  // Create subscription plan in Mercado Pago
  async createPlan(req, res) {
    try {
      const { planType } = req.body; // 'monthly' or 'annual'
      
      if (!PLANS[planType]) {
        return res.status(400).json({ error: 'Invalid plan type' });
      }

      const plan = PLANS[planType];
      
      const planData = {
        reason: plan.name,
        auto_recurring: {
          frequency: plan.frequency,
          frequency_type: plan.frequency_type,
          transaction_amount: plan.price,
          currency_id: 'ARS',
          billing_day: plan.billing_day,
          repetitions: plan.repetitions,
          free_trial: {
            frequency: 0 // No free trial
          }
        },
        back_url: `${process.env.FRONTEND_URL}/perfil`,
        payment_methods_allowed: {
          payment_types: [
            { id: 'credit_card' },
            { id: 'debit_card' }
          ],
          payment_methods: []
        }
      };

      const response = await preApprovalPlan.create({ body: planData });
      
      res.json({
        success: true,
        plan: response,
        planType
      });
    } catch (error) {
      console.error('Error creating plan:', error);
      res.status(500).json({ 
        error: 'Failed to create subscription plan',
        details: error.message 
      });
    }
  },

  // Create subscription for a user
  async createSubscription(req, res) {
    try {
      const { planType, planId } = req.body;
      const userId = req.user.id;
      const userEmail = req.user.email;

      if (!PLANS[planType]) {
        return res.status(400).json({ error: 'Invalid plan type' });
      }

      // Check if user already has an active subscription
      const existingSubscription = await SubscriptionModel.getByUserId(userId);
      if (existingSubscription && existingSubscription.status === 'active') {
        return res.status(400).json({ 
          error: 'User already has an active subscription' 
        });
      }

      const plan = PLANS[planType];
      const now = new Date();
      const nextBilling = new Date(now);
      
      if (planType === 'monthly') {
        nextBilling.setMonth(nextBilling.getMonth() + 1);
      } else {
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      }

      // Create preapproval (subscription) in Mercado Pago
      const subscriptionData = {
        reason: plan.name,
        auto_recurring: {
          frequency: plan.frequency,
          frequency_type: plan.frequency_type,
          transaction_amount: plan.price,
          currency_id: 'ARS',
          start_date: now.toISOString(),
          end_date: planType === 'annual' 
            ? new Date(now.setFullYear(now.getFullYear() + 1)).toISOString()
            : undefined
        },
        back_url: `${process.env.FRONTEND_URL}/perfil?subscription=success`,
        payer_email: userEmail,
        status: 'pending',
        external_reference: userId
      };

      // If planId is provided, use it
      if (planId) {
        subscriptionData.preapproval_plan_id = planId;
      }

      const mpSubscription = await preApproval.create({ body: subscriptionData });

      // Save subscription to database
      await SubscriptionModel.upsert({
        user_id: userId,
        mp_preapproval_id: mpSubscription.id,
        plan_type: planType,
        status: 'pending',
        amount: plan.price,
        currency: 'ARS',
        start_date: now.toISOString(),
        next_billing_date: nextBilling.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      });

      res.json({
        success: true,
        subscription: mpSubscription,
        init_point: mpSubscription.init_point,
        sandbox_init_point: mpSubscription.sandbox_init_point
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ 
        error: 'Failed to create subscription',
        details: error.message 
      });
    }
  },

  // Get subscription status
  async getSubscriptionStatus(req, res) {
    try {
      const userId = req.params.userId || req.user.id;

      // Verify user can only access their own subscription
      if (userId !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const subscription = await SubscriptionModel.getByUserId(userId);

      if (!subscription) {
        return res.json({
          hasSubscription: false,
          isActive: false
        });
      }

      // Check if subscription is still active
      const isActive = await SubscriptionModel.isActive(userId);

      res.json({
        hasSubscription: true,
        isActive,
        subscription: {
          plan_type: subscription.plan_type,
          status: subscription.status,
          amount: subscription.amount,
          currency: subscription.currency,
          start_date: subscription.start_date,
          next_billing_date: subscription.next_billing_date,
          cancelled_at: subscription.cancelled_at
        }
      });
    } catch (error) {
      console.error('Error getting subscription status:', error);
      res.status(500).json({ 
        error: 'Failed to get subscription status',
        details: error.message 
      });
    }
  },

  // Cancel subscription
  async cancelSubscription(req, res) {
    try {
      const userId = req.user.id;

      const subscription = await SubscriptionModel.getByUserId(userId);

      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      if (subscription.status === 'cancelled') {
        return res.status(400).json({ error: 'Subscription already cancelled' });
      }

      // Cancel in Mercado Pago
      try {
        await preApproval.update({
          id: subscription.mp_preapproval_id,
          body: { status: 'cancelled' }
        });
      } catch (mpError) {
        console.error('Error cancelling in Mercado Pago:', mpError);
        // Continue anyway to update local database
      }

      // Update in database
      await SubscriptionModel.cancel(userId);

      res.json({
        success: true,
        message: 'Subscription cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ 
        error: 'Failed to cancel subscription',
        details: error.message 
      });
    }
  },

  // Get available plans
  async getPlans(req, res) {
    try {
      const plans = Object.entries(PLANS).map(([key, plan]) => ({
        id: key,
        name: plan.name,
        price: plan.price,
        currency: 'ARS',
        frequency: plan.frequency,
        frequency_type: plan.frequency_type,
        description: key === 'monthly' 
          ? 'Acceso premium con renovación mensual'
          : 'Acceso premium por un año completo con descuento'
      }));

      res.json({ plans });
    } catch (error) {
      console.error('Error getting plans:', error);
      res.status(500).json({ 
        error: 'Failed to get plans',
        details: error.message 
      });
    }
  }
};
