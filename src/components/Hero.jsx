import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bot, MessageSquare, Zap } from 'lucide-react'

const Hero = () => {
  return (
    <section id="home" className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gray-200/40 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gray-300/40 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-gray-200/40 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center space-x-2 bg-gray-100 border border-gray-300 rounded-full px-4 py-2">
              <Zap className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">
                Transformación Digital con IA
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-gray-900">
              Potencia tu PyME con{' '}
              <span className="text-gradient">
                Inteligencia Artificial
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Implementamos soluciones de chat con IA personalizadas que automatizan 
              la atención al cliente, mejoran la experiencia del usuario y hacen crecer tu negocio.
            </p>
        </div>
      </div>
    </section>
  )
}

export default Hero
