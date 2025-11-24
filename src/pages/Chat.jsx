import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useNavigate, Link } from 'react-router-dom'
import { Send, Sparkles, Menu, LogOut, User, Plus, MessageSquare, Loader2, LayoutDashboard, FileText, AlertCircle, Crown } from 'lucide-react'
import { sendMessageToGPT, generateSuggestedQuestions } from '../services/openaiService'

const Chat = () => {
  const { user, signOut } = useAuth()
  const { companyData, invoices } = useData()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 ¡Hola! Soy tu **Asistente de Inteligencia Financiera** especializado en ARCA 2025 y análisis empresarial.

**🏛️ Sistema ARCA 2025 (AFIP)**
• Consultas sobre obligaciones fiscales
• Cálculo de impuestos (IVA, Ganancias, Ingresos Brutos)
• Vencimientos y calendario fiscal
• Régimen de información y facturación electrónica

**📊 Análisis de tus Números**
• Estado de resultados en tiempo real
• Análisis de rentabilidad por producto/servicio
• Flujo de caja y proyecciones
• Comparativas mensuales y tendencias

**💼 Gestión Financiera**
• KPIs personalizados de tu empresa
• Análisis de clientes y proveedores
• Optimización de costos operativos
• Estrategias de crecimiento

**🎯 Preguntas Rápidas**
Puedes preguntarme cosas como:
• "¿Cuánto debo pagar de IVA este mes?"
• "¿Cuál es mi margen de ganancia actual?"
• "¿Qué clientes me generan más ingresos?"
• "¿Cuándo vencen mis obligaciones fiscales?"

¿En qué puedo ayudarte hoy?`,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [error, setError] = useState(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState([])
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Generar preguntas sugeridas basadas en los datos
    const questions = generateSuggestedQuestions(companyData, invoices)
    setSuggestedQuestions(questions)
  }, [companyData, invoices])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleSubmit = async (e, customMessage = null) => {
    e?.preventDefault()
    const messageToSend = customMessage || input.trim()
    if (!messageToSend || isLoading) return

    setInput('')
    setError(null)
    setMessages((prev) => [...prev, { role: 'user', content: messageToSend }])
    setIsLoading(true)

    try {
      // Construir historial de conversación (últimos 10 mensajes)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Llamar a GPT con contexto financiero
      const response = await sendMessageToGPT(
        messageToSend,
        companyData,
        invoices,
        conversationHistory
      )

      if (response.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.message }
        ])
      } else {
        setError(response.error)
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `❌ Error: ${response.error}`,
            isError: true
          }
        ])
      }
    } catch (err) {
      console.error('Error en chat:', err)
      setError('Error al procesar tu mensaje. Por favor, intenta de nuevo.')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
          isError: true
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question) => {
    handleSubmit(null, question)
  }

  const handleNewChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `👋 ¡Hola! Soy tu **Asistente de Inteligencia Financiera** especializado en ARCA 2025 y análisis empresarial.

**🏛️ Sistema ARCA 2025 (AFIP)**
• Consultas sobre obligaciones fiscales
• Cálculo de impuestos (IVA, Ganancias, Ingresos Brutos)
• Vencimientos y calendario fiscal
• Régimen de información y facturación electrónica

**📊 Análisis de tus Números**
• Estado de resultados en tiempo real
• Análisis de rentabilidad por producto/servicio
• Flujo de caja y proyecciones
• Comparativas mensuales y tendencias

**💼 Gestión Financiera**
• KPIs personalizados de tu empresa
• Análisis de clientes y proveedores
• Optimización de costos operativos
• Estrategias de crecimiento

**🎯 Preguntas Rápidas**
Puedes preguntarme cosas como:
• "¿Cuánto debo pagar de IVA este mes?"
• "¿Cuál es mi margen de ganancia actual?"
• "¿Qué clientes me generan más ingresos?"
• "¿Cuándo vencen mis obligaciones fiscales?"

¿En qué puedo ayudarte hoy?`,
      },
    ])
    setError(null)
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative lg:translate-x-0 z-50 w-72 bg-white border-r border-gray-200 transition-transform duration-300 h-full flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-sm font-semibold text-gray-900 mb-1">Chat IA</h1>
          <p className="text-xs text-gray-500 mb-3">ARCA 2025 + Análisis</p>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Chat</span>
          </button>
        </div>

        {/* Financial Context Info */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Datos Cargados</div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {companyData ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-700 font-medium">{companyData.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">{companyData.industry}</div>
                </>
              ) : (
                <div className="text-xs text-gray-500">Sin empresa configurada</div>
              )}
              
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-600">Facturas:</span>
                <span className="text-xs font-semibold text-gray-900">{invoices.length}</span>
              </div>
              
              {invoices.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Ventas:</span>
                    <span className="text-xs font-semibold text-green-600">
                      {invoices.filter(inv => inv.type === 'income').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Compras:</span>
                    <span className="text-xs font-semibold text-red-600">
                      {invoices.filter(inv => inv.type === 'expense').length}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Questions about Numbers */}
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2">
              💡 Preguntas Rápidas
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleSuggestedQuestion("¿Cuál es mi margen de ganancia actual?")}
                className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-700 border border-gray-200"
                disabled={isLoading}
              >
                📊 Margen de ganancia
              </button>
              <button
                onClick={() => handleSuggestedQuestion("¿Cuánto debo pagar de IVA este mes?")}
                className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-700 border border-gray-200"
                disabled={isLoading}
              >
                🏛️ Cálculo de IVA
              </button>
              <button
                onClick={() => handleSuggestedQuestion("¿Qué clientes me generan más ingresos?")}
                className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-700 border border-gray-200"
                disabled={isLoading}
              >
                👥 Top clientes
              </button>
              <button
                onClick={() => handleSuggestedQuestion("Analiza mi flujo de caja del último mes")}
                className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-700 border border-gray-200"
                disabled={isLoading}
              >
                💰 Flujo de caja
              </button>
            </div>
          </div>

          {suggestedQuestions.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-700 mb-2">
                🎯 Análisis Avanzados
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-700 border border-gray-200"
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 rounded-md flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Asistente IA</h2>
                <div className="hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-600">GPT-4 Turbo</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {error && (
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-red-600">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Error</span>
              </div>
            )}
            <Link
              to="/dashboard"
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-2 sm:space-x-3 max-w-full sm:max-w-3xl ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-gray-800'
                      : 'bg-black'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl text-sm sm:text-base ${
                    message.role === 'user'
                      ? 'bg-black text-white'
                      : message.isError
                      ? 'bg-red-50 border border-red-200 text-red-900'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-3xl">
                <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-3 sm:p-4 md:p-6 bg-white">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta sobre tus finanzas..."
                disabled={isLoading}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-lg text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all pr-10 sm:pr-12 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 sm:right-2 p-1.5 sm:p-2 bg-gray-900 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Asistente IA con acceso a tus datos financieros
            </p>
          </form>
        </div>
      </div>

      {/* Botón flotante de Dashboard */}
      <Link
        to="/dashboard"
        className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-30"
        title="Volver al Dashboard"
      >
        <LayoutDashboard className="w-6 h-6" />
      </Link>
    </div>
  )
}

export default Chat
