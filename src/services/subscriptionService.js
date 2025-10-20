import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const DEMO_MODE = !import.meta.env.VITE_API_URL; // Enable demo mode if API URL not configured

// Mock data for demo mode
const MOCK_PLANS = {
  plans: [
    {
      id: 'monthly',
      name: 'Premium Mensual',
      price: 12000,
      currency: 'ARS',
      frequency: 1,
      frequency_type: 'months',
      description: 'Acceso premium con renovación mensual'
    },
    {
      id: 'annual',
      name: 'Premium Anual',
      price: 120000,
      currency: 'ARS',
      frequency: 1,
      frequency_type: 'months',
      description: 'Acceso premium por un año completo con descuento'
    }
  ]
};

// Get auth token from Supabase
async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

// Get available subscription plans
export async function getPlans() {
  try {
    // Return mock data in demo mode
    if (DEMO_MODE) {
      return new Promise(resolve => setTimeout(() => resolve(MOCK_PLANS), 500));
    }
    
    const response = await fetch(`${API_URL}/subscriptions/plans`);
    if (!response.ok) throw new Error('Failed to fetch plans');
    return await response.json();
  } catch (error) {
    console.error('Error fetching plans:', error);
    // Fallback to mock data if API fails
    return MOCK_PLANS;
  }
}

// Create a new subscription
export async function createSubscription(planType, planId = null) {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/subscriptions/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ planType, planId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

// Get subscription status for current user
export async function getSubscriptionStatus() {
  try {
    // Return mock data in demo mode
    if (DEMO_MODE) {
      return new Promise(resolve => setTimeout(() => resolve({
        hasSubscription: false,
        isActive: false
      }), 500));
    }
    
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/subscriptions/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch subscription status');
    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    // Fallback to no subscription
    return { hasSubscription: false, isActive: false };
  }
}

// Cancel subscription
export async function cancelSubscription() {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/subscriptions/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to cancel subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}
