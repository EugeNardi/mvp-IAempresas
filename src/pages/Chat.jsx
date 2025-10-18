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
      content: `👋 ¡Hola! Soy tu **CFO Virtual** potenciado por GPT-4 Turbo.

Puedo ayudarte con análisis financiero avanzado:

📊 **Estados Financieros Completos**
- Balance General con ratios
- Estado de Resultados detallado
- Flujo de Caja proyectado

📈 **Proyecciones e Inversiones**
- Escenarios a 3, 6 y 12 meses
- Análisis de ROI y TIR
- Valoración de empresa

💼 **KPIs y Ratios**
- Liquidez, Rentabilidad, Solvencia
- Análisis de tendencias
- Benchmarking

🎯 **Recomendaciones Estratégicas**
- Optimización de costos
- Oportunidades de crecimiento
- Gestión de riesgos

¿Qué análisis te gustaría que realice?`,
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
        content: `👋 ¡Hola! Soy tu **CFO Virtual** potenciado por GPT-4 Turbo.

Puedo ayudarte con análisis financiero avanzado:

📊 **Estados Financieros Completos**
- Balance General con ratios
- Estado de Resultados detallado
- Flujo de Caja proyectado

📈 **Proyecciones e Inversiones**
- Escenarios a 3, 6 y 12 meses
- Análisis de ROI y TIR
- Valoración de empresa

💼 **KPIs y Ratios**
- Liquidez, Rentabilidad, Solvencia
- Análisis de tendencias
- Benchmarking

🎯 **Recomendaciones Estratégicas**
- Optimización de costos
- Oportunidades de crecimiento
- Gestión de riesgos

¿Qué análisis te gustaría que realice?`,
      },
    ])
    setError(null)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-300 overflow-hidden flex flex-col shadow-2xl`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200/50">
          <h1 className="text-lg font-semibold text-gray-900 text-center mb-4">Chat IA</h1>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white px-4 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
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

          {suggestedQuestions.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Análisis Avanzados
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all text-xs text-gray-700 border border-gray-200 hover:border-gray-300 shadow-sm"
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
        <div className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Chat IA</h2>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Error de conexión</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GPT-4 Turbo
              </span>
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
        <div className="border-t border-gray-200 p-6 bg-white">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                className="w-full px-6 py-4 bg-white border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all pr-14 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-3 bg-black rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Este es un asistente de demostración. Las respuestas son simuladas.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chat
