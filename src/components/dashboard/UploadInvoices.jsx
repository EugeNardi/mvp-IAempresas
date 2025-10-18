import React, { useState } from 'react'
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, DollarSign, Calendar, ShoppingCart, TrendingUp, Loader2, Brain, AlertTriangle, Eye, X } from 'lucide-react'
import { processMultipleInvoices } from '../../services/invoiceProcessor'
import { processMultipleInvoicesWithAI } from '../../services/aiInvoiceProcessor'
import { useData } from '../../context/DataContext'

const UploadInvoices = ({ companyData }) => {
  const { invoices, saveInvoice, deleteInvoice, loading: invoicesLoading, tableExists } = useData()
  const [dragActive, setDragActive] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualInvoice, setManualInvoice] = useState({
    type: 'income',
    number: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: '',
  })
  const [processingStatus, setProcessingStatus] = useState('')
  const [processingProgress, setProcessingProgress] = useState(0)
  const [useAI, setUseAI] = useState(true)
  const [aiResults, setAiResults] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState(null)
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [pdfToView, setPdfToView] = useState(null)
  const [activeTab, setActiveTab] = useState('ventas') // 'ventas' o 'compras'

  // Actualizar tipo de factura cuando cambia el tab
  React.useEffect(() => {
    if (showManualForm) {
      setManualInvoice(prev => ({
        ...prev,
        type: activeTab === 'ventas' ? 'income' : 'expense'
      }))
    }
  }, [activeTab, showManualForm])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }


  const handleFiles = async (files) => {
    setProcessing(true)
    setProcessingStatus('Iniciando procesamiento...')
    setProcessingProgress(0)
    setAiResults(null)
    
    try {
      let results
      
      if (useAI) {
        // Procesar con IA
        setProcessingStatus('Procesando con IA (detección de duplicados)...')
        results = await processMultipleInvoicesWithAI(
          Array.from(files), 
          invoices, // Pasar facturas existentes para detección de duplicados
          (progress) => {
            setProcessingStatus(progress.status)
            setProcessingProgress(progress.progress)
          }
        )
      } else {
        // Procesar sin IA (método tradicional)
        results = await processMultipleInvoices(Array.from(files), (progress) => {
          setProcessingStatus(progress.status)
          setProcessingProgress(progress.progress)
        })
      }
      
      // Analizar resultados
      const successfulInvoices = results.filter(inv => inv.processed && !inv.error)
      const duplicateCopies = results.filter(inv => inv.aiAnalysis?.isDuplicateCopy)
      const withWarnings = results.filter(inv => inv.aiAnalysis?.warnings?.length > 0)
      
      // Guardar resultados para mostrar
      if (useAI) {
        setAiResults({
          total: results.length,
          successful: successfulInvoices.length,
          duplicates: duplicateCopies.length,
          warnings: withWarnings.length,
          details: results
        })
      }
      
      if (successfulInvoices.length > 0) {
        // Guardar TODAS las facturas (incluso copias)
        // Las copias tienen shouldCount: false en impuestos
        const toSave = successfulInvoices
        
        if (toSave.length > 0) {
          setProcessingStatus('Guardando facturas en la base de datos...')
          for (let i = 0; i < toSave.length; i++) {
            const invoice = toSave[i]
            const file = Array.from(files)[i]
            
            // FORZAR el tipo según el tab activo (usuario decide)
            invoice.type = activeTab === 'ventas' ? 'income' : 'expense'
            
            // Crear URL temporal del archivo para visualización
            if (file) {
              const fileUrl = URL.createObjectURL(file)
              invoice.fileUrl = fileUrl
              invoice.fileName = file.name
              invoice.fileType = file.type
            }
            
            await saveInvoice(invoice)
          }
          console.log(`✅ ${toSave.length} factura(s) guardada(s) en ${activeTab === 'ventas' ? 'Ventas' : 'Compras'}`)
        }
        
        // Mostrar resumen
        if (duplicateCopies.length > 0) {
          alert(`📋 Se detectaron ${duplicateCopies.length} copia(s) de facturas.\n\nSe guardaron todas las facturas (${toSave.length}), pero las copias no sumarán impuestos en los reportes.`)
        }
      }
      
      // Mostrar errores si los hay
      const failedInvoices = results.filter(inv => inv.error)
      if (failedInvoices.length > 0) {
        console.error('Facturas con errores:', failedInvoices)
        alert(`${failedInvoices.length} archivo(s) no pudieron procesarse. Ver consola para detalles.`)
      }
      
    } catch (error) {
      console.error('Error procesando facturas:', error)
      alert('Error al procesar las facturas. Por favor, intenta de nuevo.')
    } finally {
      setProcessing(false)
      setProcessingStatus('')
      setProcessingProgress(0)
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const newInvoice = {
        ...manualInvoice,
        fileName: 'Manual',
        processed: true,
      }
      
      await saveInvoice(newInvoice)
      
      setManualInvoice({
        type: 'income',
        number: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        category: '',
      })
      setShowManualForm(false)
      
      console.log('✅ Factura manual guardada correctamente')
    } catch (error) {
      console.error('Error guardando factura manual:', error)
      alert('Error al guardar la factura. Por favor, intenta de nuevo.')
    }
  }

  const handleDelete = async (id) => {
    const invoice = invoices.find(inv => inv.id === id)
    setInvoiceToDelete(invoice)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!invoiceToDelete) return
    
    try {
      await deleteInvoice(invoiceToDelete.id)
      setShowDeleteModal(false)
      setInvoiceToDelete(null)
    } catch (error) {
      console.error('Error eliminando factura:', error)
      alert('Error al eliminar la factura')
    }
  }

  const handleViewPdf = (invoice) => {
    // Si la factura tiene un archivo asociado, mostrarlo
    if (invoice.fileUrl || invoice.fileName) {
      setPdfToView(invoice)
      setShowPdfViewer(true)
    } else {
      alert('Esta factura no tiene un archivo asociado')
    }
  }

  const downloadInvoiceFile = (invoice) => {
    if (invoice.fileUrl) {
      const link = document.createElement('a')
      link.href = invoice.fileUrl
      link.download = invoice.fileName || `factura-${invoice.number}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const totalIncome = invoices
    .filter(inv => inv.type === 'income')
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0)

  const totalExpenses = invoices
    .filter(inv => inv.type === 'expense')
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0)

  // Mostrar loading mientras se cargan las facturas
  if (invoicesLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando facturas...</p>
        </div>
      </div>
    )
  }

  // Mostrar mensaje si la tabla no existe
  if (!tableExists) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-900 mb-3">
                ⚠️ Tabla de Facturas No Configurada
              </h3>
              <p className="text-red-800 mb-4">
                La tabla <code className="bg-red-100 px-2 py-1 rounded font-mono text-sm">invoices</code> no existe en tu base de datos de Supabase.
              </p>
              
              <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
                <h4 className="font-bold text-gray-900 mb-2">👉 Pasos para solucionar:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Abre tu proyecto en <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Supabase Dashboard</a></li>
                  <li>Ve a <strong>SQL Editor</strong> en el menú lateral</li>
                  <li>Abre el archivo <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">supabase-invoices-setup.sql</code> de tu proyecto</li>
                  <li>Copia todo el contenido y pégalo en el SQL Editor</li>
                  <li>Haz click en <strong>Run</strong> para ejecutar el script</li>
                  <li>Recarga esta página (F5)</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>📝 Nota:</strong> El script creará la tabla con todas las columnas necesarias, índices, y políticas de seguridad (RLS).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!companyData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Configura tu empresa primero
          </h3>
          <p className="text-gray-600">
            Antes de cargar facturas, completa los datos de tu empresa en la pestaña "Datos de Empresa"
          </p>
        </div>
      </div>
    )
  }

  const salesInvoices = invoices.filter(inv => inv.type === 'income')
  const purchaseInvoices = invoices.filter(inv => inv.type === 'expense')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Facturas de Venta</span>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${totalIncome.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">{salesInvoices.length} factura(s)</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Facturas de Compra</span>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${totalExpenses.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">{purchaseInvoices.length} factura(s)</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Facturas</span>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
          <p className="text-xs text-gray-500 mt-1">
            {salesInvoices.length} ventas / {purchaseInvoices.length} compras
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Resultado</span>
            <div className={`w-10 h-10 ${totalIncome - totalExpenses >= 0 ? 'bg-blue-100' : 'bg-orange-100'} rounded-lg flex items-center justify-center`}>
              <DollarSign className={`w-5 h-5 ${totalIncome - totalExpenses >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${(totalIncome - totalExpenses).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Tabs de Sección */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('ventas')}
            className={`flex-1 px-6 py-4 font-semibold transition-all ${
              activeTab === 'ventas'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>Facturas de Venta</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'ventas' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {salesInvoices.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('compras')}
            className={`flex-1 px-6 py-4 font-semibold transition-all ${
              activeTab === 'compras'
                ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Facturas de Compra</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'compras' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                {purchaseInvoices.length}
              </span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {activeTab === 'ventas' ? 'Cargar Facturas de Venta' : 'Cargar Facturas de Compra'}
                {useAI && <Brain className="w-6 h-6 text-slate-600" />}
              </h3>
              <p className="text-gray-600">
                {useAI ? (
                  <span className="flex items-center gap-1">
                    <Brain className="w-4 h-4" />
                    IA activada: Detecta duplicados y valida datos automáticamente
                  </span>
                ) : (
                  activeTab === 'ventas' 
                    ? 'Sube facturas de ventas e ingresos' 
                    : 'Sube facturas de compras y gastos'
                )}
              </p>
            </div>
          <div className="flex items-center gap-3">
            {/* Toggle IA */}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm font-medium text-gray-700">IA</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-600"></div>
              </div>
            </label>
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
            >
              {showManualForm ? 'Cancelar' : 'Ingreso Manual'}
            </button>
          </div>
        </div>

        {/* Resultados del análisis con IA */}
        {aiResults && (
          <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Brain className="w-6 h-6 text-slate-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-2">Resultados del Análisis con IA</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <p className="text-xs text-gray-600">Total procesadas</p>
                    <p className="text-xl font-bold text-gray-900">{aiResults.total}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <p className="text-xs text-emerald-700">Guardadas</p>
                    <p className="text-xl font-bold text-emerald-600">{aiResults.successful - aiResults.duplicates}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <p className="text-xs text-amber-700">Duplicadas</p>
                    <p className="text-xl font-bold text-amber-600">{aiResults.duplicates}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-700">Con advertencias</p>
                    <p className="text-xl font-bold text-blue-600">{aiResults.warnings}</p>
                  </div>
                </div>
                {aiResults.duplicates > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-800 font-medium mb-1">
                          Se detectaron {aiResults.duplicates} copia(s) de facturas
                        </p>
                        <p className="text-xs text-blue-700">
                          ✅ Todas las facturas se guardaron (incluyendo copias)<br/>
                          ✅ Las copias están marcadas con badge "📋 Copia"<br/>
                          ✅ Los impuestos de las copias NO se suman en reportes<br/>
                          ✅ Solo la factura original cuenta para cálculos de IVA
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showManualForm ? (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            {/* Badge informativo del tipo */}
            <div className={`p-3 rounded-lg border-2 ${
              activeTab === 'ventas' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm font-medium ${
                activeTab === 'ventas' ? 'text-green-800' : 'text-red-800'
              }`}>
                {activeTab === 'ventas' ? '📈 Factura de Venta' : '🛒 Factura de Compra'} - Se guardará como {activeTab === 'ventas' ? 'Ingreso' : 'Gasto'}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Factura *
                </label>
                <input
                  type="text"
                  value={manualInvoice.number}
                  onChange={(e) => setManualInvoice({...manualInvoice, number: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 outline-none"
                  placeholder="FAC-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={manualInvoice.date}
                  onChange={(e) => setManualInvoice({...manualInvoice, date: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={manualInvoice.amount}
                  onChange={(e) => setManualInvoice({...manualInvoice, amount: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  value={manualInvoice.category}
                  onChange={(e) => setManualInvoice({...manualInvoice, category: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 outline-none"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Ventas">Ventas</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Compras">Compras</option>
                  <option value="Gastos Operativos">Gastos Operativos</option>
                  <option value="Sueldos">Sueldos</option>
                  <option value="Impuestos">Impuestos</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={manualInvoice.description}
                  onChange={(e) => setManualInvoice({...manualInvoice, description: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 outline-none"
                  placeholder="Descripción de la factura"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all"
            >
              Agregar Factura
            </button>
          </form>
        ) : (
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              dragActive ? 'border-black bg-gray-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleChange}
              className="hidden"
            />
            
            {processing ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <p className="text-gray-900 font-semibold">Procesando con OCR...</p>
                <p className="text-sm text-gray-600">{processingStatus}</p>
                {processingProgress > 0 && (
                  <div className="max-w-xs mx-auto">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-700 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{Math.round(processingProgress)}%</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Arrastra archivos aquí o haz clic para seleccionar
                </h4>
                <p className="text-gray-600 mb-4">
                  Soporta PDF, JPG, PNG (máx. 10MB por archivo)
                </p>
                <label
                  htmlFor="file-upload"
                  className="inline-block bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all cursor-pointer"
                >
                  Seleccionar Archivos
                </label>
              </>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Invoices List - Filtrada por Tab */}
      {((activeTab === 'ventas' && salesInvoices.length > 0) || (activeTab === 'compras' && purchaseInvoices.length > 0)) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {activeTab === 'ventas' 
              ? `Facturas de Venta Cargadas (${salesInvoices.length})`
              : `Facturas de Compra Cargadas (${purchaseInvoices.length})`
            }
          </h3>
          
          <div className="space-y-3">
            {(activeTab === 'ventas' ? salesInvoices : purchaseInvoices).map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-10 h-10 ${invoice.type === 'income' ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                    <FileText className={`w-5 h-5 ${invoice.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900">{invoice.number}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.type === 'income' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {invoice.type === 'income' ? '📈 Venta' : '🛒 Compra'}
                      </span>
                      {invoice.fileName !== 'Manual' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          🤖 OCR
                        </span>
                      )}
                      {invoice.aiAnalysis?.isDuplicateCopy && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                          📋 Copia
                        </span>
                      )}
                      {invoice.aiProcessed && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          🧠 IA
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{invoice.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(invoice.date).toLocaleDateString('es-AR')}
                      </span>
                      <span className="text-xs text-gray-500">{invoice.category}</span>
                    </div>
                    
                    {/* Mostrar impuestos discriminados */}
                    {invoice.taxes && invoice.taxes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {invoice.taxes.map((tax, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                            {tax.name}: ${tax.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className={`text-lg font-bold ${invoice.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {invoice.type === 'income' ? '+' : '-'}${parseFloat(invoice.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                    {invoice.taxes && invoice.taxes.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {invoice.taxes.length} impuesto{invoice.taxes.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {/* Botón Ver/Descargar Archivo */}
                  {invoice.fileName !== 'Manual' && invoice.fileUrl && (
                    <button
                      onClick={() => handleViewPdf(invoice)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group relative"
                      title={invoice.fileType?.startsWith('image/') ? 'Ver imagen' : invoice.fileType === 'application/pdf' ? 'Ver PDF' : 'Descargar archivo'}
                    >
                      <Eye className="w-5 h-5" />
                      {/* Tooltip con tipo de archivo */}
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {invoice.fileType?.startsWith('image/') ? '🖼️ Imagen' : invoice.fileType === 'application/pdf' ? '📄 PDF' : '📁 Archivo'}
                      </span>
                    </button>
                  )}
                  
                  {/* Botón Eliminar */}
                  <button
                    onClick={() => handleDelete(invoice.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar factura"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && invoiceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  ¿Eliminar factura?
                </h3>
                <p className="text-gray-600 mb-4">
                  Estás a punto de eliminar la siguiente factura:
                </p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Número:</span>
                    <span className="font-semibold text-gray-900">{invoiceToDelete.number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fecha:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(invoiceToDelete.date).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monto:</span>
                    <span className={`font-bold ${
                      invoiceToDelete.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${parseFloat(invoiceToDelete.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-red-600 mt-4 font-medium">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setInvoiceToDelete(null)
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visor de PDF */}
      {showPdfViewer && pdfToView && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{pdfToView.number}</h3>
                  <p className="text-sm text-gray-600">{pdfToView.description}</p>
                  {pdfToView.fileName && (
                    <p className="text-xs text-gray-500 mt-1">{pdfToView.fileName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pdfToView.fileUrl && (
                  <button
                    onClick={() => downloadInvoiceFile(pdfToView)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowPdfViewer(false)
                    setPdfToView(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Visor de Archivo */}
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              {pdfToView.fileUrl ? (
                <div className="h-full flex items-center justify-center">
                  {pdfToView.fileType?.startsWith('image/') ? (
                    // Mostrar imagen
                    <img
                      src={pdfToView.fileUrl}
                      alt={pdfToView.number}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                  ) : pdfToView.fileType === 'application/pdf' || pdfToView.fileName?.endsWith('.pdf') ? (
                    // Mostrar PDF en iframe
                    <iframe
                      src={pdfToView.fileUrl}
                      className="w-full h-full rounded-lg border border-gray-300 bg-white"
                      title={`PDF de ${pdfToView.number}`}
                    />
                  ) : (
                    // Archivo no visualizable - mostrar info y botón de descarga
                    <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                      <FileText className="w-20 h-20 text-blue-600 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        Archivo: {pdfToView.fileName}
                      </p>
                      <p className="text-sm text-gray-600 mb-6">
                        Este tipo de archivo no se puede visualizar en el navegador.
                      </p>
                      <button
                        onClick={() => downloadInvoiceFile(pdfToView)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Descargar Archivo
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No hay archivo disponible</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Esta factura fue ingresada manualmente.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer con información */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Tipo</p>
                  <p className="font-semibold text-gray-900">
                    {pdfToView.type === 'income' ? '📈 Venta' : '🛒 Compra'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Fecha</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(pdfToView.date).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Categoría</p>
                  <p className="font-semibold text-gray-900">{pdfToView.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Monto</p>
                  <p className={`font-bold text-lg ${
                    pdfToView.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${parseFloat(pdfToView.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadInvoices
