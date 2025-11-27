import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Minimize2, Maximize2, Sparkles, TrendingUp, DollarSign, BarChart3 } from 'lucide-react'
import { sendMessageToGPT } from '../../services/openaiService'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const FloatingChat = ({ dashboardContext }) => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu **Asistente Financiero Inteligente**. Estoy aquí para ayudarte a analizar y entender mejor tus datos financieros.\n\n**Puedo ayudarte con:**\n• Análisis de ingresos y gastos\n• Ratios financieros y liquidez\n• Proyecciones y tendencias\n• Recomendaciones personalizadas\n\n¿Qué te gustaría saber?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [quickActions, setQuickActions] = useState([
    { id: 1, icon: DollarSign, label: '¿Cuál es mi liquidez?', query: '¿Cuál es mi ratio de liquidez actual y qué significa?' },
    { id: 2, icon: TrendingUp, label: 'Análisis de gastos', query: 'Analiza mis gastos y dame recomendaciones' },
    { id: 3, icon: BarChart3, label: 'Resumen financiero', query: 'Dame un resumen completo de mi situación financiera' }
  ])
  const [conversationId, setConversationId] = useState(null)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const buildContextPrompt = () => {
    if (!dashboardContext) return ''

    const context = `Eres un Asistente Financiero Profesional especializado en análisis empresarial argentino.

CONTEXTO FINANCIERO ACTUAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 PERÍODO: ${dashboardContext.period || 'General'}

💰 INGRESOS Y EGRESOS:
  • Ingresos totales: $${dashboardContext.totalIncome?.toLocaleString('es-AR') || '0'}
  • Egresos totales: $${dashboardContext.totalExpenses?.toLocaleString('es-AR') || '0'}
  • Ganancia bruta: $${dashboardContext.grossProfit?.toLocaleString('es-AR') || '0'}
  • Ganancia neta: $${dashboardContext.netProfit?.toLocaleString('es-AR') || '0'}

📈 ESTRUCTURA DE GASTOS:
  • Gastos fijos: $${dashboardContext.fixedExpenses?.toLocaleString('es-AR') || '0'}
  • Gastos variables: $${dashboardContext.variableExpenses?.toLocaleString('es-AR') || '0'}

🎯 INDICADORES CLAVE:
  • Ratio de liquidez: ${dashboardContext.liquidityRatio?.toFixed(2) || '0'}
  • ROI: ${dashboardContext.roi?.toFixed(2) || '0'}%

📦 INVENTARIO:
  • Productos: ${dashboardContext.productsCount || '0'}
  • Valor: $${dashboardContext.inventoryValue?.toLocaleString('es-AR') || '0'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCCIONES:
• Responde en español argentino profesional
• Usa formato Markdown para estructurar respuestas
• Incluye emojis relevantes para mejor visualización
• Proporciona insights accionables y recomendaciones
• Si mencionas cifras, usa el formato argentino (punto para miles, coma para decimales)
• Sé conciso pero completo en tus análisis
`
    return context
  }

  const handleQuickAction = (query) => {
    setInput(query)
    setTimeout(() => handleSend(), 100)
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    const currentInput = input
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Build conversation history for OpenAI
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }))

      // Prepare dashboard context data
      const companyData = dashboardContext ? {
        name: 'Mi Empresa',
        fiscalYear: new Date().getFullYear().toString()
      } : null

      const invoicesData = dashboardContext ? [{
        type: 'income',
        amount: dashboardContext.totalIncome || 0,
        category: 'Ventas',
        description: 'Ingresos totales'
      }, {
        type: 'expense',
        amount: dashboardContext.totalExpenses || 0,
        category: 'Gastos',
        description: 'Gastos totales'
      }] : []

      // Call OpenAI service
      const response = await sendMessageToGPT(
        currentInput,
        companyData,
        invoicesData,
        conversationHistory
      )

      if (response.success) {
        const assistantMessage = { role: 'assistant', content: response.message }
        setMessages(prev => [...prev, assistantMessage])

        // Save conversation to database
        if (user) {
          await saveConversationMessage(userMessage, assistantMessage)
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `❌ Error: ${response.error || 'No pude procesar tu mensaje. Por favor, intenta de nuevo.'}`
          }
        ])
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const saveConversationMessage = async (userMsg, assistantMsg) => {
    try {
      if (!conversationId) {
        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from('chat_conversations')
          .insert([{
            user_id: user.id,
            title: userMsg.content.substring(0, 50) + '...',
            created_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (convError) throw convError
        setConversationId(newConv.id)

        // Save messages
        await supabase
          .from('chat_messages')
          .insert([
            {
              conversation_id: newConv.id,
              role: 'user',
              content: userMsg.content,
              created_at: new Date().toISOString()
            },
            {
              conversation_id: newConv.id,
              role: 'assistant',
              content: assistantMsg.content,
              created_at: new Date().toISOString()
            }
          ])
      } else {
        // Add to existing conversation
        await supabase
          .from('chat_messages')
          .insert([
            {
              conversation_id: conversationId,
              role: 'user',
              content: userMsg.content,
              created_at: new Date().toISOString()
            },
            {
              conversation_id: conversationId,
              role: 'assistant',
              content: assistantMsg.content,
              created_at: new Date().toISOString()
            }
          ])
      }
    } catch (error) {
      console.error('Error saving conversation:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center z-50 hover:scale-110 group"
      >
        <div className="relative">
          <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
          <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
        </div>
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-[420px] h-[650px]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white px-5 py-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-bold text-lg">Asistente IA</h3>
            <p className="text-xs text-blue-100">Análisis Financiero</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
              <p className="text-xs font-semibold text-gray-600 mb-2">ACCIONES RÁPIDAS</p>
              <div className="space-y-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.query)}
                      className="w-full flex items-center gap-2 p-2 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all text-left group"
                    >
                      <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50 to-gray-100"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                      .replace(/\n/g, '<br />')
                  }} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-center animate-fadeIn">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Powered by OpenAI GPT-4</p>
          </div>
        </>
      )}
    </div>
  )
}

export default FloatingChat
