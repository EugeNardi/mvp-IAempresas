# Sistema de Suscripciones Premium con Mercado Pago

## 📋 Descripción General

Sistema completo de suscripciones premium implementado con Mercado Pago para Argentina, que permite a los usuarios suscribirse a planes mensuales o anuales con renovación automática.

## 🏗️ Arquitectura

### Backend (Node.js + Express)
- **Puerto**: 3001 (configurable)
- **Base de datos**: Supabase (PostgreSQL)
- **Pagos**: Mercado Pago SDK oficial
- **Autenticación**: JWT con Supabase Auth

### Frontend (React)
- **Puerto**: 5173 (Vite dev server)
- **Rutas nuevas**:
  - `/premium` - Página de planes de suscripción
  - `/perfil` - Gestión de suscripción del usuario

## 📦 Instalación

### 1. Backend

```bash
cd server
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `server/` basado en `.env.example`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key

# Mercado Pago Configuration
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_de_mercadopago
MERCADOPAGO_PUBLIC_KEY=tu_public_key_de_mercadopago

# JWT Configuration
JWT_SECRET=tu_secreto_jwt_seguro

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Configurar Base de Datos

Ejecuta el script SQL en tu base de datos Supabase:

```bash
# En Supabase Dashboard > SQL Editor
# Ejecuta el contenido de: server/database/subscriptions-schema.sql
```

Esto creará:
- Tabla `subscriptions`
- Índices para optimización
- Políticas de seguridad (RLS)
- Función `has_active_subscription()`

### 4. Configurar Mercado Pago

#### Obtener Credenciales

1. Ingresa a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Ve a "Tus aplicaciones" > "Crear aplicación"
3. Copia el **Access Token** y **Public Key**
4. Para testing, usa las credenciales de **Modo Sandbox**

#### Configurar Webhook

1. En tu aplicación de Mercado Pago, ve a "Webhooks"
2. Agrega la URL: `https://tu-dominio.com/api/webhook`
3. Selecciona los eventos:
   - `subscription_preapproval`
   - `subscription_authorized_payment`

### 5. Frontend

Actualiza el archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_OPENAI_API_KEY=tu_openai_api_key
VITE_API_URL=http://localhost:3001/api
```

## 🚀 Ejecución

### Desarrollo

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Producción

```bash
# Backend
cd server
npm start

# Frontend
npm run build
```

## 📡 API Endpoints

### Públicos

#### GET `/api/subscriptions/plans`
Obtiene los planes disponibles.

**Response:**
```json
{
  "plans": [
    {
      "id": "monthly",
      "name": "Premium Mensual",
      "price": 4999,
      "currency": "ARS",
      "frequency": 1,
      "frequency_type": "months",
      "description": "Acceso premium con renovación mensual"
    },
    {
      "id": "annual",
      "name": "Premium Anual",
      "price": 49900,
      "currency": "ARS",
      "frequency": 1,
      "frequency_type": "months",
      "description": "Acceso premium por un año completo con descuento"
    }
  ]
}
```

### Protegidos (requieren JWT)

#### POST `/api/subscriptions/create-subscription`
Crea una nueva suscripción para el usuario autenticado.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "planType": "monthly",
  "planId": "optional_plan_id"
}
```

**Response:**
```json
{
  "success": true,
  "subscription": { ... },
  "init_point": "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_id=..."
}
```

#### GET `/api/subscriptions/status`
Obtiene el estado de suscripción del usuario autenticado.

**Response:**
```json
{
  "hasSubscription": true,
  "isActive": true,
  "subscription": {
    "plan_type": "monthly",
    "status": "active",
    "amount": 4999,
    "currency": "ARS",
    "start_date": "2025-01-01T00:00:00Z",
    "next_billing_date": "2025-02-01T00:00:00Z"
  }
}
```

#### POST `/api/subscriptions/cancel`
Cancela la suscripción del usuario autenticado.

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

### Webhook

#### POST `/api/webhook`
Recibe notificaciones de Mercado Pago.

**Body (ejemplo):**
```json
{
  "type": "subscription_preapproval",
  "action": "authorized",
  "data": {
    "id": "preapproval_id"
  }
}
```

## 🎨 Componentes Frontend

### Premium Page (`/premium`)

Muestra los planes disponibles y permite al usuario suscribirse.

**Características:**
- Diseño moderno con Tailwind CSS
- Comparación de planes mensual vs anual
- Cálculo de ahorro en plan anual
- Redirección a Mercado Pago checkout
- Manejo de estados de carga y errores

