# 🚀 Guía Rápida - Sistema de Suscripciones

## ⚡ Configuración en 5 Pasos

### 1️⃣ Configurar Base de Datos (Supabase)

1. Abre Supabase Dashboard → SQL Editor
2. Ejecuta el script: `server/database/subscriptions-schema.sql`
3. Verifica que se creó la tabla `subscriptions`

### 2️⃣ Obtener Credenciales de Mercado Pago

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Crea una aplicación o usa una existente
3. Copia el **Access Token** (para testing, usa el de Test)
4. Copia el **Public Key**

### 3️⃣ Configurar Backend

```bash
cd server
npm install
cp .env.example .env
```

Edita `server/.env`:
```env
PORT=3001
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key_de_supabase
MERCADOPAGO_ACCESS_TOKEN=TEST-tu-access-token-de-mercadopago
MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key
JWT_SECRET=cualquier_string_seguro_aleatorio
FRONTEND_URL=http://localhost:5173
```

**⚠️ Importante:** Usa el **Service Role Key** de Supabase, no el Anon Key.

### 4️⃣ Configurar Frontend

Edita `.env` en la raíz:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
VITE_API_URL=http://localhost:3001/api
```

### 5️⃣ Iniciar Servidores

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend (desde la raíz)
npm run dev
```

## ✅ Verificar Instalación

1. **Backend funcionando:**
   - Abre: http://localhost:3001/health
   - Deberías ver: `{"status":"ok","message":"Server is running"}`

2. **Frontend funcionando:**
   - Abre: http://localhost:5173
   - Navega a: http://localhost:5173/premium
   - Deberías ver los planes de suscripción

## 🧪 Probar el Sistema

### Flujo Completo de Prueba

1. **Registra un usuario:**
   - Ve a http://localhost:5173/register
   - Crea una cuenta de prueba

2. **Ve a Premium:**
   - Navega a http://localhost:5173/premium
   - Verás los planes Mensual y Anual

3. **Suscríbete:**
   - Click en "Suscribirme ahora"
   - Serás redirigido a Mercado Pago (sandbox)

4. **Usa tarjeta de prueba:**
   - Número: `5031 7557 3453 0604`
   - CVV: `123`
   - Vencimiento: `11/25`
   - Nombre: Cualquiera

5. **Verifica suscripción:**
   - Serás redirigido a http://localhost:5173/perfil
   - Verás tu suscripción activa

## 🔍 Troubleshooting Rápido

### ❌ Backend no inicia
```bash
# Verifica que Node.js esté instalado
node --version  # Debe ser v18 o superior

# Reinstala dependencias
cd server
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error "Missing Supabase environment variables"
- Verifica que `.env` exista en `server/`
- Usa el **Service Role Key**, no el Anon Key
- Copia la URL completa de Supabase (con https://)

### ❌ Error "Missing MERCADOPAGO_ACCESS_TOKEN"
- Verifica que copiaste el Access Token correctamente
- Para testing, usa el que empieza con `TEST-`
- No incluyas espacios ni comillas en el `.env`

### ❌ Frontend no se conecta al backend
- Verifica que `VITE_API_URL` esté en `.env` (raíz del proyecto)
- Reinicia el servidor de Vite después de cambiar `.env`
- Verifica que el backend esté corriendo en el puerto 3001

### ❌ Webhook no funciona en desarrollo local
- Los webhooks de Mercado Pago necesitan una URL pública
- Usa [ngrok](https://ngrok.com/) para exponer tu puerto 3001:
  ```bash
  ngrok http 3001
  ```
- Configura la URL del webhook en Mercado Pago:
  ```
  https://tu-url-de-ngrok.ngrok.io/api/webhook
  ```

## 📋 Checklist de Configuración

- [ ] Base de datos creada en Supabase
- [ ] Script SQL ejecutado
- [ ] Credenciales de Mercado Pago obtenidas
- [ ] `server/.env` configurado
- [ ] `.env` (frontend) configurado
- [ ] Dependencias del backend instaladas
- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] Health check responde OK
- [ ] Página /premium carga correctamente

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. **Configura el webhook** (para producción):
   - En Mercado Pago Developers → Tu App → Webhooks
   - URL: `https://tu-dominio.com/api/webhook`
   - Eventos: `subscription_preapproval`, `subscription_authorized_payment`

2. **Personaliza los planes**:
   - Edita precios en `server/controllers/subscriptionController.js`
   - Busca el objeto `PLANS`

3. **Personaliza el diseño**:
   - Edita `src/pages/Premium.jsx`
   - Edita `src/pages/Perfil.jsx`

4. **Agrega funcionalidades premium**:
   - Usa `getSubscriptionStatus()` para verificar si el usuario es premium
   - Bloquea/desbloquea funciones según el estado

## 📚 Documentación Completa

Para más detalles, ver:
- `MERCADOPAGO_SUBSCRIPTIONS.md` - Documentación completa
- `server/README.md` - Documentación del backend

## 💡 Tips

- **Modo Test**: Usa credenciales TEST de Mercado Pago para desarrollo
- **Tarjetas de prueba**: [Lista completa aquí](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/testing)
- **Logs**: El backend imprime logs detallados en la consola
- **Hot reload**: El backend se reinicia automáticamente al guardar cambios

## 🆘 ¿Necesitas Ayuda?

1. Revisa los logs del backend en la terminal
2. Revisa la consola del navegador (F12)
3. Verifica que todas las variables de entorno estén configuradas
4. Consulta la documentación completa en `MERCADOPAGO_SUBSCRIPTIONS.md`

---

**¡Listo! Tu sistema de suscripciones está funcionando** 🎉
