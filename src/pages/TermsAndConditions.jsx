import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Shield, AlertCircle } from 'lucide-react'
import Logo from '../components/common/Logo'

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <Logo size="sm" />
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Volver al inicio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-lg text-gray-600">
            Última actualización: Noviembre 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
          {/* Sección 1 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">1.</span> Aceptación de los Términos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Al acceder y utilizar Gestionar ("la Plataforma"), usted acepta estar sujeto a estos Términos y Condiciones. 
              Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
            </p>
          </section>

          {/* Sección 2 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">2.</span> Descripción del Servicio
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Gestionar es una plataforma de gestión empresarial con inteligencia artificial que ofrece:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Sistema de gestión de inventario</li>
              <li>Control de ventas y compras</li>
              <li>Análisis financiero automatizado</li>
              <li>Gestión de proveedores y clientes</li>
              <li>Reportes e inteligencia de negocios</li>
              <li>Asistente de IA conversacional</li>
            </ul>
          </section>

          {/* Sección 3 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">3.</span> Período de Prueba Gratuita
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-2">Prueba de 21 días sin tarjeta</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Acceso completo a todas las funcionalidades</li>
                    <li>• No se requiere tarjeta de crédito para registrarse</li>
                    <li>• Al finalizar los 21 días, la cuenta se bloqueará automáticamente</li>
                    <li>• Podrá reactivar su cuenta suscribiéndose a un plan de pago</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Sección 4 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">4.</span> Planes y Pagos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Después del período de prueba gratuita, deberá suscribirse a uno de nuestros planes de pago para continuar utilizando la plataforma:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Plan Mensual:</strong> Facturación mensual con cancelación en cualquier momento</li>
              <li><strong>Plan Anual:</strong> Facturación anual con descuento del 20%</li>
              <li>Los pagos se procesan de forma segura a través de Mercado Pago</li>
              <li>Todas las transacciones están protegidas con encriptación SSL</li>
            </ul>
          </section>

          {/* Sección 5 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">5.</span> Uso Aceptable
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Al utilizar Gestionar, usted se compromete a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Proporcionar información precisa y actualizada</li>
              <li>Mantener la confidencialidad de sus credenciales de acceso</li>
              <li>No compartir su cuenta con terceros</li>
              <li>No utilizar la plataforma para actividades ilegales</li>
              <li>No intentar acceder a áreas restringidas del sistema</li>
              <li>No realizar ingeniería inversa o copiar el software</li>
            </ul>
          </section>

          {/* Sección 6 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">6.</span> Privacidad y Protección de Datos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nos comprometemos a proteger su información personal:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Sus datos están encriptados y almacenados de forma segura</li>
              <li>No compartimos su información con terceros sin su consentimiento</li>
              <li>Cumplimos con las leyes de protección de datos vigentes</li>
              <li>Puede solicitar la eliminación de sus datos en cualquier momento</li>
              <li>Utilizamos cookies solo para mejorar la experiencia del usuario</li>
            </ul>
          </section>

          {/* Sección 7 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">7.</span> Propiedad Intelectual
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Todos los derechos de propiedad intelectual sobre la plataforma Gestionar, incluyendo el código fuente, 
              diseño, logos, y contenido, son propiedad exclusiva de Gestionar. Usted mantiene todos los derechos sobre 
              los datos que ingresa en la plataforma.
            </p>
          </section>

          {/* Sección 8 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">8.</span> Limitación de Responsabilidad
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <p className="font-semibold mb-2">Importante</p>
                  <p>
                    Gestionar se proporciona "tal cual" sin garantías de ningún tipo. No nos hacemos responsables por 
                    pérdidas de datos, interrupciones del servicio, o decisiones comerciales tomadas basándose en la 
                    información proporcionada por la plataforma.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sección 9 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">9.</span> Cancelación y Reembolsos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Política de cancelación:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Puede cancelar su suscripción en cualquier momento desde su panel de control</li>
              <li>La cancelación será efectiva al final del período de facturación actual</li>
              <li>No se realizan reembolsos por períodos parciales</li>
              <li>Sus datos permanecerán disponibles durante 30 días después de la cancelación</li>
            </ul>
          </section>

          {/* Sección 10 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">10.</span> Modificaciones
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. 
              Los cambios serán notificados a través de la plataforma y por correo electrónico. El uso continuado 
              de la plataforma después de las modificaciones constituye su aceptación de los nuevos términos.
            </p>
          </section>

          {/* Sección 11 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">11.</span> Contacto
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-700"><strong>Email:</strong> soporte@gestionar.com</p>
              <p className="text-gray-700"><strong>Teléfono:</strong> +54 11 1234-5678</p>
              <p className="text-gray-700"><strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00 hs</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TermsAndConditions
