import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { 
  Save, X, Upload, Mic, Sparkles, Loader, 
  TrendingDown, AlertCircle, CheckCircle, FileText
} from 'lucide-react'

const MovimientosGasto = ({ onClose, onSuccess }) => {
  const { addInvoice, invoices } = useData()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [aiAnalyzed, setAiAnalyzed] = useState(false)

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    categoria: '',
    concepto: '',
    descripcion: '',
    beneficiario: '',
    medio: 'efectivo',
    pagado: 'si',
    deuda: '',
    monto: '',
    comprobante: null,
    recurrente: 'no',
    frecuencia: 'mensual'
  })

  const categorias = ['Sueldos', 'Alquiler', 'Servicios', 'Marketing', 'Impuestos', 'Mantenimiento', 'Seguros', 'Otros']
  const mediosPago = ['efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito', 'cheque', 'debito_automatico']
  
  const beneficiariosSugeridos = [...new Set(
    invoices
      .filter(inv => inv.metadata?.movementType === 'gasto' && inv.metadata?.beneficiario)
      .map(inv => inv.metadata.beneficiario)
  )]

  const analyzeWithAI = async (file) => {
    setAnalyzing(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 2500))

      const aiData = {
        fecha: new Date().toISOString().split('T')[0],
        categoria: 'Servicios',
        concepto: 'Servicio de Internet',
        descripcion: 'Pago mensual de internet empresarial',
        beneficiario: 'Proveedor de Servicios SA',
        medio: 'debito_automatico',
        pagado: 'si',
        monto: '15000',
        recurrente: 'si',
        frecuencia: 'mensual'
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
      if (!formData.categoria) throw new Error('La categoría es obligatoria')
      if (!formData.concepto) throw new Error('El concepto es obligatorio')
      if (!formData.monto || parseFloat(formData.monto) <= 0) throw new Error('El monto debe ser mayor a 0')

      const gasto = {
        type: 'expense',
        date: formData.fecha,
        amount: parseFloat(formData.monto),
        description: `${formData.categoria} - ${formData.concepto}`,
        category: formData.categoria,
        number: `GASTO-${Date.now()}`,
        metadata: {
          movementType: 'gasto',
          concepto: formData.concepto,
          descripcion: formData.descripcion,
          beneficiario: formData.beneficiario,
          paymentMethod: formData.medio,
          pagado: formData.pagado === 'si',
          deuda: formData.pagado === 'no' ? parseFloat(formData.deuda) : 0,
          recurrente: formData.recurrente === 'si',
          frecuencia: formData.recurrente === 'si' ? formData.frecuencia : null,
          comprobante: formData.comprobante,
          aiAnalyzed: aiAnalyzed
        }
      }

      await addInvoice(gasto)
      onSuccess?.('Gasto registrado exitosamente.')
      onClose?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border-2 border-red-200">
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 flex items-center justify-between z-10 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingDown className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Nuevo Gasto</h2>
              <p className="text-red-100 text-sm">Registra un gasto operativo o administrativo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* IA Analysis */}
          <div className="bg-white border-2 border-red-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Análisis Automático con IA</h3>
                <p className="text-sm text-gray-600">Sube un comprobante o graba un audio</p>
              </div>
            </div>

            {analyzing && (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg mb-4 border border-red-200">
                <Loader className="w-5 h-5 text-red-600 animate-spin" />
                <p className="text-sm font-medium text-red-800">Analizando con IA...</p>
              </div>
            )}

            {aiAnalyzed && (
              <div className="flex items-center gap-3 p-4 bg-red-100 border-2 border-red-300 rounded-lg mb-4">
                <CheckCircle className="w-5 h-5 text-red-700" />
                <p className="text-sm font-medium text-red-900">Formulario completado por IA. Revisa y ajusta.</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 bg-white border-2 border-red-300 rounded-lg cursor-pointer hover:border-red-500 hover:shadow-md transition-all">
                <Upload className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Subir Comprobante</p>
                  <p className="text-xs text-gray-600">PDF o Imagen</p>
                </div>
                <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" disabled={analyzing} />
              </label>

              <button
                type="button"
                onClick={() => setError('Función de audio en desarrollo')}
                disabled={analyzing}
                className="flex items-center gap-3 p-4 bg-white border-2 border-red-300 rounded-lg hover:border-red-500 hover:shadow-md transition-all disabled:opacity-50"
              >
                <Mic className="w-5 h-5 text-red-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">Grabar Audio</p>
                  <p className="text-xs text-gray-600">Describe el gasto</p>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Datos del Gasto */}
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-sm border-2 border-red-100">
            <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              Información del Gasto
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Fecha *</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Categoría *</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                >
                  <option value="">Seleccionar</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Concepto *</label>
              <input
                type="text"
                value={formData.concepto}
                onChange={(e) => setFormData({...formData, concepto: e.target.value})}
                required
                placeholder="Ej: Pago de alquiler, Servicio de luz, etc."
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows="3"
                placeholder="Detalles adicionales del gasto..."
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Beneficiario</label>
              <input
                type="text"
                list="beneficiarios"
                value={formData.beneficiario}
                onChange={(e) => setFormData({...formData, beneficiario: e.target.value})}
                placeholder="Nombre del proveedor o beneficiario"
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
              />
              <datalist id="beneficiarios">
                {beneficiariosSugeridos.map((ben, idx) => (
                  <option key={idx} value={ben} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Pago */}
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-sm border-2 border-red-100">
            <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              Información de Pago
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Medio de Pago *</label>
                <select
                  value={formData.medio}
                  onChange={(e) => setFormData({...formData, medio: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                >
                  {mediosPago.map(medio => (
                    <option key={medio} value={medio}>{medio.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">¿Pagado? *</label>
                <select
                  value={formData.pagado}
                  onChange={(e) => setFormData({...formData, pagado: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-lg border-2 outline-none transition-all ${
                    formData.pagado === 'si' ? 'border-green-500 bg-green-50 font-semibold text-green-800' : 'border-red-500 bg-red-50 font-semibold text-red-800'
                  }`}
                >
                  <option value="si">SÍ - Pagado</option>
                  <option value="no">NO - Pendiente</option>
                </select>
              </div>
            </div>

            {formData.pagado === 'no' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-red-700">Deuda a Pagar *</label>
                <input
                  type="number"
                  value={formData.deuda}
                  onChange={(e) => setFormData({...formData, deuda: e.target.value})}
                  required
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-red-400 bg-red-50 outline-none font-semibold text-red-800"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Monto Total *</label>
              <input
                type="number"
                value={formData.monto}
                onChange={(e) => setFormData({...formData, monto: e.target.value})}
                required
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-xl font-bold"
              />
            </div>
          </div>

          {/* Recurrencia */}
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-sm border-2 border-red-100">
            <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              Recurrencia
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">¿Es Recurrente?</label>
                <select
                  value={formData.recurrente}
                  onChange={(e) => setFormData({...formData, recurrente: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                >
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
              </div>

              {formData.recurrente === 'si' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Frecuencia</label>
                  <select
                    value={formData.frecuencia}
                    onChange={(e) => setFormData({...formData, frecuencia: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                  >
                    <option value="semanal">Semanal</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="mensual">Mensual</option>
                    <option value="bimestral">Bimestral</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t-2 border-red-200 sticky bottom-0 bg-gradient-to-br from-red-50 to-orange-50 pb-2">
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Registrar Gasto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MovimientosGasto
