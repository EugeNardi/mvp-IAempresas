# 🚨 EJECUTAR SCRIPTS SQL EN ESTE ORDEN

## ⚠️ PROBLEMA ACTUAL
```
Error: "Could not find the table 'public.profiles' in the schema cache"
```

**La tabla `profiles` NO EXISTE en tu base de datos.**

---

## ✅ SOLUCIÓN: Ejecutar Scripts SQL en Orden

### 📍 Dónde ejecutar:
1. Ve a https://supabase.com
2. Abre tu proyecto
3. Menú izquierdo → **SQL Editor**
4. Clic en **"New query"**

---

## 🔢 ORDEN DE EJECUCIÓN

### **1️⃣ PRIMERO: create-profiles-table.sql** ⭐ OBLIGATORIO
```sql
-- Copia y pega TODO el contenido de: create-profiles-table.sql
-- Clic en "Run" o Ctrl+Enter
```
**Qué hace:**
- ✅ Crea la tabla `profiles` (ESENCIAL)
- ✅ Agrega columnas de WhatsApp
- ✅ Agrega columnas de trial/premium
- ✅ Crea perfil automático para nuevos usuarios
- ✅ Crea perfiles para usuarios existentes

**Verificar:**
Deberías ver: `"Tabla profiles creada exitosamente!"`

---

### **2️⃣ SEGUNDO: create-chat-tables.sql**
```sql
-- Copia y pega TODO el contenido de: create-chat-tables.sql
-- Clic en "Run"
```
**Qué hace:**
- ✅ Crea tabla `chat_conversations`
- ✅ Crea tabla `chat_messages`
- ✅ Configura permisos y triggers

---

### **3️⃣ TERCERO: create-whatsapp-auth-table.sql**
```sql
-- Copia y pega TODO el contenido de: create-whatsapp-auth-table.sql
-- Clic en "Run"
```
**Qué hace:**
- ✅ Crea tabla `whatsapp_authorization`
- ✅ Configura permisos para WhatsApp

---

### **4️⃣ OPCIONAL: create-clients-table.sql**
```sql
-- Solo si no existe la tabla clients
-- Copia y pega TODO el contenido de: create-clients-table.sql
-- Clic en "Run"
```

---

## ✅ Verificar que Todo Funcionó

Después de ejecutar los scripts, ve a:
**Table Editor** (menú izquierdo)

Deberías ver estas tablas:
- ✅ `profiles` ⭐ CRÍTICA
- ✅ `chat_conversations`
- ✅ `chat_messages`
- ✅ `whatsapp_authorization`
- ✅ `clients`
- ✅ `companies` (ya existe)
- ✅ `invoices` (ya existe)

---

## 🔄 Después de Ejecutar los Scripts

### **Refrescar el Frontend**
1. Ve a http://localhost:5173
2. Presiona **Ctrl + Shift + R** (hard refresh)
3. Abre la consola (F12)

### **Los errores deberían desaparecer:**
- ❌ ~~"Could not find the table 'public.profiles'"~~
- ❌ ~~"404 profiles"~~
- ✅ Sin errores de base de datos

### **Todavía verás (es normal):**
- ⚠️ `ERR_CONNECTION_REFUSED` en :3001
  → **Solución**: Iniciar el backend

---

## 🚀 Después: Iniciar Backend

Una vez que los scripts SQL estén ejecutados:

```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev
```

Espera a ver:
```
🚀 Server running on port 3001
```

Luego refresca el frontend y todo debería funcionar.

---

## 📋 Checklist Completo

```
[ ] 1. Ejecutar create-profiles-table.sql en Supabase
[ ] 2. Ejecutar create-chat-tables.sql en Supabase
[ ] 3. Ejecutar create-whatsapp-auth-table.sql en Supabase
[ ] 4. Verificar tablas en Table Editor
[ ] 5. Refrescar frontend (Ctrl+Shift+R)
[ ] 6. Verificar que no hay errores de profiles
[ ] 7. cd server && npm install
[ ] 8. cd server && npm run dev
[ ] 9. Verificar http://localhost:3001/health
[ ] 10. Refrescar frontend y probar
```

---

## ⚡ Resumen Ultra Rápido

1. **Supabase SQL Editor** → Ejecutar `create-profiles-table.sql` ⭐
2. **Supabase SQL Editor** → Ejecutar `create-chat-tables.sql`
3. **Supabase SQL Editor** → Ejecutar `create-whatsapp-auth-table.sql`
4. **Terminal** → `cd server && npm run dev`
5. **Navegador** → Refrescar http://localhost:5173

---

¡Después de esto todo funcionará! 🎉
