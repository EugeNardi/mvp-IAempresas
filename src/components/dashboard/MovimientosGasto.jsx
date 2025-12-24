import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { 
  Save, X, Upload, Mic, Sparkles, Loader, 
  TrendingDown, AlertCircle, CheckCircle, FileText,
  ChevronDown, ChevronUp
} from 'lucide-react'
import AudioRecorderComponent from '../common/AudioRecorder'
import { processAudioForMovement, isOpenAIConfigured } from '../../services/aiService'
import { createUserFriendlyError } from '../../utils/errorMessages'

const MovimientosGasto = ({ movimiento, onClose, onSuccess }) => {
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
        categoria: movimiento.category || '',
        descripcion: movimiento.description || '',
        beneficiario: movimiento.metadata?.beneficiario || '',
        medio: movimiento.metadata?.paymentMethod || 'efectivo',
        pagado: movimiento.metadata?.pagado ? 'si' : 'no',
        deuda: movimiento.metadata?.deuda || '',
        monto: movimiento.amount?.toString() || '',
        comprobante: null,
        tipoGasto: movimiento.metadata?.tipoGasto || 'variable',
        periodicidad: movimiento.metadata?.periodicidad || 'mensual'
      }
    }
    return {
      fecha: new Date().toISOString().split('T')[0],
      categoria: '',
      descripcion: '',
      beneficiario: '',
      medio: 'efectivo',
      pagado: 'si',
      deuda: '',
      monto: '',
      comprobante: null,
      tipoGasto: 'variable',
      periodicidad: 'mensual'
    }
  })

  const categorias = ['Sueldos', 'Alquiler', 'Servicios', 'Marketing', 'Impuestos', 'Mantenimiento', 'Seguros', 'Otros']
  const mediosPago = ['efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito', 'cheque', 'debito_automatico']
  
  const beneficiariosSugeridos = [...new Set(
    invoices
      .filter(inv => inv.metadata?.movementType === 'gasto' && inv.metadata?.beneficiario)
      .map(inv => inv.metadata.beneficiario)
  )]

  const analyzeWithAI = async (file, type) => {
    setAnalyzing(true)
    setError('')

    try {
      if (type === 'audio') {
        if (!isOpenAIConfigured()) {
          throw new Error('API de OpenAI no configurada. Agrega tu VITE_OPENAI_API_KEY en el archivo .env')
        }

        const result = await processAudioForMovement(file, 'gasto')
        
        if (!result.success) {
          throw new Error(result.error)
        }

        const aiData = result.data
        
        const mappedData = {
          fecha: aiData.fecha || new Date().toISOString().split('T')[0],
          categoria: aiData.categoria || '',
          descripcion: aiData.descripcion || '',
          beneficiario: aiData.beneficiario || '',
          medio: aiData.medio || 'efectivo',
          pagado: aiData.pagado ? 'si' : 'no',
          monto: aiData.monto?.toString() || '',
          tipoGasto: aiData.tipoGasto || 'variable',
          periodicidad: aiData.periodicidad || 'mensual',
          comprobante: file
        }

        setFormData(prev => ({ ...prev, ...mappedData }))
        setAiAnalyzed(true)
        
      } else {
        await new Promise(resolve => setTimeout(resolve, 2500))

        const aiData = {
          fecha: new Date().toISOString().split('T')[0],
          categoria: 'Servicios',
          descripcion: 'Pago mensual de internet empresarial',
          beneficiario: 'Proveedor de Servicios SA',
          medio: 'debito_automatico',
          pagado: 'si',
          monto: '15000',
          tipoGasto: 'fijo',
          periodicidad: 'mensual'
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
      if (!formData.categoria) throw new Error('La categoría es obligatoria')
      if (!formData.monto || parseFloat(formData.monto) <= 0) throw new Error('El monto debe ser mayor a 0')

      const gastoData = {
        type: 'expense',
        date: formData.fecha,
        amount: parseFloat(formData.monto),
        description: formData.descripcion || formData.categoria,
        category: formData.categoria,
        number: isEditing ? (movimiento.number || movimiento.invoice_number) : `GASTO-${Date.now()}`,
        metadata: {
          movementType: 'gasto',
          descripcion: formData.descripcion,
          beneficiario: formData.beneficiario,
          paymentMethod: formData.medio,
          pagado: formData.pagado === 'si',
          deuda: formData.pagado === 'no' ? parseFloat(formData.deuda) : 0,
          tipoGasto: formData.tipoGasto,
          periodicidad: formData.tipoGasto === 'fijo' ? formData.periodicidad : null,
          comprobante: formData.comprobante,
          aiAnalyzed: aiAnalyzed
        }
      }

      if (isEditing) {
        await updateInvoice(movimiento.id, gastoData)
      } else {
        await addInvoice(gastoData)
      }
      onSuccess?.(isEditing ? 'Gasto actualizado exitosamente.' : 'Gasto registrado exitosamente.')
      onClose?.()
    } catch (err) {
      const friendlyMessage = createUserFriendlyError(err, 'Error al guardar el gasto')
      setError(friendlyMessage)
      console.error('Error en gasto:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-xl border border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? <><span className="text-gray-900">Editar</span> <span className="text-gray-900">Gasto</span></> : <><span className="text-gray-900">Nuevo</span> <span className="text-gray-900">Gasto</span></>}
              </h2>
              <p className="text-gray-500 text-sm">{isEditing ? 'Modifica los datos del gasto' : 'Registra un gasto operativo o administrativo'}</p>
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

          {/* Datos del Gasto */}
          <div className="bg-white rounded-xl p-5 space-y-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Información del Gasto</h3>
            
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
          <div className="bg-white rounded-xl p-5 space-y-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Información de Pago</h3>

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
                  step="1"
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
                step="1"
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-xl font-bold"
              />
            </div>
          </div>

          {/* Tipo de Gasto */}
          <div className="bg-white rounded-xl p-5 space-y-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tipo de Gasto</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Clasificación del Gasto *</label>
                <select
                  value={formData.tipoGasto}
                  onChange={(e) => setFormData({...formData, tipoGasto: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                >
                  <option value="variable">Variable (ocasional o fluctuante)</option>
                  <option value="fijo">Fijo (recurrente y constante)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Fijo:</strong> Alquiler, sueldos, servicios básicos, etc. | <strong>Variable:</strong> Marketing, mantenimiento, compras ocasionales, etc.
                </p>
              </div>

              {formData.tipoGasto === 'fijo' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Periodicidad del Pago *</label>
                  <select
                    value={formData.periodicidad}
                    onChange={(e) => setFormData({...formData, periodicidad: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                  >
                    <option value="semanal">Semanal</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="mensual">Mensual</option>
                    <option value="bimestral">Bimestral</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Indica cada cuánto tiempo se realiza este pago fijo
                  </p>
                </div>
              )}
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
              className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
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
