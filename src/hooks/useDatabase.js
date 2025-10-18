import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import * as db from '../services/database'

/**
 * Hook personalizado para manejar datos de la base de datos
 * Sincroniza automáticamente los datos con Supabase
 */
export const useDatabase = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados de datos
  const [company, setCompany] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [conversations, setConversations] = useState([])
  const [settings, setSettings] = useState(null)

  /**
   * Cargar todos los datos del usuario
   */
  const loadUserData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [companyResult, invoicesResult, conversationsResult, settingsResult] = await Promise.all([
        db.getCompany(user.id),
        db.getInvoices(user.id),
        db.getChatConversations(user.id),
        db.getUserSettings(user.id)
      ])

      if (companyResult.error) throw companyResult.error
      if (invoicesResult.error) throw invoicesResult.error
      if (conversationsResult.error) throw conversationsResult.error

      setCompany(companyResult.data)
      setInvoices(invoicesResult.data)
      setConversations(conversationsResult.data)
      setSettings(settingsResult.data)

      // Si no tiene empresa, inicializar datos
      if (!companyResult.data) {
        await db.initializeUserData(user.id, user.email)
        // Recargar empresa
        const newCompany = await db.getCompany(user.id)
        setCompany(newCompany.data)
      }

    } catch (err) {
      console.error('Error loading user data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Cargar datos cuando el usuario cambia
  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  /**
   * Refrescar datos
   */
  const refresh = useCallback(async () => {
    await loadUserData()
  }, [loadUserData])

  return {
    // Estados
    loading,
    error,
    company,
    invoices,
    conversations,
    settings,
    
    // Funciones
    refresh,
    
    // Setters directos (para actualizaciones optimistas)
    setCompany,
    setInvoices,
    setConversations,
    setSettings
  }
}

/**
 * Hook para manejar la empresa
 */
export const useCompany = () => {
  const { user } = useAuth()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadCompany()
    }
  }, [user])

  const loadCompany = async () => {
    if (!user?.id) return

    setLoading(true)
    const { data } = await db.getCompany(user.id)
    setCompany(data)
    setLoading(false)
  }

  const saveCompany = async (companyData) => {
    if (!user?.id) return { success: false, error: 'No user' }

    setSaving(true)
    const { data, error } = await db.upsertCompany(user.id, companyData)
    
    if (!error) {
      setCompany(data)
    }
    
    setSaving(false)
    return { success: !error, error, data }
  }

  return {
    company,
    loading,
    saving,
    saveCompany,
    refresh: loadCompany
  }
}

/**
 * Hook para manejar facturas
 */
export const useInvoices = () => {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadInvoices()
    }
  }, [user])

  const loadInvoices = async () => {
    if (!user?.id) return

    setLoading(true)
    const { data } = await db.getInvoices(user.id)
    setInvoices(data)
    setLoading(false)
  }

  const addInvoice = async (invoiceData) => {
    if (!user?.id) return { success: false, error: 'No user' }

    setSaving(true)
    const { data, error } = await db.createInvoice(user.id, invoiceData)
    
    if (!error) {
      setInvoices(prev => [data, ...prev])
    }
    
    setSaving(false)
    return { success: !error, error, data }
  }

  const addInvoices = async (invoicesData) => {
    if (!user?.id) return { success: false, error: 'No user' }

    setSaving(true)
    const { data, error } = await db.createInvoices(user.id, invoicesData)
    
    if (!error) {
      setInvoices(prev => [...data, ...prev])
    }
    
    setSaving(false)
    return { success: !error, error, data }
  }

  const updateInvoice = async (invoiceId, invoiceData) => {
    if (!user?.id) return { success: false, error: 'No user' }

    setSaving(true)
    const { data, error } = await db.updateInvoice(user.id, invoiceId, invoiceData)
    
    if (!error) {
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? data : inv))
    }
    
    setSaving(false)
    return { success: !error, error, data }
  }

  const removeInvoice = async (invoiceId) => {
    if (!user?.id) return { success: false, error: 'No user' }

    setSaving(true)
    const { error } = await db.deleteInvoice(user.id, invoiceId)
    
    if (!error) {
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId))
    }
    
    setSaving(false)
    return { success: !error, error }
  }

  const clearInvoices = async () => {
    if (!user?.id) return { success: false, error: 'No user' }

    setSaving(true)
    const { error } = await db.deleteAllInvoices(user.id)
    
    if (!error) {
      setInvoices([])
    }
    
    setSaving(false)
    return { success: !error, error }
  }

  return {
    invoices,
    loading,
    saving,
    addInvoice,
    addInvoices,
    updateInvoice,
    removeInvoice,
    clearInvoices,
    refresh: loadInvoices
  }
}

/**
 * Hook para manejar conversaciones de chat
 */
export const useChatConversations = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    if (!user?.id) return

    setLoading(true)
    const { data } = await db.getChatConversations(user.id)
    setConversations(data)
    setLoading(false)
  }

  const loadMessages = async (conversationId) => {
    if (!user?.id) return

    const { data } = await db.getChatMessages(user.id, conversationId)
    setMessages(data)
  }

  const createConversation = async (title) => {
    if (!user?.id) return { success: false, error: 'No user' }

    const { data, error } = await db.createConversation(user.id, title)
    
    if (!error) {
      setConversations(prev => [data, ...prev])
      setCurrentConversation(data)
      setMessages([])
    }
    
    return { success: !error, error, data }
  }

  const selectConversation = async (conversation) => {
    setCurrentConversation(conversation)
    await loadMessages(conversation.id)
  }

  const addMessage = async (role, content) => {
    if (!user?.id || !currentConversation) return { success: false, error: 'No conversation' }

    const { data, error } = await db.createMessage(user.id, currentConversation.id, role, content)
    
    if (!error) {
      setMessages(prev => [...prev, data])
    }
    
    return { success: !error, error, data }
  }

  const removeConversation = async (conversationId) => {
    if (!user?.id) return { success: false, error: 'No user' }

    const { error } = await db.deleteConversation(user.id, conversationId)
    
    if (!error) {
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null)
        setMessages([])
      }
    }
    
    return { success: !error, error }
  }

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    loadConversations,
    createConversation,
    selectConversation,
    addMessage,
    removeConversation
  }
}

/**
 * Hook para estadísticas financieras
 */
export const useFinancialStats = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    if (!user?.id) return

    setLoading(true)
    
    const [invoices, summary, categories] = await Promise.all([
      db.getInvoices(user.id),
      db.getFinancialSummary(user.id),
      db.getCategorySummary(user.id)
    ])

    // Calcular estadísticas
    const income = invoices.data?.filter(inv => inv.type === 'income') || []
    const expenses = invoices.data?.filter(inv => inv.type === 'expense') || []
    
    const totalIncome = income.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const totalExpenses = expenses.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const profit = totalIncome - totalExpenses
    const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0

    setStats({
      totalIncome,
      totalExpenses,
      profit,
      profitMargin,
      invoiceCount: invoices.data?.length || 0,
      incomeCount: income.length,
      expenseCount: expenses.length,
      monthlySummary: summary.data || [],
      categorySummary: categories.data || []
    })
    
    setLoading(false)
  }

  return {
    stats,
    loading,
    refresh: loadStats
  }
}
