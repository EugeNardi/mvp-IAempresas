import React, { useState } from 'react'
import { Mail, MapPin, Send, CheckCircle } from 'lucide-react'

const CTA = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate form submission
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', company: '', message: '' })
    }, 3000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
              ¿Listo para{' '}
              <span className="text-gradient">transformar tu negocio?</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Agenda una consulta gratuita y descubre cómo la IA puede llevar tu PyME al siguiente nivel.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-semibold text-gray-900">euge060406@gmail.com</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Ubicación</div>
                  <div className="font-semibold text-gray-900">Córdoba, Córdoba, Argentina</div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Lo que incluye tu consulta:</h3>
              <ul className="space-y-2">
                {[
                  'Análisis personalizado de tu negocio',
                  'Propuesta de solución a medida',
                  'Estimación de ROI y beneficios',
                  'Demo en vivo de la tecnología',
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-2 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Content - Form */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 shadow-2xl">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email corporativo
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                      placeholder="juan@empresa.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                      placeholder="Mi Empresa S.A."
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Cuéntanos sobre tu proyecto
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all resize-none"
                      placeholder="Describe brevemente tus necesidades..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gray-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-600 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Solicitar Consulta Gratuita</span>
                    <Send className="w-5 h-5" />
                  </button>

                  <p className="text-sm text-gray-500 text-center">
                    Responderemos en menos de 24 horas
                  </p>
                </form>
              ) : (
                <div className="text-center py-12 animate-fade-in">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    ¡Mensaje enviado!
                  </h3>
                  <p className="text-gray-600">
                    Gracias por tu interés. Nos pondremos en contacto contigo pronto.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA
