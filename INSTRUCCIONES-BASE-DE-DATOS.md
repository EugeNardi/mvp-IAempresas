# 📚 Instrucciones para Configurar la Base de Datos

## 🎯 Objetivo
Configurar la base de datos en Supabase para que cada usuario tenga sus propios datos persistentes y seguros.

---

## 📋 Paso 1: Acceder al SQL Editor de Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
3. Haz clic en **"New Query"** para crear una nueva consulta

---

## 📋 Paso 2: Ejecutar el Script de Creación de Tablas

1. Abre el archivo `supabase-schema.sql` que se encuentra en la raíz del proyecto
2. **Copia TODO el contenido** del archivo
3. **Pega** el contenido en el SQL Editor de Supabase
4. Haz clic en el botón **"Run"** (▶️) en la esquina inferior derecha
5. Espera a que se ejecute (puede tardar unos segundos)
6. Deberías ver un mensaje de éxito ✅

---

## 📋 Paso 3: Verificar que las Tablas se Crearon Correctamente

### Opción A: Usar el Table Editor
1. Ve a **"Table Editor"** en el menú lateral
2. Deberías ver las siguientes tablas:
   - ✅ `companies` - Datos de empresas
   - ✅ `invoices` - Facturas
   - ✅ `chat_conversations` - Conversaciones de chat
   - ✅ `chat_messages` - Mensajes de chat
   - ✅ `saved_reports` - Reportes guardados
   - ✅ `user_settings` - Configuraciones de usuario

### Opción B: Verificar con SQL
Ejecuta esta consulta en el SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

---

## 📋 Paso 4: Verificar las Políticas de Seguridad (RLS)

Ejecuta esta consulta para verificar que las políticas de seguridad están activas:

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Deberías ver políticas para cada tabla que permiten a los usuarios:
- ✅ Ver solo sus propios datos
- ✅ Insertar solo sus propios datos
- ✅ Actualizar solo sus propios datos
- ✅ Eliminar solo sus propios datos

---

## 🔒 ¿Qué es Row Level Security (RLS)?

**RLS** es una característica de seguridad que garantiza que:
- Cada usuario **SOLO puede ver y modificar sus propios datos**
- Los datos están **completamente aislados** entre usuarios
- **No hay forma** de que un usuario acceda a los datos de otro
- Todo esto se maneja **automáticamente** a nivel de base de datos

---

## 📊 Estructura de las Tablas

### 1. **companies** - Datos de la Empresa
```
- id (UUID)
- user_id (UUID) → Referencia al usuario
- name (texto)
- cuit (texto)
- address (texto)
- city (texto)
- province (texto)
- country (texto)
- industry (texto)
- fiscal_year (número)
- created_at (timestamp)
- updated_at (timestamp)
```

### 2. **invoices** - Facturas
```
- id (UUID)
- user_id (UUID) → Referencia al usuario
- company_id (UUID) → Referencia a la empresa
- type (income/expense)
- number (texto)
- date (fecha)
- amount (decimal)
- category (texto)
- description (texto)
- file_url (texto)
- ocr_processed (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### 3. **chat_conversations** - Conversaciones
```
- id (UUID)
- user_id (UUID) → Referencia al usuario
- title (texto)
- created_at (timestamp)
- updated_at (timestamp)
```

### 4. **chat_messages** - Mensajes
```
- id (UUID)
- conversation_id (UUID) → Referencia a la conversación
- user_id (UUID) → Referencia al usuario
- role (user/assistant)
- content (texto)
- created_at (timestamp)
```

### 5. **saved_reports** - Reportes Guardados
```
- id (UUID)
- user_id (UUID) → Referencia al usuario
- company_id (UUID) → Referencia a la empresa
- report_type (texto)
- title (texto)
- data (JSON)
- created_at (timestamp)
- updated_at (timestamp)
```

### 6. **user_settings** - Configuraciones
```
- id (UUID)
- user_id (UUID) → Referencia al usuario
- theme (texto)
- language (texto)
- notifications_enabled (boolean)
- preferences (JSON)
- created_at (timestamp)
- updated_at (timestamp)
```

---

## 🚀 Cómo Usar la Base de Datos en tu Código

### Importar los Servicios

```javascript
import * as db from './services/database'
import { useAuth } from './context/AuthContext'
```

### Ejemplo 1: Guardar Empresa

```javascript
import { useCompany } from './hooks/useDatabase'

function CompanyProfile() {
  const { company, saveCompany, loading } = useCompany()

  const handleSave = async (formData) => {
    const { success, error } = await saveCompany(formData)
    
    if (success) {
      alert('Empresa guardada correctamente!')
    } else {
      alert('Error: ' + error.message)
    }
  }

  return (
    // Tu componente aquí
  )
}
```

### Ejemplo 2: Guardar Facturas

```javascript
import { useInvoices } from './hooks/useDatabase'

function UploadInvoices() {
  const { invoices, addInvoice, addInvoices, loading } = useInvoices()

  const handleAddInvoice = async (invoiceData) => {
    const { success, error } = await addInvoice(invoiceData)
    
    if (success) {
      alert('Factura guardada!')
    }
  }

  const handleAddMultiple = async (invoicesArray) => {
    const { success, error } = await addInvoices(invoicesArray)
    
    if (success) {
      alert(`${invoicesArray.length} facturas guardadas!`)
    }
  }

  return (
    // Tu componente aquí
  )
}
```

### Ejemplo 3: Chat con Persistencia

```javascript
import { useChatConversations } from './hooks/useDatabase'

