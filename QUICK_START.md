# ⚡ Guía Rápida de Inicio

## 🎯 Lo que se implementó

### ✅ WhatsApp Real
- Ya no es demo, ahora es **WhatsApp real** con código QR
- Envío automático de mensajes masivos
- Sesión persistente por usuario

### ✅ Chatbot con OpenAI
- Migrado de **Gemini a OpenAI GPT-4**
- Memoria persistente de conversaciones
- Análisis financiero inteligente

---

## 🚀 Inicio Rápido (5 minutos)

### 1️⃣ Configurar Variables de Entorno

**Frontend** - Crea `.env` en la raíz:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_OPENAI_API_KEY=sk-tu-api-key-de-openai
VITE_API_URL=http://localhost:3001/api
```

**Backend** - Crea `server/.env`:
```env
PORT=3001
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key
FRONTEND_URL=http://localhost:5173
```

### 2️⃣ Crear Tablas en Supabase

Ve al **SQL Editor** de Supabase y ejecuta:

```sql
-- 1. Tabla de WhatsApp
-- Copia y pega el contenido de: create-whatsapp-auth-table.sql

-- 2. Tablas de Chat
-- Copia y pega el contenido de: create-chat-tables.sql
```

### 3️⃣ Instalar e Iniciar

```bash
# Instalar dependencias
npm install
cd server && npm install && cd ..

# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server
npm run dev
```

---

## 📱 Usar WhatsApp (Primera Vez)

1. Abre http://localhost:5173
2. Ve a **Mensajería**
3. Clic en **"Autorizar WhatsApp"**
4. **Escanea el QR** con tu WhatsApp:
   - WhatsApp → Configuración → Dispositivos vinculados
   - "Vincular un dispositivo"
   - Escanea el código
5. ✅ ¡Conectado! Ya puedes enviar mensajes

---

## 💬 Usar el Chatbot

1. El **icono flotante** aparece en todas las páginas
2. Haz clic y pregunta lo que quieras
3. Tiene **memoria**: recuerda toda la conversación
4. Usa **OpenAI GPT-4** (no Gemini)

**Ejemplos de preguntas:**
- "¿Cuál es mi situación financiera actual?"
- "Analiza mis gastos del mes"
- "¿Cuánto debo pagar de IVA?"

---

## 🔑 Obtener API Keys

### OpenAI:
1. Ve a https://platform.openai.com/api-keys
2. Crea una nueva API key
3. Cópiala en `VITE_OPENAI_API_KEY`
4. **Importante**: Asegúrate de tener créditos

### Supabase:
1. Ve a tu proyecto en https://supabase.com
2. Settings → API
3. Copia `Project URL` y `anon public`
4. Para el backend, copia `service_role` (¡no la compartas!)

---

## ✅ Checklist de Verificación

- [ ] Variables de entorno configuradas (frontend y backend)
- [ ] Tablas creadas en Supabase
- [ ] Dependencias instaladas
- [ ] Frontend corriendo en :5173
- [ ] Backend corriendo en :3001
- [ ] API Key de OpenAI válida con créditos
- [ ] WhatsApp autorizado con QR

---

## 🐛 Problemas Comunes

**"Cannot connect to WhatsApp"**
→ Verifica que el backend esté corriendo

**"OpenAI API error"**
→ Revisa que la API key esté bien y tenga créditos

**"Table does not exist"**
→ Ejecuta los scripts SQL en Supabase

**"CORS error"**
→ Verifica que `FRONTEND_URL` en el backend sea correcto

---

## 📚 Más Información

Ver `SETUP_INSTRUCTIONS.md` para guía completa

---

¡Listo para empezar! 🎉
