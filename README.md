# IA Solutions - Plataforma Completa con Chat IA

Una aplicación web moderna y profesional con **tema oscuro**, autenticación completa con Supabase y una interfaz de chat estilo ChatGPT para empresas de consultoría en IA.

## 🎨 Diseño

Inspirado en los mejores estándares de diseño de:
- **Apple**: Minimalismo, elegancia y atención al detalle
- **Notion**: Interfaz limpia y moderna
- **shadcn/ui**: Componentes accesibles y bien diseñados
- **ChatGPT**: Interfaz de chat intuitiva y profesional

## ✨ Características Principales

### 🌙 Tema Oscuro Profesional
- Paleta de colores oscuros elegante y moderna
- Efectos glass-morphism y gradientes sutiles
- Optimizado para reducir fatiga visual

### 🔐 Autenticación Completa
- Sistema de registro e inicio de sesión con Supabase
- Rutas protegidas con React Router
- Gestión de sesiones persistentes
- Validación de formularios

### 💬 Chat Estilo ChatGPT
- Interfaz de chat moderna y responsiva
- Sidebar con historial de conversaciones
- Mensajes en tiempo real (simulados)
- Perfil de usuario integrado

### 🎯 Landing Page Completa
- Hero section con animaciones
- Sección de características
- Proceso de implementación
- Testimonios y estadísticas
- Formulario de contacto

### ⚡ Características Técnicas
- **Diseño Responsivo**: Optimizado para todos los dispositivos
- **Animaciones Suaves**: Transiciones y efectos visuales profesionales
- **Rendimiento Optimizado**: Carga rápida con Vite
- **Componentes Modulares**: Código organizado y mantenible
- **TypeScript Ready**: Fácil migración a TypeScript

## 🛠️ Tecnologías

- **React 18**: Framework de UI moderno
- **Vite**: Build tool ultra-rápido
- **TailwindCSS**: Framework de CSS utility-first con tema oscuro
- **Supabase**: Backend as a Service para autenticación
- **React Router DOM**: Navegación y rutas protegidas
- **Lucide React**: Iconos modernos y elegantes
- **Framer Motion**: Animaciones fluidas

## 📦 Instalación Rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

**📖 Para instrucciones detalladas de configuración de Supabase, consulta [SETUP.md](./SETUP.md)**

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
```

### 4. Abrir en el navegador
```
http://localhost:5173
```

## 🏗️ Estructura del Proyecto

```
mvp-inga-franco/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── Navbar.jsx        # Navegación con links a auth
│   │   ├── Hero.jsx          # Hero con tema oscuro
│   │   ├── Features.jsx      # Características
│   │   ├── HowItWorks.jsx    # Proceso de implementación
│   │   ├── Benefits.jsx      # Beneficios y testimonios
│   │   ├── CTA.jsx           # Formulario de contacto
│   │   ├── Footer.jsx        # Footer
│   │   └── ProtectedRoute.jsx # HOC para rutas protegidas
│   ├── pages/                # Páginas principales
│   │   ├── Landing.jsx       # Landing page completa
│   │   ├── Login.jsx         # Página de inicio de sesión
│   │   ├── Register.jsx      # Página de registro
│   │   └── Chat.jsx          # Interfaz de chat estilo ChatGPT
│   ├── context/
│   │   └── AuthContext.jsx   # Contexto de autenticación
│   ├── lib/
│   │   └── supabase.js       # Cliente de Supabase
│   ├── App.jsx               # Configuración de rutas
│   ├── main.jsx              # Punto de entrada
│   └── index.css             # Estilos globales con tema oscuro
├── .env.example              # Ejemplo de variables de entorno
├── SETUP.md                  # Guía detallada de configuración
├── README.md                 # Este archivo
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js        # Configuración con tema oscuro
└── postcss.config.js
```

## 🎯 Rutas de la Aplicación

1. **`/`** - Landing Page (pública)
   - Hero con animaciones
   - Características del producto
   - Proceso de implementación
   - Beneficios y testimonios
   - Formulario de contacto

2. **`/login`** - Inicio de Sesión (pública)
   - Formulario de login con validación
   - Integración con Supabase Auth
   - Redirección automática al chat

3. **`/register`** - Registro (pública)
   - Formulario de registro completo
   - Validación de contraseñas
   - Creación de cuenta en Supabase

4. **`/chat`** - Interfaz de Chat (protegida)
   - Chat estilo ChatGPT
   - Sidebar con historial
   - Perfil de usuario
   - Cierre de sesión

## 🎨 Paleta de Colores (Tema Oscuro)

- **Fondo Principal**: `#0f0f0f` (dark-bg)
- **Tarjetas**: `#1a1a1a` (dark-card)
- **Bordes**: `#2a2a2a` (dark-border)
- **Hover**: `#252525` (dark-hover)
- **Primario**: Gradiente azul-cyan (#0ea5e9 → #06b6d4)
- **Texto**: Blanco y grises claros para legibilidad
- **Acentos**: Múltiples gradientes para diferentes secciones

## 🚀 Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Personalización

### Cambiar Colores del Tema Oscuro

Edita `tailwind.config.js`:

```javascript
colors: {
  dark: {
    bg: '#0f0f0f',      // Fondo principal
    card: '#1a1a1a',    // Tarjetas
    border: '#2a2a2a',  // Bordes
    hover: '#252525',   // Estados hover
  },
}
```

### Modificar Contenido

- **Landing Page**: Edita componentes en `src/components/`
- **Páginas de Auth**: Edita `src/pages/Login.jsx` y `src/pages/Register.jsx`
- **Chat**: Edita `src/pages/Chat.jsx`

### Conectar IA Real

En `src/pages/Chat.jsx`, reemplaza la simulación con una API real:

```javascript
// Reemplaza el setTimeout con una llamada a tu API
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [...messages, { role: 'user', content: userMessage }],
  }),
})
```

## 🚀 Próximos Pasos

1. **Configurar Supabase** siguiendo [SETUP.md](./SETUP.md)
2. **Personalizar el contenido** según tu marca
3. **Conectar una IA real** (OpenAI, Anthropic, etc.)
4. **Agregar más funcionalidades**:
   - Historial de conversaciones persistente
   - Compartir chats
   - Exportar conversaciones
   - Temas personalizables
   - Multi-idioma

## 🐛 Solución de Problemas

### Error: "Invalid API key"
Verifica que las credenciales de Supabase en `.env` sean correctas.

### Los estilos no cargan
Ejecuta `npm install` y reinicia el servidor.

### Error de autenticación
Asegúrate de que el proveedor de Email esté habilitado en Supabase.

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de React Router](https://reactrouter.com)
- [Documentación de TailwindCSS](https://tailwindcss.com)
- [Guía de configuración completa](./SETUP.md)

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**Desarrollado con ❤️ para transformar PyMEs con IA**

✨ **Características**: Tema Oscuro | Autenticación | Chat IA | Diseño Profesional
"# mvp-IAempresas" 
