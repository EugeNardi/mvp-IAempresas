import { supabase } from '../lib/supabase'

// ============================================
// SERVICIOS DE BASE DE DATOS
// ============================================

// ============================================
// 1. EMPRESAS (COMPANIES)
// ============================================

/**
 * Obtener la empresa del usuario actual
 */
export const getCompany = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error getting company:', error)
    return { data: null, error }
  }
}

/**
 * Crear o actualizar empresa
 */
export const upsertCompany = async (userId, companyData) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .upsert({
        user_id: userId,
        ...companyData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error upserting company:', error)
    return { data: null, error }
  }
}

/**
 * Eliminar empresa
 */
export const deleteCompany = async (userId) => {
  try {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('user_id', userId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('Error deleting company:', error)
    return { error }
  }
}


// ============================================
// 2. FACTURAS (INVOICES)
// ============================================

/**
 * Obtener todas las facturas del usuario
 */
export const getInvoices = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error getting invoices:', error)
    return { data: [], error }
  }
}

/**
 * Obtener una factura por ID
 */
export const getInvoiceById = async (userId, invoiceId) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .eq('id', invoiceId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error getting invoice:', error)
    return { data: null, error }
  }
}

/**
 * Crear una nueva factura
 */
export const createInvoice = async (userId, invoiceData) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id: userId,
        ...invoiceData
      })
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error creating invoice:', error)
    return { data: null, error }
  }
}

/**
 * Crear múltiples facturas
 */
export const createInvoices = async (userId, invoicesData) => {
  try {
    const invoicesWithUserId = invoicesData.map(invoice => ({
      user_id: userId,
      ...invoice
    }))

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoicesWithUserId)
      .select()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error creating invoices:', error)
    return { data: null, error }
  }
}

/**
 * Actualizar una factura
 */
export const updateInvoice = async (userId, invoiceId, invoiceData) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        ...invoiceData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error updating invoice:', error)
    return { data: null, error }
  }
}

/**
 * Eliminar una factura
 */
export const deleteInvoice = async (userId, invoiceId) => {
  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('user_id', userId)
      .eq('id', invoiceId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return { error }
  }
}

/**
 * Eliminar todas las facturas del usuario
 */
export const deleteAllInvoices = async (userId) => {
  try {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('user_id', userId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('Error deleting all invoices:', error)
    return { error }
  }
}

/**
 * Obtener resumen financiero
 */
export const getFinancialSummary = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('financial_summary')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error getting financial summary:', error)
    return { data: [], error }
  }
}

/**
 * Obtener resumen por categorías
 */
export const getCategorySummary = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('category_summary')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error getting category summary:', error)
    return { data: [], error }
  }
}


// ============================================
// 3. CONVERSACIONES DE CHAT
// ============================================

/**
 * Obtener todas las conversaciones del usuario
 */
export const getChatConversations = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error getting conversations:', error)
    return { data: [], error }
  }
}

/**
 * Crear una nueva conversación
 */
export const createConversation = async (userId, title = 'Nueva conversación') => {
  try {
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        title
      })
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error creating conversation:', error)
    return { data: null, error }
  }
}

/**
 * Actualizar título de conversación
 */
export const updateConversation = async (userId, conversationId, title) => {
  try {
    const { data, error } = await supabase
      .from('chat_conversations')
      .update({
        title,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('id', conversationId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error updating conversation:', error)
    return { data: null, error }
  }
}

/**
 * Eliminar una conversación
 */
export const deleteConversation = async (userId, conversationId) => {
  try {
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('user_id', userId)
      .eq('id', conversationId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return { error }
  }
}


// ============================================
// 4. MENSAJES DE CHAT
// ============================================

/**
 * Obtener mensajes de una conversación
 */
export const getChatMessages = async (userId, conversationId) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error getting messages:', error)
    return { data: [], error }
  }
}

/**
 * Crear un nuevo mensaje
 */
export const createMessage = async (userId, conversationId, role, content) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        role,
        content
      })
      .select()
      .single()

    if (error) throw error

    // Actualizar timestamp de la conversación
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return { data, error: null }
  } catch (error) {
    console.error('Error creating message:', error)
    return { data: null, error }
  }
}

/**
 * Eliminar todos los mensajes de una conversación
 */
export const deleteConversationMessages = async (userId, conversationId) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId)
      .eq('conversation_id', conversationId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('Error deleting messages:', error)
    return { error }
  }
}


// ============================================
// 5. REPORTES GUARDADOS
// ============================================

/**
 * Obtener todos los reportes guardados
 */
export const getSavedReports = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('saved_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error getting saved reports:', error)
    return { data: [], error }
  }
}

/**
 * Guardar un reporte
 */
export const saveReport = async (userId, reportType, title, reportData) => {
  try {
    const { data, error } = await supabase
      .from('saved_reports')
      .insert({
        user_id: userId,
        report_type: reportType,
        title,
        data: reportData
      })
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error saving report:', error)
    return { data: null, error }
  }
}

/**
 * Eliminar un reporte
 */
export const deleteReport = async (userId, reportId) => {
  try {
    const { error } = await supabase
      .from('saved_reports')
      .delete()
      .eq('user_id', userId)
      .eq('id', reportId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('Error deleting report:', error)
    return { error }
  }
}


// ============================================
// 6. CONFIGURACIONES DE USUARIO
// ============================================

/**
 * Obtener configuraciones del usuario
 */
export const getUserSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error getting user settings:', error)
    return { data: null, error }
  }
}

/**
 * Actualizar configuraciones del usuario
 */
export const updateUserSettings = async (userId, settings) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error updating user settings:', error)
    return { data: null, error }
  }
}


// ============================================
// 7. UTILIDADES
// ============================================

/**
 * Verificar si el usuario tiene datos
 */
export const checkUserHasData = async (userId) => {
  try {
    const [companyResult, invoicesResult] = await Promise.all([
      getCompany(userId),
      getInvoices(userId)
    ])

    return {
      hasCompany: !!companyResult.data,
      hasInvoices: (invoicesResult.data?.length || 0) > 0,
      invoiceCount: invoicesResult.data?.length || 0
    }
  } catch (error) {
    console.error('Error checking user data:', error)
    return {
      hasCompany: false,
      hasInvoices: false,
      invoiceCount: 0
    }
  }
}

/**
 * Inicializar datos del usuario (crear empresa por defecto)
 */
export const initializeUserData = async (userId, userEmail) => {
  try {
    // Crear configuraciones por defecto
    await updateUserSettings(userId, {
      theme: 'light',
      language: 'es',
      notifications_enabled: true
    })

    // Crear empresa por defecto
    await upsertCompany(userId, {
      name: 'Mi Empresa',
      country: 'Argentina',
      fiscal_year: new Date().getFullYear()
    })

    return { success: true, error: null }
  } catch (error) {
    console.error('Error initializing user data:', error)
    return { success: false, error }
  }
}

/**
 * Exportar todos los datos del usuario
 */
export const exportUserData = async (userId) => {
  try {
    const [company, invoices, conversations, reports, settings] = await Promise.all([
      getCompany(userId),
      getInvoices(userId),
      getChatConversations(userId),
      getSavedReports(userId),
      getUserSettings(userId)
    ])

    return {
      company: company.data,
      invoices: invoices.data,
      conversations: conversations.data,
      reports: reports.data,
      settings: settings.data,
      exportDate: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error exporting user data:', error)
    return null
  }
}
