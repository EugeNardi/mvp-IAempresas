import React from 'react';
import { Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

/**
 * Premium Feature Component
 * Wraps content that should only be accessible to premium users
 * Shows upgrade prompt if user is not premium
 */
const PremiumFeature = ({ 
  children, 
  fallback = null,
  showUpgradePrompt = true,
  featureName = 'Esta funcionalidad'
}) => {
  const navigate = useNavigate();
  const { isPremium, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-dark-bg/80 backdrop-blur-sm">
        <div className="text-center max-w-md p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-700/20 rounded-full mb-4">
            <Lock className="w-8 h-8 text-blue-500" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">
            Funcionalidad Premium
          </h3>
          
          <p className="text-gray-400 mb-6">
            {featureName} está disponible solo para usuarios Premium
          </p>

          <button
            onClick={() => navigate('/premium')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            <Crown className="w-5 h-5" />
            Ver Planes Premium
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Premium Gate Component
 * Simple gate that shows upgrade button if not premium
 */
export const PremiumGate = ({ children, message = 'Actualiza a Premium para acceder' }) => {
  const navigate = useNavigate();
  const { isPremium, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-700/20 rounded-full mb-4">
        <Crown className="w-8 h-8 text-blue-500" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">
        Contenido Premium
      </h3>
      
      <p className="text-gray-400 mb-6">
        {message}
      </p>

      <button
        onClick={() => navigate('/premium')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
      >
        <Crown className="w-5 h-5" />
        Hazte Premium
      </button>
    </div>
  );
};

export default PremiumFeature;
