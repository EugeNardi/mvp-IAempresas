import React from 'react'
import { Bot, Clock, TrendingUp, Shield, Zap, Users } from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: Bot,
      title: 'IA Conversacional Avanzada',
      description: 'Chatbots inteligentes que entienden el contexto y responden de manera natural y precisa.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Clock,
      title: 'Disponibilidad 24/7',
      description: 'Tu asistente virtual nunca duerme. Atiende a tus clientes en cualquier momento del día.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Aumenta tus Ventas',
      description: 'Convierte más visitantes en clientes con respuestas rápidas y personalizadas.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Shield,
      title: 'Seguridad Garantizada',
      description: 'Protección de datos de nivel empresarial con encriptación end-to-end.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Zap,
      title: 'Integración Rápida',
      description: 'Implementación en menos de 48 horas. Compatible con todas las plataformas.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Users,
      title: 'Soporte Personalizado',
      description: 'Equipo dedicado para ayudarte en cada paso de la implementación.',
      color: 'from-indigo-500 to-purple-500',
    },
  ]

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-up">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
            Todo lo que necesitas para{' '}
            <span className="text-gradient">transformar tu negocio</span>
          </h2>
          <p className="text-xl text-gray-600">
            Soluciones completas de IA diseñadas específicamente para PyMEs que quieren crecer
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-black hover:shadow-2xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gray-700 flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Arrow */}
              <div className="mt-4 text-gray-900 font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Saber más →
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <a
            href="#contact"
            className="inline-flex items-center space-x-2 text-gray-900 font-semibold hover:text-gray-700 transition-colors"
          >
            <span>Ver todas las características</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default Features
