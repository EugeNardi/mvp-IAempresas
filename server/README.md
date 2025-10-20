# Backend - Sistema de Suscripciones

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor de desarrollo
npm run dev

# Iniciar servidor de producción
npm start
```

## 📁 Estructura del Proyecto

```
server/
├── app.js                      # Aplicación Express principal
├── package.json                # Dependencias y scripts
├── .env.example                # Ejemplo de variables de entorno
├── controllers/                # Lógica de negocio
│   ├── subscriptionController.js
│   └── webhookController.js
├── routes/                     # Definición de rutas
│   ├── subscriptionRoutes.js
│   └── webhookRoutes.js
├── models/                     # Modelos de datos
│   └── subscriptionModel.js
├── middlewares/                # Middlewares personalizados
│   └── authMiddleware.js
├── utils/                      # Utilidades
│   ├── supabaseClient.js
│   └── mercadoPagoClient.js
└── database/                   # Scripts SQL
    └── subscriptions-schema.sql
```

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
MERCADOPAGO_PUBLIC_KEY=tu_public_key
JWT_SECRET=tu_secreto_seguro
FRONTEND_URL=http://localhost:5173
```

### Base de Datos

Ejecuta el script SQL en Supabase:
```sql
-- Ver: database/subscriptions-schema.sql
```

## 📡 Endpoints

### Health Check
```
GET /health
```

### Suscripciones (Protegidas)
```
GET    /api/subscriptions/plans
POST   /api/subscriptions/create-subscription
GET    /api/subscriptions/status
POST   /api/subscriptions/cancel
```

### Webhook (Mercado Pago)
```
POST   /api/webhook
```

## 🔐 Autenticación

Todas las rutas protegidas requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

El token se obtiene del frontend mediante Supabase Auth.

## 📦 Dependencias Principales

- **express**: Framework web
- **cors**: CORS middleware
- **dotenv**: Variables de entorno
- **mercadopago**: SDK oficial de Mercado Pago
- **@supabase/supabase-js**: Cliente de Supabase
- **jsonwebtoken**: Validación de JWT

## 🧪 Testing

```bash
# Health check
curl http://localhost:3001/health

# Obtener planes
curl http://localhost:3001/api/subscriptions/plans
```

## 📝 Notas

- El servidor usa `--watch` en modo desarrollo para hot reload
- Los webhooks responden inmediatamente con 200 OK
- Los errores se loguean en consola con detalles
- CORS está configurado para el frontend específico

## 🐛 Debugging

Para ver logs detallados, el servidor imprime:
- Inicio del servidor con puerto y entorno
- Webhooks recibidos con tipo y acción
- Errores con stack trace en desarrollo
- Actualizaciones de estado de suscripciones

## 🚀 Despliegue

### Render / Railway / Heroku

1. Conecta tu repositorio
2. Configura las variables de entorno
3. Comando de build: `npm install`
4. Comando de start: `npm start`
5. Configura el webhook URL en Mercado Pago

### Variables de Entorno en Producción

Asegúrate de configurar:
- `NODE_ENV=production`
- `FRONTEND_URL` con tu dominio de producción
- Credenciales de **Producción** de Mercado Pago

---

Para más detalles, ver: `../MERCADOPAGO_SUBSCRIPTIONS.md`
