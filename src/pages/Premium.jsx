import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Zap, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPlans, getSubscriptionStatus } from '../services/subscriptionService';

const Premium = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
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

  const handleSubscribe = (planType) => {
    // Allow payment even without user logged in
    // If not logged in, they'll register during checkout
    navigate(`/checkout?plan=${planType}`);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-900 animate-spin" />
      </div>
    );
  }

  // If user already has active subscription
  if (subscriptionStatus?.isActive) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-24">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <Crown className="w-16 h-16 text-gray-900 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              ¡Ya eres Premium!
            </h2>
            <p className="text-gray-600 mb-6">
              Disfruta de todas las funcionalidades exclusivas
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Ir al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-cyan-100">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-medium text-cyan-700">PLANES PREMIUM</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Elige tu plan
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Accede a funcionalidades exclusivas y lleva tu negocio al siguiente nivel
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
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isAnnual = plan.id === 'annual';
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white border-2 rounded-lg p-8 transition-all ${
                  isAnnual
                    ? 'border-cyan-400 shadow-lg shadow-cyan-100'
                    : 'border-gray-200 hover:border-cyan-200 hover:shadow-md'
                }`}
              >
                {/* Popular Badge */}
                {isAnnual && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-medium px-4 py-1 rounded-full shadow-md">
                      Más popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-gray-900">
                        {formatPrice(plan.price).split(',')[0]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {plan.frequency_type === 'months' && plan.frequency === 1 ? 'por mes' : 'por año'}
                    </p>
                  </div>

                  {/* Savings Badge */}
                  {isAnnual && (
                    <div className="inline-block bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-4">
                      <p className="text-sm text-green-700 font-medium">
                        Ahorrás {formatPrice(12000 * 12 - 120000)} al año
                      </p>
                    </div>
                  )}
                </div>

                {/* Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-3 rounded-md font-medium text-sm transition-all mb-6 ${
                    isAnnual
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-md hover:shadow-lg'
                      : 'bg-white text-gray-900 border-2 border-cyan-400 hover:bg-cyan-50'
                  }`}
                >
                  Prueba 7 días gratis
                </button>

                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-2 mb-6">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#00B1EA"/>
              <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="#009EE3"/>
            </svg>
            <span className="text-sm font-medium text-cyan-700">Pago seguro procesado por Mercado Pago</span>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-500" />
              <span>Cancela cuando quieras</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-500" />
              <span>Renovación automática</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-500" />
              <span>Sin registro previo necesario</span>
            </div>
          </div>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="mt-8 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Volver {user ? 'al dashboard' : 'al inicio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Premium;
