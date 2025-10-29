import React, { useState } from 'react'
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle, Download, FileText, Trash2 } from 'lucide-react'

const ExcelImport = ({ invoices, setInvoices, companyData }) => {
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar que sea un archivo Excel
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]

    if (!validTypes.includes(file.type)) {
      alert('Por favor sube un archivo Excel (.xlsx, .xls) o CSV')
      return
    }

    setImporting(true)
    setImportResult(null)

    try {
      // Simular procesamiento de Excel
      // En producción, aquí usarías una librería como xlsx o SheetJS
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Datos de ejemplo importados
      const importedInvoices = [
        {
          id: Date.now() + 1,
          fileName: file.name,
          type: 'income',
          number: 'IMP-001',
          date: new Date().toISOString().split('T')[0],
          amount: '15000.00',
          description: 'Importado desde Excel',
          category: 'Ventas',
          taxes: [],
          processed: true,
          source: 'excel'
        },
        {
          id: Date.now() + 2,
          fileName: file.name,
          type: 'expense',
          number: 'IMP-002',
          date: new Date().toISOString().split('T')[0],
          amount: '8500.00',
          description: 'Importado desde Excel',
          category: 'Gastos Operativos',
          taxes: [],
          processed: true,
          source: 'excel'
        }
      ]

      setInvoices([...invoices, ...importedInvoices])
      setImportResult({
        success: true,
        count: importedInvoices.length,
        message: `${importedInvoices.length} registros importados correctamente`
      })
    } catch (error) {
      console.error('Error importando Excel:', error)
      setImportResult({
        success: false,
        message: 'Error al importar el archivo'
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    // Crear template CSV
    const template = `Tipo,Número,Fecha,Monto,Descripción,Categoría
income,FAC-001,2024-03-15,15000.00,Venta de productos,Ventas
expense,COMP-001,2024-03-15,8500.00,Compra de insumos,Gastos Operativos`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla_facturas.csv'
    a.click()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent inline-block pb-2">Importar</span> desde Excel
          </h2>
          <p className="text-gray-600 mt-1">Carga masiva de facturas desde archivos Excel o CSV</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-lg">
          <FileSpreadsheet className="w-5 h-5 text-green-600" />
          <span className="text-sm font-semibold text-green-700">Excel/CSV</span>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Cargar Archivo Excel</h3>
          <p className="text-gray-600 mb-6">Soporta archivos .xlsx, .xls y .csv</p>

          <label className="inline-block">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelUpload}
              className="hidden"
              disabled={importing}
            />
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all cursor-pointer inline-flex items-center space-x-2">
              {importing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Importando...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Seleccionar Archivo</span>
                </>
              )}
            </div>
          </label>

          <button
            onClick={downloadTemplate}
            className="ml-4 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all inline-flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Descargar Plantilla</span>
          </button>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className={`mt-6 p-4 rounded-xl border ${
            importResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {importResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <p className={`font-semibold ${
                importResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {importResult.message}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Formato del Archivo
        </h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Columnas requeridas:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Tipo:</strong> "income" (venta) o "expense" (compra)</li>
            <li><strong>Número:</strong> Número de factura</li>
            <li><strong>Fecha:</strong> Formato YYYY-MM-DD (ej: 2024-03-15)</li>
            <li><strong>Monto:</strong> Valor numérico (ej: 15000.00)</li>
            <li><strong>Descripción:</strong> Descripción de la factura</li>
            <li><strong>Categoría:</strong> Ventas, Gastos Operativos, etc.</li>
          </ul>
          <p className="mt-3"><strong>Tip:</strong> Descarga la plantilla para ver el formato correcto</p>
        </div>
      </div>

      {/* Imported Invoices */}
      {invoices.filter(inv => inv.source === 'excel').length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Facturas Importadas desde Excel ({invoices.filter(inv => inv.source === 'excel').length})
          </h3>
          <div className="space-y-3">
            {invoices.filter(inv => inv.source === 'excel').map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{invoice.number}</h4>
                    <p className="text-sm text-gray-600">{invoice.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${invoice.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {invoice.type === 'income' ? '+' : '-'}${parseFloat(invoice.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExcelImport
