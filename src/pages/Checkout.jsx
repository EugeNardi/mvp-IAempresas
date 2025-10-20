import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  Check, 
  Loader2,
  Crown,
  Zap,
  Lock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createSubscription } from '../services/subscriptionService';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const planType = searchParams.get('plan');
  
  // Plan details
  const planDetails = {
    monthly: {
      name: 'Premium Mensual',
      price: 12000,
      period: 'mes',
      icon: Zap,
      features: [
        'Acceso ilimitado al chat con IA',
        'Análisis avanzado de documentos',
        'Exportación de datos',
        'Soporte prioritario 24/7',
        'Historial ilimitado',
        'Actualizaciones primero'
      ]
    },
    annual: {
      name: 'Premium Anual',
      price: 120000,
      period: 'año',
      icon: Crown,
      savings: 24000,
      features: [
        'Todo lo del plan mensual',
        'Ahorro de $24,000 al año',
        'Integraciones personalizadas',
        'Dashboard con métricas avanzadas',
        'Soporte VIP',
        'Acceso anticipado a nuevas funciones'
      ]
    }
  };

  const plan = planDetails[planType];

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/checkout?plan=${planType}` } });
      return;
    }

    if (!planType || !plan) {
      navigate('/premium');
    }
  }, [user, planType, plan, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await createSubscription(planType);
      
      // Redirect to Mercado Pago
      if (result.init_point) {
        window.location.href = result.init_point;
      } else if (result.sandbox_init_point) {
        window.location.href = result.sandbox_init_point;
      } else {
        throw new Error('No se recibió URL de pago');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error al procesar el pago');
      setLoading(false);
    }
  };

  if (!plan) {
    return null;
  }

  const Icon = plan.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <button
            onClick={() => navigate('/premium')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Volver a planes</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Plan Details */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                Confirmar Suscripción
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm">
                Revisa los detalles de tu plan antes de continuar
              </p>
            </div>

            {/* Plan Card */}
            <div className="bg-gradient-to-br from-dark-card to-dark-bg border-2 border-cyan-500/40 rounded-xl p-4 sm:p-6 shadow-xl shadow-cyan-500/10">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5">
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    Renovación automática cada {plan.period}
                  </p>
                </div>
              </div>

              <div className="border-t border-dark-border pt-4 mb-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-gray-400 text-xs sm:text-sm">Precio</span>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">/ {plan.period}</span>
                  </div>
                </div>
                
                {plan.savings && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 mt-3">
                    <p className="text-green-400 text-xs sm:text-sm font-semibold text-center">
                      💰 Ahorras {formatPrice(plan.savings)} al año
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-white font-semibold text-xs sm:text-sm mb-2">
                  Incluye:
                </p>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center mt-0.5">
                      <Check className="w-2.5 h-2.5 text-cyan-400" />
                    </div>
                    <span className="text-gray-300 text-xs sm:text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-semibold text-xs sm:text-sm mb-0.5">
                    Pago 100% Seguro
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Protegido con encriptación bancaria. Procesado por Mercado Pago.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Confirmation */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <div className="bg-dark-card border border-dark-border rounded-xl p-4 sm:p-6 shadow-xl">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                Resumen del Pedido
              </h2>

              {/* User Info */}
              <div className="bg-dark-bg rounded-lg p-3 mb-4">
                <p className="text-gray-400 text-xs mb-0.5">Cuenta</p>
                <p className="text-white font-semibold text-xs sm:text-sm">{user?.email}</p>
              </div>

              {/* Price Summary */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs sm:text-sm">Subtotal</span>
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    {formatPrice(plan.price)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs sm:text-sm">Impuestos</span>
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    Incluidos
                  </span>
                </div>
                <div className="border-t border-dark-border pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-sm sm:text-base">Total</span>
                    <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      {formatPrice(plan.price)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5 text-right">
                    por {plan.period}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3 group hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                    Proceder al Pago Seguro
                  </>
                )}
              </button>

              {/* Mercado Pago Logo */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-gray-400 text-xs">Procesado por</span>
                <svg className="h-5 sm:h-6" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="0" y="35" fill="#009EE3" fontSize="28" fontWeight="bold" fontFamily="Arial, sans-serif">
                    Mercado
                  </text>
                  <text x="0" y="50" fill="#FFD700" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">
                    Pago
                  </text>
                </svg>
              </div>

              {/* Payment Methods */}
              <div className="border-t border-dark-border pt-4">
                <p className="text-gray-400 text-xs mb-2 text-center">
                  Métodos de pago aceptados
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <div className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3 text-cyan-400" />
                    <span className="text-white text-xs font-medium">Crédito</span>
                  </div>
                  <div className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3 text-blue-400" />
                    <span className="text-white text-xs font-medium">Débito</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <p className="text-gray-500 text-xs text-center mt-4 leading-relaxed">
                Al continuar, aceptas la renovación automática. Cancela cuando quieras.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