### Perfil Page (`/perfil`)

Gestión de suscripción del usuario.

**Características:**
- Información del usuario
- Estado de suscripción con badges visuales
- Detalles del plan (tipo, precio, fechas)
- Cancelación de suscripción con confirmación
- Opción de renovar si está cancelada/vencida

## 🔄 Flujo de Suscripción

### 1. Usuario Selecciona Plan
```
Usuario → /premium → Selecciona plan → Click "Suscribirme"
```

### 2. Creación de Suscripción
```
Frontend → POST /api/subscriptions/create-subscription
Backend → Mercado Pago API (create preapproval)
Backend → Guarda en DB (status: pending)
Backend → Retorna init_point
Frontend → Redirige a Mercado Pago
```

### 3. Usuario Completa Pago
```
Usuario → Mercado Pago Checkout → Ingresa datos de tarjeta
Mercado Pago → Procesa pago
Mercado Pago → Redirige a /perfil?subscription=success
```

### 4. Webhook Actualiza Estado
```
Mercado Pago → POST /api/webhook (action: authorized)
Backend → Actualiza DB (status: active)
Backend → Calcula next_billing_date
```

### 5. Renovación Automática
```
Mercado Pago → Cobra automáticamente en next_billing_date
Mercado Pago → POST /api/webhook (payment approved)
Backend → Actualiza next_billing_date
```

## 🔐 Seguridad

### Backend
- ✅ Autenticación JWT en todas las rutas protegidas
- ✅ Validación de usuario en operaciones de suscripción
- ✅ Service Role Key de Supabase para operaciones admin
- ✅ CORS configurado para frontend específico

### Base de Datos
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas para que usuarios solo vean sus suscripciones
- ✅ Service role puede gestionar todas las suscripciones

### Mercado Pago
- ✅ Access Token en variables de entorno
- ✅ Webhook valida origen de notificaciones
- ✅ Preapproval IDs únicos por suscripción

## 📊 Estados de Suscripción

| Estado | Descripción | Acciones Disponibles |
|--------|-------------|---------------------|
| `pending` | Pago pendiente | Esperar confirmación |
| `active` | Suscripción activa | Cancelar |
| `cancelled` | Cancelada por usuario | Renovar |
| `expired` | Vencida por falta de pago | Renovar |
| `payment_failed` | Error en el pago | Renovar |
| `paused` | Pausada temporalmente | Reactivar |

## 🧪 Testing

### Modo Sandbox

Mercado Pago provee un modo sandbox para testing:

1. Usa las credenciales de **Test** en `.env`
2. Usa tarjetas de prueba de [Mercado Pago Testing](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/testing)

**Tarjetas de prueba (Argentina):**
- **Aprobada**: 5031 7557 3453 0604 (CVV: 123, Venc: 11/25)
- **Rechazada**: 5031 4332 1540 6351

### Endpoints de Testing

```bash
# Health check
curl http://localhost:3001/health

# Get plans (público)
curl http://localhost:3001/api/subscriptions/plans

# Get subscription status (requiere auth)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/subscriptions/status
```

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifica que `SUPABASE_URL` y `SUPABASE_SERVICE_KEY` estén en `.env`
- Usa el **Service Role Key**, no el Anon Key

### Error: "Missing MERCADOPAGO_ACCESS_TOKEN"
- Verifica las credenciales en `.env`
- Asegúrate de usar las credenciales correctas (Test o Producción)

### Webhook no recibe notificaciones
- Verifica que la URL del webhook esté correcta en Mercado Pago
- En desarrollo local, usa [ngrok](https://ngrok.com/) para exponer el puerto 3001
- Verifica que los eventos estén seleccionados en la configuración

### Suscripción no se actualiza a "active"
- Revisa los logs del webhook en la consola del backend
- Verifica que el webhook esté recibiendo las notificaciones
- Comprueba que el `mp_preapproval_id` coincida en DB y Mercado Pago

## 📈 Próximas Mejoras

- [ ] Agregar más planes (trimestral, etc.)
- [ ] Implementar cupones de descuento
- [ ] Historial de pagos en el perfil
- [ ] Notificaciones por email
- [ ] Panel admin para gestionar suscripciones
- [ ] Métricas y analytics de suscripciones
- [ ] Soporte para múltiples monedas
- [ ] Prueba gratuita (free trial)

## 📞 Soporte

Para más información:
- [Documentación Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Express.js Docs](https://expressjs.com/)

---

**Desarrollado con ❤️ para IA Solutions**
