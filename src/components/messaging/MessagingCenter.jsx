import React, { useState, useEffect } from 'react'
import { 
  Send, X, Users, Clock, CheckCircle, AlertCircle, 
  MessageSquare, Filter, Calendar, DollarSign, Package,
  Phone, Mail, Download, Upload, Zap
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const MessagingCenter = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('send') // 'send', 'history', 'automation'
  const [recipients, setRecipients] = useState([])
  const [selectedRecipients, setSelectedRecipients] = useState([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('promotional') // 'promotional', 'reminder', 'notification'
  const [filterType, setFilterType] = useState('all') // 'all', 'debtors', 'customers', 'custom'
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sentMessages, setSentMessages] = useState([])
  const [automations, setAutomations] = useState([])

  // Cargar destinatarios (clientes y deudores)
  useEffect(() => {
    loadRecipients()
    loadSentMessages()
    loadAutomations()
  }, [])

  const loadRecipients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Aquí deberías cargar tus clientes/deudores desde tu base de datos
      // Por ahora usamos datos de ejemplo
      const mockRecipients = [
        { id: 1, name: 'Juan Pérez', phone: '+5491123456789', email: 'juan@example.com', debt: 50000, type: 'debtor' },
        { id: 2, name: 'María García', phone: '+5491198765432', email: 'maria@example.com', debt: 0, type: 'customer' },
        { id: 3, name: 'Carlos López', phone: '+5491156781234', email: 'carlos@example.com', debt: 25000, type: 'debtor' },
      ]
      
      setRecipients(mockRecipients)
    } catch (error) {
      console.error('Error cargando destinatarios:', error)
    }
  }

  const loadSentMessages = async () => {
    // Cargar historial de mensajes enviados
    const mockHistory = [
      {
        id: 1,
        date: new Date().toISOString(),
        recipients: 15,
        message: 'Recordatorio de pago pendiente',
        status: 'sent',
        type: 'reminder'
      }
    ]
    setSentMessages(mockHistory)
  }

  const loadAutomations = async () => {
    // Cargar automatizaciones configuradas
    const mockAutomations = [
      {
        id: 1,
        name: 'Recordatorio de deuda semanal',
        trigger: 'weekly',
        active: true,
        recipients: 'debtors',
        message: 'Hola {name}, te recordamos que tienes una deuda pendiente de ${debt}.'
      }
    ]
    setAutomations(mockAutomations)
  }

  const getFilteredRecipients = () => {
    switch (filterType) {
      case 'debtors':
        return recipients.filter(r => r.debt > 0)
      case 'customers':
        return recipients.filter(r => r.debt === 0)
      case 'custom':
        return recipients.filter(r => selectedRecipients.includes(r.id))
      default:
        return recipients
    }
  }

  const handleSelectAll = () => {
    const filtered = getFilteredRecipients()
    if (selectedRecipients.length === filtered.length) {
      setSelectedRecipients([])
    } else {
      setSelectedRecipients(filtered.map(r => r.id))
    }
  }

  const handleToggleRecipient = (id) => {
    setSelectedRecipients(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const handleSendMessage = async () => {
    if (!message.trim() || selectedRecipients.length === 0) {
      alert('Por favor completa el mensaje y selecciona al menos un destinatario')
      return
    }

    setIsSending(true)
    try {
      // Aquí integrarías con tu servicio de mensajería (WhatsApp API, SMS, etc.)
      // Por ahora simulamos el envío
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newMessage = {
        id: Date.now(),
        date: new Date().toISOString(),
        recipients: selectedRecipients.length,
        message: message,
        status: 'sent',
        type: messageType
      }

      setSentMessages(prev => [newMessage, ...prev])
      setMessage('')
      setSelectedRecipients([])
      alert(`Mensaje enviado exitosamente a ${selectedRecipients.length} destinatarios`)
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      alert('Error al enviar el mensaje')
    } finally {
      setIsSending(false)
    }
  }

  const messageTemplates = {
    promotional: 'Hola {name}! Tenemos una promoción especial para ti. ¡No te la pierdas!',
    reminder: 'Hola {name}, te recordamos que tienes un pago pendiente de ${debt}. Por favor, comunícate con nosotros.',
    notification: 'Hola {name}, te informamos que tu pedido está listo para ser retirado.'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6" />
            <h2 className="text-xl font-bold">Centro de Mensajería</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('send')}
              className={`py-3 px-4 font-medium transition-colors border-b-2 ${
                activeTab === 'send'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Enviar Mensajes
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-4 font-medium transition-colors border-b-2 ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Historial
              </div>
            </button>
            <button
              onClick={() => setActiveTab('automation')}
              className={`py-3 px-4 font-medium transition-colors border-b-2 ${
                activeTab === 'automation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Automatizaciones
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'send' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Message Composer */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Mensaje
                  </label>
                  <select
                    value={messageType}
                    onChange={(e) => {
                      setMessageType(e.target.value)
                      setMessage(messageTemplates[e.target.value])
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="promotional">Promocional</option>
                    <option value="reminder">Recordatorio de Pago</option>
                    <option value="notification">Notificación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe tu mensaje aquí..."
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Variables disponibles: {'{name}'}, {'{debt}'}, {'{phone}'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de WhatsApp de la Empresa
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+54 9 11 1234-5678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !message.trim() || selectedRecipients.length === 0}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar a {selectedRecipients.length} destinatarios
                    </>
                  )}
                </button>
              </div>

              {/* Right: Recipients */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Destinatarios
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-1 text-xs rounded-full ${
                        filterType === 'all'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setFilterType('debtors')}
                      className={`px-3 py-1 text-xs rounded-full ${
                        filterType === 'debtors'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Deudores
                    </button>
                    <button
                      onClick={() => setFilterType('customers')}
                      className={`px-3 py-1 text-xs rounded-full ${
                        filterType === 'customers'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Clientes
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRecipients.length === getFilteredRecipients().length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Seleccionar todos ({getFilteredRecipients().length})
                    </span>
                  </label>
                </div>

                <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  {getFilteredRecipients().map((recipient) => (
                    <label
                      key={recipient.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(recipient.id)}
                        onChange={() => handleToggleRecipient(recipient.id)}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{recipient.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {recipient.phone}
                          </span>
                          {recipient.debt > 0 && (
                            <span className="flex items-center gap-1 text-red-600">
                              <DollarSign className="w-3 h-3" />
                              ${recipient.debt.toLocaleString('es-AR')}
                            </span>
                          )}
                        </div>
                      </div>
                      {recipient.type === 'debtor' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Deudor
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Mensajes Enviados</h3>
              <div className="space-y-3">
                {sentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-gray-900">
                            {msg.type === 'reminder' ? 'Recordatorio' : msg.type === 'promotional' ? 'Promocional' : 'Notificación'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(msg.date).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{msg.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {msg.recipients} destinatarios
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Automatizaciones</h3>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                  + Nueva Automatización
                </button>
              </div>
              <div className="space-y-3">
                {automations.map((auto) => (
                  <div
                    key={auto.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-5 h-5 text-blue-500" />
                          <span className="font-medium text-gray-900">{auto.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            auto.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {auto.active ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{auto.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {auto.trigger === 'weekly' ? 'Semanal' : auto.trigger === 'monthly' ? 'Mensual' : 'Diario'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {auto.recipients === 'debtors' ? 'Deudores' : 'Todos'}
                          </span>
                        </div>
                      </div>
                      <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessagingCenter
