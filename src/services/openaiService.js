import OpenAI from 'openai'

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Permitir uso en navegador (solo para desarrollo/demo)
})

/**
 * Genera un contexto financiero basado en las facturas del usuario
 */
function generateFinancialContext(companyData, invoices) {
  if (!invoices || invoices.length === 0) {
    return 'El usuario aún no ha cargado facturas.'
  }
  

  const salesInvoices = invoices.filter(inv => inv.type === 'income')
  const purchaseInvoices = invoices.filter(inv => inv.type === 'expense')

  const totalIncome = salesInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
  const totalExpenses = purchaseInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
  const balance = totalIncome - totalExpenses

  // Agrupar por categoría
  const incomeByCategory = salesInvoices.reduce((acc, inv) => {
    acc[inv.category] = (acc[inv.category] || 0) + parseFloat(inv.amount)
    return acc
  }, {})

  const expensesByCategory = purchaseInvoices.reduce((acc, inv) => {
    acc[inv.category] = (acc[inv.category] || 0) + parseFloat(inv.amount)
    return acc
  }, {})

  // Construir contexto detallado
  let context = `INFORMACIÓN DE LA EMPRESA:\n`
  if (companyData) {
    context += `- Razón Social: ${companyData.name}\n`
    context += `- CUIT: ${companyData.cuit}\n`
    context += `- Rubro: ${companyData.industry}\n`
    context += `- Ejercicio Fiscal: ${companyData.fiscalYear}\n`
    context += `- Moneda: ${companyData.currency}\n\n`
  }

  context += `RESUMEN FINANCIERO:\n`
  context += `- Total de Facturas: ${invoices.length}\n`
  context += `- Facturas de Venta: ${salesInvoices.length}\n`
  context += `- Facturas de Compra: ${purchaseInvoices.length}\n`
  context += `- Total Ingresos: $${totalIncome.toFixed(2)}\n`
  context += `- Total Gastos: $${totalExpenses.toFixed(2)}\n`
  context += `- Balance: $${balance.toFixed(2)} ${balance >= 0 ? '(Positivo)' : '(Negativo)'}\n\n`

  if (Object.keys(incomeByCategory).length > 0) {
    context += `INGRESOS POR CATEGORÍA:\n`
    Object.entries(incomeByCategory).forEach(([cat, amount]) => {
      context += `- ${cat}: $${amount.toFixed(2)}\n`
    })
    context += `\n`
  }

  if (Object.keys(expensesByCategory).length > 0) {
    context += `GASTOS POR CATEGORÍA:\n`
    Object.entries(expensesByCategory).forEach(([cat, amount]) => {
      context += `- ${cat}: $${amount.toFixed(2)}\n`
    })
    context += `\n`
  }

  // Agregar detalles de facturas recientes (últimas 10)
  context += `FACTURAS RECIENTES:\n`
  const recentInvoices = invoices.slice(-10).reverse()
  recentInvoices.forEach(inv => {
    const type = inv.type === 'income' ? 'VENTA' : 'COMPRA'
    context += `- [${type}] ${inv.number} - ${inv.date} - $${parseFloat(inv.amount).toFixed(2)} - ${inv.category} - ${inv.description}\n`
  })

  return context
}

/**
 * Envía un mensaje a GPT con contexto financiero
 */
