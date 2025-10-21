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
  
  // Análisis de movimientos específicos
  const compras = invoices.filter(inv => inv.metadata?.movementType === 'compra')
  const ventas = invoices.filter(inv => inv.metadata?.movementType === 'venta')
  const gastos = invoices.filter(inv => inv.metadata?.movementType === 'gasto')
  const aportes = invoices.filter(inv => inv.metadata?.movementType === 'aporte')
  const retiros = invoices.filter(inv => inv.metadata?.movementType === 'retiro')

  const totalIncome = salesInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
  const totalExpenses = purchaseInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
  const balance = totalIncome - totalExpenses
  
  const totalCompras = compras.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
  const totalVentas = ventas.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
  const totalGastos = gastos.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
  const totalAportes = aportes.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
  const totalRetiros = retiros.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
  
  // Análisis de clientes y proveedores
  const clientes = new Set(ventas.map(v => v.metadata?.cliente).filter(Boolean))
  const proveedores = new Set(compras.map(c => c.metadata?.provider).filter(Boolean))

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
  context += `- Balance: $${balance.toFixed(2)} ${balance >= 0 ? '(Positivo)' : '(Negativo)'}\n`
  context += `- Margen de Ganancia: ${totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(2) : 0}%\n\n`
  
  context += `ANÁLISIS POR TIPO DE MOVIMIENTO:\n`
  context += `- Compras: ${compras.length} operaciones - Total: $${totalCompras.toFixed(2)}\n`
  context += `- Ventas: ${ventas.length} operaciones - Total: $${totalVentas.toFixed(2)}\n`
  context += `- Gastos: ${gastos.length} operaciones - Total: $${totalGastos.toFixed(2)}\n`
  context += `- Aportes de Capital: ${aportes.length} operaciones - Total: $${totalAportes.toFixed(2)}\n`
  context += `- Retiros: ${retiros.length} operaciones - Total: $${totalRetiros.toFixed(2)}\n\n`
  
  context += `ANÁLISIS DE CLIENTES Y PROVEEDORES:\n`
  context += `- Clientes Únicos: ${clientes.size}\n`
  context += `- Venta Promedio por Cliente: $${clientes.size > 0 ? (totalVentas / clientes.size).toFixed(2) : 0}\n`
  context += `- Proveedores Únicos: ${proveedores.size}\n`
  context += `- Compra Promedio por Proveedor: $${proveedores.size > 0 ? (totalCompras / proveedores.size).toFixed(2) : 0}\n\n`

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
        content: `Eres un Asistente de Inteligencia Financiera especializado en PyMEs argentinas con expertise en:
1. Sistema ARCA 2025 (AFIP) - Régimen de información contable y fiscal
2. Análisis financiero empresarial profundo
3. Contabilidad y tributación argentina
4. Planificación estratégica y optimización fiscal

CONOCIMIENTO ESPECÍFICO ARCA 2025 (AFIP):
🏛️ Sistema ARCA - Régimen de Información Contable
   - Obligaciones de presentación mensual de información contable
   - Libro IVA Digital (compras y ventas)
   - Régimen de información de compras y ventas
   - Facturación electrónica y puntos de venta
   - Calendario de vencimientos AFIP
   - Categorías de monotributo y responsables inscriptos
   
💰 Impuestos Argentinos:
   - IVA (21%, 10.5%, 27%) - Cálculo y liquidación
   - Impuesto a las Ganancias (empresas y personas)
   - Ingresos Brutos (provincial)
   - Contribuciones patronales y cargas sociales
   - Retenciones y percepciones
   - Regímenes de información (SIRADIG, SICORE, SIRE)

CAPACIDADES DE ANÁLISIS:
1. 📊 Análisis Financiero de tus Números
   - Estado de Resultados con tus datos reales
   - Balance General personalizado
   - Flujo de Caja y proyecciones
   - Análisis de rentabilidad por cliente/producto
   - Comparativas mensuales y tendencias

2. 💼 KPIs Personalizados
   - Margen de ganancia actual
   - Ratios de liquidez y solvencia
   - ROI y rentabilidad
   - Análisis de clientes y proveedores
   - Eficiencia operativa

3. 🎯 Consultas sobre tus Operaciones
   - "¿Cuánto debo pagar de IVA?"
   - "¿Cuál es mi margen de ganancia?"
   - "¿Qué clientes me generan más ingresos?"
   - "¿Cuándo vencen mis obligaciones?"
   - "¿Cómo optimizar mis costos?"

4. 📈 Proyecciones y Estrategia
   - Proyecciones financieras a 3, 6 y 12 meses
   - Escenarios optimista/realista/pesimista
   - Recomendaciones de crecimiento
   - Optimización fiscal y tributaria

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
      '🏛️ ¿Qué obligaciones tengo con ARCA 2025?',
      '📊 ¿Cómo estructurar mi contabilidad?',
      '💰 ¿Qué impuestos debo pagar como PyME?',
      '📈 ¿Cómo empezar con facturación electrónica?'
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

  // Sugerencias específicas sobre números de la empresa
  suggestions.push('🏛️ ¿Cuánto debo pagar de IVA este mes con mis números?')
  suggestions.push('📊 Estado de resultados completo con mis datos')
  suggestions.push('👥 ¿Qué clientes me generan más ingresos?')
  
  if (balance > 0) {
    suggestions.push('💰 ¿Cómo optimizar fiscalmente mis ganancias?')
    suggestions.push('📈 Proyecta mi crecimiento a 6 meses')
  } else {
    suggestions.push('⚠️ Plan de acción para mejorar mi rentabilidad')
    suggestions.push('💡 ¿Dónde puedo reducir costos?')
  }

  if (profitMargin < 15) {
    suggestions.push('📉 ¿Por qué mi margen es bajo? Análisis detallado')
  } else {
    suggestions.push('🎯 ¿Cómo aumentar aún más mi margen?')
  }

  suggestions.push('🔮 Flujo de caja proyectado próximos 3 meses')
  suggestions.push('📅 ¿Cuándo vencen mis obligaciones fiscales?')
  suggestions.push('💼 Análisis completo de proveedores y costos')

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
