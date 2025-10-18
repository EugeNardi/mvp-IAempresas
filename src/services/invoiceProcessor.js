import Tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist'

// Configurar worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

/**
 * Extrae texto de un PDF usando PDF.js
 */
async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''

    // Extraer texto de todas las páginas
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      fullText += pageText + '\n'
    }

    return fullText
  } catch (error) {
    console.error('Error extrayendo texto del PDF:', error)
    return null
  }
}

/**
 * Extrae texto de una imagen usando Tesseract OCR
 */
async function extractTextFromImage(file) {
  try {
    const result = await Tesseract.recognize(file, 'spa', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`Progreso OCR: ${Math.round(m.progress * 100)}%`)
        }
      }
    })
    return result.data.text
  } catch (error) {
    console.error('Error en OCR:', error)
    return null
  }
}

/**
 * Detecta si es factura de compra o venta basándose en palabras clave
 */
function detectInvoiceType(text) {
  const textLower = text.toLowerCase()
  
  // Palabras clave para facturas de compra
  const purchaseKeywords = [
    'proveedor',
    'compra',
    'adquisición',
    'orden de compra',
    'remito',
    'debe',
    'factura de compra'
  ]
  
  // Palabras clave para facturas de venta
  const saleKeywords = [
    'cliente',
    'venta',
    'factura de venta',
    'haber',
    'cobro',
    'ingreso'
  ]
  
  const purchaseScore = purchaseKeywords.filter(keyword => textLower.includes(keyword)).length
  const saleScore = saleKeywords.filter(keyword => textLower.includes(keyword)).length
  
  // Si hay más palabras de compra, es compra (gasto), sino es venta (ingreso)
  return purchaseScore > saleScore ? 'expense' : 'income'
}

/**
 * Extrae el número de factura del texto con validación mejorada
 */
