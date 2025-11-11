import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, Sparkles, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const token = searchParams.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!token) {
      setError('Token de recuperación no encontrado')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(data.error || 'Error al restablecer la contraseña')
      }
    } catch (error) {
      setError('Error de conexión. Por favor intenta nuevamente.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Token no válido
            </h1>
            <p className="text-gray-600 mb-6">
              El enlace de recuperación no es válido o ha expirado.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block w-full bg-gray-900 text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-2 group mb-6">
            <div className="w-10 h-10 bg-gray-900 rounded-md flex items-center justify-center group-hover:bg-gray-800 transition-colors">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Sistema de Gestión</span>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Nueva contraseña</h1>
          <p className="text-sm text-gray-600">
            Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-400 text-sm font-medium mb-1">
                  ¡Contraseña actualizada!
                </p>
                <p className="text-green-400 text-sm">
                  Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión...
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gray-900 text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Actualizando...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Contraseña actualizada</span>
                </>
              ) : (
                <span>Restablecer contraseña</span>
              )}
            </button>
          </form>

          {/* Security Tips */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm font-medium mb-2">
              💡 Consejos de seguridad:
            </p>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>• Usa una combinación de letras, números y símbolos</li>
              <li>• No uses la misma contraseña en otros sitios</li>
              <li>• Evita información personal fácil de adivinar</li>
            </ul>
          </div>
        </div>

        {/* Links */}
        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
            ¿Recordaste tu contraseña? <span className="font-semibold">Inicia sesión</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
