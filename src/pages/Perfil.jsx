import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Crown, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSubscriptionStatus, cancelSubscription } from '../services/subscriptionService';

const Perfil = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSubscriptionStatus();
    
    // Check for success message from Mercado Pago redirect
    const subscriptionParam = searchParams.get('subscription');
    if (subscriptionParam === 'success') {
      setMessage({
        type: 'success',
        text: '¡Tu suscripción está activa! 🎉'
      });
      // Remove query param
      window.history.replaceState({}, '', '/perfil');
    }
  }, [searchParams]);

  const loadSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptionStatus();
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
      setMessage({
        type: 'error',
        text: 'Error al cargar la información de suscripción'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      await cancelSubscription();
      setMessage({
        type: 'success',
        text: 'Suscripción cancelada exitosamente'
      });
      setShowCancelConfirm(false);
      // Reload subscription status
      await loadSubscriptionStatus();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error al cancelar la suscripción'
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        icon: CheckCircle,
        text: 'Activo',
        className: 'bg-green-500/10 text-green-400 border-green-500/20'
      },
      pending: {
        icon: AlertCircle,
        text: 'Pendiente',
        className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      },
      cancelled: {
        icon: XCircle,
        text: 'Cancelado',
        className: 'bg-red-500/10 text-red-400 border-red-500/20'
      },
      expired: {
        icon: XCircle,
        text: 'Vencido',
        className: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
      },
      payment_failed: {
        icon: AlertCircle,
        text: 'Error de pago',
        className: 'bg-red-500/10 text-red-400 border-red-500/20'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.className}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{config.text}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-dark-hover hover:bg-dark-border text-gray-300 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* User Info Card */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            Información Personal
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-300">
              <Mail className="w-5 h-5 text-gray-400" />
              <span>{user?.email}</span>
            </div>
            
            {user?.user_metadata?.full_name && (
              <div className="flex items-center gap-3 text-gray-300">
                <User className="w-5 h-5 text-gray-400" />
                <span>{user.user_metadata.full_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Card */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Suscripción Premium
          </h2>

          {!subscription?.hasSubscription ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-500/10 rounded-full mb-4">
                <Crown className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 mb-4">No tienes una suscripción activa</p>
              <button
                onClick={() => navigate('/premium')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                Ver planes Premium
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Estado</label>
                {getStatusBadge(subscription.subscription.status)}
              </div>

              {/* Plan Type */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Plan</label>
                <div className="flex items-center gap-2 text-white">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">
                    {subscription.subscription.plan_type === 'monthly' ? 'Premium Mensual' : 'Premium Anual'}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Precio</label>
                <div className="flex items-center gap-2 text-white">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <span className="font-semibold">
                    {formatPrice(subscription.subscription.amount)} {subscription.subscription.currency}
                  </span>
                  <span className="text-gray-400 text-sm">
                    / {subscription.subscription.plan_type === 'monthly' ? 'mes' : 'año'}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Fecha de inicio</label>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>{formatDate(subscription.subscription.start_date)}</span>
                  </div>
                </div>

                {subscription.subscription.next_billing_date && subscription.isActive && (
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Próxima renovación</label>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>{formatDate(subscription.subscription.next_billing_date)}</span>
                    </div>
                  </div>
                )}

                {subscription.subscription.cancelled_at && (
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Fecha de cancelación</label>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>{formatDate(subscription.subscription.cancelled_at)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {subscription.isActive && (
                <div className="pt-4 border-t border-dark-border">
                  {!showCancelConfirm ? (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors"
                    >
                      Cancelar suscripción
                    </button>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <p className="text-red-400 mb-4">
                        ¿Estás seguro que deseas cancelar tu suscripción? Perderás acceso a todas las funcionalidades premium.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCancelSubscription}
                          disabled={cancelling}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                          Sí, cancelar
                        </button>
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          disabled={cancelling}
                          className="px-4 py-2 bg-dark-hover hover:bg-dark-border text-gray-300 rounded-lg transition-colors"
                        >
                          No, mantener
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reactivate if cancelled or expired */}
              {(subscription.subscription.status === 'cancelled' || 
                subscription.subscription.status === 'expired' ||
                subscription.subscription.status === 'payment_failed') && (
                <div className="pt-4 border-t border-dark-border">
                  <button
                    onClick={() => navigate('/premium')}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    Renovar suscripción
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;
