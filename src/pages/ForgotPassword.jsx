import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Sparkles, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email) {
      setError('Por favor ingresa tu email')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setEmail('')
      } else {
        setError(data.error || 'Error al procesar la solicitud')
      }
    } catch (error) {
      setError('Error de conexión. Por favor intenta nuevamente.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Recuperar contraseña</h1>
          <p className="text-sm text-gray-600">
            Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
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
                  ¡Solicitud enviada!
                </p>
                <p className="text-green-400 text-sm">
                  Si el email existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <span>Enviar instrucciones</span>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>💡 Consejo:</strong> Revisa tu carpeta de spam si no recibes el email en unos minutos.
            </p>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio de sesión</span>
          </Link>
        </div>

        {/* Links */}
        <div className="text-center mt-6">
          <Link to="/register" className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
            ¿No tienes una cuenta? <span className="font-semibold">Regístrate</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
