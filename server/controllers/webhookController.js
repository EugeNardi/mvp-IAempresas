import { preApproval, payment } from '../utils/mercadoPagoClient.js';
import { SubscriptionModel } from '../models/subscriptionModel.js';

export const WebhookController = {
  // Handle Mercado Pago webhook notifications
  async handleWebhook(req, res) {
    try {
      // Respond immediately to Mercado Pago
      res.status(200).send('OK');

      const { type, data, action } = req.body;

      console.log('Webhook received:', { type, action, data });

      // Handle different notification types
      switch (type) {
        case 'subscription_preapproval':
          await handleSubscriptionNotification(data.id, action);
          break;
        
        case 'subscription_authorized_payment':
          await handlePaymentNotification(data.id);
          break;
        
        case 'subscription_preapproval_plan':
          console.log('Plan notification received:', data);
          break;
        
        default:
          console.log('Unhandled webhook type:', type);
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      // Don't send error to Mercado Pago, already responded with 200
    }
  }
};

// Handle subscription status changes
async function handleSubscriptionNotification(preapprovalId, action) {
  try {
    // Get subscription details from Mercado Pago
    const mpSubscription = await preApproval.get({ id: preapprovalId });
    
    const subscription = await SubscriptionModel.getByPreapprovalId(preapprovalId);
    
    if (!subscription) {
      console.error('Subscription not found in database:', preapprovalId);
      return;
    }

    const userId = subscription.user_id;
    let newStatus = mpSubscription.status;
    const metadata = {};

    // Map Mercado Pago status to our status
    switch (action) {
      case 'created':
        newStatus = 'pending';
        break;
      
      case 'updated':
        newStatus = mpSubscription.status;
        break;
      
      case 'authorized':
        newStatus = 'active';
        metadata.activated_at = new Date().toISOString();
        
        // Calculate next billing date
        const now = new Date();
        const nextBilling = new Date(now);
        if (subscription.plan_type === 'monthly') {
          nextBilling.setMonth(nextBilling.getMonth() + 1);
        } else {
          nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        }
        metadata.next_billing_date = nextBilling.toISOString();
        break;
      
      case 'cancelled':
        newStatus = 'cancelled';
        metadata.cancelled_at = new Date().toISOString();
        break;
      
      case 'paused':
        newStatus = 'paused';
        break;
      
      case 'finished':
        newStatus = 'expired';
        break;
      
      default:
        console.log('Unhandled subscription action:', action);
    }

    // Update subscription in database
    await SubscriptionModel.updateStatus(userId, newStatus, metadata);
    
    console.log(`Subscription ${preapprovalId} updated to ${newStatus}`);
  } catch (error) {
    console.error('Error handling subscription notification:', error);
  }
}

// Handle payment notifications
async function handlePaymentNotification(paymentId) {
  try {
    // Get payment details from Mercado Pago
    const mpPayment = await payment.get({ id: paymentId });
    
    console.log('Payment notification:', {
      id: paymentId,
      status: mpPayment.status,
      preapproval_id: mpPayment.preapproval_id
    });

    if (!mpPayment.preapproval_id) {
      console.log('Payment not associated with subscription');
      return;
    }

    const subscription = await SubscriptionModel.getByPreapprovalId(
      mpPayment.preapproval_id
    );

    if (!subscription) {
      console.error('Subscription not found for payment:', paymentId);
      return;
    }

    const userId = subscription.user_id;
    const metadata = {
      last_payment_id: paymentId,
      last_payment_status: mpPayment.status,
      last_payment_date: new Date().toISOString()
    };

    // Update subscription based on payment status
    switch (mpPayment.status) {
      case 'approved':
        // Payment successful, ensure subscription is active
        metadata.status = 'active';
        
        // Update next billing date
        const now = new Date();
        const nextBilling = new Date(now);
        if (subscription.plan_type === 'monthly') {
          nextBilling.setMonth(nextBilling.getMonth() + 1);
        } else {
          nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        }
        metadata.next_billing_date = nextBilling.toISOString();
        
        await SubscriptionModel.updateStatus(userId, 'active', metadata);
        console.log(`Payment approved for subscription ${subscription.mp_preapproval_id}`);
        break;
      
      case 'rejected':
      case 'cancelled':
        // Payment failed
        metadata.status = 'payment_failed';
        await SubscriptionModel.updateStatus(userId, 'payment_failed', metadata);
        console.log(`Payment failed for subscription ${subscription.mp_preapproval_id}`);
        break;
      
      case 'pending':
      case 'in_process':
        // Payment pending
        metadata.status = 'pending';
        await SubscriptionModel.updateStatus(userId, 'pending', metadata);
        break;
      
      default:
        console.log('Unhandled payment status:', mpPayment.status);
    }
  } catch (error) {
    console.error('Error handling payment notification:', error);
  }
}
