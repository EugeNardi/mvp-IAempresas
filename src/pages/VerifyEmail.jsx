import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  const token = searchParams.get('token')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Token de verificación no encontrado')
        return
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message || 'Email verificado exitosamente')
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            navigate('/login')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Error al verificar el email')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Error de conexión. Por favor intenta nuevamente.')
        console.error('Error:', error)
      }
    }

    verifyEmail()
  }, [token, navigate])

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
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-center">
            {status === 'verifying' && (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Verificando tu email
                </h1>
                <p className="text-gray-600">
                  Por favor espera mientras verificamos tu cuenta...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  ¡Email verificado!
                </h1>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800 text-sm">
                    Tu cuenta ha sido activada exitosamente. Serás redirigido al inicio de sesión en unos segundos...
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-block w-full bg-gray-900 text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors"
                >
                  Ir al inicio de sesión
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  Error en la verificación
                </h1>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 text-sm">
                    El enlace puede haber expirado o ya fue utilizado. Si necesitas un nuevo enlace de verificación, por favor contacta a soporte.
                  </p>
                </div>
                <div className="space-y-3">
                  <Link
                    to="/register"
                    className="block w-full bg-gray-900 text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors"
                  >
                    Registrarse nuevamente
                  </Link>
                  <Link
                    to="/"
                    className="block w-full bg-gray-100 text-gray-900 py-2.5 rounded-md font-medium hover:bg-gray-200 transition-colors"
                  >
                    Volver al inicio
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