function extractInvoiceNumber(text) {
  // PASO 1: Buscar con palabras clave específicas (más confiable)
  const specificPatterns = [
    // Factura N°, Nro, Número
    /(?:factura|fac|fc|comprobante)\s*(?:n[°º]?|nro|número|num|#)[:\s]*([A-Z]?[\-\s]?\d{4,}[\-\s]?\d*)/i,
    // Factura seguida de letra y números (ej: Factura A 0001-00012345)
    /(?:factura|fac|fc)\s*([A-Z]\s*\d{4}[\-\s]\d{8})/i,
    // Número de comprobante
    /(?:comprobante|comp)[:\s]*([A-Z]?[\-\s]?\d{4,}[\-\s]?\d*)/i,
  ]
  
  for (const pattern of specificPatterns) {
    const match = text.match(pattern)
    if (match) {
      const invoiceNum = match[1].replace(/\s+/g, '-').trim()
      // Validar que no sea un monto (no debe tener más de 2 decimales)
      if (!invoiceNum.match(/\d+[.,]\d{2}$/)) {
        return invoiceNum
      }
    }
  }
  
  // PASO 2: Buscar patrones típicos de facturas argentinas
  const argentinePatterns = [
    // Formato AFIP: A 0001-00012345 o similar
    /([A-Z]\s*\d{4}[\-\s]\d{8})/,
    // Formato con letra: A-12345
    /([A-Z][\-\s]\d{4,})/,
    // Formato numérico con guión: 0001-12345
    /(\d{4}[\-]\d{4,})/,
  ]
  
  for (const pattern of argentinePatterns) {
    const match = text.match(pattern)
    if (match) {
      const invoiceNum = match[1].replace(/\s+/g, '-').trim()
      // Validar que no sea un monto
      const numericPart = invoiceNum.replace(/[A-Z\-\s]/g, '')
      if (numericPart.length >= 4 && !invoiceNum.includes('.') && !invoiceNum.includes(',')) {
        return invoiceNum
      }
    }
  }
  
  // PASO 3: Buscar números largos que parezcan números de factura (8+ dígitos sin decimales)
  const longNumbers = text.match(/\d{8,}/g)
  if (longNumbers && longNumbers.length > 0) {
    // Tomar el primer número largo encontrado
    return `FAC-${longNumbers[0]}`
  }
  
  // Si no se encuentra, generar uno único basado en timestamp
  return `FAC-${Date.now().toString().slice(-8)}`
}

/**
 * Extrae la fecha de la factura
 */
function extractDate(text) {
  // Patrones de fecha comunes
  const patterns = [
    /(?:fecha|date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const dateStr = match[1]
      const parts = dateStr.split(/[\/\-]/)
      
      if (parts.length === 3) {
        let [day, month, year] = parts
        
        // Convertir año de 2 dígitos a 4
        if (year.length === 2) {
          year = '20' + year
        }
        
        // Asegurar formato de 2 dígitos
        day = day.padStart(2, '0')
        month = month.padStart(2, '0')
        
        return `${year}-${month}-${day}`
      }
    }
  }
  
  // Si no se encuentra, usar fecha actual
  return new Date().toISOString().split('T')[0]
}

/**
 * Extrae el monto total de la factura con validación mejorada
 * Prioriza IMPORTE NETO o TOTAL sobre IVA y otros conceptos
 */
function extractAmount(text) {
  const textLower = text.toLowerCase()
  const lines = text.split('\n')
  
  // PASO 1: Buscar IMPORTE NETO o TOTAL (máxima prioridad)
  // En facturas argentinas, el "Importe Neto" es el valor principal
  const netAmountPatterns = [
    /(?:importe\s+neto)[:\s]*\$?\s*([\d.,]+)/i, // PRIORIDAD MÁXIMA: Importe Neto
    /(?:subtotal)[:\s]*\$?\s*([\d.,]+)/i, // Subtotal (antes de IVA)
    /(?:importe\s+total)[:\s]*\$?\s*([\d.,]+)/i,
    /(?:total\s+(?:final|general|facturado))[:\s]*\$?\s*([\d.,]+)/i,
    /(?:total\s+factura)[:\s]*\$?\s*([\d.,]+)/i,
  ]
  
  for (const pattern of netAmountPatterns) {
    const match = text.match(pattern)
    if (match) {
      const cleanedAmount = cleanAndValidateAmount(match[1])
      // Validar que sea un monto significativo (no IVA suelto)
      if (cleanedAmount !== null && cleanedAmount >= 100) {
        return cleanedAmount.toFixed(2)
      }
    }
  }
  
  // PASO 2: Analizar línea por línea con MEJOR DETECCIÓN
  let importeNeto = null
  let subtotal = null
  let iva = null
  let ivaAmount = null
  let total = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineLower = line.toLowerCase()
    
    // PRIORIDAD 1: Identificar IMPORTE NETO (el valor principal en facturas argentinas)
    if (lineLower.match(/(?:importe\s+neto|neto\s+gravado)/)) {
      const amountMatch = line.match(/\$?\s*([\d.,]+)/)
      if (amountMatch) {
        const amount = cleanAndValidateAmount(amountMatch[1])
        if (amount && amount >= 100) {
          importeNeto = amount
        }
      }
    }
    
    // Identificar Subtotal
    if (lineLower.match(/(?:subtotal|sub\s+total)/) && !lineLower.match(/iva/)) {
      const amountMatch = line.match(/\$?\s*([\d.,]+)/)
      if (amountMatch) {
        const amount = cleanAndValidateAmount(amountMatch[1])
        if (amount && amount >= 100) {
          subtotal = amount
        }
      }
    }
    
    // Identificar IVA (NUNCA tomar como total)
    if (lineLower.match(/(?:^iva|^\s*iva|i\.v\.a)/)) {
      const amountMatch = line.match(/\$?\s*([\d.,]+)/)
      if (amountMatch) {
        const amount = cleanAndValidateAmount(amountMatch[1])
        // El IVA suele ser ~21% del neto, validar proporción
        if (amount && amount > 0) {
          ivaAmount = amount
        }
      }
    }
    
    // Identificar TOTAL (solo si NO está en línea con IVA)
    if (lineLower.match(/^(?:total|total:|\s*total\s)/) && !lineLower.match(/iva/)) {
      // Buscar el número en esta línea o las siguientes 2 líneas
      for (let j = i; j < Math.min(i + 3, lines.length); j++) {
        const amountMatch = lines[j].match(/\$?\s*([\d.,]+)/)
        if (amountMatch) {
          const amount = cleanAndValidateAmount(amountMatch[1])
          if (amount !== null && amount >= 100) {
            total = amount
            break
          }
        }
      }
    }
  }
  
  // LÓGICA DE DECISIÓN MEJORADA:
  
  // 1. Si encontramos IMPORTE NETO, ese es el valor principal
  if (importeNeto && importeNeto >= 100) {
    // Validar que no sea el IVA
    if (!ivaAmount || importeNeto > ivaAmount * 2) {
      return importeNeto.toFixed(2)
    }
  }
  
  // 2. Si encontramos Subtotal + IVA, validar proporción
  if (subtotal && ivaAmount) {
    // El IVA debería ser ~15-30% del subtotal
    const ivaRatio = ivaAmount / subtotal
    if (ivaRatio >= 0.10 && ivaRatio <= 0.35) {
      // IVA es coherente, retornar subtotal (importe neto)
      return subtotal.toFixed(2)
    }
  }
  
  // 3. Si solo encontramos subtotal (sin IVA), retornarlo
  if (subtotal && subtotal >= 100) {
    return subtotal.toFixed(2)
  }
  
  // 4. Si encontramos total validado, retornarlo
  if (total && total >= 100) {
    // Validar que total > IVA (si existe)
    if (!ivaAmount || total > ivaAmount * 2) {
      return total.toFixed(2)
    }
  }
  
  // PASO 3: Buscar números con símbolo $ (excluyendo IVA explícitamente)
  const currencyPattern = /\$\s*([\d.,]+)/g
  const currencyMatches = [...text.matchAll(currencyPattern)]
  
  if (currencyMatches.length > 0) {
    // Filtrar montos que NO sean IVA
    const validAmounts = []
    
    for (const match of currencyMatches) {
      const amount = cleanAndValidateAmount(match[1])
      if (amount === null || amount < 100) continue
      
      // Obtener contexto alrededor del monto (80 caracteres antes y después)
      const matchIndex = match.index
      const contextStart = Math.max(0, matchIndex - 80)
      const contextEnd = Math.min(text.length, matchIndex + 80)
      const context = text.substring(contextStart, contextEnd).toLowerCase()
      
      // RECHAZAR EXPLÍCITAMENTE si está marcado como IVA
      if (context.match(/(?:^iva|^\s*iva|i\.v\.a|impuesto\s+al\s+valor)/)) {
        continue
      }
      
      // Rechazar si está cerca de otras palabras que indican que NO es el total
      if (context.match(/(?:descuento|bonificación|anticipo|seña)/)) {
        continue
      }
      
      // ACEPTAR si está cerca de palabras que indican que SÍ es el total
      const isTotal = context.match(/(?:importe\s+neto|subtotal|total|neto\s+gravado)/)
      
      if (isTotal) {
        validAmounts.push({ amount, priority: 10 })
      } else {
        validAmounts.push({ amount, priority: 1 })
      }
    }
    
    if (validAmounts.length > 0) {
      // Ordenar por prioridad y luego por monto
      validAmounts.sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority
        return b.amount - a.amount
      })
      return validAmounts[0].amount.toFixed(2)
    }
  }
  
  // PASO 4: Buscar números seguidos de "pesos", "ARS", "USD"
  const moneyWordPattern = /([\d.,]+)\s*(?:pesos|ars|usd)/i
  const moneyMatch = text.match(moneyWordPattern)
  if (moneyMatch) {
    const cleanedAmount = cleanAndValidateAmount(moneyMatch[1])
    if (cleanedAmount !== null && cleanedAmount >= 10) {
      return cleanedAmount.toFixed(2)
    }
  }
  
  // PASO 5: Como último recurso, buscar el número más grande válido
  // (pero con más validaciones para evitar IVA/Subtotales)
  const allNumbers = text.match(/[\d.,]+/g)
  if (allNumbers && allNumbers.length > 0) {
    const validAmounts = allNumbers
      .map(num => cleanAndValidateAmount(num))
      .filter(amount => {
        if (amount === null) return false
        if (amount < 10) return false
        if (amount > 10000000) return false
        if (Number.isInteger(amount) && amount.toString().length >= 8) return false
        return true
      })
      .sort((a, b) => b - a)
    
    // Si hay múltiples montos, el más grande suele ser el total (con IVA)
    if (validAmounts.length > 0) {
      return validAmounts[0].toFixed(2)
    }
  }
  
  return '0.00'
}

