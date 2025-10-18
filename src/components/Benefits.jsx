import React from 'react'
import { Check, TrendingUp, DollarSign, Users, Clock } from 'lucide-react'

const Benefits = () => {
  const benefits = [
    'Reduce costos operativos hasta un 60%',
    'Aumenta la satisfacción del cliente',
    'Respuestas instantáneas 24/7',
    'Escala sin contratar más personal',
    'Integración con tus sistemas actuales',
    'Análisis y reportes en tiempo real',
  ]


  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Resultados que{' '}
              <span className="text-gradient">transforman negocios</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Nuestras soluciones de IA no solo automatizan procesos, sino que impulsan 
              el crecimiento real de tu empresa con resultados medibles.
            </p>

            {/* Benefits List */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 text-lg">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <a
                href="#contact"
                className="inline-flex items-center space-x-2 bg-gray-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-600 hover:scale-105 transition-all duration-300"
              >
                <span>Solicitar Demo Gratuita</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Right Content - Image Placeholder */}
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-xl">
              <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-600 font-medium">Resultados Medibles</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Benefits
