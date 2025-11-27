# 🔧 Solución de Errores Actuales

## ❌ Errores Detectados

### 1. **Backend no está corriendo** (ERR_CONNECTION_REFUSED)
```
:3001/api/whatsapp/status: Failed to load resource: net::ERR_CONNECTION_REFUSED
```

### 2. **Tabla profiles sin columnas necesarias** (404)
```
profiles?select=company_phone,company_cbu,company_alias: 404
profiles?select=whatsapp_authorized: 404
profiles?select=trial_ends_at,is_premium: 404
```

### 3. **Tabla chat_messages sin permisos** (403)
```
chat_messages: Failed to load resource: 403
```

---

## ✅ Solución Paso a Paso

### **PASO 1: Arreglar Tabla Profiles en Supabase**

1. Ve a tu proyecto en Supabase: https://supabase.com
2. Abre el **SQL Editor**
3. Ejecuta el archivo: **`fix-profiles-table.sql`**

```sql
-- Copia y pega todo el contenido de fix-profiles-table.sql
```

### **PASO 2: Crear Tablas de Chat**

En el mismo SQL Editor, ejecuta: **`create-chat-tables.sql`**

```sql
-- Copia y pega todo el contenido de create-chat-tables.sql
```

### **PASO 3: Crear Tabla de WhatsApp**

Ejecuta: **`create-whatsapp-auth-table.sql`**

```sql
-- Copia y pega todo el contenido de create-whatsapp-auth-table.sql
```

### **PASO 4: Verificar Variables de Entorno**

#### Frontend (`.env` en la raíz):
```env
VITE_SUPABASE_URL=https://ewotgkdjtgisxprsoddg.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_OPENAI_API_KEY=sk-tu-api-key-de-openai
VITE_API_URL=http://localhost:3001/api
```

#### Backend (`server/.env`):
```env
PORT=3001
NODE_ENV=development

SUPABASE_URL=https://ewotgkdjtgisxprsoddg.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key_aqui

FRONTEND_URL=http://localhost:5173

JWT_SECRET=tu_secret_key_seguro_aqui
```

### **PASO 5: Instalar Dependencias del Backend**

```bash
cd server
npm install
```

### **PASO 6: Iniciar Servidores**

**Opción A - Automático (Windows):**
```bash
# Doble clic en:
START_SERVERS.bat
```

**Opción B - Manual:**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

---

## 🔍 Verificar que Todo Funcione

### 1. Backend corriendo:
- Abre: http://localhost:3001/health
- Deberías ver: `{"status":"ok","message":"Server is running"}`

### 2. Frontend corriendo:
- Abre: http://localhost:5173
- No deberías ver errores 404 en la consola

### 3. WhatsApp disponible:
- Ve a Mensajería
- Clic en "Autorizar WhatsApp"
- Debería aparecer el botón "Generar Código QR"

### 4. Chatbot funcionando:
- Clic en el icono flotante
- Escribe un mensaje
- Debería responder con OpenAI

---

## 📋 Checklist Completo

- [ ] Ejecutar `fix-profiles-table.sql` en Supabase
- [ ] Ejecutar `create-chat-tables.sql` en Supabase
- [ ] Ejecutar `create-whatsapp-auth-table.sql` en Supabase
- [ ] Crear archivo `.env` en la raíz
- [ ] Crear archivo `server/.env`
- [ ] Configurar `VITE_OPENAI_API_KEY`
- [ ] Configurar `SUPABASE_SERVICE_KEY`
- [ ] Instalar dependencias: `cd server && npm install`
- [ ] Iniciar backend: `cd server && npm run dev`
- [ ] Iniciar frontend: `npm run dev`
- [ ] Verificar http://localhost:3001/health
- [ ] Verificar http://localhost:5173

---

## 🆘 Si Siguen los Errores

### Error: "Cannot find module 'whatsapp-web.js'"
```bash
cd server
npm install whatsapp-web.js qrcode-terminal qrcode
```

### Error: "OPENAI_API_KEY not configured"
- Obtén tu API key en: https://platform.openai.com/api-keys
- Agrégala en `.env`: `VITE_OPENAI_API_KEY=sk-...`

### Error: "Invalid or expired token"
- Verifica que `SUPABASE_SERVICE_KEY` esté correcta
- Debe ser la `service_role` key, no la `anon` key

### Error: "Table does not exist"
- Ejecuta todos los scripts SQL en Supabase
- Verifica en Supabase → Table Editor que las tablas existan

---

## 📞 Orden de Ejecución

1. ✅ Arreglar base de datos (SQL scripts)
2. ✅ Configurar variables de entorno
3. ✅ Instalar dependencias backend
4. ✅ Iniciar backend primero
5. ✅ Iniciar frontend después
6. ✅ Probar funcionalidades

---

¡Sigue estos pasos y todo debería funcionar! 🚀
