# 🏗️ Arquitectura del Sistema de Suscripciones

## 📊 Diagrama Simplificado

```
FRONTEND (React)                    BACKEND (Node.js)              EXTERNAL
─────────────────                   ─────────────────              ────────

┌─────────────┐                     ┌─────────────┐               ┌──────────┐
│   Premium   │────────────────────>│Subscription │──────────────>│ Mercado  │
│    Page     │  Create Sub         │ Controller  │  API Calls    │   Pago   │
└─────────────┘                     └─────────────┘               └──────────┘
                                            │
┌─────────────┐                     ┌─────────────┐               ┌──────────┐
│   Perfil    │────────────────────>│Subscription │──────────────>│ Supabase │
│    Page     │  Get Status         │    Model    │  DB Queries   │    DB    │
└─────────────┘                     └─────────────┘               └──────────┘
                                            │
┌─────────────┐                     ┌─────────────┐
│useSubscription│<───────────────────│    Auth     │
│    Hook     │  JWT Validation     │ Middleware  │
└─────────────┘                     └─────────────┘
                                            │
                                    ┌─────────────┐
                                    │   Webhook   │<────────── Mercado Pago
                                    │ Controller  │  Notifications
                                    └─────────────┘
```

## 🔄 Flujo Principal

1. **Usuario selecciona plan** → Frontend `/premium`
2. **Crea suscripción** → Backend `POST /api/subscriptions/create-subscription`
3. **Guarda en DB** → Supabase (status: pending)
4. **Redirige a pago** → Mercado Pago checkout
5. **Usuario paga** → Mercado Pago procesa
6. **Webhook notifica** → Backend `POST /api/webhook`
7. **Actualiza estado** → DB (status: active)
8. **Usuario premium** → Acceso completo

## 📁 Estructura de Archivos

```
Backend:
server/
├── app.js                    # Servidor principal
├── controllers/              # Lógica de negocio
├── routes/                   # Rutas API
├── models/                   # Modelos de datos
├── middlewares/              # Auth JWT
└── utils/                    # Clientes (MP, Supabase)

Frontend:
src/
├── pages/
│   ├── Premium.jsx          # Planes de suscripción
│   └── Perfil.jsx           # Gestión de suscripción
├── services/
│   └── subscriptionService.js  # API calls
├── hooks/
│   └── useSubscription.js   # Estado de suscripción
└── components/
    ├── PremiumBadge.jsx     # Badge premium
    └── PremiumFeature.jsx   # Protección de contenido
```

## 🎯 Estados de Suscripción

```
pending → active → cancelled
    ↓       ↓         ↓
  expired ← payment_failed
```

## 📡 API Endpoints

**Públicos:**
- `GET /api/subscriptions/plans` - Obtener planes

**Protegidos (JWT):**
- `POST /api/subscriptions/create-subscription` - Crear suscripción
- `GET /api/subscriptions/status` - Estado de suscripción
- `POST /api/subscriptions/cancel` - Cancelar suscripción

**Webhook:**
- `POST /api/webhook` - Notificaciones de Mercado Pago

---

Ver documentación completa en `MERCADOPAGO_SUBSCRIPTIONS.md`
