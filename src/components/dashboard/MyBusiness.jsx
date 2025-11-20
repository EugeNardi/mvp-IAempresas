import React, { useState, useEffect } from 'react'
import { Building2, Save, CheckCircle, Loader2, Sparkles, TrendingUp, Calculator, Shield, Zap, Target } from 'lucide-react'
import { useData } from '../../context/DataContext'

const MyBusiness = () => {
  const { companyData, saveCompanyData } = useData()
  const [formData, setFormData] = useState({
    name: '',
    cuit: '',
    businessType: '', // 'emprendedor' o 'pyme'
    fiscalCategory: '',
    industry: '',
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (companyData) {
      setFormData({
        name: companyData.name || '',
        cuit: companyData.cuit || '',
        businessType: companyData.businessType || '',
        fiscalCategory: companyData.fiscalCategory || '',
        industry: companyData.industry || '',
      })
    }
  }, [companyData])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await saveCompanyData(formData)
      setSaved(true)
      
      // Mantener el mensaje visible y NO recargar automáticamente
      // El usuario verá el mensaje y los cambios se aplicarán sin recargar
    } catch (error) {
      console.error('Error guardando datos:', error)
      alert('Error al guardar los datos')
    } finally {
      setSaving(false)
    }
  }

  // Obtener saludo según hora del día
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '¡Buenos días'
    if (hour < 20) return '¡Buenas tardes'
    return '¡Buenas noches'
  }

  const businessTypes = [
    {
      value: 'emprendedor',
      title: 'Emprendedor',
      description: 'Ideal para freelancers y pequeños negocios',
      icon: Zap,
      gradient: 'from-gray-700 to-gray-900',
      lightBg: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-900',
      features: [
        { icon: Target, text: 'Gestión simplificada' },
        { icon: TrendingUp, text: 'Análisis de ventas' },
        { icon: Sparkles, text: 'Interfaz intuitiva' }
      ]
    },
    {
      value: 'pyme',
      title: 'PyME',
      description: 'Para pequeñas y medianas empresas',
      icon: Building2,
      gradient: 'from-blue-600 to-blue-800',
      lightBg: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-900',
      features: [
        { icon: Shield, text: 'Gestión completa' },
        { icon: Calculator, text: 'Cálculo de impuestos' },
        { icon: TrendingUp, text: 'Proyecciones avanzadas' }
      ]
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header con tipo de cuenta */}
      {companyData?.businessType && (
        <div className="mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${
            companyData.businessType === 'emprendedor'
              ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
              : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
          }`}>
            {companyData.businessType === 'emprendedor' ? (
              <>
                <Zap className="w-4 h-4" />
                <span>Cuenta de Emprendedor</span>
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4" />
                <span>Cuenta de PyME</span>
              </>
            )}
          </div>
        </div>
      )}

      {saved && (
        <div className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 opacity-10 blur-3xl" />
          <div className="relative bg-white border-2 border-green-500 rounded-2xl shadow-2xl p-8">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-9 h-9 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full animate-ping" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {getGreeting()}, {formData.name}!
                  </h3>
                  <span className="text-2xl">🎉</span>
                </div>
                <div className="mb-3">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${
                    formData.businessType === 'emprendedor'
                      ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
                  }`}>
                    {formData.businessType === 'emprendedor' ? (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Panel EMPRENDEDOR Activado</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span>Panel PyME Activado</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Tu configuración ha sido guardada exitosamente. El sistema ya está personalizado para tu negocio.
                </p>
                <button
                  onClick={() => setSaved(false)}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium underline"
                >
                  Cerrar mensaje
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de Tipo de Cuenta */}
      {companyData?.businessType && !saved && (
        <div className={`mb-6 p-5 rounded-2xl border-2 ${
          companyData.businessType === 'emprendedor'
            ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
            : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                companyData.businessType === 'emprendedor'
                  ? 'bg-gradient-to-br from-gray-700 to-gray-900'
                  : 'bg-gradient-to-br from-blue-600 to-blue-800'
              }`}>
                {companyData.businessType === 'emprendedor' ? (
                  <Zap className="w-6 h-6 text-white" />
                ) : (
                  <Building2 className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tu cuenta actual</p>
                <h3 className={`text-xl font-bold ${
                  companyData.businessType === 'emprendedor' ? 'text-gray-900' : 'text-blue-900'
                }`}>
                  {companyData.businessType === 'emprendedor' ? 'Emprendedor' : 'PyME'}
                </h3>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
              companyData.businessType === 'emprendedor'
                ? 'bg-gray-800 text-white'
                : 'bg-blue-600 text-white'
            }`}>
              Activa
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Type Selection - Destacado */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-900" />
              ¿Qué tipo de negocio tienes?
            </h2>
            <p className="text-sm text-gray-600">
              Esto personalizará tu experiencia y las herramientas disponibles
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {businessTypes.map((type) => {
              const Icon = type.icon
              const isSelected = formData.businessType === type.value
              
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, businessType: type.value })}
                  className={`
                    relative p-8 rounded-2xl border-2 transition-all duration-500 text-left overflow-hidden group
                    ${isSelected 
                      ? `border-transparent shadow-2xl bg-gradient-to-br ${type.gradient}` 
                      : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md'
                    }
                  `}
                >
                  {/* Background Pattern */}
                  {isSelected && (
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12" />
                    </div>
                  )}
                  
                  {/* Check Badge */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                  
                  {/* Icon with gradient background */}
                  <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                    isSelected ? 'bg-white/20' : 'bg-gradient-to-br ' + type.gradient
                  }`}>
                    <Icon className={`w-7 h-7 ${isSelected ? 'text-white' : 'text-white'}`} />
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {type.title}
                  </h3>
                  
                  <p className={`text-sm mb-6 ${isSelected ? 'text-white/90' : 'text-gray-600'}`}>
                    {type.description}
                  </p>
                  
                  {/* Features with icons */}
                  <ul className="space-y-3">
                    {type.features.map((feature, idx) => {
                      const FeatureIcon = feature.icon
                      return (
                        <li key={idx} className={`text-sm flex items-center gap-3 ${isSelected ? 'text-white/95' : 'text-gray-700'}`}>
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-white/20' : 'bg-gray-100'
                          }`}>
                            <FeatureIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <span className="font-medium">{feature.text}</span>
                        </li>
                      )
                    })}
                  </ul>
                </button>
              )
            })}
          </div>
        </div>

        {/* Datos Básicos */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Datos Básicos</h2>
              <p className="text-sm text-gray-500">Información esencial de tu negocio</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Nombre del Negocio */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
                Nombre del Negocio
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5 outline-none transition-all font-medium"
                placeholder="Ej: Mi Empresa SRL"
              />
            </div>

            {/* CUIT */}
            <div>
              <label htmlFor="cuit" className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
                CUIT
              </label>
              <input
                type="text"
                id="cuit"
                name="cuit"
                value={formData.cuit}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5 outline-none transition-all font-medium"
                placeholder="20-12345678-9"
              />
            </div>

            {/* Rubro */}
            <div>
              <label htmlFor="industry" className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
                Rubro
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5 outline-none transition-all font-medium"
              >
                <option value="">Seleccionar rubro...</option>
                <option value="Comercio">Comercio</option>
                <option value="Servicios">Servicios</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Gastronomía">Gastronomía</option>
                <option value="Construcción">Construcción</option>
                <option value="Salud">Salud</option>
                <option value="Educación">Educación</option>
                <option value="Transporte">Transporte</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Categoría Fiscal */}
            <div>
              <label htmlFor="fiscalCategory" className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
                Categoría Fiscal
              </label>
              <select
                id="fiscalCategory"
                name="fiscalCategory"
                value={formData.fiscalCategory}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5 outline-none transition-all font-medium"
              >
                <option value="">Seleccionar categoría...</option>
                <option value="Monotributo">Monotributo</option>
                <option value="Responsable Inscripto">Responsable Inscripto</option>
                <option value="Autónomo">Autónomo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-6">
          <p className="text-sm text-gray-500 font-medium">
            Todos los campos son obligatorios
          </p>
          <button
            type="submit"
            disabled={saving}
            className="px-10 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-bold hover:from-gray-800 hover:to-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Footer */}
      {formData.businessType && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Configuración Personalizada</h4>
              <p className="text-sm text-gray-700">
                {formData.businessType === 'emprendedor' 
                  ? 'Como emprendedor, tendrás acceso a herramientas simplificadas: Panel, Movimientos, Inventario, Análisis y Proyecciones. Perfecto para gestionar tu negocio sin complicaciones.' 
                  : 'Como PyME, tendrás acceso completo a todas las herramientas: Panel, Movimientos, Inventario, Análisis, Proyecciones, Cálculo de Impuestos y Simulador de Créditos.'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                💡 Puedes cambiar estos datos en cualquier momento desde esta sección.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBusiness
