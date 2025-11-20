import React, { useState, useEffect } from 'react'
import { Building2, Save, CheckCircle, Loader2, Sparkles, TrendingUp, Calculator } from 'lucide-react'
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
      
      // Mostrar mensaje de bienvenida y recargar después de 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)
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
      icon: Sparkles,
      features: ['Gestión básica', 'Análisis simple', 'Sin impuestos complejos']
    },
    {
      value: 'pyme',
      title: 'PyME',
      description: 'Para pequeñas y medianas empresas',
      icon: Building2,
      features: ['Gestión completa', 'Cálculo de impuestos', 'Proyecciones financieras']
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mi Negocio
        </h1>
        <p className="text-gray-600">
          Configura tu negocio en menos de 2 minutos
        </p>
      </div>

      {saved && (
        <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl shadow-lg animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {getGreeting()}, {formData.name}! 🎉
              </h3>
              <p className="text-green-800 font-semibold text-base mb-2">
                {formData.businessType === 'emprendedor' 
                  ? '¡Bienvenido al Panel de EMPRENDEDOR!' 
                  : '¡Bienvenido al Panel de PyME!'}
              </p>
              <p className="text-sm text-gray-600">
                Tu configuración ha sido guardada. Redirigiendo al panel...
              </p>
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

          <div className="grid md:grid-cols-2 gap-4">
            {businessTypes.map((type) => {
              const Icon = type.icon
              const isSelected = formData.businessType === type.value
              
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, businessType: type.value })}
                  className={`
                    relative p-6 rounded-xl border-2 transition-all text-left
                    ${isSelected 
                      ? 'border-gray-900 bg-gray-900 text-white shadow-lg scale-105' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-white' : 'text-gray-900'}`} />
                  
                  <h3 className={`text-lg font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {type.title}
                  </h3>
                  
                  <p className={`text-sm mb-4 ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}>
                    {type.description}
                  </p>
                  
                  <ul className="space-y-1.5">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className={`text-xs flex items-center gap-2 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                        <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-gray-400'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>
        </div>

        {/* Datos Básicos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-900" />
            Datos Básicos
          </h2>

          <div className="space-y-5">
            {/* Nombre del Negocio */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all"
                placeholder="Ej: Mi Empresa SRL"
              />
            </div>

            {/* CUIT */}
            <div>
              <label htmlFor="cuit" className="block text-sm font-semibold text-gray-900 mb-2">
                CUIT *
              </label>
              <input
                type="text"
                id="cuit"
                name="cuit"
                value={formData.cuit}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all"
                placeholder="20-12345678-9"
              />
            </div>

            {/* Rubro */}
            <div>
              <label htmlFor="industry" className="block text-sm font-semibold text-gray-900 mb-2">
                Rubro *
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all"
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
              <label htmlFor="fiscalCategory" className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Categoría Fiscal *
              </label>
              <select
                id="fiscalCategory"
                name="fiscalCategory"
                value={formData.fiscalCategory}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all"
              >
                <option value="">Seleccionar categoría...</option>
                <option value="Monotributo">Monotributo</option>
                <option value="Responsable Inscripto">Responsable Inscripto</option>
                <option value="Autónomo">Autónomo</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Tu situación fiscal ante AFIP
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">
            * Campos obligatorios
          </p>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
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
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Puedes cambiar estos datos en cualquier momento. 
          {formData.businessType === 'emprendedor' && ' Como emprendedor, verás solo las herramientas esenciales para tu negocio.'}
          {formData.businessType === 'pyme' && ' Como PyME, tendrás acceso a todas las herramientas avanzadas de gestión.'}
        </p>
      </div>
    </div>
  )
}

export default MyBusiness
