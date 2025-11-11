# 🚀 Quick Start - Sistema de Emails

## Pasos Rápidos para Activar el Sistema

### 1. ⚙️ Configurar Variables de Entorno

Edita el archivo `server/.env` y agrega:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion_de_16_caracteres
```

**Para obtener la contraseña de aplicación de Gmail:**
1. Ve a: https://myaccount.google.com/security
2. Activa "Verificación en dos pasos"
3. Busca "Contraseñas de aplicaciones"
4. Genera una nueva para "Correo"
5. Copia los 16 caracteres

### 2. 🗄️ Crear Tabla en Supabase

Ejecuta este SQL en tu proyecto de Supabase:

```sql
-- Copia y pega el contenido del archivo:
-- server/database/verification-tokens-schema.sql
```

O desde el dashboard de Supabase:
1. Ve a SQL Editor
2. Copia el contenido de `server/database/verification-tokens-schema.sql`
3. Ejecuta el script

### 3. 🖼️ Guardar Imagen del Dashboard

**IMPORTANTE:** Guarda manualmente la imagen que compartiste en:
```
public/dashboard-preview.png
```

Esta imagen se mostrará en la landing page.

### 4. 🔄 Reiniciar el Servidor

```bash
cd server
npm run dev
```

### 5. ✅ Probar el Sistema

#### Opción A: Desde la UI
1. Ve a http://localhost:5173/register
2. Regístrate con un email real
3. Revisa tu bandeja de entrada
4. Haz clic en el enlace de verificación

#### Opción B: Con cURL
```bash
# Registrar usuario
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu_email@gmail.com",
    "password": "password123",
    "fullName": "Tu Nombre"
  }'
```

## 📋 Checklist de Verificación

- [ ] Variables SMTP configuradas en `.env`
- [ ] Tabla `verification_tokens` creada en Supabase
- [ ] Imagen del dashboard guardada en `public/dashboard-preview.png`
- [ ] Servidor backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] Email de prueba enviado y recibido

## 🎯 Funcionalidades Implementadas

### Landing Page
- ✅ Componente `DashboardPreview` con imagen del sistema
- ✅ Reemplaza la sección "Cómo Funciona"
- ✅ Muestra características del dashboard

### Sistema de Emails
- ✅ Email de verificación al registrarse
- ✅ Email de bienvenida después de verificar
- ✅ Email de recuperación de contraseña
- ✅ Templates HTML profesionales con branding
- ✅ Diseño responsive

### Páginas Nuevas
- ✅ `/verify-email` - Verificación de cuenta
- ✅ `/forgot-password` - Solicitar recuperación
- ✅ `/reset-password` - Restablecer contraseña

### Endpoints Backend
- ✅ `POST /api/auth/register` - Registro con email
- ✅ `POST /api/auth/verify-email` - Verificar email
- ✅ `POST /api/auth/request-password-reset` - Solicitar recuperación
- ✅ `POST /api/auth/reset-password` - Restablecer contraseña

## 🔧 Troubleshooting Rápido

### Email no llega
```bash
# Verifica las credenciales
echo $SMTP_USER
echo $SMTP_PASS

# Revisa los logs del servidor
# Busca mensajes de error de nodemailer
```

### Error "Token inválido"
- Los tokens expiran (24h verificación, 1h recuperación)
- Solicita un nuevo token

### Puerto ocupado
```bash
# Cambiar puerto del servidor
# En server/.env:
PORT=3002
```

## 📞 Soporte

Si tienes problemas:
1. Revisa `EMAIL_SETUP_GUIDE.md` para documentación completa
2. Verifica los logs del servidor
3. Confirma que todas las variables de entorno estén configuradas

---

**¡Listo para usar!** 🎉
