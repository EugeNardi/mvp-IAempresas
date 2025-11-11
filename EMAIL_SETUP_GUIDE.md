# 📧 Guía de Configuración del Sistema de Emails

## Descripción General

El sistema de emails transaccionales está completamente implementado con templates HTML profesionales para:
- ✅ **Verificación de email** al registrarse
- 🔐 **Recuperación de contraseña**
- 🎉 **Email de bienvenida** después de verificar

## Configuración Requerida

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env` en la carpeta `server/`:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
```

### 2. Configurar Gmail para SMTP

Si usas Gmail, necesitas generar una **Contraseña de Aplicación**:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad → Verificación en dos pasos (debe estar activada)
3. Contraseñas de aplicaciones
4. Selecciona "Correo" y "Otro (nombre personalizado)"
5. Nombra como "Sistema de Gestión"
6. Copia la contraseña generada (16 caracteres)
7. Úsala en `SMTP_PASS`

### 3. Crear Tabla en Supabase

Ejecuta el script SQL en tu base de datos de Supabase:

```bash
# El archivo está en: server/database/verification-tokens-schema.sql
```

Este script crea:
- Tabla `verification_tokens`
- Índices para optimización
- Políticas RLS de seguridad
- Función para limpiar tokens expirados

## Endpoints Disponibles

### Backend (Puerto 3001)

#### 1. Registro con Email de Verificación
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123",
  "fullName": "Juan Pérez"
}
```

**Respuesta:**
```json
{
  "message": "Usuario registrado exitosamente. Por favor verifica tu email.",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "fullName": "Juan Pérez"
  }
}
```

#### 2. Verificar Email
```
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "token_recibido_por_email"
}
```

#### 3. Solicitar Recuperación de Contraseña
```
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "usuario@example.com"
}
```

#### 4. Restablecer Contraseña
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "token_recibido_por_email",
  "newPassword": "nueva_password123"
}
```

## Páginas del Frontend

### Rutas Implementadas

- `/verify-email?token=xxx` - Verificación de email
- `/forgot-password` - Solicitar recuperación
- `/reset-password?token=xxx` - Restablecer contraseña

### Flujo de Usuario

#### Registro:
1. Usuario se registra en `/register`
2. Recibe email de verificación
3. Hace clic en el enlace del email
4. Es redirigido a `/verify-email?token=xxx`
5. Email verificado → Recibe email de bienvenida
6. Redirigido a `/login`

#### Recuperación de Contraseña:
1. Usuario hace clic en "¿Olvidaste tu contraseña?" en `/login`
2. Ingresa su email en `/forgot-password`
3. Recibe email con enlace de recuperación
4. Hace clic en el enlace del email
5. Es redirigido a `/reset-password?token=xxx`
6. Ingresa nueva contraseña
7. Contraseña actualizada → Redirigido a `/login`

## Templates de Email

Los emails incluyen:
- 🎨 **Diseño profesional** con gradientes y colores de marca
- 📱 **Responsive** para móviles y desktop
- ✨ **Branding consistente** con logo y colores
- 🔒 **Información de seguridad**
- 📋 **Instrucciones claras** paso a paso
- ⏰ **Indicadores de expiración** de tokens
- 💡 **Tips y consejos** útiles

### Personalización

Puedes personalizar los templates en:
```
server/utils/emailService.js
```

Modifica:
- Colores y estilos CSS
- Contenido de los mensajes
- Logo y branding
- Información de contacto

## Seguridad

### Tokens
- ✅ Generados con `crypto.randomBytes(32)`
- ✅ Almacenados hasheados en la base de datos
- ✅ Expiración automática (24h verificación, 1h recuperación)
- ✅ Un solo uso (marcados como `used`)
- ✅ Políticas RLS en Supabase

### Mejores Prácticas Implementadas
- No revelar si un email existe en el sistema
- Tokens únicos y aleatorios
- Expiración de tokens
- HTTPS requerido en producción
- Rate limiting recomendado (implementar en producción)

## Testing

### Probar Localmente

1. **Iniciar el servidor:**
```bash
cd server
npm run dev
```

2. **Registrar un usuario:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

3. **Revisar el email** en tu bandeja de entrada

4. **Copiar el token** del enlace del email

5. **Verificar el email:**
```bash
curl -X POST http://localhost:3001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "tu_token_aqui"}'
```

## Troubleshooting

### Email no llega
- ✅ Verifica las credenciales SMTP en `.env`
- ✅ Revisa la carpeta de spam
- ✅ Confirma que la verificación en dos pasos esté activada (Gmail)
- ✅ Verifica los logs del servidor para errores

### Token inválido o expirado
- ✅ Los tokens de verificación expiran en 24 horas
- ✅ Los tokens de recuperación expiran en 1 hora
- ✅ Los tokens solo pueden usarse una vez
- ✅ Solicita un nuevo token si expiró

### Error de conexión SMTP
- ✅ Verifica que el puerto 587 no esté bloqueado
- ✅ Prueba con puerto 465 (secure: true)
- ✅ Revisa firewall y antivirus

## Próximos Pasos

### Mejoras Recomendadas

1. **Rate Limiting**
   - Limitar intentos de registro por IP
   - Limitar solicitudes de recuperación por email

2. **Email Queue**
   - Implementar cola de emails con Bull/Redis
   - Reintentos automáticos en caso de fallo

3. **Analytics**
   - Tracking de emails abiertos
   - Tracking de clicks en enlaces

4. **Templates Adicionales**
   - Email de cambio de contraseña exitoso
   - Email de cambio de email
   - Notificaciones de actividad sospechosa

5. **Testing**
   - Tests unitarios para servicios de email
   - Tests de integración para flujos completos

## Soporte

Para más información o soporte:
- 📧 Email: soporte@iasolucions.com
- 📚 Documentación: Ver archivos en `/server/utils/emailService.js`

---

**Última actualización:** Noviembre 2025
**Versión:** 1.0.0
