import React from 'react'
import { CheckCircle, ArrowRight } from 'lucide-react'

const DashboardPreview = () => {
  return (
    <section id="dashboard-preview" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 animate-slide-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-gray-900 px-2">
            Tu negocio en{' '}
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent inline-block pb-1 sm:pb-2">
              un solo lugar
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
            Dashboard profesional con toda la información que necesitas para tomar decisiones inteligentes
          </p>
        </div>

        {/* Dashboard Image - Full Width */}
        <div className="relative animate-fade-in">
          {/* Main container */}
          <div className="relative rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl border border-gray-200 bg-white">
            <img 
              src="/dashboard-preview.png" 
              alt="Dashboard de Gestión Empresarial - Sistema de Gestión con IA"
              className="w-full h-auto object-cover"
              loading="eager"
              fetchpriority="high"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          </div>

          {/* Floating badge */}
          <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 px-4">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
            <span className="text-center">Sistema en producción con clientes reales</span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 sm:mt-10 md:mt-12 animate-fade-in px-4">
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6">
            Únete a cientos de empresas que ya transformaron su gestión
          </p>
          <a
            href="/register"
            className="group inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg w-full sm:w-auto"
          >
            <span>Comenzar Ahora</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default DashboardPreview
