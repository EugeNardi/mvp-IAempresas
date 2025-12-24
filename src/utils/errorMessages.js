/**
 * Utilidad para traducir errores de Supabase y base de datos al español
 */

/**
 * Traduce códigos de error de PostgreSQL/Supabase a mensajes en español
 */
export function translateDatabaseError(error) {
  if (!error) return 'Error desconocido'

  // Errores de Supabase/PostgreSQL por código
  const errorCodeMessages = {
    // Errores de constraint/validación
    '23505': 'Este registro ya existe en la base de datos',
    '23503': 'No se puede eliminar porque hay datos relacionados',
    '23502': 'Falta información obligatoria',
    '23514': 'Los datos no cumplen con las reglas de validación',
    '42703': 'Error en la estructura de la base de datos. Contacta al administrador.',
    '42P01': 'La tabla no existe. Ejecuta el script de configuración.',
    
    // Errores de autenticación
    'PGRST301': 'No tienes permisos para realizar esta acción',
    'PGRST204': 'No se encontró el registro',
    'PGRST116': 'Múltiples registros encontrados cuando se esperaba uno solo',
    
    // Errores de red/conexión
    'ECONNREFUSED': 'No se puede conectar a la base de datos',
    'ETIMEDOUT': 'La conexión tardó demasiado tiempo',
    'ENOTFOUND': 'No se pudo encontrar el servidor',
  }

  // Si hay un código de error, buscar traducción
  if (error.code && errorCodeMessages[error.code]) {
    return errorCodeMessages[error.code]
  }

  // Traducir mensajes comunes en inglés
  const message = error.message || error.toString()
  
  // Patrones de mensajes comunes
  const patterns = [
    { regex: /invalid.*type/i, message: 'Tipo de dato inválido' },
    { regex: /not.*null/i, message: 'Falta información obligatoria' },
    { regex: /unique.*constraint/i, message: 'Este registro ya existe' },
    { regex: /foreign.*key/i, message: 'Referencia inválida a otro registro' },
    { regex: /duplicate.*key/i, message: 'Ya existe un registro con estos datos' },
    { regex: /permission.*denied/i, message: 'No tienes permisos para esta acción' },
    { regex: /relation.*does.*not.*exist/i, message: 'La tabla no existe en la base de datos' },
    { regex: /column.*does.*not.*exist/i, message: 'Error en la estructura de datos' },
    { regex: /invalid.*input.*syntax/i, message: 'Formato de datos incorrecto' },
    { regex: /value.*too.*long/i, message: 'El texto es demasiado largo' },
    { regex: /numeric.*out.*of.*range/i, message: 'El número es demasiado grande' },
    { regex: /division.*by.*zero/i, message: 'Error matemático: división por cero' },
    { regex: /invalid.*refresh.*token/i, message: 'Tu sesión expiró. Por favor, inicia sesión nuevamente.' },
    { regex: /refresh.*token.*not.*found/i, message: 'Tu sesión expiró. Por favor, inicia sesión nuevamente.' },
    { regex: /network.*error/i, message: 'Error de conexión. Verifica tu internet.' },
    { regex: /timeout/i, message: 'La operación tardó demasiado. Intenta de nuevo.' },
    { regex: /has.*no.*field/i, message: 'Error en la estructura de la base de datos. Ejecuta el script de corrección.' },
  ]

  // Buscar patrón coincidente
  for (const pattern of patterns) {
    if (pattern.regex.test(message)) {
      return pattern.message
    }
  }

  // Si no se encuentra traducción, devolver mensaje original limpio
  return message.replace(/^Error:\s*/i, '')
}

/**
 * Crea un mensaje de error amigable para el usuario
 */
export function createUserFriendlyError(error, context = '') {
  const translatedMessage = translateDatabaseError(error)
  
  // Agregar contexto si existe
  if (context) {
    return `${context}: ${translatedMessage}`
  }
  
  return translatedMessage
}

/**
 * Mensajes de error específicos para operaciones comunes
 */
export const ERROR_MESSAGES = {
  // Facturas
  INVOICE_SAVE_FAILED: 'No se pudo guardar la factura',
  INVOICE_DELETE_FAILED: 'No se pudo eliminar la factura',
  INVOICE_UPDATE_FAILED: 'No se pudo actualizar la factura',
  INVOICE_LOAD_FAILED: 'No se pudieron cargar las facturas',
  
  // Productos
  PRODUCT_SAVE_FAILED: 'No se pudo guardar el producto',
  PRODUCT_DELETE_FAILED: 'No se pudo eliminar el producto',
  PRODUCT_UPDATE_FAILED: 'No se pudo actualizar el producto',
  PRODUCT_LOAD_FAILED: 'No se pudieron cargar los productos',
  PRODUCT_STOCK_UPDATE_FAILED: 'No se pudo actualizar el stock',
  
  // Empresa
  COMPANY_SAVE_FAILED: 'No se pudo guardar la información de la empresa',
  COMPANY_LOAD_FAILED: 'No se pudo cargar la información de la empresa',
  
  // Autenticación
  AUTH_FAILED: 'Error de autenticación',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  
  // General
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados',
}

/**
 * Registra el error en consola con formato
 */
export function logError(error, context = '') {
  const timestamp = new Date().toISOString()
  console.error(`[${timestamp}] ${context}:`, error)
  
  if (error.code) {
    console.error(`Código de error: ${error.code}`)
  }
  
  if (error.details) {
    console.error('Detalles:', error.details)
  }
  
  if (error.hint) {
    console.error('Sugerencia:', error.hint)
  }
}
