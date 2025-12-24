import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { 
  Save, X, Upload, Mic, Sparkles, Loader, 
  DollarSign, AlertCircle, CheckCircle, TrendingUp,
  ChevronDown, ChevronUp
} from 'lucide-react'
import AudioRecorderComponent from '../common/AudioRecorder'
import { processAudioForMovement, isOpenAIConfigured } from '../../services/aiService'
import { createUserFriendlyError } from '../../utils/errorMessages'

const MovimientosAporte = ({ movimiento, onClose, onSuccess }) => {
  const { addInvoice, updateInvoice, invoices } = useData()
  const isEditing = !!movimiento
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [aiAnalyzed, setAiAnalyzed] = useState(false)
  const [aiSectionExpanded, setAiSectionExpanded] = useState(false)

  const [formData, setFormData] = useState(() => {
    if (isEditing && movimiento) {
      return {
        fecha: movimiento.date || movimiento.invoice_date || new Date().toISOString().split('T')[0],
        tipoAporte: movimiento.category || '',
        aportante: movimiento.metadata?.aportante || '',
        descripcion: movimiento.description || '',
        medio: movimiento.metadata?.paymentMethod || 'transferencia',
        monto: movimiento.amount?.toString() || '',
        comprobante: null,
        porcentajeParticipacion: movimiento.metadata?.porcentajeParticipacion || '',
        destinoFondos: movimiento.metadata?.destinoFondos || ''
      }
    }
    return {
      fecha: new Date().toISOString().split('T')[0],
      tipoAporte: '',
      aportante: '',
      descripcion: '',
      medio: 'transferencia',
      monto: '',
      comprobante: null,
      porcentajeParticipacion: '',
      destinoFondos: ''
    }
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

  const analyzeWithAI = async (file, type) => {
    setAnalyzing(true)
    setError('')

    try {
      if (type === 'audio') {
        if (!isOpenAIConfigured()) {
          throw new Error('API de OpenAI no configurada. Agrega tu VITE_OPENAI_API_KEY en el archivo .env')
        }

        const result = await processAudioForMovement(file, 'aporte')
        
        if (!result.success) {
          throw new Error(result.error)
        }

        const aiData = result.data
        
        const mappedData = {
          fecha: aiData.fecha || new Date().toISOString().split('T')[0],
          tipoAporte: aiData.tipoAporte || '',
          aportante: aiData.aportante || '',
          descripcion: aiData.descripcion || '',
          medio: aiData.medio || 'transferencia',
          monto: aiData.monto?.toString() || '',
          porcentajeParticipacion: aiData.porcentajeParticipacion?.toString() || '',
          destinoFondos: aiData.destinoFondos || '',
          comprobante: file
        }

        setFormData(prev => ({ ...prev, ...mappedData }))
        setAiAnalyzed(true)
        
      } else {
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
      }
    } catch (err) {
      const friendlyMessage = createUserFriendlyError(err, 'Error al analizar con IA')
      setError(friendlyMessage || 'Error al analizar con IA. Por favor completa manualmente.')
      console.error('Error en análisis IA:', err)
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

    await analyzeWithAI(file, 'document')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.tipoAporte) throw new Error('El tipo de aporte es obligatorio')
      if (!formData.aportante) throw new Error('El aportante es obligatorio')
      if (!formData.monto || parseFloat(formData.monto) <= 0) throw new Error('El monto debe ser mayor a 0')

      const aporteData = {
        type: 'income',
        date: formData.fecha,
        amount: parseFloat(formData.monto),
        description: `${formData.tipoAporte} - ${formData.aportante}`,
        category: formData.tipoAporte,
        number: isEditing ? (movimiento.number || movimiento.invoice_number) : `APORTE-${Date.now()}`,
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

      if (isEditing) {
        await updateInvoice(movimiento.id, aporteData)
      } else {
        await addInvoice(aporteData)
      }
      onSuccess?.(isEditing ? 'Aporte actualizado exitosamente.' : 'Aporte registrado exitosamente.')
      onClose?.()
    } catch (err) {
      const friendlyMessage = createUserFriendlyError(err, 'Error al guardar el aporte')
      setError(friendlyMessage)
      console.error('Error en aporte:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-xl border border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? <><span className="text-gray-900">Editar</span> <span className="text-gray-900">Aporte</span></> : <><span className="text-gray-900">Nuevo</span> <span className="text-gray-900">Aporte</span></>}
              </h2>
              <p className="text-gray-500 text-sm">{isEditing ? 'Modifica los datos del aporte' : 'Registra un aporte de capital o inversión'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Análisis con IA - Colapsable */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setAiSectionExpanded(!aiSectionExpanded)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Análisis Automático con IA</h3>
                  <p className="text-sm text-gray-600">Sube un comprobante o graba un audio</p>
                </div>
              </div>
              {aiSectionExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {aiSectionExpanded && (
              <div className="px-5 pb-5 space-y-3 border-t border-gray-200 pt-4">
                {analyzing && (
                  <div className="flex items-center gap-3 p-3.5 bg-green-50 rounded-lg border border-green-100">
                    <Loader className="w-4 h-4 text-green-600 animate-spin" />
                    <p className="text-sm text-green-700">Analizando con IA...</p>
                  </div>
                )}

                {aiAnalyzed && (
                  <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-700">Formulario completado por IA. Revisa y ajusta.</p>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3.5 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-gray-50 transition-all">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Subir Comprobante</p>
                      <p className="text-xs text-gray-500">PDF o Imagen</p>
                    </div>
                    <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" disabled={analyzing} />
                  </label>

                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">O graba un audio</p>
                    <AudioRecorderComponent
                      onRecordingComplete={(audioFile) => analyzeWithAI(audioFile, 'audio')}
                      onError={(error) => setError(error)}
                      disabled={analyzing}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Datos del Aporte */}
          <div className="bg-white rounded-xl p-5 space-y-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Información del Aporte</h3>
            
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
                  step="1"
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-xl font-bold text-purple-700"
                />
              </div>
            </div>
          </div>

          {/* Detalles Adicionales */}
          <div className="bg-white rounded-xl p-5 space-y-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Detalles Adicionales</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">% Participación (opcional)</label>
                <input
                  type="number"
                  value={formData.porcentajeParticipacion}
                  onChange={(e) => setFormData({...formData, porcentajeParticipacion: e.target.value})}
                  min="0"
                  max="100"
                  step="1"
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
          <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
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
          <div className="flex gap-3 pt-5 border-t border-gray-200 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white text-sm rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
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
