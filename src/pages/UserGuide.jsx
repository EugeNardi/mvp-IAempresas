import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Package, ShoppingCart, TrendingUp, BarChart3, MessageSquare } from 'lucide-react'
import Logo from '../components/common/Logo'

const UserGuide = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/"><Logo size="sm" /></Link>
            <Link to="/" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Volver al inicio</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Instrucciones de Uso</h1>
          <p className="text-lg text-gray-600">Guía completa para usar Gestionar</p>
        </div>

        <div className="space-y-6">
          {/* Primeros Pasos */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Primeros Pasos</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Crear tu cuenta</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Haz clic en "Comenzar Gratis"</li>
                  <li>Completa email y contraseña</li>
                  <li>Verifica tu email</li>
                  <li>Tienes 21 días de prueba gratuita sin tarjeta</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Configurar tu negocio</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Ve a "Mi Negocio" en el dashboard</li>
                  <li>Completa información de tu empresa</li>
                  <li>Selecciona tipo: Emprendedor o PyME</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Inventario */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Agregar productos</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Ve a "Inventario" &gt; "Nuevo Producto"</li>
                  <li>Completa: nombre, categoría, marca, modelo</li>
                  <li>Ingresa precios (costo, venta, mayorista)</li>
                  <li>Define stock mínimo para alertas</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Importar masivamente</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Descarga la plantilla Excel</li>
                  <li>Completa los datos</li>
                  <li>Sube el archivo desde "Carga Masiva"</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Ventas */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Registro de Ventas</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Crear una venta</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>"Movimientos" &gt; "Nuevo Movimiento" &gt; "Venta"</li>
                  <li>Elige tipo: minorista o mayorista</li>
                  <li>Agrega productos del inventario</li>
                  <li>Define cantidad, precio y descuento en pesos</li>
                  <li>Selecciona medio de pago</li>
                  <li>Marca si está cobrado o es deuda</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Ventas en dólares</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Selecciona moneda "USD"</li>
                  <li>Ingresa tipo de cambio</li>
                  <li>El sistema convierte a ARS automáticamente</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Compras */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Compras y Gastos</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Registrar compras</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>"Movimientos" &gt; "Compra"</li>
                  <li>Selecciona o crea proveedor</li>
                  <li>Agrega productos comprados</li>
                  <li>El stock se actualiza automáticamente</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Registrar gastos</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>"Movimientos" &gt; "Gasto"</li>
                  <li>Categorías: sueldos, alquiler, servicios, etc.</li>
                  <li>Marca si está pagado o pendiente</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Análisis */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Análisis e Inteligencia</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Reportes disponibles</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Análisis de clientes: top compradores</li>
                  <li>Análisis de productos: más vendidos, rentabilidad</li>
                  <li>Análisis de proveedores: mejores precios</li>
                  <li>Análisis financiero: punto de equilibrio, márgenes</li>
                  <li>Proyecciones con IA ajustadas por inflación</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Chat IA */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Asistente de IA</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Cómo usarlo</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Haz clic en el ícono de chat</li>
                  <li>Escribe tu pregunta en lenguaje natural</li>
                  <li>Obtén respuestas sobre tu negocio en tiempo real</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Ejemplos de consultas</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>"¿Cuáles son mis productos más vendidos?"</li>
                  <li>"¿Cuánto vendí este mes?"</li>
                  <li>"¿Qué productos tienen stock bajo?"</li>
                  <li>"Dame consejos para mejorar mis ventas"</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="text-center mt-12">
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UserGuide
