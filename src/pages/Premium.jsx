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
    if (!user) {
      navigate('/login', { state: { from: '/premium' } });
      return;
    }

    // Redirect to checkout page
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
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg">
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5"></div>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full px-3 sm:px-4 py-1.5 mb-4 sm:mb-5 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs text-cyan-400 font-semibold tracking-wide">DESBLOQUEA TODO EL POTENCIAL</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            Hazte{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient">
              Premium
            </span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isAnnual = plan.id === 'annual';
            
            return (
              <div
                key={plan.id}
                className={`relative group bg-gradient-to-br from-dark-card to-dark-bg border-2 rounded-2xl p-4 sm:p-6 lg:p-7 transition-all duration-300 hover:scale-[1.02] ${
                  isAnnual
                    ? 'border-cyan-500/60 shadow-2xl shadow-cyan-500/30 ring-2 ring-cyan-500/20'
                    : 'border-dark-border hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10'
                }`}
              >
                {/* Popular Badge */}
                {isAnnual && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white text-xs font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg animate-pulse">
                      ⭐ MÁS POPULAR
                    </div>
                  </div>
                )}

                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isAnnual ? 'bg-gradient-to-br from-cyan-500/5 to-blue-500/5' : 'bg-gradient-to-br from-cyan-500/3 to-blue-500/3'
                }`}></div>

                <div className="relative text-center mb-5">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl mb-4 ${
                    isAnnual 
                      ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 shadow-lg shadow-cyan-500/20' 
                      : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20'
                  }`}>
                    {isAnnual ? (
                      <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
                    ) : (
                      <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
                    )}
                  </div>
                  
                  {/* Plan Name */}
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-4 tracking-tight">
                    {plan.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        {formatPrice(plan.price).split(',')[0]}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-400 font-medium">
                      {plan.frequency_type === 'months' && plan.frequency === 1 ? 'por mes' : 'por año'}
                    </p>
                  </div>

                  {/* Savings Badge */}
                  {isAnnual && (
                    <div className="inline-block bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/20 rounded-full px-3 sm:px-4 py-1.5 mb-3">
                      <p className="text-xs sm:text-sm text-green-400 font-bold">
                        💰 Ahorrás {formatPrice(12000 * 12 - 120000)} al año
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs sm:text-sm text-gray-400 mt-3 leading-relaxed px-2">
                    {plan.description}
                  </p>
                </div>

                {/* Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`relative w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 mb-5 overflow-hidden group ${
                    isAnnual
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-[1.02]'
                      : 'bg-gradient-to-r from-dark-hover to-dark-border text-white hover:from-cyan-500/20 hover:to-blue-500/20 hover:shadow-xl hover:shadow-cyan-500/20 hover:scale-[1.02]'
                  } flex items-center justify-center gap-2`}
                >
                  <span className={`absolute inset-0 ${isAnnual ? 'bg-white/20' : 'bg-cyan-500/10'} translate-y-full group-hover:translate-y-0 transition-transform duration-300`}></span>
                  <span className="relative flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Suscribirme ahora
                  </span>
                </button>

                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-cyan-500/5 transition-colors">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-cyan-400" />
                      </div>
                      <span className="text-gray-300 text-xs sm:text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info with Mercado Pago Logo */}
        <div className="mt-6 sm:mt-8 lg:mt-10">
          {/* Trust Badges */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex items-center gap-2 sm:gap-3 bg-dark-card border border-dark-border rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow-lg">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" rx="20" fill="#009EE3"/>
                  <path d="M30 50L45 65L70 35" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="text-left">
                  <p className="text-white font-bold text-xs sm:text-sm">Pago 100% Seguro</p>
                  <p className="text-gray-400 text-xs">Procesado por</p>
                </div>
              </div>
              <div className="h-10 w-px bg-dark-border mx-1 sm:mx-2"></div>
              <svg className="h-6 sm:h-8" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="35" fill="#009EE3" fontSize="28" fontWeight="bold" fontFamily="Arial, sans-serif">
                  Mercado
                </text>
                <text x="0" y="50" fill="#FFD700" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">
                  Pago
                </text>
              </svg>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-green-400" />
                <span>Tarjetas de crédito y débito</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-green-400" />
                <span>Renovación automática</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-green-400" />
                <span>Cancela cuando quieras</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 max-w-2xl mx-auto px-4">
              Puedes cancelar tu suscripción en cualquier momento. Sin compromisos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