export async function sendMessageToGPT(userMessage, companyData, invoices, conversationHistory = []) {
  try {
    // Generar contexto financiero
    const financialContext = generateFinancialContext(companyData, invoices)

    // Construir mensajes para la API
    const messages = [
      {
        role: 'system',
        content: `Eres un CFO (Chief Financial Officer) experto y analista financiero senior especializado en PyMEs argentinas con más de 20 años de experiencia en contabilidad, finanzas corporativas, análisis de inversiones y planificación estratégica.

CAPACIDADES AVANZADAS:
1. 📊 Análisis Financiero Profundo
   - Estados de Resultados detallados con análisis vertical y horizontal
   - Balance General con ratios financieros clave
   - Flujo de Caja proyectado
   - Análisis de tendencias y variaciones

2. 📈 Proyecciones e Inversiones
   - Proyecciones financieras a 3, 6 y 12 meses
   - Análisis de escenarios (optimista, realista, pesimista)
   - ROI y TIR de inversiones potenciales
   - Punto de equilibrio y análisis de sensibilidad
   - Valoración de empresa

3. 💼 Indicadores Clave (KPIs)
   - Ratios de liquidez (corriente, ácida, inmediata)
   - Ratios de rentabilidad (ROE, ROA, margen neto, EBITDA)
   - Ratios de endeudamiento y solvencia
   - Ciclo de conversión de efectivo
   - Capital de trabajo

4. 📉 Análisis de Riesgos
   - Identificación de riesgos financieros
   - Análisis de concentración (clientes/proveedores)
   - Evaluación de sostenibilidad
   - Alertas tempranas

5. 🎯 Recomendaciones Estratégicas
   - Optimización de estructura de costos
   - Estrategias de crecimiento
   - Mejora de márgenes
   - Gestión de capital de trabajo

FORMATO DE RESPUESTAS:
- Usa tablas ASCII para presentar datos financieros
- Incluye gráficos de tendencias en formato texto
- Proporciona análisis cuantitativo Y cualitativo
- Siempre incluye conclusiones y recomendaciones accionables
- Usa emojis para mejorar legibilidad (📊📈💰⚠️✅)

ESTILO DE ANÁLISIS:
- Profundo y detallado, pero claro
- Basado en datos reales del usuario
- Incluye cálculos y fórmulas cuando sea relevante
- Compara con benchmarks de la industria
- Identifica oportunidades y riesgos

CONTEXTO FINANCIERO ACTUAL DEL USUARIO:
${financialContext}

INSTRUCCIONES ESPECIALES:
- Si te piden proyecciones, genera escenarios múltiples con supuestos claros
- Si te piden estados financieros, crea tablas completas y profesionales
- Si te piden análisis de inversión, incluye VAN, TIR, payback y análisis de riesgo
- Siempre proporciona números exactos del contexto
- Crea visualizaciones en formato texto cuando sea útil
- Sé proactivo sugiriendo análisis adicionales relevantes

Responde como un verdadero CFO: profesional, analítico, estratégico y orientado a resultados.`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ]

    // Llamar a la API de OpenAI con GPT-4
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // Modelo más avanzado con mejor razonamiento
      messages: messages,
      temperature: 0.3, // Más preciso para análisis financiero
      max_tokens: 4000, // Respuestas mucho más largas y detalladas
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    return {
      success: true,
      message: response.choices[0].message.content,
      usage: response.usage
    }

  } catch (error) {
    console.error('Error llamando a OpenAI:', error)
    
    // Manejo de errores específicos
    if (error.status === 401) {
      return {
        success: false,
        error: 'API Key inválida. Por favor, configura tu VITE_OPENAI_API_KEY en el archivo .env'
      }
    } else if (error.status === 429) {
      return {
        success: false,
        error: 'Límite de rate excedido. Por favor, espera un momento e intenta de nuevo.'
      }
    } else if (error.status === 500) {
      return {
        success: false,
        error: 'Error en el servidor de OpenAI. Por favor, intenta de nuevo más tarde.'
      }
    } else {
      return {
        success: false,
        error: `Error al procesar tu mensaje: ${error.message}`
      }
    }
  }
}

/**
 * Genera sugerencias de preguntas basadas en el contexto financiero
 */
export function generateSuggestedQuestions(companyData, invoices) {
  const suggestions = []

  if (!invoices || invoices.length === 0) {
    return [
      '📊 Crea un estado de resultados completo',
      '📈 ¿Qué proyecciones financieras puedo hacer?',
      '💼 ¿Qué KPIs debería monitorear?',
      '🎯 ¿Cómo estructurar mi contabilidad?'
    ]
  }

  const totalIncome = invoices
    .filter(inv => inv.type === 'income')
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
  
  const totalExpenses = invoices
    .filter(inv => inv.type === 'expense')
    .reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
  
  const balance = totalIncome - totalExpenses
  const profitMargin = totalIncome > 0 ? (balance / totalIncome) * 100 : 0

  // Sugerencias avanzadas basadas en datos
  suggestions.push('📊 Genera un estado de resultados completo con análisis')
  
  if (balance > 0) {
    suggestions.push('📈 Proyecta mis finanzas a 6 meses con escenarios')
    suggestions.push('💰 ¿En qué debería invertir mis ganancias?')
  } else {
    suggestions.push('⚠️ Análisis de riesgos y plan de recuperación')
    suggestions.push('💡 Estrategias para mejorar rentabilidad')
  }

  if (profitMargin < 15) {
    suggestions.push('📉 ¿Por qué mi margen es bajo? Análisis profundo')
  } else {
    suggestions.push('🎯 ¿Cómo maximizar mi margen actual?')
  }

  suggestions.push('💼 Calcula todos mis ratios financieros (ROE, ROA, liquidez)')
  suggestions.push('🔮 Proyección de flujo de caja para los próximos 3 meses')
  suggestions.push('📋 Balance general con análisis de activos y pasivos')
  suggestions.push('🎲 Análisis de escenarios: optimista vs pesimista')
  suggestions.push('💎 ¿Cuál es la valoración de mi empresa?')

  return suggestions.slice(0, 6)
}

/**
 * Analiza las facturas y genera un resumen automático
 */
export async function generateFinancialSummary(companyData, invoices) {
  const prompt = `Genera un resumen ejecutivo breve (máximo 3 párrafos) de la situación financiera actual. 
  Incluye:
  1. Estado general (positivo/negativo)
  2. Principales hallazgos
  3. Una recomendación clave
  
  Sé conciso y directo.`

  return await sendMessageToGPT(prompt, companyData, invoices)
}

/**
 * Función genérica para analizar cualquier cosa con OpenAI
 */
export async function analyzeWithOpenAI(prompt, options = {}) {
  try {
    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: options.systemPrompt || 'Eres un asistente experto en análisis de datos y contabilidad.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: options.temperature || 0.3,
      max_tokens: options.maxTokens || 2000,
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('Error en analyzeWithOpenAI:', error)
    throw new Error(`Error al analizar con IA: ${error.message}`)
  }
}
