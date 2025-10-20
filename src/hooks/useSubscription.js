import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSubscriptionStatus } from '../services/subscriptionService';

/**
 * Custom hook to manage subscription status
 * @returns {Object} Subscription state and utilities
 */
export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setSubscription(null);
      setIsLoading(false);
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSubscriptionStatus();
      setSubscription(data);
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError(err.message);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    if (user) {
      loadSubscription();
    }
  };

  return {
    subscription,
    isLoading,
    error,
    isPremium: subscription?.isActive || false,
    hasSubscription: subscription?.hasSubscription || false,
    refresh
  };
};

export default useSubscription;
