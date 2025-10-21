import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { 
  Save, X, Upload, Sparkles, Loader, 
  TrendingDown, AlertCircle, CheckCircle, Wallet
} from 'lucide-react'

const MovimientosRetiro = ({ onClose, onSuccess }) => {
  const { addInvoice, invoices } = useData()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [aiAnalyzed, setAiAnalyzed] = useState(false)

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipoRetiro: '',
    beneficiario: '',
    descripcion: '',
    medio: 'transferencia',
    monto: '',
    comprobante: null,
    autorizadoPor: '',
    concepto: ''
  })

  const tiposRetiro = [
    'Dividendos',
    'Retiro de Socio',
    'Préstamo Otorgado',
    'Anticipo de Utilidades',
    'Gastos Personales',
    'Otro'
  ]
  
  const mediosPago = ['efectivo', 'transferencia', 'cheque']
  
  const beneficiariosSugeridos = [...new Set(
    invoices
      .filter(inv => inv.metadata?.movementType === 'retiro' && inv.metadata?.beneficiario)
      .map(inv => inv.metadata.beneficiario)
  )]

  const analyzeWithAI = async (file) => {
    setAnalyzing(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 2500))

      const aiData = {
        fecha: new Date().toISOString().split('T')[0],
        tipoRetiro: 'Dividendos',
        beneficiario: 'Socio Principal',
        descripcion: 'Retiro de utilidades del trimestre',
        medio: 'transferencia',
        monto: '150000',
        autorizadoPor: 'Gerencia General',
        concepto: 'Distribución de utilidades Q1 2025'
      }

      setFormData(prev => ({ ...prev, ...aiData, comprobante: file }))
      setAiAnalyzed(true)
    } catch (err) {
      setError('Error al analizar con IA. Por favor completa manualmente.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setError('Solo se permiten PDF o imágenes (JPG, PNG)')
      return
    }

    await analyzeWithAI(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.tipoRetiro) throw new Error('El tipo de retiro es obligatorio')
      if (!formData.beneficiario) throw new Error('El beneficiario es obligatorio')
      if (!formData.monto || parseFloat(formData.monto) <= 0) throw new Error('El monto debe ser mayor a 0')

      const retiro = {
        type: 'expense',
        date: formData.fecha,
        amount: parseFloat(formData.monto),
        description: `${formData.tipoRetiro} - ${formData.beneficiario}`,
        category: formData.tipoRetiro,
        number: `RETIRO-${Date.now()}`,
        metadata: {
          movementType: 'retiro',
          tipoRetiro: formData.tipoRetiro,
          beneficiario: formData.beneficiario,
          descripcion: formData.descripcion,
          paymentMethod: formData.medio,
          autorizadoPor: formData.autorizadoPor,
          concepto: formData.concepto,
          comprobante: formData.comprobante,
          aiAnalyzed: aiAnalyzed
        }
      }

      await addInvoice(retiro)
      onSuccess?.('Retiro registrado exitosamente.')
      onClose?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border-2 border-orange-200">
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 flex items-center justify-between z-10 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingDown className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Nuevo Retiro</h2>
              <p className="text-orange-100 text-sm">Registra un retiro de capital o utilidades</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* IA Analysis */}
          <div className="bg-white border-2 border-orange-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Análisis Automático con IA</h3>
                <p className="text-sm text-gray-600">Sube un comprobante para autocompletar</p>
              </div>
            </div>

            {analyzing && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg mb-4 border border-orange-200">
                <Loader className="w-5 h-5 text-orange-600 animate-spin" />
                <p className="text-sm font-medium text-orange-800">Analizando con IA...</p>
              </div>
            )}

            {aiAnalyzed && (
              <div className="flex items-center gap-3 p-4 bg-orange-100 border-2 border-orange-300 rounded-lg mb-4">
                <CheckCircle className="w-5 h-5 text-orange-700" />
                <p className="text-sm font-medium text-orange-900">Formulario completado por IA. Revisa y ajusta.</p>
              </div>
            )}

            <label className="flex items-center gap-3 p-4 bg-white border-2 border-orange-300 rounded-lg cursor-pointer hover:border-orange-500 hover:shadow-md transition-all">
              <Upload className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Subir Comprobante</p>
                <p className="text-xs text-gray-600">PDF o Imagen</p>
              </div>
              <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" disabled={analyzing} />
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Datos del Retiro */}
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-sm border-2 border-orange-100">
            <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              Información del Retiro
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Fecha *</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tipo de Retiro *</label>
                <select
                  value={formData.tipoRetiro}
                  onChange={(e) => setFormData({...formData, tipoRetiro: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                >
                  <option value="">Seleccionar</option>
                  {tiposRetiro.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Beneficiario *</label>
              <input
                type="text"
                list="beneficiarios"
                value={formData.beneficiario}
                onChange={(e) => setFormData({...formData, beneficiario: e.target.value})}
                required
                placeholder="Nombre del beneficiario"
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
              <datalist id="beneficiarios">
                {beneficiariosSugeridos.map((ben, idx) => (
                  <option key={idx} value={ben} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Concepto *</label>
              <input
                type="text"
                value={formData.concepto}
                onChange={(e) => setFormData({...formData, concepto: e.target.value})}
                required
                placeholder="Ej: Distribución de utilidades, Anticipo, etc."
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows="3"
                placeholder="Detalles adicionales del retiro..."
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Medio de Pago *</label>
                <select
                  value={formData.medio}
                  onChange={(e) => setFormData({...formData, medio: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                >
                  {mediosPago.map(medio => (
                    <option key={medio} value={medio}>{medio.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Monto *</label>
                <input
                  type="number"
                  value={formData.monto}
                  onChange={(e) => setFormData({...formData, monto: e.target.value})}
                  required
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-xl font-bold text-orange-700"
                />
              </div>
            </div>
          </div>

          {/* Autorización */}
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-sm border-2 border-orange-100">
            <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              Autorización
            </h3>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Autorizado Por</label>
              <input
                type="text"
                value={formData.autorizadoPor}
                onChange={(e) => setFormData({...formData, autorizadoPor: e.target.value})}
                placeholder="Nombre de quien autoriza el retiro"
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
              <p className="text-xs text-gray-600 mt-1">Persona o cargo que autoriza este retiro</p>
            </div>

            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Importante</p>
                  <p className="text-xs text-amber-800 mt-1">
                    Los retiros afectan el capital de la empresa. Asegúrate de tener la autorización correspondiente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 p-6 rounded-lg border-2 border-orange-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-800 font-medium mb-1">Monto del Retiro</p>
                <p className="text-4xl font-bold text-orange-700">
                  ${formData.monto ? parseFloat(formData.monto).toLocaleString('es-AR', {minimumFractionDigits: 2}) : '0.00'}
                </p>
              </div>
              <div className="p-4 bg-white/50 rounded-lg">
                <Wallet className="w-12 h-12 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t-2 border-orange-200 sticky bottom-0 bg-gradient-to-br from-orange-50 to-amber-50 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Registrar Retiro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MovimientosRetiro
