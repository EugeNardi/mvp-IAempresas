import React, { useState, useEffect } from 'react'
import { Building2, Save, CheckCircle, Loader2 } from 'lucide-react'
import { useData } from '../../context/DataContext'

const CompanyProfile = () => {
  const { companyData, saveCompanyData } = useData()
  const [formData, setFormData] = useState({
    name: '',
    cuit: '',
    address: '',
    city: '',
    province: '',
    country: 'Argentina',
    industry: '',
    fiscalYear: new Date().getFullYear().toString(),
    currency: 'ARS',
  })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (companyData) {
      setFormData(companyData)
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
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error guardando empresa:', error)
      alert('Error al guardar los datos de la empresa')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Datos de la Empresa</h3>
            <p className="text-gray-600">Configura la información básica de tu empresa</p>
          </div>
        </div>

        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Datos guardados exitosamente</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name & CUIT */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Razón Social *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                placeholder="Mi Empresa S.A."
              />
            </div>

            <div>
              <label htmlFor="cuit" className="block text-sm font-medium text-gray-700 mb-2">
                CUIT *
              </label>
              <input
                type="text"
                id="cuit"
                name="cuit"
                value={formData.cuit}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                placeholder="20-12345678-9"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Dirección *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all"
              placeholder="Av. Ejemplo 1234"
            />
          </div>

          {/* City, Province, Country */}
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                placeholder="Córdoba"
              />
            </div>

            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
                Provincia *
              </label>
              <input
                type="text"
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                placeholder="Córdoba"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                País *
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
              />
            </div>
          </div>

          {/* Industry & Fiscal Year */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Rubro / Industria *
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all"
              >
                <option value="">Seleccionar...</option>
                <option value="Comercio">Comercio</option>
                <option value="Servicios">Servicios</option>
                <option value="Manufactura">Manufactura</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Construcción">Construcción</option>
                <option value="Gastronomía">Gastronomía</option>
                <option value="Salud">Salud</option>
                <option value="Educación">Educación</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label htmlFor="fiscalYear" className="block text-sm font-medium text-gray-700 mb-2">
                Ejercicio Fiscal *
              </label>
              <select
                id="fiscalYear"
                name="fiscalYear"
                value={formData.fiscalYear}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
              Moneda *
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all"
            >
              <option value="ARS">Peso Argentino (ARS)</option>
              <option value="USD">Dólar Estadounidense (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Guardar Información</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompanyProfile
