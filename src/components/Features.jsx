import React, { useState } from 'react'
import { Bot, Clock, TrendingUp, Shield, Zap, Users, X } from 'lucide-react'

const Features = () => {
  const [selectedFeature, setSelectedFeature] = useState(null)
  const features = [
    {
      icon: Bot,
      title: 'IA Conversacional Avanzada',
      description: 'Chatbots inteligentes que entienden el contexto y responden de manera natural y precisa.',
      color: 'from-blue-500 to-blue-700',
      details: 'Nuestro sistema utiliza modelos de lenguaje de última generación (GPT-4) para comprender consultas complejas y proporcionar respuestas contextuales. Incluye procesamiento de lenguaje natural, análisis de sentimientos, y capacidad de aprendizaje continuo para mejorar con cada interacción.'
    },
    {
      icon: Clock,
      title: 'Disponibilidad 24/7',
      description: 'Tu asistente virtual nunca duerme. Atiende a tus clientes en cualquier momento del día.',
      color: 'from-purple-500 to-pink-500',
      details: 'Sistema de alta disponibilidad con 99.9% de uptime garantizado. Responde instantáneamente a consultas en cualquier horario, incluyendo fines de semana y feriados. Ideal para negocios con clientes en diferentes zonas horarias o que requieren atención fuera del horario laboral.'
    },
    {
      icon: TrendingUp,
      title: 'Aumenta tus Ventas',
      description: 'Convierte más visitantes en clientes con respuestas rápidas y personalizadas.',
      color: 'from-green-500 to-emerald-500',
      details: 'Incrementa tu tasa de conversión hasta un 40% con respuestas inmediatas y personalizadas. El sistema identifica oportunidades de venta, recomienda productos basándose en el historial del cliente, y guía a los usuarios a través del proceso de compra de manera natural y efectiva.'
    },
    {
      icon: Shield,
      title: 'Seguridad Garantizada',
      description: 'Protección de datos de nivel empresarial con encriptación end-to-end.',
      color: 'from-orange-500 to-red-500',
      details: 'Cumplimos con los estándares más altos de seguridad: encriptación AES-256, certificación ISO 27001, cumplimiento GDPR y protección de datos personales. Todos los datos se almacenan en servidores seguros con backups automáticos y auditorías de seguridad regulares.'
    },
    {
      icon: Zap,
      title: 'Integración Rápida',
      description: 'Implementación en menos de 48 horas. Compatible con todas las plataformas.',
      color: 'from-yellow-500 to-orange-500',
      details: 'Proceso de integración simplificado con APIs REST y webhooks. Compatible con WordPress, Shopify, WooCommerce, Mercado Libre, redes sociales (WhatsApp, Facebook, Instagram) y sistemas personalizados. Incluye documentación completa y soporte técnico durante la implementación.'
    },
    {
      icon: Users,
      title: 'Soporte Personalizado',
      description: 'Equipo dedicado para ayudarte en cada paso de la implementación.',
      color: 'from-indigo-500 to-purple-500',
      details: 'Asignamos un Customer Success Manager dedicado a tu cuenta. Incluye: onboarding personalizado, capacitación del equipo, soporte técnico prioritario vía chat/email/teléfono, y sesiones mensuales de optimización para maximizar el retorno de tu inversión.'
    },
  ]

  return (
    <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 animate-slide-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 sm:mb-6 text-gray-900 leading-tight px-2">
            Todo lo que necesitas para{' '}
            <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent inline-block pb-1 sm:pb-2">transformar tu negocio</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2">
            Soluciones completas de IA diseñadas específicamente para PyMÉs que quieren crecer
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-7 sm:p-8 border border-gray-200 hover:border-gray-900 hover:shadow-2xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gray-900 flex items-center justify-center mb-5 transform group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3">
                <span className="bg-gradient-to-r from-gray-900 to-cyan-600 bg-clip-text text-transparent">
                  {feature.title}
                </span>
              </h3>
              <p className="text-base text-gray-600 leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Button - Visible en móvil */}
              <button
                onClick={() => setSelectedFeature(feature)}
                className="text-base text-blue-600 font-medium opacity-100 sm:opacity-0 group-hover:opacity-100 transform translate-y-0 sm:translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:text-blue-700"
              >
                Saber más →
              </button>
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

      {/* Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedFeature(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-3 sm:gap-4 flex-1">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${selectedFeature.color} flex items-center justify-center flex-shrink-0`}>
                  <selectedFeature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedFeature.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedFeature.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-base text-gray-700 leading-relaxed">{selectedFeature.details}</p>
            </div>
            <div className="mt-6 sm:mt-8 flex justify-end">
              <button
                onClick={() => setSelectedFeature(null)}
                className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Features