/**
 * Limpia y valida un string de monto
 */
function cleanAndValidateAmount(amountStr) {
  if (!amountStr) return null
  
  // Limpiar el string
  let cleaned = amountStr.trim()
  
  // Determinar si usa punto o coma como separador decimal
  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  
  // Si tiene ambos, el último es el decimal
  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) {
      // Formato europeo: 1.234,56
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      // Formato americano: 1,234.56
      cleaned = cleaned.replace(/,/g, '')
    }
  } else if (lastComma > -1) {
    // Solo tiene comas
    const commaPos = lastComma
    const afterComma = cleaned.substring(commaPos + 1)
    
    if (afterComma.length === 2) {
      // Probablemente decimal: 1234,56
      cleaned = cleaned.replace(',', '.')
    } else {
      // Probablemente separador de miles: 1,234
      cleaned = cleaned.replace(/,/g, '')
    }
  } else if (lastDot > -1) {
    // Solo tiene puntos
    const dotPos = lastDot
    const afterDot = cleaned.substring(dotPos + 1)
    
    if (afterDot.length === 2) {
      // Probablemente decimal: 1234.56
      // Ya está en formato correcto
    } else if (afterDot.length === 3) {
      // Probablemente separador de miles: 1.234
      cleaned = cleaned.replace(/\./g, '')
    }
  }
  
  const numAmount = parseFloat(cleaned)
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return null
  }
  
  return numAmount
}

