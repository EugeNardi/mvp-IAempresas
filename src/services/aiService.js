/**
 * Servicio de IA para transcripción y procesamiento de audio/documentos
 * Integra OpenAI Whisper para transcripción y GPT para extracción de datos
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''

/**
 * Transcribe un archivo de audio usando OpenAI Whisper
 */
export async function transcribeAudio(audioFile) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('API Key de OpenAI no configurada')
    }

    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('model', 'whisper-1')
    formData.append('language', 'es')
    formData.append('response_format', 'json')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Error en la transcripción')
    }

    const data = await response.json()
    return {
      success: true,
      text: data.text,
      duration: data.duration
    }
  } catch (error) {
    console.error('Error en transcripción:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Procesa el texto transcrito y extrae datos estructurados según el tipo de movimiento
 */
export async function processTranscriptionForMovement(transcription, movementType) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('API Key de OpenAI no configurada')
    }

    const systemPrompts = {
      venta: `Eres un asistente que extrae información de ventas de texto en español. 
Extrae y devuelve un JSON con estos campos:
- cliente: nombre del cliente
- tipo: "minorista" o "mayorista"
- fecha: formato YYYY-MM-DD (si no se menciona, usa la fecha actual)
- medio: "efectivo", "transferencia", "tarjeta_debito", "tarjeta_credito", "cheque", o "mercadopago"
- cobrado: true si está pagado, false si está pendiente
- productos: array de objetos con {nombre, cantidad, precioUnitario, descuento}
- descripcion: resumen breve

Si falta información, usa valores razonables o null.`,

      compra: `Eres un asistente que extrae información de compras de texto en español.
Extrae y devuelve un JSON con estos campos:
- proveedor: nombre del proveedor
- tipo: "minorista" o "mayorista"
- fecha: formato YYYY-MM-DD
- medio: método de pago
- pagado: true/false
- productos: array de objetos con {categoria, nombre, cantidad, costoUnitario, precioMinorista, precioMayorista}
- descripcion: resumen breve`,

      gasto: `Eres un asistente que extrae información de gastos de texto en español.
Extrae y devuelve un JSON con estos campos:
- concepto: tipo de gasto
- beneficiario: a quién se le paga
- fecha: formato YYYY-MM-DD
- monto: valor numérico
- medio: método de pago
- pagado: true/false
- categoria: "Sueldos", "Alquiler", "Servicios", "Marketing", "Impuestos", u otra
- recurrente: true/false
- frecuencia: "mensual", "quincenal", "semanal", etc. (si es recurrente)
- descripcion: resumen breve`,

      aporte: `Eres un asistente que extrae información de aportes de capital de texto en español.
Extrae y devuelve un JSON con estos campos:
- aportante: nombre de quien aporta
- fecha: formato YYYY-MM-DD
- monto: valor numérico
- medio: método de pago
- tipoAporte: "Capital Inicial", "Inversión", "Préstamo Recibido", u otro
- porcentajeParticipacion: número entre 0-100 (si se menciona)
- destinoFondos: para qué se usará el dinero
- descripcion: resumen breve`,

      retiro: `Eres un asistente que extrae información de retiros de capital de texto en español.
Extrae y devuelve un JSON con estos campos:
- beneficiario: quién recibe el retiro
- fecha: formato YYYY-MM-DD
- monto: valor numérico
- medio: método de pago
- tipoRetiro: "Dividendos", "Retiro Socio", "Préstamo Otorgado", u otro
- autorizadoPor: quién autoriza (si se menciona)
- concepto: motivo del retiro
- descripcion: resumen breve`
    }

    const systemPrompt = systemPrompts[movementType] || systemPrompts.gasto

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Extrae la información de este texto: "${transcription}"`
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Error en el procesamiento')
    }

    const data = await response.json()
    const extractedData = JSON.parse(data.choices[0].message.content)

    return {
      success: true,
      data: extractedData,
      transcription: transcription
    }
  } catch (error) {
    console.error('Error en procesamiento:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Función principal que transcribe y procesa audio en un solo paso
 */
export async function processAudioForMovement(audioFile, movementType) {
  try {
    // Paso 1: Transcribir audio
    console.log('🎤 Transcribiendo audio...')
    const transcriptionResult = await transcribeAudio(audioFile)
    
    if (!transcriptionResult.success) {
      throw new Error(transcriptionResult.error)
    }

    console.log('✅ Transcripción completada:', transcriptionResult.text)

    // Paso 2: Procesar transcripción
    console.log('🤖 Procesando con IA...')
    const processingResult = await processTranscriptionForMovement(
      transcriptionResult.text,
      movementType
    )

    if (!processingResult.success) {
      throw new Error(processingResult.error)
    }

    console.log('✅ Procesamiento completado:', processingResult.data)

    return {
      success: true,
      transcription: transcriptionResult.text,
      data: processingResult.data
    }
  } catch (error) {
    console.error('Error en proceso completo:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Verifica si la API de OpenAI está configurada
 */
export function isOpenAIConfigured() {
  return !!OPENAI_API_KEY && OPENAI_API_KEY.length > 0
}
