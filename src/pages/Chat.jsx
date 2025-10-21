import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useNavigate, Link } from 'react-router-dom'
import { Send, Sparkles, Menu, LogOut, User, Plus, MessageSquare, Loader2, LayoutDashboard, FileText, AlertCircle } from 'lucide-react'
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
  const [sidebarOpen, setSidebarOpen] = useState(true)
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-sm font-semibold text-gray-900 mb-1">Inteligencia Financiera</h1>
          <p className="text-xs text-gray-500 mb-3">ARCA 2025 + Análisis Empresarial</p>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Conversación</span>
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
              💡 Preguntas sobre tus Números
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleSuggestedQuestion("¿Cuál es mi margen de ganancia actual?")}
                className="w-full text-left px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-700 border border-gray-200"
                disabled={isLoading}
              >
                📊 Margen de ganancia
              </button>
              <button
                onClick={() => handleSuggestedQuestion("¿Cuánto debo pagar de IVA este mes?")}
                className="w-full text-left px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-700 border border-gray-200"
                disabled={isLoading}
              >
                🏛️ Cálculo de IVA
              </button>
              <button
                onClick={() => handleSuggestedQuestion("¿Qué clientes me generan más ingresos?")}
                className="w-full text-left px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-700 border border-gray-200"
                disabled={isLoading}
              >
                👥 Top clientes
              </button>
              <button
                onClick={() => handleSuggestedQuestion("Analiza mi flujo de caja del último mes")}
                className="w-full text-left px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-700 border border-gray-200"
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
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-700 border border-gray-200"
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
        <div className="p-6 border-t border-gray-200/50">
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-medium text-gray-500 truncate">{user?.email}</p>
          </div>
          <Link
            to="/dashboard"
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all mb-2 group"
          >
            <LayoutDashboard className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all group"
          >
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
            <span className="font-medium">Salir</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Asistente IA</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Error</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm px-3 py-1 bg-gray-50 rounded-md border border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-700">GPT-4 Turbo</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-3 max-w-3xl ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
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
                  className={`px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-black text-white'
                      : message.isError
                      ? 'bg-red-50 border border-red-200 text-red-900'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta sobre tus finanzas..."
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all pr-12 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-gray-900 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Asistente IA con acceso a tus datos financieros
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chat
