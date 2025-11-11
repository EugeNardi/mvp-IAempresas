import React from 'react'
import { Sparkles, Mail, MapPin } from 'lucide-react'

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
              <span className="text-xl font-bold">IA Solutions</span>
            </a>
            <p className="text-gray-400 text-sm max-w-xs">
              Transformamos PyMEs con soluciones de inteligencia artificial conversacional.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Mail className="w-4 h-4" />
              <span>euge060406@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Córdoba, Argentina</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} IA Solutions. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
