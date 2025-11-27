import React, { useState, useEffect } from 'react'
import { Send, Users, Clock, CheckCircle, Phone, DollarSign, Copy, Check, Search, Settings, Shield, Edit2, Trash2, Plus, AlertCircle, QrCode, X } from 'lucide-react'
import { useData } from '../context/DataContext'
import { supabase } from '../lib/supabase'
import Toast from '../components/Toast'

const Messaging = () => {
  const { invoices } = useData()
  const [clients, setClients] = useState([])
  const [selectedClients, setSelectedClients] = useState([])
  const [message, setMessage] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyCBU, setCompanyCBU] = useState('')
  const [companyAlias, setCompanyAlias] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sentMessages, setSentMessages] = useState([])
  const [copiedField, setCopiedField] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState('send')
  const [whatsappAuthorized, setWhatsappAuthorized] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [showClientModal, setShowClientModal] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [whatsappStatus, setWhatsappStatus] = useState('not_initialized')
  const [isInitializing, setIsInitializing] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [backendAvailable, setBackendAvailable] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadClients()
    loadSentMessages()
    loadCompanySettings()
    checkWhatsAppAuth()
  }, [invoices])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  const showError = (message) => showToast(message, 'error')
  const showSuccess = (message) => showToast(message, 'success')
  const showWarning = (message) => showToast(message, 'warning')

  const checkWhatsAppAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('http://localhost:3001/api/whatsapp/status', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        console.log('⚠️ Backend no disponible, usando modo offline')
        setBackendAvailable(false)
        setWhatsappAuthorized(false)
        return
      }

      const data = await response.json()
      setWhatsappAuthorized(data.connected || false)
      setWhatsappStatus(data.status || 'not_initialized')
      setBackendAvailable(true)
    } catch (error) {
      console.error('Error checking WhatsApp auth:', error)
      setBackendAvailable(false)
      setWhatsappAuthorized(false)
    }
  }

  const authorizeWhatsApp = async () => {
    try {
      setIsInitializing(true)
      setQrCode(null)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        showError('Sesión no válida. Por favor, inicia sesión nuevamente.')
        setIsInitializing(false)
        return
      }

      // Initialize WhatsApp client
      const response = await fetch('http://localhost:3001/api/whatsapp/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('El servidor backend no está disponible. Inicia el servidor con: cd server && npm run dev')
      }

      const data = await response.json()
      
      if (data.success) {
        showSuccess('Inicializando WhatsApp...')
        // Start polling for QR code
        pollForQRCode(session.access_token)
      } else {
        showError('Error al inicializar WhatsApp: ' + data.error)
        setIsInitializing(false)
      }
    } catch (error) {
      console.error('Error:', error)
      showError(error.message || 'Error al autorizar WhatsApp. Verifica que el servidor backend esté corriendo.')
      setIsInitializing(false)
    }
  }

  const pollForQRCode = async (token) => {
    let attempts = 0
    const maxAttempts = 60 // 60 seconds

    const poll = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/whatsapp/qr', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()
        
        if (data.qrCode) {
          setQrCode(data.qrCode)
          setWhatsappStatus(data.status)
          setIsInitializing(false)
        }

        if (data.status === 'connected') {
          clearInterval(poll)
          setWhatsappAuthorized(true)
          setShowAuthModal(false)
          setQrCode(null)
          alert('✅ WhatsApp conectado correctamente')
        }

        if (data.status === 'auth_failed' || data.status === 'error') {
          clearInterval(poll)
          setIsInitializing(false)
          alert('❌ Error en la autenticación de WhatsApp')
        }

        attempts++
        if (attempts >= maxAttempts) {
          clearInterval(poll)
          setIsInitializing(false)
          alert('⏱️ Tiempo de espera agotado. Intenta de nuevo.')
        }
      } catch (error) {
        console.error('Error polling QR:', error)
      }
    }, 1000)
  }

  const loadCompanySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('profiles')
        .select('company_phone, company_cbu, company_alias')
        .eq('id', user.id)
        .single()

      if (data) {
        setCompanyPhone(data.company_phone || '')
        setCompanyCBU(data.company_cbu || '')
        setCompanyAlias(data.company_alias || '')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const saveCompanySettings = async () => {
    try {
      console.log('💾 Guardando configuración...', { companyPhone, companyCBU, companyAlias })
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Usuario no autenticado')

      console.log('👤 Usuario:', user.id)

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          company_phone: companyPhone, 
          company_cbu: companyCBU, 
          company_alias: companyAlias 
        })
        .eq('id', user.id)
        .select()

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw error
      }

      console.log('✅ Datos guardados:', data)
      showSuccess('Configuración guardada correctamente')
      setShowSettings(false)
      
      // Recargar para confirmar
      await loadCompanySettings()
    } catch (error) {
      console.error('❌ Error completo:', error)
      showError(`Error al guardar: ${error.message}`)
    }
  }

  const loadClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('debt', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
      // Si falla, usar el método antiguo como fallback
      loadClientsFromInvoices()
    }
  }

  const loadClientsFromInvoices = () => {
    if (!invoices || invoices.length === 0) return

    const clientMap = {}
    
    invoices.forEach(invoice => {
      const clientName = invoice.metadata?.cliente || invoice.metadata?.proveedor || 'Cliente Desconocido'
      const clientPhone = invoice.metadata?.telefono || ''
      const amount = parseFloat(invoice.amount) || 0

      if (!clientMap[clientName]) {
        clientMap[clientName] = { name: clientName, phone: clientPhone, debt: 0 }
      }

      // Las ventas (income) generan deuda si el cliente no pagó
      // Los pagos (income con metadata.isPago) reducen la deuda
      if (invoice.type === 'income' && invoice.metadata?.movementType === 'venta') {
        clientMap[clientName].debt += amount
      } else if (invoice.type === 'income' && invoice.metadata?.isPago) {
        clientMap[clientName].debt -= amount
      }
    })

    const clientsList = Object.values(clientMap)
      .filter(d => d.debt > 0)
      .map((d, i) => ({ ...d, id: i + 1 }))

    console.log('📋 Clientes con deuda:', clientsList)
    setClients(clientsList)
  }

  const saveClient = async (clientData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (editingClient) {
        // Actualizar cliente existente
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', editingClient.id)
          .eq('user_id', user.id)

        if (error) throw error
        alert('✅ Cliente actualizado')
      } else {
        // Crear nuevo cliente
        const { error } = await supabase
          .from('clients')
          .insert([{ ...clientData, user_id: user.id }])

        if (error) throw error
        alert('✅ Cliente creado')
      }

      setShowClientModal(false)
      setEditingClient(null)
      loadClients()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al guardar cliente')
    }
  }

  const deleteClient = async (clientId) => {
    if (!confirm('¿Eliminar este cliente?')) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('clients')
        .update({ is_active: false })
        .eq('id', clientId)
        .eq('user_id', user.id)

      if (error) throw error
      alert('✅ Cliente eliminado')
      loadClients()
    } catch (error) {
      alert('❌ Error al eliminar')
    }
  }

  const loadSentMessages = () => {
    const history = JSON.parse(localStorage.getItem('sentMessages') || '[]')
    setSentMessages(history)
  }

  const generateDebtMessage = (client) => {
    return `Hola *${client.name}*! 👋

Te escribimos para recordarte que tienes una deuda pendiente de *$${client.debt.toLocaleString('es-AR')}*.

📋 *Datos para realizar el pago:*
${companyAlias ? `• Alias: *${companyAlias}*` : ''}
${companyCBU ? `• CBU: *${companyCBU}*` : ''}
${companyPhone ? `• Consultas: ${companyPhone}` : ''}

Una vez realizado el pago, envíanos el comprobante para actualizar tu cuenta.

¡Gracias! 🙏`
  }

  const handleSendMessages = async () => {
    if (!whatsappAuthorized) {
      setShowAuthModal(true)
      return
    }

    if (selectedClients.length === 0) {
      showWarning('Selecciona al menos un cliente')
      return
    }

    const clientsWithoutPhone = selectedClients.filter(id => {
      const client = clients.find(c => c.id === id)
      return !client.phone
    })

    if (clientsWithoutPhone.length > 0) {
      showWarning('Algunos clientes no tienen teléfono configurado')
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        showError('Sesión no válida')
        return
      }

      const messages = selectedClients.map(id => {
        const client = clients.find(c => c.id === id)
        const personalizedMessage = message || generateDebtMessage(client)
        
        return {
          phoneNumber: client.phone,
          message: personalizedMessage,
          clientName: client.name
        }
      })

      showSuccess(`Enviando ${messages.length} mensajes...`)

      // Send via backend API
      const response = await fetch('http://localhost:3001/api/whatsapp/send-bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      })

      const result = await response.json()

      if (result.success) {
        const newRecord = {
          id: Date.now(),
          date: new Date().toISOString(),
          recipients: result.sent,
          messages: messages.map(m => ({ debtor: m.clientName }))
        }

        const history = JSON.parse(localStorage.getItem('sentMessages') || '[]')
        history.unshift(newRecord)
        localStorage.setItem('sentMessages', JSON.stringify(history))
        setSentMessages(history)

        showSuccess(` ${result.sent} mensajes enviados correctamente`)
        setSelectedClients([])
        setMessage('')
      } else {
        showError('Error al enviar mensajes: ' + result.error)
      }
    } catch (error) {
      console.error('Error sending messages:', error)
      showError('Error al enviar mensajes. Verifica que el backend esté corriendo.')
    }
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  )

  const debtors = filteredClients.filter(c => c.debt > 0)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Centro de Mensajería</h1>
            <p className="text-blue-100">Gestiona comunicaciones con tus clientes y deudores</p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {showSettings && (
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-lg mb-3">Configuración de Empresa</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono WhatsApp</label>
                <input
                  type="tel"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="+54 9 11 1234-5678"
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alias</label>
                <input
                  type="text"
                  value={companyAlias}
                  onChange={(e) => setCompanyAlias(e.target.value)}
                  placeholder="mi.empresa.alias"
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CBU</label>
                <input
                  type="text"
                  value={companyCBU}
                  onChange={(e) => setCompanyCBU(e.target.value)}
                  placeholder="0000000000000000000000"
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60"
                />
              </div>
            </div>
            <button
              onClick={saveCompanySettings}
              className="w-full bg-white text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50"
            >
              Guardar Configuración
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold">{debtors.length}</span>
          </div>
          <p className="text-sm text-gray-600">Deudores Activos</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-red-600" />
            <span className="text-2xl font-bold">
              ${debtors.reduce((sum, d) => sum + d.debt, 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className="text-sm text-gray-600">Deuda Total</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold">{sentMessages.length}</span>
          </div>
          <p className="text-sm text-gray-600">Mensajes Enviados</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="border-b border-gray-200 flex">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-4 px-6 font-medium ${activeTab === 'send' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              Enviar Mensajes
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 px-6 font-medium ${activeTab === 'history' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              Historial
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'send' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Deudores</h3>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedClients.length === debtors.length && debtors.length > 0}
                      onChange={() => {
                        if (selectedClients.length === debtors.length) {
                          setSelectedClients([])
                        } else {
                          setSelectedClients(debtors.map(d => d.id))
                        }
                      }}
                      className="w-4 h-4 text-blue-500 rounded"
                    />
                    <span className="text-sm font-medium">Seleccionar todos ({debtors.length})</span>
                  </label>
                  <span className="text-sm text-gray-600">{selectedClients.length} seleccionados</span>
                </div>

                <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  {debtors.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No hay deudores</p>
                    </div>
                  ) : (
                    debtors.map((debtor) => (
                      <label
                        key={debtor.id}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(debtor.id)}
                          onChange={() => {
                            setSelectedClients(prev =>
                              prev.includes(debtor.id) ? prev.filter(d => d !== debtor.id) : [...prev, debtor.id]
                            )
                          }}
                          className="w-4 h-4 text-blue-500 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{debtor.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {debtor.phone || 'Sin teléfono'}
                            </span>
                            <span className="flex items-center gap-1 text-red-600 font-semibold">
                              <DollarSign className="w-3 h-3" />
                              ${debtor.debt.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            setEditingClient(debtor)
                            setShowClientModal(true)
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Mensaje</h3>
                  {!whatsappAuthorized && (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200"
                    >
                      <Shield className="w-4 h-4" />
                      Autorizar WhatsApp
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (selectedClients.length > 0) {
                      const debtor = debtors.find(d => d.id === selectedClients[0])
                      setMessage(generateDebtMessage(debtor))
                    }
                  }}
                  disabled={selectedClients.length === 0}
                  className="w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 font-medium"
                >
                  Generar Mensaje Automático
                </button>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="El mensaje se generará automáticamente..."
                  rows={14}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                />

                {(companyAlias || companyCBU) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-blue-900">Datos Configurados:</p>
                    {companyAlias && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Alias: <strong>{companyAlias}</strong></span>
                        <button
                          onClick={() => copyToClipboard(companyAlias, 'alias')}
                          className="p-1 hover:bg-blue-100 rounded"
                        >
                          {copiedField === 'alias' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-blue-600" />}
                        </button>
                      </div>
                    )}
                    {companyCBU && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">CBU: <strong>{companyCBU}</strong></span>
                        <button
                          onClick={() => copyToClipboard(companyCBU, 'cbu')}
                          className="p-1 hover:bg-blue-100 rounded"
                        >
                          {copiedField === 'cbu' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-blue-600" />}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleSendMessages}
                  disabled={selectedClients.length === 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:shadow-lg disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Enviar a {selectedClients.length} destinatarios
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Historial</h3>
              {sentMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No hay mensajes enviados</p>
                </div>
              ) : (
                sentMessages.map((record) => (
                  <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium">{record.recipients} mensajes</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {record.messages?.map((msg, i) => (
                        <div key={i} className="py-1">• {msg.debtor}</div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Autorización WhatsApp */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Autorizar WhatsApp</h3>
              <button onClick={() => setShowAuthModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Autorización Requerida</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Para enviar mensajes de WhatsApp, necesitas autorizar tu número de teléfono.
                    </p>
                  </div>
                </div>
              </div>
              
              {isInitializing && !qrCode && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">Inicializando WhatsApp...</p>
                </div>
              )}

              {qrCode && (
                <div className="text-center py-4">
                  <p className="text-sm font-medium text-gray-900 mb-4">
                    Escanea este código QR con WhatsApp
                  </p>
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    1. Abre WhatsApp en tu teléfono<br />
                    2. Ve a Configuración → Dispositivos vinculados<br />
                    3. Toca "Vincular un dispositivo"<br />
                    4. Escanea este código QR
                  </p>
                </div>
              )}

              {!isInitializing && !qrCode && (
                <div className="text-center py-8">
                  <QrCode className="w-24 h-24 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Haz clic en el botón para generar el código QR de WhatsApp
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {!qrCode && (
                  <button
                    onClick={authorizeWhatsApp}
                    disabled={isInitializing}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isInitializing ? 'Inicializando...' : 'Generar Código QR'}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowAuthModal(false)
                    setQrCode(null)
                    setIsInitializing(false)
                  }}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Cliente */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
              <button onClick={() => {
                setShowClientModal(false)
                setEditingClient(null)
              }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              saveClient({
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                debt: parseFloat(formData.get('debt')) || 0
              })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingClient?.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingClient?.phone}
                  placeholder="+54 9 11 1234-5678"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingClient?.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deuda</label>
                <input
                  type="number"
                  name="debt"
                  defaultValue={editingClient?.debt}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowClientModal(false)
                    setEditingClient(null)
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default Messaging