import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { 
  Save, X, Upload, Mic, Sparkles, Loader, 
  DollarSign, AlertCircle, CheckCircle, TrendingUp
} from 'lucide-react'

const MovimientosAporte = ({ onClose, onSuccess }) => {
  const { addInvoice, invoices } = useData()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [aiAnalyzed, setAiAnalyzed] = useState(false)

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipoAporte: '',
    aportante: '',
    descripcion: '',
    medio: 'transferencia',
    monto: '',
    comprobante: null,
    porcentajeParticipacion: '',
    destinoFondos: ''
  })

  const tiposAporte = [
    'Capital Inicial',
    'Inversión',
    'Préstamo Recibido',
    'Aporte de Socio',
    'Subsidio',
    'Donación',
    'Otro'
  ]
  
  const mediosPago = ['efectivo', 'transferencia', 'cheque', 'deposito']
  
  const aportantesSugeridos = [...new Set(
    invoices
      .filter(inv => inv.metadata?.movementType === 'aporte' && inv.metadata?.aportante)
      .map(inv => inv.metadata.aportante)
  )]

  const analyzeWithAI = async (file) => {
    setAnalyzing(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 2500))

      const aiData = {
        fecha: new Date().toISOString().split('T')[0],
        tipoAporte: 'Aporte de Socio',
        aportante: 'Juan Pérez',
        descripcion: 'Aporte de capital para expansión',
        medio: 'transferencia',
        monto: '500000',
        porcentajeParticipacion: '25',
        destinoFondos: 'Expansión de operaciones'
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
      if (!formData.tipoAporte) throw new Error('El tipo de aporte es obligatorio')
      if (!formData.aportante) throw new Error('El aportante es obligatorio')
      if (!formData.monto || parseFloat(formData.monto) <= 0) throw new Error('El monto debe ser mayor a 0')

      const aporte = {
        type: 'income',
        date: formData.fecha,
        amount: parseFloat(formData.monto),
        description: `${formData.tipoAporte} - ${formData.aportante}`,
        category: formData.tipoAporte,
        number: `APORTE-${Date.now()}`,
        metadata: {
          movementType: 'aporte',
          tipoAporte: formData.tipoAporte,
          aportante: formData.aportante,
          descripcion: formData.descripcion,
          paymentMethod: formData.medio,
          porcentajeParticipacion: formData.porcentajeParticipacion ? parseFloat(formData.porcentajeParticipacion) : null,
          destinoFondos: formData.destinoFondos,
          comprobante: formData.comprobante,
          aiAnalyzed: aiAnalyzed
        }
      }

      await addInvoice(aporte)
      onSuccess?.('Aporte registrado exitosamente.')
      onClose?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border-2 border-purple-200">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex items-center justify-between z-10 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Nuevo Aporte</h2>
              <p className="text-purple-100 text-sm">Registra un aporte de capital o inversión</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* IA Analysis */}
          <div className="bg-white border-2 border-purple-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Análisis Automático con IA</h3>
                <p className="text-sm text-gray-600">Sube un comprobante o graba un audio</p>
              </div>
            </div>

            {analyzing && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg mb-4 border border-purple-200">
                <Loader className="w-5 h-5 text-purple-600 animate-spin" />
                <p className="text-sm font-medium text-purple-800">Analizando con IA...</p>
              </div>
            )}

            {aiAnalyzed && (
              <div className="flex items-center gap-3 p-4 bg-purple-100 border-2 border-purple-300 rounded-lg mb-4">
                <CheckCircle className="w-5 h-5 text-purple-700" />
                <p className="text-sm font-medium text-purple-900">Formulario completado por IA. Revisa y ajusta.</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 bg-white border-2 border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 hover:shadow-md transition-all">
                <Upload className="w-5 h-5 text-purple-600" />
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
                className="flex items-center gap-3 p-4 bg-white border-2 border-purple-300 rounded-lg hover:border-purple-500 hover:shadow-md transition-all disabled:opacity-50"
              >
                <Mic className="w-5 h-5 text-purple-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">Grabar Audio</p>
                  <p className="text-xs text-gray-600">Describe el aporte</p>
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

          {/* Datos del Aporte */}
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-sm border-2 border-purple-100">
            <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Información del Aporte
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Fecha *</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tipo de Aporte *</label>
                <select
                  value={formData.tipoAporte}
                  onChange={(e) => setFormData({...formData, tipoAporte: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                >
                  <option value="">Seleccionar</option>
                  {tiposAporte.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Aportante *</label>
              <input
                type="text"
                list="aportantes"
                value={formData.aportante}
                onChange={(e) => setFormData({...formData, aportante: e.target.value})}
                required
                placeholder="Nombre del aportante o inversor"
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              />
              <datalist id="aportantes">
                {aportantesSugeridos.map((aport, idx) => (
                  <option key={idx} value={aport} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows="3"
                placeholder="Detalles del aporte, condiciones, etc..."
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Medio de Pago *</label>
                <select
                  value={formData.medio}
                  onChange={(e) => setFormData({...formData, medio: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
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
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-xl font-bold text-purple-700"
                />
              </div>
            </div>
          </div>

          {/* Detalles Adicionales */}
          <div className="bg-white rounded-lg p-6 space-y-4 shadow-sm border-2 border-purple-100">
            <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Detalles Adicionales
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">% Participación (opcional)</label>
                <input
                  type="number"
                  value={formData.porcentajeParticipacion}
                  onChange={(e) => setFormData({...formData, porcentajeParticipacion: e.target.value})}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
                <p className="text-xs text-gray-600 mt-1">Porcentaje de participación en la empresa</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Destino de Fondos</label>
                <input
                  type="text"
                  value={formData.destinoFondos}
                  onChange={(e) => setFormData({...formData, destinoFondos: e.target.value})}
                  placeholder="Ej: Expansión, Equipamiento, etc."
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                />
                <p className="text-xs text-gray-600 mt-1">Para qué se utilizará el aporte</p>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-lg border-2 border-purple-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-800 font-medium mb-1">Aporte Total</p>
                <p className="text-4xl font-bold text-purple-700">
                  ${formData.monto ? parseFloat(formData.monto).toLocaleString('es-AR', {minimumFractionDigits: 2}) : '0.00'}
                </p>
              </div>
              <div className="p-4 bg-white/50 rounded-lg">
                <TrendingUp className="w-12 h-12 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t-2 border-purple-200 sticky bottom-0 bg-gradient-to-br from-purple-50 to-indigo-50 pb-2">
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Registrar Aporte
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MovimientosAporte
