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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-4 sm:my-8 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] border border-gray-200">
        {/* Header con diseño Vercel */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Importar desde Excel
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Detección automática de estructura</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>

        {/* Progress Steps - Estilo Vercel */}
        {!success && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {/* Step 1 */}
              <div className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all ${
                step === 'upload' ? 'text-gray-900' : 
                step === 'mapping' || step === 'preview' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step === 'upload' ? 'bg-black text-white' : 
                  step === 'mapping' || step === 'preview' ? 'bg-gray-900 text-white' : 
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step === 'mapping' || step === 'preview' ? '✓' : '1'}
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:block">Subir</span>
              </div>

              {/* Connector 1 */}
              <div className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-all ${
                step === 'mapping' || step === 'preview' ? 'bg-gray-900' : 'bg-gray-200'
              }`}></div>

              {/* Step 2 */}
              <div className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all ${
                step === 'mapping' ? 'text-gray-900' : 
                step === 'preview' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step === 'mapping' ? 'bg-black text-white' : 
                  step === 'preview' ? 'bg-gray-900 text-white' : 
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step === 'preview' ? '✓' : '2'}
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:block">Mapear</span>
              </div>

              {/* Connector 2 */}
              <div className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-all ${
                step === 'preview' ? 'bg-gray-900' : 'bg-gray-200'
              }`}></div>

              {/* Step 3 */}
              <div className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all ${
                step === 'preview' ? 'text-gray-900' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step === 'preview' ? 'bg-black text-white' : 
                  'bg-gray-200 text-gray-500'
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
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-5">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">Importación Inteligente</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start">
                        <span className="text-gray-400 mr-2 flex-shrink-0">•</span>
                        <span>Analiza automáticamente la estructura de tu Excel</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-400 mr-2 flex-shrink-0">•</span>
                        <span>Detecta columnas: Productos, Cantidad, Costo, Precio</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-400 mr-2 flex-shrink-0">•</span>
                        <span>Ignora columnas vacías y filas sin datos</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-400 mr-2 flex-shrink-0">•</span>
                        <span>Mapeo inteligente con ajuste manual</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-400 mr-2 flex-shrink-0">•</span>
                        <span>Compatible con múltiples formatos de Excel</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-5">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2 text-base sm:text-lg">Tips para mejores resultados</h4>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2 flex-shrink-0">•</span>
                        <span><strong>Primera fila:</strong> Debe contener nombres de columnas</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2 flex-shrink-0">•</span>
                        <span><strong>Columnas vacías:</strong> Se ignoran automáticamente</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2 flex-shrink-0">•</span>
                        <span><strong>Filas vacías:</strong> Se filtran automáticamente</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2 flex-shrink-0">•</span>
                        <span><strong>Formato flexible:</strong> Funciona con cualquier estructura</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-6 sm:py-8 space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-lg">
                  <FileSpreadsheet className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600" />
                </div>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  <Download className="w-4 h-4 flex-shrink-0" />
                  <span>Descargar Plantilla</span>
                </button>
                <p className="text-sm text-gray-500 text-center">O sube tu propio Excel con cualquier formato</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Seleccionar Archivo</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-gray-400 hover:bg-gray-50 transition-all group">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="inline-block p-3 bg-gray-100 rounded-lg mb-3 group-hover:bg-gray-200 transition-colors">
                      <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" />
                    </div>
                    <p className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                      {file ? (
                        <span className="text-green-600 flex items-center justify-center space-x-2">
                          <CheckCircle className="w-5 h-5" />
                          <span>{file.name}</span>
                        </span>
                      ) : (
                        'Haz clic para seleccionar'
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      Soporta: <span className="font-medium">.xlsx, .xls, .csv</span>
                    </p>
                  </label>
                </div>
              </div>
            </>
          )}

          {analyzing && (
            <div className="text-center py-12 sm:py-16">
              <div className="relative inline-block mb-6">
                <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-gray-200 border-t-black"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-gray-900" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Analizando estructura...</h3>
              <p className="text-gray-500 text-sm sm:text-base">Detectando columnas y mapeando datos</p>
            </div>
          )}

          {step === 'mapping' && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Análisis Completado</h4>
                    <p className="text-sm text-green-800">
                      <strong>{detectedColumns.length} columnas</strong> y <strong>{rawData.length} filas</strong> detectadas
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Mapeo de Columnas</h4>
                <div className="space-y-3">
                  {targetFields.map(field => (
                    <div key={field.key} className="grid grid-cols-2 gap-4 items-center">
                      <label className="text-sm font-medium text-gray-900">
                        {field.label}
                        {field.required && <span className="text-red-600 ml-1">*</span>}
                      </label>
                      <select
                        value={columnMapping[field.key] || ''}
                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {detectedColumns.slice(0, 6).map(col => (
                            <th key={col} className="px-3 py-2.5 text-left text-xs font-medium text-gray-700">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {rawData.slice(0, 3).map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {detectedColumns.slice(0, 6).map(col => (
                              <td key={col} className="px-3 py-2.5 text-gray-600">{String(row[col] || '-')}</td>
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">Advertencias</h4>
                      <ul className="text-sm text-yellow-800 space-y-1">
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
                  Productos a Importar ({preview.filter(p => p.errors.length === 0).length} de {preview.length})
                </h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-700">#</th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-700">Producto</th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-700">Categoría</th>
                        <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-700">Costo</th>
                        <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-700">Precio</th>
                        <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-700">Stock</th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-700">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {preview.slice(0, 15).map((item, i) => (
                        <tr key={i} className={`${item.errors.length > 0 ? 'bg-red-50' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className="px-3 py-2.5 text-gray-500 text-xs">{item.rowNumber}</td>
                          <td className="px-3 py-2.5 text-gray-900 font-medium">{item.name || '-'}</td>
                          <td className="px-3 py-2.5">
                            {item.category ? (
                              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                {item.category}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-900">
                            ${item.unit_cost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-900">
                            ${item.sale_price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-900">{item.current_stock}</td>
                          <td className="px-3 py-2.5 text-center">
                            {item.errors.length > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium" title={item.errors.join(', ')}>
                                Error
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
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
                <div className="bg-green-100 p-6 rounded-full">
                  <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">Importación Exitosa</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto mb-4">
                <p className="text-lg text-gray-700 mb-2">
                  <span className="text-2xl font-semibold text-gray-900">{importStats.imported}</span> de {importStats.total} productos importados
                </p>
                {importStats.errors > 0 && (
                  <p className="text-sm text-gray-500">
                    {importStats.errors} productos omitidos por errores
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-900"></div>
                <p className="text-sm">Cerrando...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        {!success && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between space-x-3">
            {step === 'upload' && (
              <button 
                onClick={onClose} 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
            )}
            
            {step === 'mapping' && (
              <>
                <button 
                  type="button"
                  onClick={() => setStep('upload')} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  ← Atrás
                </button>
                <button 
                  type="button"
                  onClick={handlePreview} 
                  className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  Continuar
                </button>
              </>
            )}
            
            {step === 'preview' && (
              <>
                <button 
                  type="button"
                  onClick={() => setStep('mapping')} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  ← Ajustar
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={loading || preview.filter(p => p.errors.length === 0).length === 0}
                  className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-white"></div>
                      <span>Importando...</span>
                    </span>
                  ) : (
                    `Importar ${preview.filter(p => p.errors.length === 0).length} productos`
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
