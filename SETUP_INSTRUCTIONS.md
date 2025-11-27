# 🚀 Instrucciones de Configuración - MVP IA Empresas

## ✅ Cambios Implementados

### 1. **WhatsApp Real con QR Code**
- ✅ Integración completa con `whatsapp-web.js`
- ✅ Autenticación mediante código QR real
- ✅ Envío masivo de mensajes automatizado
- ✅ Persistencia de sesión por usuario
- ✅ Estado de conexión en tiempo real

### 2. **Chatbot con OpenAI (No Gemini)**
- ✅ Migrado de Gemini a OpenAI GPT-4
- ✅ Memoria persistente de conversaciones en base de datos
- ✅ Contexto financiero completo
- ✅ Análisis inteligente con datos reales

---

## 📋 Configuración Inicial

### **Paso 1: Variables de Entorno - Frontend**

Crea un archivo `.env` en la raíz del proyecto con:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
VITE_OPENAI_API_KEY=tu_api_key_de_openai
VITE_API_URL=http://localhost:3001/api
```

**Importante:**
- Obtén tu API Key de OpenAI en: https://platform.openai.com/api-keys
- Asegúrate de tener créditos en tu cuenta de OpenAI

### **Paso 2: Variables de Entorno - Backend**

Crea un archivo `.env` en la carpeta `server/` con:

```env
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_KEY=tu_service_role_key_de_supabase

# Mercado Pago (si aplica)
MERCADOPAGO_ACCESS_TOKEN=tu_token_de_mercadopago
MERCADOPAGO_PUBLIC_KEY=tu_public_key_de_mercadopago

# JWT
JWT_SECRET=tu_secret_key_seguro

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
```

### **Paso 3: Crear Tablas en Supabase**

Ejecuta estos scripts SQL en tu proyecto de Supabase (en el SQL Editor):

1. **Tabla de autorización de WhatsApp:**
```sql
-- Ejecutar: create-whatsapp-auth-table.sql
```

2. **Tablas de conversaciones del chat:**
```sql
-- Ejecutar: create-chat-tables.sql
```

3. **Tabla de clientes (si no existe):**
```sql
-- Ejecutar: create-clients-table.sql
```

### **Paso 4: Instalar Dependencias**

#### Frontend:
```bash
npm install
```

#### Backend:
```bash
cd server
npm install
```

---

## 🚀 Iniciar la Aplicación

### **Terminal 1 - Frontend:**
```bash
npm run dev
```
La app estará en: http://localhost:5173

### **Terminal 2 - Backend:**
```bash
cd server
npm run dev
```
El servidor estará en: http://localhost:3001

---

## 📱 Cómo Usar WhatsApp

1. **Ve a la página de Mensajería**
2. **Haz clic en "Autorizar WhatsApp"**
3. **Se generará un código QR real**
4. **Escanea el QR con WhatsApp:**
   - Abre WhatsApp en tu teléfono
   - Ve a **Configuración → Dispositivos vinculados**
   - Toca **"Vincular un dispositivo"**
   - Escanea el código QR
5. **¡Listo!** Ahora puedes enviar mensajes masivos reales

### Características:
- ✅ Sesión persistente (no necesitas escanear cada vez)
- ✅ Envío automático con delay entre mensajes
- ✅ Formato de número argentino automático (+54)
- ✅ Mensajes personalizados por cliente

---

## 💬 Cómo Usar el Chatbot

1. **El chatbot flotante aparece en todas las páginas**
2. **Usa OpenAI GPT-4** (no Gemini)
3. **Tiene memoria persistente:**
   - Todas las conversaciones se guardan en la base de datos
   - Mantiene el contexto de la conversación
   - Recuerda información de sesiones anteriores

### Características:
- ✅ Análisis financiero inteligente
- ✅ Contexto completo de tu empresa
- ✅ Respuestas basadas en tus datos reales
- ✅ Memoria de conversaciones

---

## 🔧 Solución de Problemas

### **WhatsApp no conecta:**
- Verifica que el servidor backend esté corriendo
- Revisa que no haya firewall bloqueando
- Asegúrate de tener buena conexión a internet
- Si falla, cierra el modal y vuelve a intentar

### **Chatbot no responde:**
- Verifica que `VITE_OPENAI_API_KEY` esté configurada
- Revisa que tengas créditos en OpenAI
- Abre la consola del navegador para ver errores
- Verifica que las tablas de chat existan en Supabase

### **Mensajes no se envían:**
- Verifica que WhatsApp esté conectado (icono verde)
- Asegúrate de que los clientes tengan teléfono configurado
- Revisa que el formato del número sea correcto

---

## 📊 Estructura de Tablas Nuevas

### `chat_conversations`
- Almacena conversaciones del chatbot
- Una conversación por sesión de chat
- Título generado del primer mensaje

### `chat_messages`
- Mensajes individuales (user/assistant)
- Vinculados a una conversación
- Timestamp para orden cronológico

### `whatsapp_authorization`
- Estado de autorización de WhatsApp
- Datos de sesión por usuario
- QR code temporal

---

## 🎯 Próximos Pasos

1. **Configura tus variables de entorno**
2. **Ejecuta los scripts SQL en Supabase**
3. **Inicia frontend y backend**
4. **Autoriza WhatsApp escaneando el QR**
5. **¡Empieza a usar la plataforma!**

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de la consola (F12 en el navegador)
2. Revisa los logs del servidor backend
3. Verifica que todas las variables de entorno estén configuradas
4. Asegúrate de que las tablas de Supabase existan

---

## 🔐 Seguridad

- ✅ Nunca compartas tu `.env` en Git
- ✅ Usa variables de entorno para todas las claves
- ✅ Las sesiones de WhatsApp son privadas por usuario
- ✅ Row Level Security (RLS) activado en todas las tablas

---

¡Todo listo para usar! 🎉
