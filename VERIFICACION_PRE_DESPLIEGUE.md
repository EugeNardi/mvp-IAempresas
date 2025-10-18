# ✅ Verificación Pre-Despliegue

Usa esta checklist antes de desplegar para asegurarte de que todo está listo.

## 🔍 Verificaciones Locales

### 1. Archivos de Configuración
- [x] `netlify.toml` existe en la raíz del proyecto
- [x] `public/_redirects` existe
- [x] `vite.config.js` está optimizado
- [x] `.gitignore` incluye `.env` y `node_modules`
- [x] `.env.example` está actualizado

### 2. Variables de Entorno
Verifica que tu archivo `.env` tenga todas estas variables:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_OPENAI_API_KEY=sk-proj-...
```

### 3. Prueba Local de Build

Ejecuta estos comandos para verificar que el build funciona:

```bash
# Instalar dependencias
npm install

# Probar el build
npm run build

# Probar el preview del build
npm run preview
```

Si todo funciona correctamente, deberías poder abrir `http://localhost:4173` y ver tu aplicación.

### 4. Verificar Dependencias

Asegúrate de que todas las dependencias estén en `package.json`:

```bash
npm list --depth=0
```

## 🗄️ Verificaciones de Supabase

### 1. Tablas Creadas
Verifica que estas tablas existan en tu base de datos:

- [ ] `profiles`
- [ ] `invoices`
- [ ] `products`
- [ ] `chat_messages`
- [ ] `excel_imports`

### 2. Políticas de Seguridad (RLS)
Verifica que las políticas RLS estén habilitadas:

```sql
-- Ejecuta esto en el SQL Editor de Supabase
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 3. Storage Buckets
Verifica que existan estos buckets:

- [ ] `invoices` (para PDFs de facturas)
- [ ] `excel-files` (para archivos Excel)

## 🔐 Verificaciones de Seguridad

### 1. Credenciales
- [ ] El archivo `.env` NO está en el repositorio
- [ ] Las API keys son válidas y tienen créditos/límites suficientes
- [ ] Las credenciales de Supabase son de producción (no de desarrollo)

### 2. Permisos de Supabase
- [ ] Las políticas RLS están configuradas correctamente
- [ ] Los buckets de storage tienen las políticas correctas
- [ ] La autenticación está habilitada

## 🧪 Pruebas Funcionales

Antes de desplegar, prueba localmente:

### Autenticación
- [ ] Registro de nuevo usuario funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Redirección a login cuando no está autenticado

### Dashboard
- [ ] Se cargan las estadísticas
- [ ] Los gráficos se muestran correctamente
- [ ] Los datos son precisos

### Facturas
- [ ] Se pueden subir facturas PDF
- [ ] El OCR extrae la información correctamente
- [ ] Las facturas se guardan en la base de datos
- [ ] Se pueden ver las facturas subidas

### Inventario
- [ ] Se pueden agregar productos
- [ ] Se pueden editar productos
- [ ] Se pueden eliminar productos
- [ ] Los productos se sincronizan con las facturas

### Chat IA
- [ ] El chat responde correctamente
- [ ] Las respuestas son relevantes
- [ ] El historial se guarda

### Excel
- [ ] Se pueden importar archivos Excel
- [ ] Los datos se procesan correctamente
- [ ] Se pueden exportar reportes

## 📦 Preparación del Repositorio

### 1. Limpieza
Elimina archivos innecesarios antes de subir:

```bash
# Eliminar node_modules si existe
rm -rf node_modules

# Eliminar dist si existe
rm -rf dist

# Eliminar archivos de log
rm -f *.log
```

### 2. Commit Final
```bash
git status
git add .
git commit -m "Preparar para despliegue en producción"
```

## 🚀 Lista para Netlify

Antes de conectar con Netlify, asegúrate de tener:

- [ ] Cuenta de Netlify creada
- [ ] Repositorio en GitHub con el código
- [ ] Variables de entorno anotadas en un lugar seguro
- [ ] URLs de Supabase anotadas

## 📋 Información que Necesitarás

Anota esta información antes de empezar:

### Supabase
```
Project URL: _______________________________
Anon Key: __________________________________
```

### OpenAI
```
API Key: ___________________________________
```

### GitHub
```
Repository URL: ____________________________
```

### Netlify
```
Site Name (deseado): _______________________
```

## ⚠️ Advertencias Importantes

1. **NO subas el archivo `.env` a GitHub**
2. **NO compartas tus API keys públicamente**
3. **Configura las variables de entorno en Netlify ANTES del primer despliegue**
4. **Actualiza las URLs permitidas en Supabase DESPUÉS del despliegue**

## 🎯 Siguiente Paso

Si todas las verificaciones están completas, sigue la guía:
👉 **GUIA_DESPLIEGUE_NETLIFY.md**

---

**¿Todo listo? ¡Adelante con el despliegue! 🚀**
