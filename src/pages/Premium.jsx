import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Zap, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPlans, createSubscription, getSubscriptionStatus } from '../services/subscriptionService';

const Premium = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [creatingSubscription, setCreatingSubscription] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, statusData] = await Promise.all([
        getPlans(),
        user ? getSubscriptionStatus() : Promise.resolve(null)
      ]);
      
      setPlans(plansData.plans || []);
      setSubscriptionStatus(statusData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los planes. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType) => {
    if (!user) {
      navigate('/login', { state: { from: '/premium' } });
      return;
    }

    try {
      setCreatingSubscription(planType);
      setError(null);

      const result = await createSubscription(planType);
      
      // Redirect to Mercado Pago checkout
      if (result.init_point) {
        window.location.href = result.init_point;
      } else if (result.sandbox_init_point) {
        // For testing in sandbox mode
        window.location.href = result.sandbox_init_point;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError(err.message || 'Error al crear la suscripción. Por favor, intenta nuevamente.');
      setCreatingSubscription(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const features = [
    'Acceso ilimitado al chat con IA',
    'Análisis avanzado de documentos',
    'Exportación de datos en múltiples formatos',
    'Soporte prioritario 24/7',
    'Historial ilimitado de conversaciones',
    'Integraciones personalizadas',
    'Dashboard con métricas avanzadas',
    'Actualizaciones y nuevas funciones primero'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  // If user already has active subscription
  if (subscriptionStatus?.isActive) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-8 text-center">
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">
              ¡Ya eres Premium! 🎉
            </h2>
            <p className="text-gray-400 mb-6">
              Disfruta de todas las funcionalidades exclusivas
            </p>
            <button
              onClick={() => navigate('/perfil')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Ver mi suscripción
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-gradient-to-b from-dark-card to-dark-bg border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-400 font-medium">Desbloquea todo el potencial</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Hazte <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Premium</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Accede a funcionalidades exclusivas y lleva tu negocio al siguiente nivel con IA
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isAnnual = plan.id === 'annual';
            const isCreating = creatingSubscription === plan.id;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-dark-card border rounded-2xl p-8 transition-all ${
                  isAnnual
                    ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/20 scale-105'
                    : 'border-dark-border hover:border-cyan-500/30'
                }`}
              >
                {isAnnual && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                      Más Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl mb-4">
                    {isAnnual ? (
                      <Crown className="w-8 h-8 text-cyan-400" />
                    ) : (
                      <Zap className="w-8 h-8 text-cyan-400" />
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-gray-400">
                      / {plan.frequency_type === 'months' && plan.frequency === 1 ? 'mes' : 'año'}
                    </span>
                  </div>

                  {isAnnual && (
                    <p className="text-sm text-green-400 font-medium">
                      Ahorrás {formatPrice(12000 * 12 - 120000)} al año
                    </p>
                  )}
                  
                  <p className="text-gray-400 text-sm mt-2">
                    {plan.description}
                  </p>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCreating}
                  className={`w-full py-4 rounded-xl font-semibold transition-all mb-8 ${
                    isAnnual
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50'
                      : 'bg-dark-hover text-white hover:bg-dark-border'
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Suscribirme ahora'
                  )}
                </button>

                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            Pago seguro procesado por Mercado Pago
          </p>
          <p className="text-sm text-gray-500">
            Puedes cancelar tu suscripción en cualquier momento desde tu perfil
          </p>
        </div>
      </div>
    </div>
  );
};

export default Premium;
