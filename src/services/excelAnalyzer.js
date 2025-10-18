import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

/**
 * Limpia y prepara los datos del Excel antes del análisis
 */
function cleanExcelData(rawData) {
  if (!rawData || rawData.length === 0) return []

  // Filtrar filas completamente vacías
  const nonEmptyRows = rawData.filter(row => {
    const values = Object.values(row)
    return values.some(val => val !== null && val !== undefined && val !== '')
  })

  if (nonEmptyRows.length === 0) return []

  // Obtener todas las columnas únicas de todas las filas
  const allColumns = new Set()
  nonEmptyRows.forEach(row => {
    Object.keys(row).forEach(key => {
      // Filtrar columnas vacías o con nombres inválidos
      if (key && key.trim() && !key.startsWith('__EMPTY')) {
        allColumns.add(key)
      }
    })
  })

  // Limpiar cada fila para tener solo las columnas válidas
  return nonEmptyRows.map(row => {
    const cleanRow = {}
    allColumns.forEach(col => {
      const value = row[col]
      // Solo incluir valores no vacíos
      if (value !== null && value !== undefined && value !== '') {
        cleanRow[col] = value
      }
    })
    return cleanRow
  }).filter(row => Object.keys(row).length > 0) // Filtrar filas que quedaron vacías
}

/**
 * Obtiene las columnas válidas del Excel
 */
function getValidColumns(data) {
  if (!data || data.length === 0) return []

  const columnSet = new Set()
  
  data.forEach(row => {
    Object.keys(row).forEach(key => {
      // Filtrar columnas vacías, __EMPTY, o con nombres inválidos
      if (key && 
          key.trim() && 
          !key.startsWith('__EMPTY') &&
          !key.match(/^Column\d+$/i) &&
          key !== 'undefined') {
        columnSet.add(key)
      }
    })
  })

  return Array.from(columnSet)
}

/**
 * Analiza la estructura de un Excel usando IA para sugerir el mejor mapeo de columnas
 */
