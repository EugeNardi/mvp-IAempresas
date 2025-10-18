# Configuración de Supabase

## ✅ Estado Actual
Tu aplicación ya está completamente configurada y lista para funcionar con Supabase.

## 🔑 Credenciales Configuradas

**URL del Proyecto:** `https://ewotgkdjtgisxprsoddg.supabase.co`

Las credenciales están configuradas en:
- Archivo `.env` (raíz del proyecto)
- Fallback hardcodeado en `src/lib/supabase.js`

## 📋 Configuración en Supabase Dashboard

### 1. Autenticación Email/Password
✅ **Ya está habilitada por defecto**

Ve a tu dashboard de Supabase:
👉 https://app.supabase.com/project/ewotgkdjtgisxprsoddg/auth/providers

**Configuraciones recomendadas:**
- ✅ Enable Email provider
- ✅ Enable Email Confirmations (opcional - si quieres que los usuarios confirmen su email)
- ✅ Enable Email Signup

### 2. URL Configuration
Ve a: **Authentication** → **URL Configuration**

Configura las siguientes URLs:

**Para desarrollo:**
- **Site URL:** `http://localhost:5173`
- **Redirect URLs:** 
  - `http://localhost:5173/**`
  - `http://localhost:5173/chat`

**Para producción (cuando despliegues):**
- Agrega tu dominio de producción
- Ejemplo: `https://tudominio.com/**`

### 3. Email Templates (Opcional)
Ve a: **Authentication** → **Email Templates**

Puedes personalizar los emails de:
- ✅ Confirm signup
- ✅ Magic Link
- ✅ Change Email Address
- ✅ Reset Password

## 🗄️ Base de Datos

### Tablas Automáticas
Supabase crea automáticamente estas tablas para autenticación:
- `auth.users` - Información de usuarios
- `auth.sessions` - Sesiones activas

### Metadata de Usuario
Tu aplicación guarda el nombre completo en:
```javascript
user.user_metadata.full_name
```

Esto se almacena automáticamente en `auth.users.raw_user_meta_data`

### ⚠️ No necesitas crear tablas adicionales (por ahora)
El chat actual es simulado y no persiste mensajes. Si en el futuro quieres guardar conversaciones, necesitarás crear tablas personalizadas.

## 🚀 Funcionalidades Implementadas

### ✅ Autenticación
- **Registro de usuarios** (`/register`)
  - Email + Password
  - Nombre completo guardado en metadata
  - Validación de contraseñas
  
- **Login** (`/login`)
  - Email + Password
  - Manejo de errores
  - Redirección automática al chat

- **Logout**
  - Desde el sidebar del chat
  - Limpia la sesión completamente

- **Rutas Protegidas**
  - `/chat` requiere autenticación
  - Redirección automática a `/login` si no está autenticado

### ✅ Gestión de Sesiones
- Persistencia automática de sesión
- Detección de cambios de autenticación
- Recuperación de sesión al recargar página

## 📁 Estructura de Archivos

```
mvp-inga-franco/
├── .env                          # ✅ Credenciales de Supabase
├── src/
│   ├── lib/
│   │   └── supabase.js          # ✅ Cliente de Supabase configurado
│   ├── context/
│   │   └── AuthContext.jsx      # ✅ Context de autenticación
│   ├── pages/
│   │   ├── Login.jsx            # ✅ Página de login
│   │   ├── Register.jsx         # ✅ Página de registro
│   │   └── Chat.jsx             # ✅ Chat protegido
│   └── components/
│       └── ProtectedRoute.jsx   # ✅ HOC para rutas protegidas
```

## 🧪 Cómo Probar

### 1. Iniciar el servidor
```bash
npm run dev
```

### 2. Registrar un usuario
1. Ve a `http://localhost:5173/register`
2. Completa el formulario
3. Haz clic en "Crear Cuenta"

### 3. Iniciar sesión
1. Ve a `http://localhost:5173/login`
2. Usa las credenciales que registraste
3. Serás redirigido a `/chat`

### 4. Verificar en Supabase
1. Ve a tu dashboard: https://app.supabase.com/project/ewotgkdjtgisxprsoddg/auth/users
2. Deberías ver el usuario registrado

## 🔒 Seguridad

### Variables de Entorno
✅ El archivo `.env` está en `.gitignore` (no se sube a Git)
✅ Usa `.env.example` como plantilla para otros desarrolladores

### Anon Key
✅ La `ANON_KEY` es segura para uso público
✅ Las políticas RLS (Row Level Security) protegen los datos

## 🐛 Troubleshooting

### Error: "Invalid supabaseUrl"
**Solución:** Reinicia el servidor después de modificar `.env`
```bash
# Detener con Ctrl+C
npm run dev
```

### Error: "Invalid login credentials"
**Causa:** Email o contraseña incorrectos
**Solución:** Verifica las credenciales o registra un nuevo usuario

### Error: "Email not confirmed"
**Causa:** Tienes habilitada la confirmación por email
**Solución:** 
1. Ve a Supabase Dashboard → Authentication → Users
2. Confirma manualmente el usuario
3. O desactiva "Enable Email Confirmations"

## 📞 Próximos Pasos (Opcional)

### Si quieres persistir conversaciones:
1. Crear tabla `conversations`
2. Crear tabla `messages`
3. Configurar RLS policies
4. Actualizar `Chat.jsx` para guardar mensajes

### Si quieres integrar IA real:
1. Configurar API de OpenAI o similar
2. Crear Edge Function en Supabase
3. Actualizar el handler de mensajes en `Chat.jsx`

## ✅ Checklist de Configuración

- [x] Proyecto de Supabase creado
- [x] Credenciales configuradas en `.env`
- [x] Cliente de Supabase inicializado
- [x] Context de autenticación implementado
- [x] Páginas de Login/Register creadas
- [x] Rutas protegidas configuradas
- [x] Email provider habilitado
- [ ] URL Configuration en Supabase (pendiente de configurar en dashboard)
- [ ] Email templates personalizados (opcional)

---

**🎉 Tu aplicación está lista para usar con Supabase!**
