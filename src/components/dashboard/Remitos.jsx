import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { 
  Upload, FileText, Download, Trash2, Eye, Sparkles, 
  CheckCircle, AlertCircle, Loader, Search, Filter
} from 'lucide-react'

const Remitos = ({ companyData }) => {
  const { invoices, addInvoice } = useData()
  const [remitos, setRemitos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Simular análisis de IA del PDF
  const analyzeWithAI = async (file) => {
    setAnalyzing(true)
    setError('')

    try {
      // Simular delay de procesamiento de IA
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulación de análisis de IA (en producción, esto llamaría a una API de IA)
      const mockAnalysis = {
        type: Math.random() > 0.5 ? 'compra' : 'venta',
        date: new Date().toISOString().split('T')[0],
        number: `REM-${Math.floor(Math.random() * 10000)}`,
        provider: file.name.includes('proveedor') ? 'Proveedor SA' : 'Cliente XYZ',
        items: [
          {
            description: 'Producto detectado por IA',
            quantity: Math.floor(Math.random() * 10) + 1,
            unitPrice: (Math.random() * 1000).toFixed(2),
            subtotal: 0
          }
        ],
        subtotal: 0,
        iva: 0,
        iibb: 0,
        percepciones: 0,
        total: 0,
        category: Math.random() > 0.5 ? 'Mercadería' : 'Servicios',
        cuit: '20-12345678-9',
        condicionIVA: 'Responsable Inscripto',
        tipoComprobante: Math.random() > 0.5 ? 'Factura A' : 'Factura B',
        puntoVenta: '0001',
        confidence: (Math.random() * 30 + 70).toFixed(1) // 70-100%
      }

      // Calcular totales
      mockAnalysis.items[0].subtotal = mockAnalysis.items[0].quantity * mockAnalysis.items[0].unitPrice
      mockAnalysis.subtotal = mockAnalysis.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
      mockAnalysis.iva = mockAnalysis.subtotal * 0.21 // IVA 21%
      mockAnalysis.iibb = mockAnalysis.subtotal * 0.03 // IIBB 3%
      mockAnalysis.percepciones = mockAnalysis.subtotal * 0.02 // Percepciones 2%
      mockAnalysis.total = mockAnalysis.subtotal + mockAnalysis.iva + mockAnalysis.iibb + mockAnalysis.percepciones

      setAnalysisResult(mockAnalysis)
      return mockAnalysis
    } catch (err) {
      setError('Error al analizar el documento con IA')
      throw err
    } finally {
      setAnalyzing(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('El archivo no debe superar 10MB')
      return
    }

    setUploading(true)
    setSelectedFile(file)

    try {
      // Analizar con IA
      const analysis = await analyzeWithAI(file)

      // Crear objeto de remito
      const newRemito = {
        id: Date.now(),
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        analysis: analysis,
        status: 'pending', // pending, approved, rejected
        file: URL.createObjectURL(file)
      }

      setRemitos(prev => [newRemito, ...prev])
      setSuccess('Remito cargado y analizado exitosamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const approveRemito = async (remito) => {
    try {
      // Crear movimiento en el sistema
      const movement = {
        type: remito.analysis.type === 'venta' ? 'income' : 'expense',
        date: remito.analysis.date,
        amount: remito.analysis.total,
        description: `${remito.analysis.tipoComprobante} - ${remito.analysis.provider}`,
        category: remito.analysis.category,
        number: remito.analysis.number,
        metadata: {
          movementType: remito.analysis.type,
          provider: remito.analysis.provider,
          cuit: remito.analysis.cuit,
          condicionIVA: remito.analysis.condicionIVA,
          tipoComprobante: remito.analysis.tipoComprobante,
          puntoVenta: remito.analysis.puntoVenta,
          subtotal: remito.analysis.subtotal,
          iva: remito.analysis.iva,
          iibb: remito.analysis.iibb,
          percepciones: remito.analysis.percepciones,
          items: remito.analysis.items,
          fromRemito: true,
          remitoId: remito.id,
          aiConfidence: remito.analysis.confidence
        }
      }

      await addInvoice(movement)

      // Actualizar estado del remito
      setRemitos(prev => prev.map(r => 
        r.id === remito.id ? { ...r, status: 'approved' } : r
      ))

      setSuccess('Remito aprobado y registrado en el sistema')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Error al aprobar el remito')
    }
  }

  const deleteRemito = (id) => {
    setRemitos(prev => prev.filter(r => r.id !== id))
    setSuccess('Remito eliminado')
    setTimeout(() => setSuccess(''), 3000)
  }

  const filteredRemitos = remitos.filter(r => {
    const matchesSearch = r.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.analysis.provider.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterType === 'all') return matchesSearch
    if (filterType === 'pending') return matchesSearch && r.status === 'pending'
    if (filterType === 'approved') return matchesSearch && r.status === 'approved'
    return matchesSearch && r.analysis.type === filterType
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Remitos y Comprobantes
          </h1>
          <p className="text-sm text-gray-600">Carga y análisis automático</p>
        </div>
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 cursor-pointer transition-colors">
          <Upload className="w-4 h-4" />
          Cargar PDF
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Upload Progress */}
      {(uploading || analyzing) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Loader className="w-6 h-6 text-blue-600 animate-spin" />
            <div className="flex-1">
              <p className="font-semibold text-blue-900">
                {uploading ? 'Cargando archivo...' : 'Analizando con IA...'}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {analyzing && 'Extrayendo datos del comprobante'}
              </p>
            </div>
            {analyzing && (
              <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
            )}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Análisis Automático</h3>
            <p className="text-sm text-gray-700">
              La IA extrae datos del comprobante: tipo, proveedor, items, precios e impuestos.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por archivo o proveedor..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="compra">Compras</option>
            <option value="venta">Ventas</option>
          </select>
        </div>
      </div>

      {/* Remitos List */}
      <div className="space-y-4">
        {filteredRemitos.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay remitos cargados</h3>
            <p className="text-gray-600 mb-4">Comienza cargando tu primer PDF</p>
          </div>
        ) : (
          filteredRemitos.map((remito) => (
            <div key={remito.id} className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{remito.fileName}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        remito.status === 'approved' ? 'bg-green-100 text-green-800' :
                        remito.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {remito.status === 'approved' ? 'Aprobado' :
                         remito.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        remito.analysis.type === 'venta' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {remito.analysis.type === 'venta' ? 'Venta' : 'Compra'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Cargado el {new Date(remito.uploadDate).toLocaleDateString('es-AR')} • 
                      {(remito.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={remito.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Ver PDF"
                  >
                    <Eye className="w-5 h-5 text-gray-600" />
                  </a>
                  <button
                    onClick={() => deleteRemito(remito.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Analysis Results */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Datos Detectados
                  </h4>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tipo</p>
                    <p className="font-semibold text-gray-900">{remito.analysis.tipoComprobante}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Proveedor/Cliente</p>
                    <p className="font-semibold text-gray-900">{remito.analysis.provider}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Fecha</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(remito.analysis.date).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total</p>
                    <p className="font-bold text-lg text-gray-900">
                      ${remito.analysis.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {remito.status === 'pending' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => approveRemito(remito)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprobar y Registrar
                    </button>
                    <button
                      onClick={() => setRemitos(prev => prev.map(r => 
                        r.id === remito.id ? { ...r, status: 'rejected' } : r
                      ))}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Remitos