export async function analyzeExcelStructure(columns, sampleData) {
  try {
    // Limpiar datos antes del análisis
    const cleanedData = cleanExcelData(sampleData)
    const validColumns = getValidColumns(cleanedData)

    if (validColumns.length === 0) {
      console.warn('No se encontraron columnas válidas')
      return autoMapColumns(columns)
    }

    // Preparar datos de ejemplo limpios
    const cleanedSamples = cleanedData.slice(0, 3).map(row => {
      const cleanRow = {}
      validColumns.forEach(col => {
        if (row[col] !== undefined && row[col] !== null && row[col] !== '') {
          cleanRow[col] = row[col]
        }
      })
      return cleanRow
    })

    const prompt = `Eres un experto en análisis de datos de Excel para sistemas de inventario. Analiza estas columnas y sugiere el mejor mapeo.

COLUMNAS DETECTADAS EN EL EXCEL:
${validColumns.map((col, i) => `${i + 1}. "${col}"`).join('\n')}

DATOS DE EJEMPLO (primeras filas):
${JSON.stringify(cleanedSamples, null, 2)}

CAMPOS DEL SISTEMA DE INVENTARIO:
- name: Nombre del producto (REQUERIDO) - columnas como "Productos", "Nombre", "Descripción", "Product", "Item"
- category: Categoría del producto - columnas como "Categoría", "Category", "Tipo", "Rubro"
- sku: Código/SKU - columnas como "SKU", "Código", "Code", "ID"
- unit_cost: Costo unitario (REQUERIDO) - columnas como "Costo unitario", "Costo", "Cost", "Precio Costo"
- sale_price: Precio de venta (REQUERIDO) - columnas como "Precio", "Precio Minorista", "Precio Venta", "PVP"
- current_stock: Stock/Cantidad actual - columnas como "Cantidad", "Stock", "Qty", "Disponible", "Existencia"
- min_stock: Stock mínimo - columnas como "Stock mínimo", "Mínimo", "Min Stock"
- supplier: Proveedor - columnas como "Proveedor", "Supplier"
- description: Descripción adicional

REGLAS CRÍTICAS:
1. IGNORA columnas vacías, "__EMPTY", "Column1", etc.
2. La columna "Productos" casi siempre es el NOMBRE del producto → name
3. Si hay "Categoría" o similar, SIEMPRE mapéala → category
4. "Cantidad" o "Stock" → current_stock
5. Si hay "Costo unitario" y "Costo bruto", usa "Costo unitario"
6. Si hay múltiples precios, prefiere "Precio Minorista" sobre "Precio Mayorista"
7. IMPORTANTE: Mapea la categoría si existe en las columnas
8. Solo usa nombres EXACTOS de las columnas listadas arriba

FORMATO DE RESPUESTA (JSON puro, sin markdown):
{
  "name": "nombre_exacto_columna",
  "category": "nombre_exacto_columna",
  "unit_cost": "nombre_exacto_columna",
  "sale_price": "nombre_exacto_columna",
  "current_stock": "nombre_exacto_columna"
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en análisis de datos de Excel. Respondes SOLO con JSON válido, sin explicaciones ni markdown.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    })

    const content = response.choices[0].message.content.trim()
    
    // Limpiar el contenido si viene con markdown
    const jsonContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*/, '') // Eliminar texto antes del JSON
      .replace(/[^}]*$/, '') // Eliminar texto después del JSON
      .trim()
    
    const mapping = JSON.parse(jsonContent)
    
    // Validar que las columnas mapeadas existan realmente
    const validatedMapping = {}
    Object.keys(mapping).forEach(key => {
      const columnName = mapping[key]
      if (columnName && validColumns.includes(columnName)) {
        validatedMapping[key] = columnName
      }
    })
    
    console.log('AI Suggested Mapping:', validatedMapping)
    return validatedMapping

  } catch (error) {
    console.error('Error analyzing with AI:', error)
    
    // Fallback: mapeo automático básico
    return autoMapColumns(columns)
  }
}

/**
 * Mapeo automático básico sin IA (fallback)
 */
function autoMapColumns(columns) {
  const mapping = {}
  
  console.log('Auto-mapping columns:', columns)
  
  columns.forEach(col => {
    const colLower = col.toLowerCase().trim()
    
    // Nombre del producto (prioridad alta)
    if (colLower.includes('producto') || colLower.includes('nombre') || colLower === 'item') {
      if (!mapping.name) {
        mapping.name = col
        console.log(`Mapped name: ${col}`)
      }
    }
    
    // Categoría (IMPORTANTE)
    if (colLower.includes('categoria') || colLower.includes('categoría') || colLower.includes('category') || colLower.includes('tipo') || colLower.includes('rubro')) {
      if (!mapping.category) {
        mapping.category = col
        console.log(`Mapped category: ${col}`)
      }
    }
    
    // Stock/Cantidad
    if (colLower.includes('cantidad') || colLower.includes('stock') || colLower === 'qty' || colLower.includes('existencia')) {
      if (!mapping.current_stock) {
        mapping.current_stock = col
        console.log(`Mapped stock: ${col}`)
      }
    }
    
    // Costo unitario (priorizar "unitario" sobre "bruto")
    if (colLower.includes('costo unitario') || colLower.includes('cost per unit')) {
      mapping.unit_cost = col
      console.log(`Mapped unit_cost: ${col}`)
    } else if ((colLower.includes('costo') || colLower.includes('cost')) && 
               !colLower.includes('bruto') && 
               !colLower.includes('total') &&
               !mapping.unit_cost) {
      mapping.unit_cost = col
      console.log(`Mapped unit_cost (fallback): ${col}`)
    }
    
    // Precio de venta (priorizar "minorista" sobre "mayorista")
    if ((colLower.includes('precio minorista') || colLower.includes('retail price')) && 
        !colLower.includes('deseado') &&
        !colLower.includes('redondeado')) {
      mapping.sale_price = col
      console.log(`Mapped sale_price: ${col}`)
    } else if ((colLower.includes('precio mayorista') || colLower.includes('wholesale')) && 
               !mapping.sale_price) {
      mapping.sale_price = col
      console.log(`Mapped sale_price (wholesale): ${col}`)
    } else if ((colLower.includes('precio') || colLower.includes('price')) && 
               (colLower.includes('venta') || colLower.includes('sale') || colLower === 'precio') &&
               !colLower.includes('costo') &&
               !mapping.sale_price) {
      mapping.sale_price = col
      console.log(`Mapped sale_price (generic): ${col}`)
    }
    
    // SKU/Código
    if (colLower.includes('sku') || colLower.includes('codigo') || colLower.includes('código') || colLower.includes('code')) {
      if (!mapping.sku) {
        mapping.sku = col
        console.log(`Mapped sku: ${col}`)
      }
    }
    
    // Proveedor
    if (colLower.includes('proveedor') || colLower.includes('supplier')) {
      if (!mapping.supplier) {
        mapping.supplier = col
        console.log(`Mapped supplier: ${col}`)
      }
    }
  })

  console.log('Final auto-mapping:', mapping)
  return mapping
}
