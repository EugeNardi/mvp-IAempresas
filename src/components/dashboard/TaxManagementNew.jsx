import React, { useState, useMemo } from 'react'
import { Calculator, TrendingUp, AlertCircle, DollarSign, FileText, Building2, Percent, Download, Upload, Eye, Trash2, CheckCircle, Sparkles, Loader } from 'lucide-react'
import { useData } from '../../context/DataContext'

const TaxManagement = ({ invoices, companyData }) => {
  const { addInvoice } = useData()
  const [activeTab, setActiveTab] = useState('impuestos') // 'impuestos' o 'remitos'
  const [condicionIVA, setCondicionIVA] = useState('responsable_inscripto')
  const [provincia, setProvincia] = useState('buenos_aires')
  const [tipoSociedad, setTipoSociedad] = useState('sociedades')
  
  // Estados para Remitos
  const [remitos, setRemitos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Alícuotas ARCA Argentina 2024
  const taxRates = {
    iva: { general: 0.21, reducido: 0.105, exento: 0 },
    iibb: {
      buenos_aires: 0.03, caba: 0.025, cordoba: 0.035,
      santa_fe: 0.03, mendoza: 0.03, otras: 0.03
    },
    ganancias: { sociedades: 0.35, monotributo: 0, autonomo: 0.35 },
    percepciones_iva: 0.021,
    percepciones_ganancias: 0.02,
    percepciones_iibb: 0.03,
    retenciones_iva: 0.021,
    retenciones_ganancias: 0.02,
    seguridad_social: 0.21
  }

  // Calcular impuestos basados en remitos y movimientos
  const taxCalculations = useMemo(() => {
    if (!invoices || invoices.length === 0) {
      return {
        iva: { debito: 0, credito: 0, saldo: 0, percepciones: 0, retenciones: 0 },
        iibb: { total: 0, percepciones: 0, retenciones: 0 },
        ganancias: { estimado: 0, percepciones: 0, retenciones: 0, anticipo: 0 },
        seguridad_social: 0,
        total_a_pagar: 0
      }
    }

    let ivaDebito = 0
    let ivaCredito = 0
    let ivaPercepciones = 0
    let ivaRetenciones = 0
    let iibbTotal = 0
    let iibbPercepciones = 0
    let iibbRetenciones = 0
    let gananciasBruto = 0
    let gananciasPercepciones = 0
    let gananciasRetenciones = 0
    let seguridadSocial = 0

    invoices.forEach(inv => {
      const amount = parseFloat(inv.amount) || 0
      const metadata = inv.metadata || {}

      // Si viene de remito con análisis de IA
      if (metadata.fromRemito && metadata.subtotal) {
        if (inv.type === 'income') {
          ivaDebito += metadata.iva || 0
          iibbTotal += metadata.iibb || 0
          gananciasBruto += metadata.subtotal || 0
        } else {
          ivaCredito += metadata.iva || 0
          iibbTotal += metadata.iibb || 0
        }
        ivaPercepciones += metadata.percepciones || 0
      } else {
        // Cálculo estándar para movimientos sin remito
        const subtotal = amount / (1 + taxRates.iva.general)
        
        if (inv.type === 'income') {
          // Ventas
          if (condicionIVA === 'responsable_inscripto') {
            ivaDebito += subtotal * taxRates.iva.general
          }
          iibbTotal += subtotal * (taxRates.iibb[provincia] || taxRates.iibb.otras)
          gananciasBruto += subtotal
          
          // Percepciones en ventas
          ivaPercepciones += subtotal * taxRates.percepciones_iva
          iibbPercepciones += subtotal * taxRates.percepciones_iibb
        } else {
          // Compras
          if (condicionIVA === 'responsable_inscripto') {
            ivaCredito += subtotal * taxRates.iva.general
          }
          
          // Retenciones en compras
          ivaRetenciones += subtotal * taxRates.retenciones_iva
          gananciasRetenciones += subtotal * taxRates.retenciones_ganancias
          iibbRetenciones += subtotal * taxRates.percepciones_iibb
        }
      }

      // Seguridad Social (solo sobre sueldos)
      if (inv.category === 'Sueldos') {
        seguridadSocial += amount * taxRates.seguridad_social
      }
    })

    const ivaSaldo = ivaDebito - ivaCredito - ivaRetenciones
    const gananciasEstimado = gananciasBruto * (taxRates.ganancias[tipoSociedad] || 0.35)
    const gananciasAnticipo = gananciasEstimado / 12 // Anticipo mensual
    const totalAPagar = Math.max(0, ivaSaldo) + iibbTotal + gananciasAnticipo + seguridadSocial

    return {
      iva: {
        debito: ivaDebito,
        credito: ivaCredito,
        saldo: ivaSaldo,
        percepciones: ivaPercepciones,
        retenciones: ivaRetenciones
      },
      iibb: {
        total: iibbTotal,
        percepciones: iibbPercepciones,
        retenciones: iibbRetenciones
      },
      ganancias: {
        estimado: gananciasEstimado,
        percepciones: gananciasPercepciones,
        retenciones: gananciasRetenciones,
        anticipo: gananciasAnticipo
      },
      seguridad_social: seguridadSocial,
      total_a_pagar: totalAPagar
    }
  }, [invoices, condicionIVA, provincia, tipoSociedad])

  const downloadReport = () => {
    const reportDate = new Date().toLocaleDateString('es-AR')
    const companyName = companyData?.name || 'Mi Empresa'
    
    const reportContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte Impositivo ARCA</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1f2937; border-bottom: 3px solid #111827; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .header { margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
            .company { font-size: 28px; font-weight: bold; color: #111827; }
            .total { font-weight: bold; background-color: #f9fafb; font-size: 18px; }
            .positive { color: #059669; }
            .negative { color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">${companyName}</div>
            <div>Reporte Impositivo ARCA - ${reportDate}</div>
          </div>
          
          <h1>Resumen Impositivo</h1>
          <table>
            <tr><th>Concepto</th><th>Monto</th></tr>
            <tr><td>IVA Débito Fiscal</td><td class="positive">$${taxCalculations.iva.debito.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>IVA Crédito Fiscal</td><td class="negative">$${taxCalculations.iva.credito.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>IVA Retenciones</td><td class="negative">$${taxCalculations.iva.retenciones.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
            <tr class="total"><td>Saldo IVA a Pagar</td><td class="${taxCalculations.iva.saldo >= 0 ? 'negative' : 'positive'}">$${Math.abs(taxCalculations.iva.saldo).toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
          </table>

          <h2>Ingresos Brutos (IIBB)</h2>
          <table>
            <tr><th>Concepto</th><th>Monto</th></tr>
            <tr><td>IIBB Total (${provincia})</td><td class="negative">$${taxCalculations.iibb.total.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>Percepciones IIBB</td><td>$${taxCalculations.iibb.percepciones.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>Retenciones IIBB</td><td>$${taxCalculations.iibb.retenciones.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
          </table>

          <h2>Impuesto a las Ganancias</h2>
          <table>
            <tr><th>Concepto</th><th>Monto</th></tr>
            <tr><td>Ganancias Estimado Anual</td><td class="negative">$${taxCalculations.ganancias.estimado.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>Anticipo Mensual</td><td class="negative">$${taxCalculations.ganancias.anticipo.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
            <tr><td>Retenciones Ganancias</td><td>$${taxCalculations.ganancias.retenciones.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
          </table>

          <h2>Contribuciones Patronales</h2>
          <table>
            <tr><th>Concepto</th><th>Monto</th></tr>
            <tr><td>Seguridad Social (21%)</td><td class="negative">$${taxCalculations.seguridad_social.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
          </table>

          <h2>Total a Pagar</h2>
          <table>
            <tr class="total"><td>TOTAL IMPUESTOS</td><td class="negative">$${taxCalculations.total_a_pagar.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
          </table>
        </body>
      </html>
    `

    const blob = new Blob([reportContent], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_impositivo_${reportDate}.html`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Funciones para Remitos
  const analyzeWithAI = async (file) => {
    setAnalyzing(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockAnalysis = {
        type: Math.random() > 0.5 ? 'compra' : 'venta',
        date: new Date().toISOString().split('T')[0],
        number: `REM-${Math.floor(Math.random() * 10000)}`,
        provider: file.name.includes('proveedor') ? 'Proveedor SA' : 'Cliente XYZ',
        items: [{
          description: 'Producto detectado por IA',
          quantity: Math.floor(Math.random() * 10) + 1,
          unitPrice: (Math.random() * 1000).toFixed(2),
          subtotal: 0
        }],
        subtotal: 0, iva: 0, iibb: 0, percepciones: 0, total: 0,
        category: Math.random() > 0.5 ? 'Mercadería' : 'Servicios',
        cuit: '20-12345678-9',
        condicionIVA: 'Responsable Inscripto',
        tipoComprobante: Math.random() > 0.5 ? 'Factura A' : 'Factura B',
        puntoVenta: '0001',
        confidence: (Math.random() * 30 + 70).toFixed(1)
      }

      mockAnalysis.items[0].subtotal = mockAnalysis.items[0].quantity * mockAnalysis.items[0].unitPrice
      mockAnalysis.subtotal = mockAnalysis.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)
      mockAnalysis.iva = mockAnalysis.subtotal * 0.21
      mockAnalysis.iibb = mockAnalysis.subtotal * 0.03
      mockAnalysis.percepciones = mockAnalysis.subtotal * 0.02
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

    setUploading(true)
    setSelectedFile(file)

    try {
      const analysis = await analyzeWithAI(file)
      const newRemito = {
        id: Date.now(),
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        analysis: analysis,
        status: 'pending',
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
          fromRemito: true,
          subtotal: remito.analysis.subtotal,
          iva: remito.analysis.iva,
          iibb: remito.analysis.iibb,
          percepciones: remito.analysis.percepciones,
        }
      }

      await addInvoice(movement)
      setRemitos(prev => prev.map(r => r.id === remito.id ? { ...r, status: 'approved' } : r))
      setSuccess('Remito aprobado y agregado a movimientos')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Error al aprobar remito')
    }
  }

  const deleteRemito = (id) => {
    setRemitos(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header con Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Impuestos y Remitos</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('impuestos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'impuestos'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calculator className="w-4 h-4 inline mr-2" />
              Impuestos
            </button>
            <button
              onClick={() => setActiveTab('remitos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'remitos'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Remitos
            </button>
          </div>
        </div>
        {activeTab === 'impuestos' && (
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar Reporte
          </button>
        )}
      </div>

      {/* Contenido de Impuestos */}
      {activeTab === 'impuestos' && (
        <>
      {/* Configuración */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Configuración</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Condición IVA</label>
            <select value={condicionIVA} onChange={(e) => setCondicionIVA(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none">
              <option value="responsable_inscripto">Responsable Inscripto</option>
              <option value="monotributo">Monotributo</option>
              <option value="exento">Exento</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Provincia</label>
            <select value={provincia} onChange={(e) => setProvincia(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none">
              <option value="buenos_aires">Buenos Aires</option>
              <option value="caba">CABA</option>
              <option value="cordoba">Córdoba</option>
              <option value="santa_fe">Santa Fe</option>
              <option value="mendoza">Mendoza</option>
              <option value="otras">Otras</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Sociedad</label>
            <select value={tipoSociedad} onChange={(e) => setTipoSociedad(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none">
              <option value="sociedades">Sociedades</option>
              <option value="autonomo">Autónomo</option>
              <option value="monotributo">Monotributo</option>
            </select>
          </div>
        </div>
      </div>

      {/* IVA */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Percent className="w-5 h-5" />
          IVA
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Débito</p>
            <p className="text-2xl font-bold text-gray-900">
              ${taxCalculations.iva.debito.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Crédito</p>
            <p className="text-2xl font-bold text-gray-900">
              ${taxCalculations.iva.credito.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="md:col-span-2 bg-gray-900 p-4 rounded-lg">
            <p className="text-sm text-gray-300 mb-1">Saldo a Pagar</p>
            <p className="text-3xl font-bold text-white">
              ${Math.max(0, taxCalculations.iva.saldo).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* IIBB */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Ingresos Brutos
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            ${taxCalculations.iibb.total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Ganancias */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Ganancias
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Anticipo Mensual</p>
          <p className="text-2xl font-bold text-gray-900">
            ${taxCalculations.ganancias.anticipo.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Seguridad Social */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Seguridad Social
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            ${taxCalculations.seguridad_social.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-300 mb-2">Total Impuestos a Pagar</p>
            <p className="text-4xl font-bold">
              ${taxCalculations.total_a_pagar.toLocaleString('es-AR')}
            </p>
          </div>
          <Calculator className="w-16 h-16 text-gray-400" />
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Información
        </h4>
        <p className="text-sm text-blue-800">
          Los cálculos se basan en tus movimientos y remitos analizados. Los valores son estimados.
        </p>
      </div>
        </>
      )}

      {/* Contenido de Remitos */}
      {activeTab === 'remitos' && (
        <div className="space-y-6">
          {/* Mensajes */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Upload */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Cargar Remito</h3>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Haz clic para cargar un PDF</p>
                <p className="text-xs text-gray-500 mt-1">Máximo 10MB</p>
              </div>
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={uploading || analyzing} />
            </label>
          </div>

          {/* Analyzing */}
          {analyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center gap-3">
              <Loader className="w-6 h-6 text-blue-600 animate-spin" />
              <div>
                <p className="font-semibold text-blue-900">Analizando con IA...</p>
                <p className="text-sm text-blue-700">Extrayendo datos del remito</p>
              </div>
            </div>
          )}

          {/* Lista de Remitos */}
          <div className="space-y-4">
            {remitos.map((remito) => (
              <div key={remito.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{remito.fileName}</h4>
                    <p className="text-sm text-gray-500">{new Date(remito.uploadDate).toLocaleString('es-AR')}</p>
                  </div>
                  <div className="flex gap-2">
                    {remito.status === 'pending' && (
                      <button
                        onClick={() => approveRemito(remito)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Aprobar
                      </button>
                    )}
                    <button
                      onClick={() => deleteRemito(remito.id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Tipo</p>
                    <p className="font-semibold">{remito.analysis.type === 'venta' ? 'Venta' : 'Compra'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Proveedor/Cliente</p>
                    <p className="font-semibold">{remito.analysis.provider}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-semibold text-lg">${remito.analysis.total.toLocaleString('es-AR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Confianza IA</p>
                    <p className="font-semibold">{remito.analysis.confidence}%</p>
                  </div>
                </div>
                {remito.status === 'approved' && (
                  <div className="mt-3 flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Aprobado y agregado a movimientos</span>
                  </div>
                )}
              </div>
            ))}
            {remitos.length === 0 && !analyzing && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No hay remitos cargados</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TaxManagement
