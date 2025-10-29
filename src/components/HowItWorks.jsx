import React from 'react'
import { MessageCircle, Settings, Rocket, BarChart } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: MessageCircle,
      title: 'Consulta Inicial',
      description: 'Analizamos tus necesidades y diseñamos una solución personalizada para tu negocio.',
      number: '01',
    },
    {
      icon: Settings,
      title: 'Configuración',
      description: 'Entrenamos la IA con tu información y la integramos a tus sistemas existentes.',
      number: '02',
    },
    {
      icon: Rocket,
      title: 'Lanzamiento',
      description: 'Desplegamos tu asistente virtual y lo ponemos en funcionamiento en menos de 48 horas.',
      number: '03',
    },
    {
      icon: BarChart,
      title: 'Optimización',
      description: 'Monitoreamos el rendimiento y optimizamos continuamente para mejores resultados.',
      number: '04',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-up">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
            Implementación{' '}
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent inline-block pb-2">simple y rápida</span>
          </h2>
          <p className="text-xl text-gray-600">
            En solo 4 pasos, tu negocio estará equipado con tecnología de IA de última generación
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2 -z-10"></div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 h-full">
                  {/* Number Badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mb-6">
                    <step.icon className="w-8 h-8 text-gray-900" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <div className="w-1 h-8 bg-gray-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-2 bg-gray-100 border border-gray-300 rounded-full px-6 py-3">
              <Rocket className="w-5 h-5 text-gray-900" />
              <span className="text-gray-900 font-medium">
              Implementación completa en menos de 48 horas
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
