import { analyzeWithOpenAI } from './openaiService'
import { processInvoiceFile } from './invoiceProcessor'

/**
 * Procesa una factura usando IA para validación y detección de duplicados
 */
export async function processInvoiceWithAI(file, existingInvoices = [], onProgress) {
  try {
    onProgress?.({ status: 'Extrayendo datos de la factura...', progress: 20 })
    
    // PASO 1: Extraer datos básicos con OCR/PDF
    const basicData = await processInvoiceFile(file, (progress) => {
      onProgress?.({ 
        status: progress.status, 
        progress: 20 + (progress.progress * 0.4) // 20-60%
      })
    })

    onProgress?.({ status: 'Analizando con IA...', progress: 60 })

    // PASO 2: Preparar contexto para la IA
    const context = {
      extractedText: basicData.extractedText,
      basicData: {
        number: basicData.number,
        date: basicData.date,
        amount: basicData.amount,
        type: basicData.type,
        taxes: basicData.taxes
      },
      existingInvoices: existingInvoices.map(inv => ({
        number: inv.number,
        date: inv.date,
        amount: inv.amount,
        type: inv.type
      }))
    }

    // PASO 3: Analizar con IA
    const aiPrompt = `
Eres un experto contador analizando una factura. Analiza los siguientes datos extraídos y proporciona una respuesta en formato JSON.

DATOS EXTRAÍDOS:
${JSON.stringify(context.basicData, null, 2)}

TEXTO COMPLETO DE LA FACTURA:
${context.extractedText}

FACTURAS EXISTENTES EN EL SISTEMA:
${JSON.stringify(context.existingInvoices, null, 2)}

TAREAS:
1. VALIDAR si los datos extraídos son correctos
2. DETECTAR si esta factura ya existe comparando número, fecha y monto
3. IDENTIFICAR si es una COPIA/DUPLICADO/TRIPLICADO de una factura existente
4. CORREGIR el monto si detectas errores (ej: si tomó IVA en lugar de importe neto)
5. VALIDAR que los impuestos sean coherentes con el monto
6. MARCAR impuestos que NO deben contarse (si es copia)
7. EXTRAER información adicional relevante

IMPORTANTE: NO intentes determinar si es VENTA o COMPRA. El usuario ya decidió el tipo.
Solo enfocate en extraer y validar: número, fecha, monto, impuestos, descripción y categoría.

REGLAS IMPORTANTES:
- El IMPORTE NETO o SUBTOTAL es el valor principal (sin IVA)
- Si hay IVA, debe ser ~21% del importe neto
- Si es COPIA/DUPLICADO/TRIPLICADO:
  * Permitir guardar la factura
  * Marcar como "isDuplicateCopy": true
  * Poner "shouldCount": false en TODOS los impuestos
  * Así se guarda pero NO se suma en reportes
- Si es la ORIGINAL o PRIMERA vez que se ve:
  * "isDuplicateCopy": false
  * "shouldCount": true en impuestos
- Detectar copias por: mismo número + fecha + monto similar
- Validar que la fecha sea coherente

Responde SOLO con un JSON válido con esta estructura:
{
  "isValid": true/false,
  "isDuplicate": true/false,
  "isDuplicateCopy": true/false,
  "duplicateReason": "explicación si es duplicado/copia",
  "originalInvoiceId": "id de la factura original si es copia",
  "correctedData": {
    "number": "número corregido",
    "date": "YYYY-MM-DD",
    "amount": "monto correcto (número)",
    "description": "descripción mejorada",
    "category": "categoría apropiada",
    "taxes": [
      {
        "name": "IVA 21%",
        "type": "IVA",
        "rate": 21,
        "amount": 1000,
        "shouldCount": true
      }
    ]
  },
  "confidence": 0.95,
  "warnings": ["advertencias si las hay"],
  "suggestions": ["sugerencias de mejora"]
}
`

    const aiResponse = await analyzeWithOpenAI(aiPrompt)
    
    onProgress?.({ status: 'Procesando respuesta de IA...', progress: 90 })

    // PASO 4: Parsear respuesta de IA
    let aiAnalysis
    try {
      // Extraer JSON de la respuesta (puede venir con texto adicional)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No se pudo extraer JSON de la respuesta')
      }
    } catch (error) {
      console.warn('Error parseando respuesta de IA, usando datos básicos:', error)
      aiAnalysis = {
        isValid: true,
        isDuplicate: false,
        correctedData: basicData,
        confidence: 0.5,
        warnings: ['No se pudo analizar con IA completamente'],
        suggestions: []
      }
    }

    onProgress?.({ status: 'Completado', progress: 100 })

    // PASO 5: Combinar datos básicos con análisis de IA
    return {
      ...basicData,
      ...aiAnalysis.correctedData,
      aiAnalysis: {
        isValid: aiAnalysis.isValid,
        isDuplicate: aiAnalysis.isDuplicate,
        duplicateReason: aiAnalysis.duplicateReason,
        confidence: aiAnalysis.confidence,
        warnings: aiAnalysis.warnings || [],
        suggestions: aiAnalysis.suggestions || []
      },
      processed: true,
      aiProcessed: true
    }

  } catch (error) {
    console.error('Error en procesamiento con IA:', error)
    throw error
  }
}

