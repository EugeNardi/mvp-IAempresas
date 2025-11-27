# 📱 Guía Completa: WhatsApp Real con QR Code

## 🎯 Objetivo
Configurar WhatsApp **REAL** para que cada usuario pueda:
1. Escanear un código QR desde su teléfono
2. Sincronizar su número de WhatsApp
3. Enviar mensajes automáticos a deudores

---

## 📋 Requisitos Previos

### 1. **Base de Datos Configurada**
```sql
-- Ejecuta en Supabase SQL Editor:
update-profiles-table.sql
create-chat-tables.sql
```

### 2. **Dependencias Instaladas**
```bash
cd server
npm install
```

---

## 🚀 Paso a Paso

### **Paso 1: Iniciar el Backend**

#### Opción A: Doble clic en el archivo
```
INICIAR_BACKEND.bat
```

#### Opción B: Terminal
```bash
cd server
npm run dev
```

**Deberías ver:**
```
🚀 Server running on port 3001
📱 WhatsApp service ready
```

### **Paso 2: Iniciar el Frontend**

En otra terminal:
```bash
npm run dev
```

### **Paso 3: Configurar Empresa**

1. Ve a **Mensajería**
2. Clic en **⚙️ Configuración**
3. Llena los campos:
   - **Teléfono WhatsApp**: +54 9 11 1234-5678
   - **Alias**: mi.empresa.alias
   - **CBU**: 0000000000000000000000
4. **Guardar Configuración**

### **Paso 4: Autorizar WhatsApp**

1. Clic en **"Autorizar WhatsApp"**
2. Clic en **"Generar Código QR"**
3. **Espera 5-10 segundos** (el backend genera el QR)
4. Verás un **código QR real** en pantalla

### **Paso 5: Escanear QR con tu Teléfono**

1. Abre **WhatsApp** en tu teléfono
2. Ve a **Configuración** (⋮ o ⚙️)
3. Toca **"Dispositivos vinculados"**
4. Toca **"Vincular un dispositivo"**
5. **Escanea el código QR** que aparece en la pantalla
6. Espera la confirmación: **"✅ WhatsApp conectado correctamente"**

### **Paso 6: Agregar Deudores con Teléfono**

#### Opción A: Desde Nuevo Movimiento
Cuando creas una factura de venta:
1. **Tipo**: Ingreso
2. **Categoría**: Deuda
3. **Cliente**: Nombre del cliente
4. **Teléfono**: +54 9 11 1234-5678 (formato internacional)
5. **Monto**: $10000

#### Opción B: Editar Cliente Existente
1. En **Mensajería**, ve a la lista de deudores
2. Clic en el ícono de **✏️ Editar** junto al cliente
3. Agrega el **Teléfono** en formato: `+54 9 11 1234-5678`
4. **Guardar**

### **Paso 7: Enviar Mensajes**

1. **Selecciona** los clientes con deuda
2. Clic en **"Generar Mensaje Automático"** (opcional)
3. Revisa el mensaje (incluye: nombre, deuda, alias, CBU)
4. Clic en **"Enviar a X destinatarios"**
5. Los mensajes se envían **por WhatsApp REAL** 📱

---

## 📱 Formato de Teléfono

### ✅ Correcto
```
+54 9 11 1234-5678  (Argentina)
+54 9 11 12345678   (Argentina sin guiones)
+1 555 123 4567     (USA)
+52 1 55 1234 5678  (México)
```

### ❌ Incorrecto
```
11 1234-5678        (falta código de país)
1234-5678           (falta código de área)
54 9 11 1234-5678   (falta el +)
```

---

## 🔍 Verificación

### **Backend Corriendo**
```bash
# En terminal del servidor, deberías ver:
🚀 Server running on port 3001
📱 WhatsApp service ready
```

### **WhatsApp Conectado**
En la app, verás:
- Badge verde: **"WhatsApp Conectado"**
- No aparece el botón "Autorizar WhatsApp"

### **Mensajes Enviados**
- Revisa tu WhatsApp en el teléfono
- Deberías ver los mensajes enviados
- Aparecen en **"Historial"** de la app

---

## 🛠️ Troubleshooting

### **Problema: "Backend no disponible"**

**Solución:**
```bash
# 1. Verifica que el backend esté corriendo
cd server
npm run dev

# 2. Verifica el puerto
# Debe estar en: http://localhost:3001
```

### **Problema: "QR Code no aparece"**

**Solución:**
1. Espera 10-15 segundos (puede tardar)
2. Verifica la consola del backend:
   ```
   📱 Initializing WhatsApp client for user: [id]
   🔐 QR Code generated
   ```
3. Si no aparece, cierra el modal y vuelve a intentar

### **Problema: "Error al enviar mensajes"**

**Causas comunes:**
1. **WhatsApp no autorizado** → Escanea el QR nuevamente
2. **Teléfono inválido** → Verifica formato: `+54 9 11 1234-5678`
3. **Backend detenido** → Reinicia: `cd server && npm run dev`

### **Problema: "Sesión de WhatsApp expirada"**

**Solución:**
1. Cierra sesión en WhatsApp Web (si está abierto)
2. En la app, clic en **"Autorizar WhatsApp"** nuevamente
3. Escanea el nuevo QR code

---

## 📊 Flujo Completo

```
1. Usuario crea factura con deuda
   ↓
2. Cliente aparece en "Deudores"
   ↓
3. Usuario autoriza WhatsApp (escanea QR)
   ↓
4. Usuario selecciona deudores
   ↓
5. Genera mensaje automático (o personalizado)
   ↓
6. Envía mensajes
   ↓
7. Mensajes llegan por WhatsApp REAL
   ↓
8. Historial se guarda en la app
```

---

## 🔐 Seguridad

### **Sesiones de WhatsApp**
- Cada usuario tiene su propia sesión
- Las sesiones se guardan en: `server/whatsapp-sessions/`
- Son persistentes (no necesitas escanear cada vez)

### **Datos Sensibles**
- Los mensajes NO se guardan en la base de datos
- Solo se guarda el historial (fecha, cantidad, nombres)
- Los números de teléfono están protegidos por RLS

---

## 🎉 Resultado Final

Ahora tienes:
- ✅ WhatsApp **REAL** integrado
- ✅ QR Code para cada usuario
- ✅ Envío automático de mensajes
- ✅ Mensajes personalizados con deuda y datos de pago
- ✅ Historial de mensajes enviados
- ✅ Persistencia de sesión (no necesitas escanear cada vez)

---

## 📞 Ejemplo de Mensaje Enviado

```
Hola *Juan Pérez*! 👋

Te escribimos para recordarte que tienes una deuda pendiente de *$10,000*.

📋 *Datos para realizar el pago:*
• Alias: *mi.empresa.alias*
• CBU: *0000000000000000000000*
• Consultas: +54 9 11 1234-5678

Una vez realizado el pago, envíanos el comprobante para actualizar tu cuenta.

¡Gracias! 🙏
```

---

## 🚀 Próximos Pasos

1. **Prueba con un cliente real**
2. **Verifica que llegue el mensaje**
3. **Ajusta el mensaje si es necesario**
4. **Envía a todos los deudores** 📱

**¡Todo listo para usar WhatsApp REAL!** 🎉
