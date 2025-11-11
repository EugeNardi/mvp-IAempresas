import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, LogIn } from 'lucide-react'
import Logo from './common/Logo'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Inicio', href: '#home' },
    { name: 'Características', href: '#features' },
    { name: 'Dashboard', href: '#dashboard-preview' },
    { name: 'Inteligencia', href: '#intelligence' },
    { name: 'Contacto', href: '#contact' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200'
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <a href="#home" className="group z-10">
            <Logo size="sm" />
          </a>

          {/* Desktop Navigation - Centrado */}
          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium whitespace-nowrap"
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.querySelector(link.href)
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3 z-10">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-4 py-2 rounded-md hover:bg-gray-100"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Comenzar Ahora
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    setIsMobileMenuOpen(false)
                    const element = document.querySelector(link.href)
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors font-medium px-4 py-2 rounded-md"
                >
                  {link.name}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2 px-4">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium text-center text-gray-700 hover:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium text-center bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Comenzar Ahora
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
