import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bot, MessageSquare, Zap } from 'lucide-react'

const Hero = () => {
  return (
    <section id="home" className="relative pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white shadow-inner">
      <div className="max-w-4xl mx-auto text-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 animate-fade-in hover:scale-105 transition-transform shadow-md hover:shadow-lg">
            <Zap className="w-4 h-4 text-cyan-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              Transformación Digital con IA
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900">
            Gestiona tu empresa con{' '}
            <span className="text-cyan-500 inline-block animate-pulse">
              Inteligencia Artificial
            </span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Sistema completo de gestión empresarial con análisis financiero automático, 
            inventario inteligente y reportes en tiempo real.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="group px-6 py-3 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-all hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-2"
            >
              <span>Comenzar Gratis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-all hover:scale-105 shadow-md hover:shadow-lg"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