/**
 * Procesa múltiples facturas con IA y detección de duplicados
 */
export async function processMultipleInvoicesWithAI(files, existingInvoices = [], onProgress) {
  const results = []
  const total = files.length
  const processedInvoices = [...existingInvoices]

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    onProgress?.({
      status: `Procesando con IA ${i + 1} de ${total}: ${file.name}`,
      progress: (i / total) * 100,
      currentFile: i + 1,
      totalFiles: total
    })
    
    try {
      const result = await processInvoiceWithAI(file, processedInvoices, (fileProgress) => {
        onProgress?.({
          ...fileProgress,
          currentFile: i + 1,
          totalFiles: total
        })
      })
      
      // Agregar a la lista de procesados (incluso si es copia)
      // Las copias se guardan pero marcadas para no contar impuestos
      processedInvoices.push(result)
      
      results.push(result)
    } catch (error) {
      console.error(`Error procesando ${file.name}:`, error)
      results.push({
        id: Date.now() + i,
        fileName: file.name,
        error: error.message,
        processed: false,
        aiProcessed: false
      })
    }
  }
  
  onProgress?.({
    status: 'Todos los archivos procesados con IA',
    progress: 100,
    currentFile: total,
    totalFiles: total
  })
  
  return results
}

/**
 * Valida una factura individual con IA
 */
export async function validateInvoiceWithAI(invoiceData, existingInvoices = []) {
  const aiPrompt = `
Eres un contador experto. Valida esta factura y detecta posibles errores o duplicados.

FACTURA A VALIDAR:
${JSON.stringify(invoiceData, null, 2)}

FACTURAS EXISTENTES:
${JSON.stringify(existingInvoices.slice(0, 50), null, 2)}

VALIDACIONES:
1. ¿Es un duplicado? (mismo número, fecha y monto)
2. ¿Los impuestos son coherentes con el monto?
3. ¿La fecha es válida?
4. ¿El monto es razonable?
5. ¿Hay inconsistencias?

Responde SOLO con JSON:
{
  "isValid": true/false,
  "isDuplicate": true/false,
  "errors": ["lista de errores"],
  "warnings": ["lista de advertencias"],
  "confidence": 0.95
}
`

  try {
    const aiResponse = await analyzeWithOpenAI(aiPrompt)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return {
      isValid: true,
      isDuplicate: false,
      errors: [],
      warnings: ['No se pudo validar completamente con IA'],
      confidence: 0.5
    }
  } catch (error) {
    console.error('Error validando con IA:', error)
    return {
      isValid: true,
      isDuplicate: false,
      errors: [error.message],
      warnings: [],
      confidence: 0
    }
  }
}

/**
 * Detecta duplicados en un lote de facturas
 */
export function detectDuplicates(invoices) {
  const duplicates = []
  const seen = new Map()

  for (const invoice of invoices) {
    // Crear una clave única basada en número, fecha y monto
    const key = `${invoice.number}-${invoice.date}-${invoice.amount}`
    
    if (seen.has(key)) {
      duplicates.push({
        original: seen.get(key),
        duplicate: invoice,
        reason: 'Mismo número, fecha y monto'
      })
    } else {
      seen.set(key, invoice)
    }
  }

  return duplicates
}

/**
 * Limpia y normaliza datos de factura
 */
export function normalizeInvoiceData(invoice) {
  return {
    ...invoice,
    number: invoice.number?.trim().toUpperCase() || '',
    amount: parseFloat(invoice.amount) || 0,
    date: invoice.date || new Date().toISOString().split('T')[0],
    description: invoice.description?.trim() || '',
    category: invoice.category?.trim() || 'Sin categoría',
    taxes: Array.isArray(invoice.taxes) ? invoice.taxes : []
  }
}
