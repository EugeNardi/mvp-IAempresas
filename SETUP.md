# 🚀 Guía de Configuración - IA Solutions

## 📋 Requisitos Previos

- Node.js 16+ instalado
- Una cuenta en [Supabase](https://supabase.com) (gratis)

## 🔧 Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Haz clic en "New Project"
3. Completa los datos:
   - **Name**: IA Solutions (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura
   - **Region**: Selecciona la más cercana a tu ubicación
4. Haz clic en "Create new project"

### 2. Obtener las Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** (⚙️) en el menú lateral
2. Selecciona **API**
3. Copia los siguientes valores:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon public** key (la clave pública)

### 3. Configurar Variables de Entorno

1. En la raíz del proyecto, crea un archivo `.env`:

```bash
VITE_SUPABASE_URL=tu_project_url_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

2. Reemplaza los valores con tus credenciales de Supabase

### 4. Configurar Autenticación en Supabase

1. En tu proyecto de Supabase, ve a **Authentication** → **Providers**
2. Asegúrate de que **Email** esté habilitado
3. En **Email Auth**, configura:
   - ✅ Enable email provider
   - ✅ Confirm email (opcional, puedes deshabilitarlo para desarrollo)

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🎨 Estructura de la Aplicación

```
src/
├── components/          # Componentes de la landing page
│   ├── Navbar.jsx
│   ├── Hero.jsx
│   ├── Features.jsx
│   ├── HowItWorks.jsx
│   ├── Benefits.jsx
│   ├── CTA.jsx
│   ├── Footer.jsx
│   └── ProtectedRoute.jsx
├── pages/              # Páginas principales
│   ├── Landing.jsx     # Landing page
│   ├── Login.jsx       # Inicio de sesión
│   ├── Register.jsx    # Registro
│   └── Chat.jsx        # Interfaz de chat
├── context/
│   └── AuthContext.jsx # Contexto de autenticación
├── lib/
│   └── supabase.js     # Cliente de Supabase
└── App.jsx             # Configuración de rutas
```

## 🔐 Flujo de Autenticación

1. **Registro** (`/register`):
   - El usuario crea una cuenta con email y contraseña
   - Los datos se guardan en Supabase Auth
   - Redirección automática al login

2. **Login** (`/login`):
   - El usuario inicia sesión con sus credenciales
   - Supabase valida y crea una sesión
   - Redirección automática al chat

3. **Chat** (`/chat`):
   - Ruta protegida (requiere autenticación)
   - Interfaz estilo ChatGPT
   - Sidebar con historial y perfil

## 🎯 Rutas Disponibles

- `/` - Landing page (pública)
- `/login` - Inicio de sesión (pública)
- `/register` - Registro (pública)
- `/chat` - Interfaz de chat (protegida)

## 🌙 Tema Oscuro

La aplicación utiliza un tema oscuro profesional con:
- Colores base: `#0f0f0f` (fondo), `#1a1a1a` (tarjetas)
- Acentos: Gradientes azul-cyan
- Bordes sutiles y efectos glass-morphism

## 🔨 Personalización

### Cambiar Colores

Edita `tailwind.config.js`:

```javascript
colors: {
  dark: {
    bg: '#0f0f0f',      // Fondo principal
    card: '#1a1a1a',    // Tarjetas
    border: '#2a2a2a',  // Bordes
    hover: '#252525',   // Hover states
  },
}
```

### Modificar Contenido

Cada componente tiene su contenido hardcodeado. Edita los archivos `.jsx` en `src/components/` y `src/pages/`.

## 🚀 Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en `dist/`.

## 📝 Notas Importantes

1. **Respuestas del Chat**: Actualmente son simuladas. Para conectar una IA real, integra OpenAI API o similar en `src/pages/Chat.jsx`

2. **Email Confirmation**: Si habilitaste confirmación de email en Supabase, los usuarios recibirán un email de verificación

3. **Seguridad**: Las credenciales de Supabase en `.env` son seguras para el frontend (son claves públicas)

## 🐛 Solución de Problemas

### Error: "Invalid API key"
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo

### Error: "Email not confirmed"
- Deshabilita la confirmación de email en Supabase (Development)
- O verifica el email del usuario

### La aplicación no carga estilos
- Ejecuta `npm install` nuevamente
- Verifica que Tailwind CSS esté configurado correctamente

## 📞 Soporte

Para más información sobre Supabase: [https://supabase.com/docs](https://supabase.com/docs)

---

**¡Listo!** Tu aplicación de IA Solutions está configurada y lista para usar. 🎉