/**
 * Extrae la descripción/concepto de la factura
 */
function extractDescription(text, invoiceNumber) {
  const lines = text.split('\n').filter(line => line.trim().length > 10)
  
  // Buscar líneas que parezcan descripciones
  for (const line of lines) {
    const lineLower = line.toLowerCase()
    if (
      !lineLower.includes('factura') &&
      !lineLower.includes('fecha') &&
      !lineLower.includes('total') &&
      !lineLower.includes('cuit') &&
      line.length > 15 &&
      line.length < 200
    ) {
      return line.trim()
    }
  }
  
  return `Factura ${invoiceNumber}`
}

/**
 * Categoriza automáticamente la factura basándose en palabras clave
 */
function categorizeInvoice(text, type) {
  const textLower = text.toLowerCase()
  
  if (type === 'income') {
    // Categorías de ingresos
    if (textLower.includes('servicio') || textLower.includes('consultoría')) {
      return 'Servicios'
    }
    return 'Ventas'
  } else {
    // Categorías de gastos
    if (textLower.includes('sueldo') || textLower.includes('salario') || textLower.includes('honorario')) {
      return 'Sueldos'
    }
    if (textLower.includes('impuesto') || textLower.includes('tasa') || textLower.includes('tributo')) {
      return 'Impuestos'
    }
    if (textLower.includes('alquiler') || textLower.includes('luz') || textLower.includes('agua') || textLower.includes('gas')) {
      return 'Gastos Operativos'
    }
    if (textLower.includes('compra') || textLower.includes('mercadería') || textLower.includes('producto')) {
      return 'Compras'
    }
    return 'Gastos Operativos'
  }
}

/**
 * Extrae impuestos discriminados de la factura
 */
