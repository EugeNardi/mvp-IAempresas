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
        <div className="absolute inset-0 bg-gradient-to-r from-[#009EE3]/3 via-[#0077B5]/3 to-[#009EE3]/3"></div>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#009EE3]/8 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#0077B5]/8 rounded-full filter blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 bg-[#009EE3]/10 border border-[#009EE3]/20 rounded-full px-3 sm:px-4 py-1.5 mb-4 sm:mb-5 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#009EE3] animate-pulse" />
            <span className="text-xs text-[#009EE3] font-semibold tracking-wide">DESBLOQUEA TODO EL POTENCIAL</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight w-full flex items-center justify-center gap-2 sm:gap-3">
            <span>Hazte</span>
            <span className="bg-gradient-to-r from-[#009EE3] to-[#0077B5] bg-clip-text text-transparent">
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isAnnual = plan.id === 'annual';
            
            return (
              <div
                key={plan.id}
                className={`relative group bg-gradient-to-br from-dark-card to-dark-bg border-2 rounded-2xl p-4 sm:p-6 lg:p-7 transition-all duration-300 hover:scale-[1.02] w-full ${
                  isAnnual
                    ? 'border-[#009EE3]/40 shadow-2xl shadow-[#009EE3]/20 ring-2 ring-[#009EE3]/15'
                    : 'border-dark-border hover:border-[#009EE3]/30 hover:shadow-xl hover:shadow-[#009EE3]/10'
                }`}
              >
                {/* Popular Badge */}
                {isAnnual && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-xs font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg">
                      ⭐ MÁS POPULAR
                    </div>
                  </div>
                )}

                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isAnnual ? 'bg-gradient-to-br from-[#009EE3]/5 to-[#0077B5]/5' : 'bg-gradient-to-br from-[#009EE3]/3 to-[#0077B5]/3'
                }`}></div>

                <div className="relative text-center mb-5">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl mb-4 ${
                    isAnnual 
                      ? 'bg-gradient-to-br from-[#009EE3]/25 to-[#0077B5]/25 shadow-lg shadow-[#009EE3]/15' 
                      : 'bg-gradient-to-br from-[#009EE3]/15 to-[#0077B5]/15'
                  }`}>
                    {isAnnual ? (
                      <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-[#009EE3]" />
                    ) : (
                      <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-[#009EE3]" />
                    )}
                  </div>
                  
                  {/* Plan Name */}
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-4 tracking-tight">
                    {plan.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-4xl sm:text-5xl lg:text-6xl font-light bg-gradient-to-r from-[#009EE3] to-[#0077B5] bg-clip-text text-transparent">
                        {formatPrice(plan.price).split(',')[0]}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-400 font-normal">
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
                  className="relative w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 mb-5 overflow-hidden group bg-gradient-to-r from-[#009EE3] to-[#0077B5] text-white hover:shadow-2xl hover:shadow-[#009EE3]/30 hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Suscribirme ahora
                  </span>
                </button>

                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-[#009EE3]/5 transition-colors">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#009EE3]/15 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-[#009EE3]" />
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
          <div className="flex flex-col items-center gap-4 mb-6 px-2">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3 bg-dark-card border border-dark-border rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow-lg w-full max-w-md sm:max-w-none sm:w-auto">
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
              <div className="hidden sm:block h-10 w-px bg-dark-border mx-2"></div>
              {/* Mercado Pago Logo - Professional Version */}
              <div className="flex items-center justify-center">
                <svg className="h-7 sm:h-9 w-auto" viewBox="0 0 1000 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                  {/* Icon Background - Oval */}
                  <ellipse cx="150" cy="150" rx="140" ry="85" fill="#009EE3" transform="rotate(-12 150 150)"/>
                  <ellipse cx="150" cy="150" rx="140" ry="85" fill="#00C8FF" transform="rotate(-12 150 150)" opacity="0.4"/>
                  
                  {/* Handshake - Left Hand */}
                  <path d="M90 140 L90 120 Q90 110 100 110 L130 110" stroke="#001F5C" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M130 110 L130 145" stroke="#001F5C" strokeWidth="6" strokeLinecap="round"/>
                  
                  {/* Handshake - Right Hand */}
                  <path d="M210 140 L210 120 Q210 110 200 110 L170 110" stroke="#001F5C" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M170 110 L170 145" stroke="#001F5C" strokeWidth="6" strokeLinecap="round"/>
                  
                  {/* Handshake - Connection */}
                  <ellipse cx="150" cy="145" rx="25" ry="15" fill="white" opacity="0.9"/>
                  <circle cx="140" cy="145" r="5" fill="#001F5C"/>
                  <circle cx="150" cy="145" r="5" fill="#001F5C"/>
                  <circle cx="160" cy="145" r="5" fill="#001F5C"/>
                  
                  {/* Waves - Top */}
                  <path d="M40 80 Q80 70 120 80 Q160 90 200 80 Q240 70 260 80" stroke="#00C8FF" strokeWidth="4" fill="none" opacity="0.6"/>
                  
                  {/* Waves - Bottom */}
                  <path d="M40 220 Q80 210 120 220 Q160 230 200 220 Q240 210 260 220" stroke="#00C8FF" strokeWidth="4" fill="none" opacity="0.6"/>
                  
                  {/* Text: mercado */}
                  <text x="320" y="140" fill="#001F5C" fontSize="75" fontWeight="700" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" letterSpacing="-1">mercado</text>
                  
                  {/* Text: pago */}
                  <text x="320" y="215" fill="#001F5C" fontSize="75" fontWeight="700" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" letterSpacing="-1">pago</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-[#009EE3]" />
                <span>Tarjetas de crédito y débito</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-[#009EE3]" />
                <span>Renovación automática</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-[#009EE3]" />
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
