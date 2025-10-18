import React, { useState } from 'react'
import { X, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Brain, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useData } from '../../context/DataContext'
import * as XLSX from 'xlsx'
import { analyzeExcelStructure } from '../../services/excelAnalyzer'

const SmartBulkImport = ({ companyData, categories, onClose, onImportComplete }) => {
  // Usar companyData de props si existe, sino del contexto
  const contextData = useData()
  const activeCompanyData = companyData || contextData.companyData
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [preview, setPreview] = useState([])
  const [rawData, setRawData] = useState([])
  const [detectedColumns, setDetectedColumns] = useState([])
  const [columnMapping, setColumnMapping] = useState({})
  const [errors, setErrors] = useState([])
  const [success, setSuccess] = useState(false)
  const [importStats, setImportStats] = useState(null)
  const [step, setStep] = useState('upload')

  const targetFields = [
    { key: 'name', label: 'Nombre del Producto', required: true },
    { key: 'sku', label: 'SKU/Código', required: false },
    { key: 'description', label: 'Descripción', required: false },
    { key: 'category', label: 'Categoría', required: false },
    { key: 'supplier', label: 'Proveedor', required: false },
    { key: 'unit_cost', label: 'Costo Unitario', required: false }, // Ahora opcional
    { key: 'sale_price', label: 'Precio de Venta', required: false }, // Ahora opcional
    { key: 'current_stock', label: 'Stock Actual', required: false },
    { key: 'min_stock', label: 'Stock Mínimo', required: false },
    { key: 'unit_measure', label: 'Unidad de Medida', required: false },
    { key: 'energy_cost', label: 'Costo de Energía', required: false }
  ]

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

  const readFile = async (file) => {
    setAnalyzing(true)
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        
        // PASO 1: Leer estructura raw para detectar encabezados
        const rawArray = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
        console.log('📊 Estructura raw del Excel (primeras 3 filas):', rawArray.slice(0, 3))
        
        // PASO 2: Detectar encabezados (primera fila)
        const headers = rawArray[0] || []
        console.log('📋 Encabezados detectados:', headers)
        
        // PASO 3: Leer datos como objetos usando los encabezados
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
          defval: '',
          raw: false,
          header: headers.length > 0 ? undefined : 1 // Auto-detectar headers
        })
        
        console.log('📦 Datos como objetos (primera fila):', jsonData[0])
        console.log('📊 Total filas en Excel:', jsonData.length)

        if (jsonData.length === 0) {
          alert('El archivo está vacío')
          setAnalyzing(false)
          return
        }

        // Limpiar datos: filtrar SOLO filas completamente vacías
        // Mantener filas que tengan al menos UN valor no vacío
        const cleanedData = jsonData.filter(row => {
          const values = Object.values(row)
          // Contar cuántos valores no vacíos tiene
          const nonEmptyValues = values.filter(val => {
            if (val === null || val === undefined) return false
            const strVal = String(val).trim()
            return strVal !== '' && strVal !== '0'
          })
          // Mantener la fila si tiene al menos un valor
          return nonEmptyValues.length > 0
        })

        console.log('Total filas en Excel:', jsonData.length)
        console.log('Filas con datos:', cleanedData.length)

        if (cleanedData.length === 0) {
          alert('No se encontraron datos válidos en el archivo')
          setAnalyzing(false)
          return
        }

        // Obtener columnas válidas (sin __EMPTY, Column1, etc.)
        const allColumns = new Set()
        cleanedData.forEach(row => {
          Object.keys(row).forEach(key => {
            if (key && 
                key.trim() && 
                !key.startsWith('__EMPTY') &&
                !key.match(/^Column\d+$/i) &&
                key !== 'undefined') {
              allColumns.add(key)
            }
          })
        })

        const validColumns = Array.from(allColumns)

        if (validColumns.length === 0) {
          alert('No se encontraron columnas válidas en el archivo')
          setAnalyzing(false)
          return
        }

        console.log('Columnas válidas detectadas:', validColumns)
        console.log('Filas limpias:', cleanedData.length)
        console.log('Primera fila de datos:', cleanedData[0])

        // Advertencia si solo hay una columna
        if (validColumns.length === 1) {
          console.warn('⚠️ Solo se detectó 1 columna. Verifica que el Excel tenga múltiples columnas con encabezados.')
          alert(`⚠️ Atención: Solo se detectó 1 columna ("${validColumns[0]}").\n\nVerifica que:\n- La primera fila tenga los nombres de las columnas\n- El archivo tenga múltiples columnas\n- No haya celdas fusionadas en los encabezados\n\nEncabezados detectados: ${headers.join(', ')}`)
        }
        
        // Mensaje informativo de columnas detectadas
        console.log(`✅ ${validColumns.length} columnas válidas detectadas:`, validColumns)

        setDetectedColumns(validColumns)
        setRawData(cleanedData)

        await analyzeWithAI(validColumns, cleanedData.slice(0, 5))
      } catch (error) {
        console.error('Error reading file:', error)
        alert('Error al leer el archivo. Verifica que sea un Excel válido.')
        setAnalyzing(false)
      }
    }

    reader.readAsArrayBuffer(file)
  }

  const analyzeWithAI = async (columns, sampleData) => {
    try {
      const suggestedMapping = await analyzeExcelStructure(columns, sampleData)
      setColumnMapping(suggestedMapping)
      setStep('mapping')
    } catch (error) {
      console.error('Error analyzing:', error)
      const basicMapping = autoMapColumns(columns)
      setColumnMapping(basicMapping)
      setStep('mapping')
    } finally {
      setAnalyzing(false)
    }
  }

  const autoMapColumns = (columns) => {
    const mapping = {}
    
    // Filtrar columnas inválidas
    const validColumns = columns.filter(col => 
      col && 
      col.trim() && 
      !col.startsWith('__EMPTY') &&
      !col.match(/^Column\d+$/i) &&
      col !== 'undefined'
    )
    
    validColumns.forEach(col => {
      const colLower = col.toLowerCase().trim()
      
      // Nombre del producto
      if ((colLower.includes('producto') || 
           colLower.includes('nombre') || 
           colLower.includes('descripcion') ||
           colLower === 'product' ||
           colLower === 'name') && !mapping.name) {
        mapping.name = col
      }
      
      // Stock/Cantidad
      if ((colLower.includes('cantidad') || 
           colLower.includes('stock') ||
           colLower === 'qty' ||
           colLower === 'quantity') && !mapping.current_stock) {
        mapping.current_stock = col
      }
      
      // Costo unitario (priorizar "unitario" sobre "bruto")
      if (colLower.includes('costo unitario') || colLower.includes('cost per unit')) {
        mapping.unit_cost = col
      } else if ((colLower.includes('costo') || colLower.includes('cost')) && 
                 !colLower.includes('bruto') && 
                 !colLower.includes('total') &&
                 !mapping.unit_cost) {
        mapping.unit_cost = col
      }
      
      // Precio de venta (priorizar "minorista" sobre "mayorista")
      if ((colLower.includes('precio minorista') || colLower.includes('retail price')) && 
          !colLower.includes('deseado') &&
          !colLower.includes('redondeado')) {
        mapping.sale_price = col
      } else if ((colLower.includes('precio mayorista') || colLower.includes('wholesale')) && 
                 !mapping.sale_price) {
        mapping.sale_price = col
      } else if ((colLower.includes('precio') || colLower.includes('price')) && 
                 (colLower.includes('venta') || colLower.includes('sale') || colLower === 'precio') &&
                 !colLower.includes('costo') &&
                 !mapping.sale_price) {
        mapping.sale_price = col
      }
      
      // SKU/Código
      if ((colLower.includes('sku') || 
           colLower.includes('codigo') || 
           colLower.includes('code')) && !mapping.sku) {
        mapping.sku = col
      }
      
      // Categoría
      if ((colLower.includes('categoria') || 
           colLower.includes('category') ||
           colLower.includes('tipo')) && !mapping.category) {
        mapping.category = col
      }
      
      // Proveedor
      if ((colLower.includes('proveedor') || 
           colLower.includes('supplier')) && !mapping.supplier) {
        mapping.supplier = col
      }
      
      // Unidad de medida
      if ((colLower.includes('unidad') || 
           colLower.includes('medida') ||
           colLower === 'unit') && !mapping.unit_measure) {
        mapping.unit_measure = col
      }
    })

    console.log('Mapeo automático:', mapping)
    return mapping
  }

  const handleMappingChange = (targetField, sourceColumn) => {
    setColumnMapping(prev => ({
      ...prev,
      [targetField]: sourceColumn
    }))
  }

  const handlePreview = () => {
    console.log('=== INICIANDO PREVIEW ===')
    console.log('Step actual:', step)
    console.log('Column Mapping:', columnMapping)
    console.log('Raw Data length:', rawData.length)
    
    setErrors([])
    
    // Validar campos requeridos
    const requiredFields = targetFields.filter(f => f.required)
    const missingFields = requiredFields.filter(f => !columnMapping[f.key])
    
    console.log('Required fields:', requiredFields.map(f => f.key))
    console.log('Missing fields:', missingFields.map(f => f.key))
    
    if (missingFields.length > 0) {
      const errorMsg = `Faltan campos requeridos: ${missingFields.map(f => f.label).join(', ')}`
      console.error('ERROR:', errorMsg)
      setErrors([errorMsg])
      return
    }

    console.log('Mapeando datos con:', columnMapping)
    console.log('Datos crudos (primeros 2):', rawData.slice(0, 2))

    const mappedData = rawData.map((row, index) => {
      const errors = []
      
      // Función helper para obtener valor de la columna
      const getValue = (key) => {
        const columnName = columnMapping[key]
        if (!columnName) return ''
        const value = row[columnName]
        return value !== undefined && value !== null ? value : ''
      }
      
      // Construir nombre completo del producto
      const marca = String(row['Marca'] || '').trim()
      const modelo = String(row['Modelo'] || '').trim()
      const sabor = String(getValue('name') || '').trim()
      
      // Nombre completo: Marca + Modelo + Sabor
      let nombreCompleto = ''
      if (marca) nombreCompleto += marca + ' '
      if (modelo) nombreCompleto += modelo + ' '
      if (sabor) nombreCompleto += sabor
      nombreCompleto = nombreCompleto.trim()
      
      const mappedRow = {
        rowNumber: index + 2,
        name: nombreCompleto || sabor || 'Producto sin nombre',
        sku: String(getValue('sku') || '').trim(),
        description: String(getValue('description') || '').trim(),
        category: String(getValue('category') || '').trim(),
        supplier: String(getValue('supplier') || '').trim(),
        unit_cost: parseFloat(String(getValue('unit_cost') || 0).replace(/[^0-9.-]/g, '')) || 0,
        sale_price: parseFloat(String(getValue('sale_price') || 0).replace(/[^0-9.-]/g, '')) || 0,
        current_stock: parseInt(String(getValue('current_stock') || 0).replace(/[^0-9]/g, '')) || 0,
        min_stock: parseInt(String(getValue('min_stock') || 0).replace(/[^0-9]/g, '')) || 0,
        unit_measure: String(getValue('unit_measure') || 'Unidad').trim(),
        energy_cost: parseFloat(String(getValue('energy_cost') || 0).replace(/[^0-9.-]/g, '')) || 0,
        errors: []
      }

      // Validaciones - Solo el nombre es realmente requerido
      if (!mappedRow.name || mappedRow.name.length === 0) {
        errors.push('Falta el nombre del producto')
      }
      // Advertencias (no bloquean la importación)
      if (mappedRow.unit_cost === 0 && mappedRow.sale_price === 0) {
        // Si no tiene ni costo ni precio, es una advertencia
        console.warn(`Producto "${mappedRow.name}" sin costo ni precio`)
      }

      mappedRow.errors = errors
      return mappedRow
    })

    console.log('Datos mapeados (primeros 2):', mappedData.slice(0, 2))
    console.log('Total productos mapeados:', mappedData.length)

    setPreview(mappedData)
    
    const validCount = mappedData.filter(item => item.errors.length === 0).length
    const totalErrors = mappedData.filter(item => item.errors.length > 0).length
    
    console.log('Productos válidos:', validCount)
    console.log('Productos con errores:', totalErrors)
    
    if (totalErrors > 0) {
      setErrors([`${totalErrors} productos tienen errores y no se importarán. ${validCount} productos son válidos.`])
    }
    
    console.log('Cambiando step a preview')
    setStep('preview')
    console.log('=== PREVIEW COMPLETADO ===')
  }

  const handleImport = async () => {
    console.log('=== INICIANDO IMPORTACIÓN ===')
    setLoading(true)
    setErrors([])

    try {
      const validProducts = preview.filter(item => item.errors.length === 0)
      
      console.log('Preview total:', preview.length)
      console.log('Productos válidos:', validProducts.length)
      console.log('Productos con errores:', preview.length - validProducts.length)
      
      if (validProducts.length === 0) {
        const errorMsg = 'No hay productos válidos para importar'
        console.error(errorMsg)
        setErrors([errorMsg])
        setLoading(false)
        return
      }

      console.log('Company Data:', activeCompanyData)
      
      // Obtener company_id de forma flexible
      let companyId = null
      
      if (activeCompanyData && activeCompanyData.id) {
        companyId = activeCompanyData.id
        console.log('✅ Company ID encontrado:', companyId)
      } else {
        console.warn('⚠️ No se encontró company_id. Los productos se importarán sin asociación a empresa.')
        console.warn('💡 Esto es normal para productos de marcas/proveedores externos.')
      }

      console.log('📦 Categorías disponibles:', categories.length)

      // Mapear categorías por nombre
      const categoryMap = {}
      categories.forEach(cat => {
        const key = cat.name.toLowerCase().trim()
        categoryMap[key] = cat.id
        console.log(`Categoría mapeada: "${cat.name}" -> ID ${cat.id}`)
      })

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No hay usuario autenticado')
      }

      // Preparar productos para inserción
      const productsToInsert = validProducts.map((item, index) => {
        const categoryKey = item.category ? item.category.toLowerCase().trim() : null
        const categoryId = categoryKey ? (categoryMap[categoryKey] || null) : null
        
        if (item.category && !categoryId) {
          console.warn(`⚠️ Categoría "${item.category}" no encontrada en el sistema`)
        }

        const product = {
          user_id: user.id,
          company_id: companyId || null, // Puede ser null para productos de marcas externas
          name: item.name,
          sku: item.sku && item.sku.length > 0 ? item.sku : null,
          description: item.description && item.description.length > 0 ? item.description : null,
          category_id: categoryId,
          unit_cost: Number(item.unit_cost) || 0,
          sale_price: Number(item.sale_price) || 0,
          current_stock: Number(item.current_stock) || 0,
          min_stock: Number(item.min_stock) || 0,
          is_active: true
        }
        
        if (index < 2) {
          console.log(`Producto ${index + 1} preparado:`, product)
        }
        
        return product
      })

      console.log(`Total productos a insertar: ${productsToInsert.length}`)
      console.log('Primeros 2 productos:', productsToInsert.slice(0, 2))

      // Insertar en base de datos
      console.log('Insertando en Supabase...')
      const { data, error } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select()

      if (error) {
        console.error('❌ Error de Supabase:', error)
        console.error('Detalles:', error.message, error.details, error.hint)
        throw error
      }

      console.log('✅ Productos insertados exitosamente:', data.length)
      console.log('Primeros productos insertados:', data.slice(0, 2))

      setSuccess(true)
      setImportStats({
        total: preview.length,
        imported: data.length,
        errors: preview.length - data.length
      })

      console.log('=== IMPORTACIÓN COMPLETADA ===')

      // Esperar 2 segundos y cerrar
      setTimeout(() => {
        console.log('Llamando onImportComplete()')
        onImportComplete()
        console.log('Cerrando modal')
        onClose()
      }, 2000)
    } catch (error) {
      console.error('❌ Error importing products:', error)
      console.error('Error completo:', JSON.stringify(error, null, 2))
      setErrors([`Error al importar: ${error.message || 'Error desconocido'}`])
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      {
        Productos: 'Laptop Dell',
        Cantidad: 10,
        'Costo unitario': 45000,
        'Precio Minorista': 58000
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Productos')
    XLSX.writeFile(wb, 'plantilla_ejemplo.xlsx')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-4 sm:my-8 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Header con diseño sutil */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <span>Importación Inteligente</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 animate-pulse" />
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">La IA detecta automáticamente la estructura</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/50 rounded-lg transition-all duration-200 hover:scale-110"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Progress Steps - Mejorado y responsive */}
        {!success && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {/* Step 1 */}
              <div className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all duration-300 ${
                step === 'upload' ? 'text-slate-700 scale-105' : 
                step === 'mapping' || step === 'preview' ? 'text-emerald-700' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 shadow-md ${
                  step === 'upload' ? 'bg-gradient-to-br from-slate-600 to-slate-700 text-white ring-4 ring-slate-100' : 
                  step === 'mapping' || step === 'preview' ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white' : 
                  'bg-gray-300 text-gray-600'
                }`}>
                  {step === 'mapping' || step === 'preview' ? '✓' : '1'}
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:block">Subir</span>
              </div>

              {/* Connector 1 */}
              <div className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full transition-all duration-500 ${
                step === 'mapping' || step === 'preview' ? 'bg-gradient-to-r from-emerald-500 to-slate-500' : 'bg-gray-300'
              }`}></div>

              {/* Step 2 */}
              <div className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all duration-300 ${
                step === 'mapping' ? 'text-slate-700 scale-105' : 
                step === 'preview' ? 'text-emerald-700' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 shadow-md ${
                  step === 'mapping' ? 'bg-gradient-to-br from-slate-600 to-slate-700 text-white ring-4 ring-slate-100' : 
                  step === 'preview' ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white' : 
                  'bg-gray-300 text-gray-600'
                }`}>
                  {step === 'preview' ? '✓' : '2'}
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:block">Mapear</span>
              </div>

              {/* Connector 2 */}
              <div className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full transition-all duration-500 ${
                step === 'preview' ? 'bg-gradient-to-r from-emerald-500 to-slate-500' : 'bg-gray-300'
              }`}></div>

              {/* Step 3 */}
              <div className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all duration-300 ${
                step === 'preview' ? 'text-slate-700 scale-105' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 shadow-md ${
                  step === 'preview' ? 'bg-gradient-to-br from-slate-600 to-slate-700 text-white ring-4 ring-slate-100' : 
                  'bg-gray-300 text-gray-600'
                }`}>
                  3
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:block">Importar</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Area - Mejorado y responsive */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {step === 'upload' && !analyzing && (
            <>
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-2 text-base sm:text-lg">✨ Importación Inteligente</h4>
                    <ul className="text-sm sm:text-base text-slate-700 space-y-1.5">
                      <li className="flex items-start">
                        <span className="text-slate-500 mr-2 flex-shrink-0">•</span>
                        <span>La IA analiza automáticamente tu Excel</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-slate-500 mr-2 flex-shrink-0">•</span>
                        <span>Detecta columnas como "Productos", "Cantidad", "Costo unitario"</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-slate-500 mr-2 flex-shrink-0">•</span>
                        <span><strong>Ignora columnas vacías</strong> y filas sin datos</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-slate-500 mr-2 flex-shrink-0">•</span>
                        <span>Sugiere el mejor mapeo de datos</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-slate-500 mr-2 flex-shrink-0">•</span>
                        <span>Puedes ajustar manualmente si es necesario</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-amber-900 mb-2 text-base sm:text-lg">💡 Tips para mejores resultados</h4>
                    <ul className="text-sm sm:text-base text-amber-800 space-y-1.5">
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2 flex-shrink-0">•</span>
                        <span><strong>Primera fila</strong>: Debe contener los nombres de las columnas</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2 flex-shrink-0">•</span>
                        <span><strong>Columnas vacías</strong>: Se ignoran automáticamente</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-amber-600 mr-2 flex-shrink-0">•</span>
                        <span><strong>Filas vacías</strong>: Se filtran automáticamente</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-600 mr-2 flex-shrink-0">•</span>
                        <span><strong>Formato libre</strong>: Funciona con cualquier estructura</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl">
                  <FileSpreadsheet className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600" />
                </div>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Download className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">Descargar Ejemplo</span>
                </button>
                <p className="text-sm text-gray-600 text-center">O sube tu propio Excel con cualquier formato</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Seleccionar Archivo Excel</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-slate-400 hover:bg-slate-50/30 transition-all duration-300 group">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="inline-block p-3 bg-gradient-to-br from-slate-100 to-gray-200 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600" />
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-gray-700 mb-1">
                      {file ? (
                        <span className="text-emerald-600 flex items-center justify-center space-x-2">
                          <CheckCircle className="w-5 h-5" />
                          <span>{file.name}</span>
                        </span>
                      ) : (
                        'Click para seleccionar archivo'
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      Formatos soportados: <span className="font-semibold">.xlsx, .xls, .csv</span>
                    </p>
                  </label>
                </div>
              </div>
            </>
          )}

          {analyzing && (
            <div className="text-center py-12 sm:py-16">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-300 to-gray-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 sm:h-24 sm:w-24 border-4 border-transparent border-t-slate-600 border-r-slate-500"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 animate-pulse" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Analizando con IA...</h3>
              <p className="text-gray-600 text-sm sm:text-base">Detectando estructura y mapeando columnas</p>
              <div className="mt-6 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-emerald-900 mb-2">✓ Análisis Completado</h4>
                    <p className="text-sm text-emerald-800 mb-2">
                      Se detectaron <strong>{detectedColumns.length} columnas válidas</strong> y <strong>{rawData.length} filas con datos</strong>.
                    </p>
                    <p className="text-xs text-emerald-700">
                      Las columnas vacías y filas sin datos fueron filtradas automáticamente.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Mapeo de Columnas</h4>
                <div className="space-y-3">
                  {targetFields.map(field => (
                    <div key={field.key} className="grid grid-cols-2 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <select
                        value={columnMapping[field.key] || ''}
                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- No mapear --</option>
                        {detectedColumns.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {rawData.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Vista Previa</h4>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {detectedColumns.slice(0, 6).map(col => (
                            <th key={col} className="px-3 py-2 text-left text-xs font-semibold text-gray-700">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {rawData.slice(0, 3).map((row, i) => (
                          <tr key={i}>
                            {detectedColumns.slice(0, 6).map(col => (
                              <td key={col} className="px-3 py-2 text-gray-900">{String(row[col] || '-')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'preview' && !success && (
            <>
              {errors.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-2">Advertencias</h4>
                      <ul className="text-sm text-orange-800">
                        {errors.map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Vista Previa - Productos Listos para Importar ({preview.filter(p => p.errors.length === 0).length} válidos de {preview.length} total)
                </h4>
                <div className="overflow-x-auto border-2 border-gray-300 rounded-lg shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-bold text-gray-700">#</th>
                        <th className="px-3 py-3 text-left text-xs font-bold text-gray-700">Nombre del Producto</th>
                        <th className="px-3 py-3 text-left text-xs font-bold text-gray-700">Categoría</th>
                        <th className="px-3 py-3 text-right text-xs font-bold text-gray-700">Costo</th>
                        <th className="px-3 py-3 text-right text-xs font-bold text-gray-700">Precio</th>
                        <th className="px-3 py-3 text-right text-xs font-bold text-gray-700">Stock</th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {preview.slice(0, 15).map((item, i) => (
                        <tr key={i} className={`${item.errors.length > 0 ? 'bg-red-50' : 'hover:bg-blue-50'} transition-colors`}>
                          <td className="px-3 py-2 text-gray-600 font-medium">{item.rowNumber}</td>
                          <td className="px-3 py-2 text-gray-900 font-medium">{item.name || '-'}</td>
                          <td className="px-3 py-2">
                            {item.category ? (
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                {item.category}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">Sin categoría</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-gray-900">
                            ${item.unit_cost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-green-700">
                            ${item.sale_price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-gray-900">{item.current_stock}</td>
                          <td className="px-3 py-2 text-center">
                            {item.errors.length > 0 ? (
                              <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium" title={item.errors.join(', ')}>
                                ❌ Error
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                                ✓ OK
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.length > 15 && (
                  <p className="text-sm text-gray-600 mt-3 text-center font-medium">
                    Mostrando 15 de {preview.length} productos • Todos serán importados
                  </p>
                )}
              </div>
            </>
          )}

          {success && importStats && (
            <div className="text-center py-12 sm:py-16">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-full">
                  <CheckCircle className="w-20 h-20 sm:w-24 sm:h-24 text-emerald-600 animate-bounce" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-3">¡Importación Exitosa!</h3>
              <div className="bg-white border-2 border-emerald-200 rounded-xl p-6 max-w-md mx-auto mb-4 shadow-lg">
                <p className="text-lg text-emerald-800 mb-2">
                  Se importaron <span className="text-2xl font-bold text-emerald-600">{importStats.imported}</span> de <span className="font-semibold">{importStats.total}</span> productos
                </p>
                {importStats.errors > 0 && (
                  <p className="text-sm text-orange-600">
                    {importStats.errors} productos con errores fueron omitidos
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center space-x-2 text-emerald-700">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent"></div>
                <p className="text-sm font-medium">Cerrando automáticamente...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        {!success && (
          <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
            {step === 'upload' && (
              <button 
                onClick={onClose} 
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            )}
            
            {step === 'mapping' && (
              <>
                <button 
                  type="button"
                  onClick={() => setStep('upload')} 
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Atrás
                </button>
                <button 
                  type="button"
                  onClick={handlePreview} 
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Continuar →
                </button>
              </>
            )}
            
            {step === 'preview' && (
              <>
                <button 
                  type="button"
                  onClick={() => setStep('mapping')} 
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Ajustar
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={loading || preview.filter(p => p.errors.length === 0).length === 0}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Importando...</span>
                    </span>
                  ) : (
                    `Importar ${preview.filter(p => p.errors.length === 0).length} Productos`
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SmartBulkImport