function extractTaxes(text) {
  const taxes = []
  const lines = text.split('\n')
  
  for (const line of lines) {
    const lineLower = line.toLowerCase()
    
    // Detectar IVA con diferentes formatos
    if (lineLower.match(/(?:iva|i\.v\.a)/)) {
      // Buscar porcentaje y monto
      const percentMatch = line.match(/(\d+(?:\.\d+)?)\s*%/)
      const amountMatch = line.match(/\$?\s*([\d.,]+)/)
      
      if (amountMatch) {
        const amount = cleanAndValidateAmount(amountMatch[1])
        if (amount && amount > 0) {
          const percent = percentMatch ? percentMatch[1] : '21'
          taxes.push({
            name: `IVA ${percent}%`,
            type: 'IVA',
            rate: parseFloat(percent),
            amount: amount
          })
        }
      }
    }
    
    // Detectar Impuesto a las Ganancias
    if (lineLower.match(/(?:ganancias|imp\.?\s*ganancias|ret\.?\s*ganancias)/)) {
      const amountMatch = line.match(/\$?\s*([\d.,]+)/)
      if (amountMatch) {
        const amount = cleanAndValidateAmount(amountMatch[1])
        if (amount && amount > 0) {
          taxes.push({
            name: 'Impuesto a las Ganancias',
            type: 'Ganancias',
            rate: 35,
            amount: amount
          })
        }
      }
    }
    
    // Detectar Ingresos Brutos
    if (lineLower.match(/(?:ingresos brutos|iibb|i\.i\.b\.b|ret\.?\s*iibb)/)) {
      const amountMatch = line.match(/\$?\s*([\d.,]+)/)
      if (amountMatch) {
        const amount = cleanAndValidateAmount(amountMatch[1])
        if (amount && amount > 0) {
          taxes.push({
            name: 'Ingresos Brutos',
            type: 'IIBB',
            rate: 0,
            amount: amount
          })
        }
      }
    }
    
    // Detectar Retenciones genéricas
    if (lineLower.match(/(?:retención|retencion|ret\.)/)) {
      const amountMatch = line.match(/\$?\s*([\d.,]+)/)
      if (amountMatch) {
        const amount = cleanAndValidateAmount(amountMatch[1])
        if (amount && amount > 0 && !taxes.find(t => t.amount === amount)) {
          taxes.push({
            name: 'Retención',
            type: 'Retención',
            rate: 0,
            amount: amount
          })
        }
      }
    }
    
    // Detectar Percepciones
    if (lineLower.match(/(?:percepción|percepcion|perc\.)/)) {
      const amountMatch = line.match(/\$?\s*([\d.,]+)/)
      if (amountMatch) {
        const amount = cleanAndValidateAmount(amountMatch[1])
        if (amount && amount > 0 && !taxes.find(t => t.amount === amount)) {
          taxes.push({
            name: 'Percepción',
            type: 'Percepción',
            rate: 0,
            amount: amount
          })
        }
      }
    }
  }
  
  return taxes
}

/**
 * Procesa un archivo de factura y extrae toda la información
 */
export async function processInvoiceFile(file, onProgress) {
  try {
    onProgress?.({ status: 'Iniciando procesamiento...', progress: 0 })
    
    let extractedText = ''
    const fileType = file.type
    
    // Extraer texto según el tipo de archivo
    if (fileType === 'application/pdf') {
      onProgress?.({ status: 'Extrayendo texto del PDF...', progress: 30 })
      extractedText = await extractTextFromPDF(file)
    } else if (fileType.startsWith('image/')) {
      onProgress?.({ status: 'Procesando imagen con OCR...', progress: 30 })
      extractedText = await extractTextFromImage(file)
    } else {
      throw new Error('Tipo de archivo no soportado')
    }
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No se pudo extraer texto del archivo')
    }
    
    onProgress?.({ status: 'Analizando datos de la factura...', progress: 70 })
    
    // Extraer información de la factura
    const type = detectInvoiceType(extractedText)
    const number = extractInvoiceNumber(extractedText)
    const date = extractDate(extractedText)
    const amount = extractAmount(extractedText)
    const description = extractDescription(extractedText, number)
    const category = categorizeInvoice(extractedText, type)
    const taxes = extractTaxes(extractedText) // NUEVA: Extraer impuestos
    
    onProgress?.({ status: 'Procesamiento completado', progress: 100 })
    
    return {
      id: Date.now(),
      fileName: file.name,
      type,
      number,
      date,
      amount,
      description,
      category,
      taxes, // NUEVO: Array de impuestos discriminados
      processed: true,
      extractedText: extractedText.substring(0, 1000), // Guardar más texto para debug
    }
  } catch (error) {
    console.error('Error procesando factura:', error)
    throw error
  }
}

/**
 * Procesa múltiples archivos de facturas
 */
export async function processMultipleInvoices(files, onProgress) {
  const results = []
  const total = files.length
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    onProgress?.({
      status: `Procesando ${i + 1} de ${total}: ${file.name}`,
      progress: (i / total) * 100,
      currentFile: i + 1,
      totalFiles: total
    })
    
    try {
      const result = await processInvoiceFile(file, (fileProgress) => {
        onProgress?.({
          ...fileProgress,
          currentFile: i + 1,
          totalFiles: total
        })
      })
      results.push(result)
    } catch (error) {
      console.error(`Error procesando ${file.name}:`, error)
      // Continuar con el siguiente archivo
      results.push({
        id: Date.now() + i,
        fileName: file.name,
        error: error.message,
        processed: false
      })
    }
  }
  
  onProgress?.({
    status: 'Todos los archivos procesados',
    progress: 100,
    currentFile: total,
    totalFiles: total
  })
  
  return results
}
