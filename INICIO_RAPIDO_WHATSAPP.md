# 🚀 INICIO RÁPIDO - WhatsApp Real

## ✅ Lo que Hemos Hecho

1. ✅ **Integración completa de WhatsApp** con `whatsapp-web.js`
2. ✅ **QR Code real** para cada usuario
3. ✅ **Envío de mensajes automáticos** a deudores
4. ✅ **Guardado de configuración** (teléfono, alias, CBU)
5. ✅ **Notificaciones Toast** visuales
6. ✅ **Sistema de memoria** para el chatbot

---

## 🎯 PASOS PARA EMPEZAR (5 minutos)

### **1. Configurar Backend** (1 min)

```bash
# Copia el archivo de ejemplo
cd server
copy .env.example .env
```

Abre `server/.env` y configura:
```env
PORT=3001
SUPABASE_URL=https://ewotgkdjtgisxprsoddg.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key_de_supabase
JWT_SECRET=cualquier_texto_secreto_aqui
FRONTEND_URL=http://localhost:5173
```

**¿Dónde encontrar `SUPABASE_SERVICE_KEY`?**
1. Ve a tu proyecto Supabase
2. Settings → API
3. Copia el **service_role** key (NO el anon key)

### **2. Ejecutar SQL en Supabase** (1 min)

1. Ve a Supabase → SQL Editor
2. Ejecuta estos archivos **en orden**:
   - `update-profiles-table.sql`
   - `create-chat-tables.sql`

### **3. Iniciar Servidores** (1 min)

#### Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Deberías ver:
```
🚀 Server running on port 3001
📱 WhatsApp service ready
```

#### Terminal 2 - Frontend:
```bash
npm run dev
```

### **4. Configurar Empresa** (1 min)

1. Abre http://localhost:5173
2. Ve a **Mensajería**
3. Clic en **⚙️** (arriba derecha)
4. Llena:
   - Teléfono: `+54 9 11 1234-5678`
   - Alias: `mi.empresa.alias`
   - CBU: `0000000000000000000000`
5. **Guardar**

### **5. Autorizar WhatsApp** (1 min)

1. Clic en **"Autorizar WhatsApp"**
2. Clic en **"Generar Código QR"**
3. Espera 5-10 segundos
4. **Escanea el QR** con tu WhatsApp:
   - Abre WhatsApp en tu teléfono
   - Configuración → Dispositivos vinculados
   - Vincular un dispositivo
   - Escanea el QR

---

## 📱 PROBAR EL ENVÍO

### **Agregar un Deudor de Prueba**

1. Ve a **Nuevo Movimiento**
2. Llena:
   - **Tipo**: Ingreso
   - **Categoría**: Deuda
   - **Cliente**: Tu Nombre
   - **Teléfono**: Tu número (formato: `+54 9 11 1234-5678`)
   - **Monto**: 1000
3. **Guardar**

### **Enviar Mensaje**

1. Ve a **Mensajería**
2. Verás tu nombre en "Deudores"
3. **Selecciona** tu nombre
4. Clic en **"Generar Mensaje Automático"**
5. Clic en **"Enviar a 1 destinatario"**
6. **Revisa tu WhatsApp** → deberías recibir el mensaje! 📱

---

## 🔍 Verificar que Todo Funciona

Ejecuta:
```bash
node verificar-whatsapp.cjs
```

Deberías ver:
```
✅ TODO LISTO PARA WHATSAPP REAL
```

---

## 📊 Flujo Completo

```
Usuario crea factura de venta
         ↓
Cliente aparece en "Deudores" con su teléfono
         ↓
Usuario autoriza WhatsApp (escanea QR)
         ↓
Usuario selecciona deudores
         ↓
Genera mensaje automático (incluye: nombre, deuda, alias, CBU)
         ↓
Envía mensajes
         ↓
Mensajes llegan por WhatsApp REAL 📱
         ↓
Historial se guarda en la app
```

---

## 🎯 Características Implementadas

### ✅ **WhatsApp Real**
- QR Code verdadero
- Sesión persistente (no necesitas escanear cada vez)
- Envío masivo de mensajes
- Cada usuario tiene su propia sesión

### ✅ **Mensajes Automáticos**
- Se generan con: nombre del cliente, monto de deuda, alias y CBU
- Personalizables antes de enviar
- Formato profesional con emojis

### ✅ **Gestión de Deudores**
- Se cargan automáticamente desde facturas
- Edición de teléfonos
- Selección múltiple
- Búsqueda por nombre o teléfono

### ✅ **Configuración de Empresa**
- Teléfono de contacto
- Alias bancario
- CBU
- Se guarda en Supabase (persistente)

### ✅ **Notificaciones**
- Toast visuales (verde = éxito, rojo = error)
- Desaparecen automáticamente
- Animación suave

---

## 🛠️ Troubleshooting Rápido

### **Backend no inicia**
```bash
cd server
npm install
npm run dev
```

### **QR no aparece**
- Espera 10-15 segundos
- Verifica que el backend esté corriendo
- Revisa la consola del backend

### **Mensajes no se envían**
- Verifica que WhatsApp esté autorizado (badge verde)
- Verifica formato de teléfono: `+54 9 11 1234-5678`
- Verifica que el backend esté corriendo

### **"Error al guardar configuración"**
- Ejecuta `update-profiles-table.sql` en Supabase
- Verifica que estés logueado en la app

---

## 📖 Documentación Completa

- **`WHATSAPP_REAL_GUIA.md`** → Guía detallada paso a paso
- **`SOLUCION_COMPLETA.md`** → Solución de problemas
- **`verificar-whatsapp.cjs`** → Script de verificación

---

## 🎉 ¡Listo!

Ahora tienes **WhatsApp REAL** funcionando:
- ✅ QR Code verdadero
- ✅ Envío automático de mensajes
- ✅ Mensajes personalizados con deuda
- ✅ Configuración persistente
- ✅ Notificaciones visuales

**¡Pruébalo enviándote un mensaje a ti mismo!** 📱
