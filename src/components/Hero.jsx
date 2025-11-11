import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'

const Hero = () => {
  return (
    <section id="home" className="relative pt-20 sm:pt-28 pb-12 sm:pb-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="space-y-5 sm:space-y-7">
          <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-4 py-2 animate-fade-in hover:scale-105 transition-transform shadow-md">
            <Zap className="w-4 h-4 text-cyan-500" />
            <span className="text-sm font-medium text-gray-700">
              Transformación Digital con IA
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight px-2">
            Gestiona tu empresa con{' '}
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent inline-block pb-1 sm:pb-2">
              Inteligencia Artificial
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
            Sistema completo de gestión empresarial con análisis financiero automático, 
            inventario inteligente y reportes en tiempo real.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-6 px-2 max-w-md sm:max-w-none mx-auto">
            <Link
              to="/register"
              className="group w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-2 text-base"
            >
              <span>Comenzar Gratis</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-md text-center text-base"
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
