import { supabase } from '../utils/supabaseClient.js';

export const SubscriptionModel = {
  // Create or update subscription
  async upsert(subscriptionData) {
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get subscription by user ID
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  },

  // Get subscription by Mercado Pago preapproval ID
  async getByPreapprovalId(preapprovalId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('mp_preapproval_id', preapprovalId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Update subscription status
  async updateStatus(userId, status, metadata = {}) {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      ...metadata
    };

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Cancel subscription
  async cancel(userId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Check if subscription is active
  async isActive(userId) {
    const subscription = await this.getByUserId(userId);
    
    if (!subscription) return false;
    
    if (subscription.status !== 'active') return false;
    
    // Check if subscription has expired
    if (subscription.next_billing_date) {
      const nextBilling = new Date(subscription.next_billing_date);
      const now = new Date();
      if (now > nextBilling) {
        // Subscription expired, update status
        await this.updateStatus(userId, 'expired');
        return false;
      }
    }
    
    return true;
  }
};
