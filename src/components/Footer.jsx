import React from 'react'
import { Sparkles, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
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
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white mb-3">Contacto</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4" />
                <span>Eugenio: +54 9 3467 41-2501</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4" />
                <span>Franco: +54 9 3515 63-7053</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4" />
                <span>Ignacio: +54 9 3472 58-7090</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Córdoba, Argentina</span>
              </div>
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
