import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CheckCircle, Mail, Sparkles } from 'lucide-react'
import Logo from '../components/common/Logo'

const VerifyEmail = () => {
  const navigate = useNavigate()

  // Simplemente mostrar mensaje de verificación pendiente
  // Supabase maneja la verificación automáticamente cuando el usuario hace click en el email

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <Logo size="md" />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Verifica tu email
            </h1>
            
            <p className="text-gray-600 mb-6">
              Te hemos enviado un correo de verificación. Por favor revisa tu bandeja de entrada y haz click en el enlace para activar tu cuenta.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm mb-2">
                <strong>Pasos a seguir:</strong>
              </p>
              <ol className="text-blue-800 text-sm text-left list-decimal list-inside space-y-1">
                <li>Revisa tu correo electrónico</li>
                <li>Haz click en el enlace de verificación</li>
                <li>Inicia sesión y disfruta 21 días gratis</li>
              </ol>
            </div>

            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-gray-900 text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                Ir al inicio de sesión
              </Link>
              
              <Link
                to="/"
                className="block w-full bg-gray-100 text-gray-900 py-2.5 rounded-md font-medium hover:bg-gray-200 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              ¿No recibiste el correo? Revisa tu carpeta de spam o correo no deseado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
