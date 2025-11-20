import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Loader2, CreditCard, Lock, Calendar, AlertCircle, X, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Premium = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Datos del plan
  const MONTHLY_PRICE = 14000;
  const TRIAL_DAYS = 21;
  
  // Form de pago
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Calcular fecha de fin de prueba
  const getTrialEndDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + TRIAL_DAYS);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Manejar cambio de número de tarjeta
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
      setCardData({ ...cardData, number: formatted });
    }
  };

  // Manejar cambio de vencimiento
  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      const formatted = value.length >= 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
      setCardData({ ...cardData, expiry: formatted });
    }
  };

  // Manejar cambio de CVV
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCardData({ ...cardData, cvv: value });
    }
  };

  // Validar formulario
  const validateForm = () => {
    if (cardData.number.replace(/\s/g, '').length !== 16) {
      setError('Número de tarjeta inválido');
      return false;
    }
    if (!cardData.name.trim()) {
      setError('Ingresa el nombre del titular');
      return false;
    }
    if (cardData.expiry.length !== 5) {
      setError('Fecha de vencimiento inválida');
      return false;
    }
    if (cardData.cvv.length !== 3) {
      setError('CVV inválido');
      return false;
    }
    return true;
  };

  // Procesar pago
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      // Simular procesamiento de pago (2 segundos)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la integración real con Mercado Pago
      // Por ahora, simulamos éxito
      
      // Guardar en localStorage que el usuario tiene prueba activa
      const trialData = {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        price: MONTHLY_PRICE,
        status: 'trial'
      };
      localStorage.setItem('subscription', JSON.stringify(trialData));
      
      setSuccess(true);
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Error al procesar el pago. Por favor, intenta nuevamente.');
      setProcessing(false);
    }
  };

  // Features del plan
  const features = [
    { text: 'Chat con IA especializada en ARCA 2025', icon: '🤖' },
    { text: 'Análisis automático de facturas y remitos', icon: '📄' },
    { text: 'Cálculo de impuestos (IVA, IIBB, Ganancias)', icon: '💰' },
    { text: 'Dashboard con métricas en tiempo real', icon: '📊' },
    { text: 'Gestión de inventario y stock', icon: '📦' },
    { text: 'Proyecciones financieras con IA', icon: '🔮' },
    { text: 'Exportación de reportes', icon: '📥' },
    { text: 'Soporte prioritario', icon: '💬' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-900 animate-spin" />
      </div>
    );
  }

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido a Premium!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu prueba gratuita de {TRIAL_DAYS} días ha comenzado. Disfruta de todas las funcionalidades.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>Primer cobro:</strong> {getTrialEndDate()}
            </p>
          </div>
          <Loader2 className="w-6 h-6 text-gray-900 animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-2">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver</span>
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gray-900 text-white rounded-full px-4 py-1.5 mb-4">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-semibold">PLAN PREMIUM</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
              Sistema de Gestión Empresarial
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Automatiza tu contabilidad y toma decisiones inteligentes con IA
            </p>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Columna Izquierda - Información del Plan */}
          <div>
            {/* Badge de prueba gratuita */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-900">{TRIAL_DAYS} días de prueba gratuita</h3>
                  <p className="text-sm text-green-700">Cancela cuando quieras</p>
                </div>
              </div>
              <p className="text-sm text-green-800">
                Acceso completo sin costo hasta el <strong>{getTrialEndDate()}</strong>
              </p>
            </div>

            {/* Precio */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">Plan Mensual</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-bold text-gray-900">
                    {formatPrice(MONTHLY_PRICE)}
                  </span>
                  <span className="text-xl text-gray-600">/mes</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Primer cobro el {getTrialEndDate()}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Incluye:</h4>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{feature.icon}</span>
                      <span className="text-sm text-gray-700 pt-1">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Garantías */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <Shield className="w-6 h-6 text-gray-900 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Pago seguro</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <Lock className="w-6 h-6 text-gray-900 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Datos encriptados</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <Check className="w-6 h-6 text-gray-900 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Sin permanencia</p>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Checkout */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Datos de pago</h3>
                  <p className="text-sm text-gray-600">Ingresa tu tarjeta de crédito</p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitPayment} className="space-y-5">
                {/* Número de tarjeta */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Número de tarjeta
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                      required
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {/* Nombre en la tarjeta */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nombre del titular
                  </label>
                  <input
                    type="text"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                    placeholder="JUAN PEREZ"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Vencimiento y CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Vencimiento
                    </label>
                    <input
                      type="text"
                      value={cardData.expiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/AA"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardData.cvv}
                      onChange={handleCvvChange}
                      placeholder="123"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Información importante */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Importante:</p>
                      <ul className="space-y-1 text-blue-800">
                        <li>• No se realizará ningún cobro hoy</li>
                        <li>• Primer cobro el {getTrialEndDate()}</li>
                        <li>• Si no pagas, tu cuenta se bloqueará automáticamente</li>
                        <li>• Puedes cancelar en cualquier momento</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botón de pago */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Procesando pago...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Comenzar prueba gratuita
                    </>
                  )}
                </button>

                {/* Seguridad */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Lock className="w-3 h-3" />
                  <span>Conexión segura SSL • Datos encriptados</span>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Al continuar, aceptas nuestros términos y condiciones
          </p>
          <div className="flex items-center justify-center gap-8 text-xs text-gray-500">
            <span>✓ Sin permanencia mínima</span>
            <span>✓ Cancela cuando quieras</span>
            <span>✓ Soporte 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