function Chat() {
  const {
    conversations,
    currentConversation,
    messages,
    createConversation,
    selectConversation,
    addMessage
  } = useChatConversations()

  const handleNewChat = async () => {
    await createConversation('Nueva conversación')
  }

  const handleSendMessage = async (content) => {
    // Guardar mensaje del usuario
    await addMessage('user', content)
    
    // Aquí llamarías a tu API de IA
    const response = await callAI(content)
    
    // Guardar respuesta de la IA
    await addMessage('assistant', response)
  }

  return (
    // Tu componente aquí
  )
}
```

### Ejemplo 4: Usar el Hook Principal

```javascript
import { useDatabase } from './hooks/useDatabase'

function Dashboard() {
  const {
    loading,
    error,
    company,
    invoices,
    conversations,
    refresh
  } = useDatabase()

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>{company?.name}</h1>
      <p>Facturas: {invoices.length}</p>
      <button onClick={refresh}>Refrescar</button>
    </div>
  )
}
```

---

## 🔄 Funciones Disponibles

### Empresas (Companies)
```javascript
import * as db from './services/database'

// Obtener empresa
const { data, error } = await db.getCompany(userId)

// Guardar/actualizar empresa
const { data, error } = await db.upsertCompany(userId, companyData)

// Eliminar empresa
const { error } = await db.deleteCompany(userId)
```

### Facturas (Invoices)
```javascript
// Obtener todas las facturas
const { data, error } = await db.getInvoices(userId)

// Obtener una factura
const { data, error } = await db.getInvoiceById(userId, invoiceId)

// Crear factura
const { data, error } = await db.createInvoice(userId, invoiceData)

// Crear múltiples facturas
const { data, error } = await db.createInvoices(userId, invoicesArray)

// Actualizar factura
const { data, error } = await db.updateInvoice(userId, invoiceId, invoiceData)

// Eliminar factura
const { error } = await db.deleteInvoice(userId, invoiceId)

// Eliminar todas las facturas
const { error } = await db.deleteAllInvoices(userId)

// Obtener resumen financiero
const { data, error } = await db.getFinancialSummary(userId)

// Obtener resumen por categorías
const { data, error } = await db.getCategorySummary(userId)
```

### Conversaciones (Chat)
```javascript
// Obtener conversaciones
const { data, error } = await db.getChatConversations(userId)

// Crear conversación
const { data, error } = await db.createConversation(userId, title)

// Actualizar conversación
const { data, error } = await db.updateConversation(userId, conversationId, title)

// Eliminar conversación
const { error } = await db.deleteConversation(userId, conversationId)

// Obtener mensajes
const { data, error } = await db.getChatMessages(userId, conversationId)

// Crear mensaje
const { data, error } = await db.createMessage(userId, conversationId, role, content)
```

### Reportes
```javascript
// Obtener reportes guardados
const { data, error } = await db.getSavedReports(userId)

// Guardar reporte
const { data, error } = await db.saveReport(userId, reportType, title, reportData)

// Eliminar reporte
const { error } = await db.deleteReport(userId, reportId)
```

### Configuraciones
```javascript
// Obtener configuraciones
const { data, error } = await db.getUserSettings(userId)

// Actualizar configuraciones
const { data, error } = await db.updateUserSettings(userId, settings)
```

### Utilidades
```javascript
// Verificar si el usuario tiene datos
const hasData = await db.checkUserHasData(userId)

// Inicializar datos del usuario
const { success, error } = await db.initializeUserData(userId, userEmail)

// Exportar todos los datos
const userData = await db.exportUserData(userId)
```

---

## ✅ Ventajas de este Sistema

1. **✅ Persistencia Total**: Los datos nunca se pierden al refrescar la página
2. **✅ Seguridad Máxima**: Cada usuario solo ve sus propios datos
3. **✅ Sincronización Automática**: Los datos se guardan automáticamente
4. **✅ Escalable**: Puede manejar millones de usuarios
5. **✅ Tiempo Real**: Cambios instantáneos en todos los dispositivos
6. **✅ Backup Automático**: Supabase hace backups automáticos
7. **✅ Fácil de Usar**: Hooks simples y directos

---

## 🐛 Solución de Problemas

### Problema: "relation does not exist"
**Solución**: Asegúrate de haber ejecutado el script SQL completo en Supabase.

### Problema: "permission denied"
**Solución**: Verifica que las políticas RLS estén activas. Ejecuta:
```sql
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
```

### Problema: "No rows returned"
**Solución**: Es normal si el usuario no tiene datos aún. Los hooks manejan esto automáticamente.

### Problema: Los datos no se guardan
**Solución**: 
1. Verifica que el usuario esté autenticado
2. Revisa la consola del navegador para errores
3. Verifica que `user.id` no sea null

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa los logs de Supabase
3. Verifica que las credenciales en `src/lib/supabase.js` sean correctas

---

## 🎉 ¡Listo!

Ahora tu aplicación tiene:
- ✅ Base de datos completa
- ✅ Datos persistentes
- ✅ Seguridad por usuario
- ✅ Hooks fáciles de usar
- ✅ Sin pérdida de datos al refrescar

**¡Comienza a usar los hooks en tus componentes!** 🚀
