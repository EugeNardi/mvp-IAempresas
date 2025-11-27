# 🚂 Desplegar Backend en Railway (5 minutos)

## ¿Por qué Railway?

- ✅ **Gratis** para empezar ($5 de crédito gratis/mes)
- ✅ **Fácil** de configurar
- ✅ **Automático** - detecta Node.js
- ✅ **HTTPS** incluido
- ✅ **Dominio** gratis: `tu-app.railway.app`

---

## 📋 Paso a Paso

### 1. Preparar el Proyecto

Crea `server/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node app.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Actualiza `server/package.json`:
```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 2. Crear Cuenta en Railway

1. Ve a https://railway.app
2. **Sign up with GitHub**
3. Autoriza Railway

### 3. Crear Nuevo Proyecto

1. **New Project**
2. **Deploy from GitHub repo**
3. Selecciona tu repositorio
4. Selecciona la carpeta `server/`

### 4. Configurar Variables de Entorno

En el dashboard de Railway:

```
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://ewotgkdjtgisxprsoddg.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key
JWT_SECRET=tu_secret_seguro
FRONTEND_URL=https://tu-frontend.vercel.app
```

### 5. Desplegar

Railway despliega automáticamente. Verás:
```
✅ Build successful
✅ Deployment live
🌐 URL: https://tu-app.railway.app
```

### 6. Actualizar Frontend

En tu `.env`:
```env
VITE_API_URL=https://tu-app.railway.app/api
```

Reconstruye el frontend:
```bash
npm run build
```

---

## 🎯 Resultado

Ahora tu backend está en la nube:
- ✅ URL: `https://tu-app.railway.app`
- ✅ Disponible 24/7
- ✅ Todos los usuarios lo usan
- ✅ No necesitan instalar nada
- ✅ WhatsApp funciona para cada usuario

---

## 📱 Desplegar Frontend (Vercel)

### 1. Crear cuenta en Vercel

1. Ve a https://vercel.com
2. **Sign up with GitHub**

### 2. Importar Proyecto

1. **Add New Project**
2. **Import Git Repository**
3. Selecciona tu repo
4. **Root Directory**: `.` (raíz)
5. **Framework Preset**: Vite

### 3. Variables de Entorno

```
VITE_SUPABASE_URL=https://ewotgkdjtgisxprsoddg.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_API_URL=https://tu-app.railway.app/api
VITE_OPENAI_API_KEY=tu_openai_key
```

### 4. Deploy

Vercel despliega automáticamente:
```
✅ Build successful
🌐 URL: https://tu-app.vercel.app
```

---

## 🎉 Resultado Final

Tu app está completamente en la nube:

- **Frontend**: `https://tu-app.vercel.app`
- **Backend**: `https://tu-app.railway.app`
- **Base de datos**: Supabase

Los usuarios solo:
1. Abren `https://tu-app.vercel.app`
2. Inician sesión
3. ¡Todo funciona! Backend ya está corriendo 🚀

---

## 💰 Costos

### Railway (Backend)
- **Gratis**: $5 de crédito/mes
- **Suficiente para**: ~100-500 usuarios activos
- **Después**: $5/mes por cada $5 de uso

### Vercel (Frontend)
- **Gratis**: 100 GB de ancho de banda/mes
- **Suficiente para**: Miles de usuarios
- **Después**: $20/mes (Pro)

### Supabase (Base de datos)
- **Gratis**: 500 MB de base de datos
- **Suficiente para**: Miles de registros
- **Después**: $25/mes (Pro)

---

## 🔄 Actualizaciones Automáticas

Cada vez que hagas `git push`:
- ✅ Railway redespliega el backend automáticamente
- ✅ Vercel redespliega el frontend automáticamente
- ✅ Sin downtime
- ✅ Los usuarios ven los cambios inmediatamente

---

## 🛠️ Monitoreo

### Railway Dashboard
- Ver logs en tiempo real
- Métricas de uso (CPU, RAM)
- Reiniciar servicio
- Ver variables de entorno

### Vercel Dashboard
- Analytics de visitas
- Logs de errores
- Performance metrics

---

## ✅ Ventajas de Esta Solución

1. **Cero Instalación**: Los usuarios solo abren una URL
2. **Siempre Disponible**: Backend 24/7
3. **Escalable**: Soporta muchos usuarios
4. **Profesional**: URLs propias, HTTPS incluido
5. **Fácil de Mantener**: Un solo lugar para actualizar
6. **WhatsApp Individual**: Cada usuario su sesión
7. **Gratis para Empezar**: Suficiente para validar el producto

---

## 🚀 Siguiente Paso

1. **Sube tu código a GitHub** (si no lo has hecho)
2. **Sigue los pasos de Railway** (5 minutos)
3. **Sigue los pasos de Vercel** (3 minutos)
4. **¡Listo!** Tu app está en producción 🎉
