import React from 'react';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

/**
 * Premium Badge Component
 * Shows premium status and allows navigation to premium page
 */
const PremiumBadge = ({ showUpgrade = true, className = '' }) => {
  const navigate = useNavigate();
  const { isPremium, isLoading } = useSubscription();

  if (isLoading) {
    return null;
  }

  if (isPremium) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full ${className}`}
      >
        <Crown className="w-4 h-4 text-yellow-500" />
        <span className="text-sm font-semibold text-yellow-500">Premium</span>
      </div>
    );
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/premium')}
      className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-full hover:border-cyan-500/50 transition-all ${className}`}
    >
      <Crown className="w-4 h-4 text-cyan-400" />
      <span className="text-sm font-semibold text-cyan-400">Hazte Premium</span>
    </button>
  );
};

export default PremiumBadge;
