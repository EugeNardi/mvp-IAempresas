import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Lock, Crown, Calendar } from 'lucide-react'

const TrialCheck = ({ children }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trialStatus, setTrialStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkTrialStatus()
  }, [user])

  const checkTrialStatus = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('trial_ends_at, is_premium')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (profile) {
        const now = new Date()
        const trialEnds = new Date(profile.trial_ends_at)
        const isExpired = now > trialEnds
        const isPremium = profile.is_premium

        setTrialStatus({
          isExpired,
          isPremium,
          trialEnds,
          daysLeft: Math.max(0, Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24)))
        })
      }
    } catch (error) {
      console.error('Error checking trial:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Si es premium o la prueba no ha expirado, mostrar contenido
  if (!trialStatus || trialStatus.isPremium || !trialStatus.isExpired) {
    return <>{children}</>
  }

  // Si la prueba expiró, mostrar pantalla de bloqueo
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full mb-6">
            <Lock className="w-10 h-10 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Prueba Gratuita Finalizada
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            Tu período de prueba de 21 días ha finalizado. Para continuar usando Gestionar y acceder a todas las funcionalidades, suscríbete a un plan premium.
          </p>

          {/* Trial Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
              <Calendar className="w-4 h-4" />
              <span>Prueba finalizada el:</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {trialStatus.trialEnds.toLocaleDateString('es-AR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>

          {/* Benefits */}
          <div className="text-left mb-6 space-y-2">
            <p className="text-sm font-semibold text-gray-900 mb-3">Con el plan premium obtienes:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Acceso ilimitado a todas las funcionalidades</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Análisis avanzado con IA</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Proyecciones financieras automáticas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Soporte prioritario</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/premium')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              <Crown className="w-5 h-5" />
              Ver Planes Premium
            </button>
            
            <button
              onClick={() => {
                supabase.auth.signOut()
                navigate('/login')
              }}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrialCheck
