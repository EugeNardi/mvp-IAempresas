import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div className="text-center md:text-left">
            <a href="#home" className="inline-flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Gestionar</span>
            </a>
            <p className="text-gray-400 text-sm max-w-xs">
              Sistema de gestión empresarial con inteligencia artificial.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 text-center md:text-left">
            <h3 className="text-sm font-semibold text-white mb-3">Contacto</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm justify-center md:justify-start">
                <Phone className="w-4 h-4" />
                <span>Eugenio: +54 9 3467 41-2501</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm justify-center md:justify-start">
                <Phone className="w-4 h-4" />
                <span>Franco: +54 9 3515 63-7053</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm justify-center md:justify-start">
                <Phone className="w-4 h-4" />
                <span>Ignacio: +54 9 3472 58-7090</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm justify-center md:justify-start">
                <MapPin className="w-4 h-4" />
                <span>Córdoba, Argentina</span>
              </div>
            </div>
          </div>

          {/* Legal Links - Abajo a la derecha */}
          <div className="space-y-3 text-center md:text-right">
            <h3 className="text-sm font-semibold text-white mb-3">Legal</h3>
            <div className="space-y-2">
              <Link to="/terminos" className="block text-gray-400 text-sm hover:text-white transition-colors">
                Términos y Condiciones
              </Link>
              <Link to="/instrucciones" className="block text-gray-400 text-sm hover:text-white transition-colors">
                Instrucciones de Uso
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Gestionar. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
