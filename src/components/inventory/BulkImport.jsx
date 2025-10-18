import React, { useState } from 'react'
import { X, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useData } from '../../context/DataContext'
import * as XLSX from 'xlsx'

const BulkImport = ({ categories, onClose, onImportComplete }) => {
  const { companyData } = useData()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState([])
  const [errors, setErrors] = useState([])
  const [success, setSuccess] = useState(false)
  const [importStats, setImportStats] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      alert('Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV')
      return
    }

    setFile(selectedFile)
    readFile(selectedFile)
  }

  const readFile = (file) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)

        if (jsonData.length === 0) {
          alert('El archivo está vacío')
          return
        }

        // Validar y mapear datos
        const mappedData = jsonData.map((row, index) => {
          const errors = []
          
          if (!row.nombre && !row.Nombre && !row.NOMBRE) {
            errors.push('Falta el nombre del producto')
          }
          
          if (!row.costo && !row.Costo && !row.COSTO && row.costo !== 0) {
            errors.push('Falta el costo')
          }

          if (!row.precio && !row.Precio && !row.PRECIO && row.precio !== 0) {
            errors.push('Falta el precio de venta')
          }

          return {
            rowNumber: index + 2, // +2 porque Excel empieza en 1 y tiene header
            name: row.nombre || row.Nombre || row.NOMBRE || '',
            sku: row.sku || row.SKU || row.codigo || row.Codigo || '',
            description: row.descripcion || row.Descripcion || row.DESCRIPCION || '',
            category: row.categoria || row.Categoria || row.CATEGORIA || '',
            supplier: row.proveedor || row.Proveedor || row.PROVEEDOR || '',
            unit_cost: parseFloat(row.costo || row.Costo || row.COSTO || 0),
            sale_price: parseFloat(row.precio || row.Precio || row.PRECIO || 0),
            current_stock: parseInt(row.stock || row.Stock || row.STOCK || row.cantidad || row.Cantidad || 0),
            min_stock: parseInt(row.stock_minimo || row['Stock Minimo'] || row.min_stock || 0),
            unit_measure: row.unidad || row.Unidad || row.UNIDAD || 'Unidad',
            energy_cost: parseFloat(row.energia || row.Energia || row.ENERGIA || 0),
            errors
          }
        })

        setPreview(mappedData)
        
        // Contar errores
        const totalErrors = mappedData.filter(item => item.errors.length > 0).length
        if (totalErrors > 0) {
          setErrors([`${totalErrors} productos tienen errores y no se importarán`])
        } else {
          setErrors([])
        }
      } catch (error) {
        console.error('Error reading file:', error)
        alert('Error al leer el archivo. Verifica que sea un Excel válido.')
      }
    }

    reader.readAsArrayBuffer(file)
  }

  const handleImport = async () => {
    setLoading(true)
    setErrors([])

    try {
      // Filtrar productos válidos
      const validProducts = preview.filter(item => item.errors.length === 0)
      
      if (validProducts.length === 0) {
        setErrors(['No hay productos válidos para importar'])
        setLoading(false)
        return
      }

      // Mapear categorías por nombre
      const categoryMap = {}
      categories.forEach(cat => {
        categoryMap[cat.name.toLowerCase()] = cat.id
      })

      // Preparar datos para inserción
      const productsToInsert = validProducts.map(item => ({
        company_id: companyData.id,
        name: item.name,
        sku: item.sku || null,
        description: item.description || null,
        category_id: categoryMap[item.category.toLowerCase()] || null,
        unit_cost: item.unit_cost,
        sale_price: item.sale_price,
        current_stock: item.current_stock,
        min_stock: item.min_stock,
        unit_measure: item.unit_measure,
        energy_cost: item.energy_cost
      }))

      // Insertar en base de datos
      const { data, error } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select()

      if (error) throw error

      setSuccess(true)
      setImportStats({
        total: preview.length,
        imported: data.length,
        errors: preview.length - data.length
      })

      setTimeout(() => {
        onImportComplete()
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Error importing products:', error)
      setErrors([`Error al importar: ${error.message}`])
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        nombre: 'Producto Ejemplo',
        sku: 'PROD-001',
        descripcion: 'Descripción del producto',
        categoria: 'Productos',
        proveedor: 'Proveedor XYZ',
        costo: 100.00,
        precio: 150.00,
        stock: 50,
        stock_minimo: 10,
        unidad: 'Unidad',
        energia: 5.00
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Productos')
    XLSX.writeFile(wb, 'plantilla_productos.xlsx')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Importar Productos desde Excel</h3>
                <p className="text-sm text-gray-500">Carga masiva de productos</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Instructions */}
          {!success && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">Instrucciones</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Descarga la plantilla de Excel con las columnas requeridas</li>
                    <li>Completa los datos de tus productos en el archivo</li>
                    <li>Las columnas obligatorias son: <strong>nombre, costo, precio</strong></li>
                    <li>Columnas opcionales: sku, descripcion, categoria, proveedor, stock, stock_minimo, unidad, energia</li>
                    <li>Sube el archivo completado para importar</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Download Template */}
          {!file && !success && (
            <div className="text-center py-8">
              <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
              >
                <Download className="w-5 h-5" />
                <span>Descargar Plantilla Excel</span>
              </button>
              <p className="text-sm text-gray-600">Descarga la plantilla, complétala y súbela aquí</p>
            </div>
          )}

          {/* File Upload */}
          {!success && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Archivo Excel
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">
                    {file ? file.name : 'Click para seleccionar un archivo'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Formatos: .xlsx, .xls, .csv
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-2">Errores encontrados</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Success */}
          {success && importStats && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-green-900 mb-2">¡Importación Exitosa!</h4>
              <p className="text-green-800 mb-4">
                Se importaron <strong>{importStats.imported}</strong> de <strong>{importStats.total}</strong> productos
              </p>
              <p className="text-sm text-green-700">Cerrando automáticamente...</p>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && !success && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Vista Previa ({preview.length} productos)
              </h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">#</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Nombre</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">SKU</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Costo</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Precio</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Stock</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {preview.slice(0, 10).map((item, index) => (
                      <tr key={index} className={item.errors.length > 0 ? 'bg-red-50' : ''}>
                        <td className="px-3 py-2 text-gray-600">{item.rowNumber}</td>
                        <td className="px-3 py-2 text-gray-900">{item.name || '-'}</td>
                        <td className="px-3 py-2 text-gray-600">{item.sku || '-'}</td>
                        <td className="px-3 py-2 text-right text-gray-900">${item.unit_cost.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-gray-900">${item.sale_price.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-gray-900">{item.current_stock}</td>
                        <td className="px-3 py-2 text-center">
                          {item.errors.length > 0 ? (
                            <span className="text-red-600 text-xs" title={item.errors.join(', ')}>
                              ❌ Error
                            </span>
                          ) : (
                            <span className="text-green-600 text-xs">✓ OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 10 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Mostrando 10 de {preview.length} productos
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && preview.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={loading || errors.length > 0}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importando...' : `Importar ${preview.filter(p => p.errors.length === 0).length} Productos`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BulkImport
