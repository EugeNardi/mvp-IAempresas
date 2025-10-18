# 🚀 Guía de Despliegue en Netlify

Esta guía te llevará paso a paso para desplegar tu aplicación en Netlify y tenerla funcionando en línea.

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener:

1. ✅ Una cuenta en [Netlify](https://www.netlify.com/) (es gratis)
2. ✅ Tu proyecto de Supabase configurado y funcionando
3. ✅ Tu API Key de OpenAI
4. ✅ Git instalado en tu computadora

---

## 🔧 Paso 1: Preparar el Repositorio en GitHub

### 1.1 Crear un repositorio en GitHub

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Haz clic en el botón **"New"** o **"+"** → **"New repository"**
3. Nombra tu repositorio (ejemplo: `mvp-iaempresas`)
4. Selecciona **"Private"** si quieres mantenerlo privado
5. **NO** inicialices con README, .gitignore o licencia
6. Haz clic en **"Create repository"**

### 1.2 Subir tu código a GitHub

Abre la terminal en la carpeta de tu proyecto y ejecuta:

```bash
# Si aún no has inicializado git
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Preparar proyecto para despliegue en Netlify"

# Conectar con tu repositorio de GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# Subir el código
git branch -M main
git push -u origin main
```

**⚠️ IMPORTANTE:** Verifica que tu archivo `.env` esté en el `.gitignore` para no subir tus credenciales.

---

## 🌐 Paso 2: Desplegar en Netlify

### 2.1 Conectar Netlify con GitHub

1. Ve a [Netlify](https://app.netlify.com/) e inicia sesión
2. Haz clic en **"Add new site"** → **"Import an existing project"**
3. Selecciona **"Deploy with GitHub"**
4. Autoriza a Netlify para acceder a tu cuenta de GitHub
5. Busca y selecciona tu repositorio

### 2.2 Configurar el Build

Netlify debería detectar automáticamente la configuración desde `netlify.toml`, pero verifica:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18

Haz clic en **"Deploy site"**

---

## 🔐 Paso 3: Configurar Variables de Entorno

**⚠️ CRÍTICO:** Tu aplicación NO funcionará sin estas variables.

### 3.1 Obtener tus credenciales de Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com/dashboard)
2. Ve a **Settings** → **API**
3. Copia:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon/public key** (la clave pública)

### 3.2 Obtener tu API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una nueva API key o usa una existente
3. Copia la clave (empieza con `sk-...`)

### 3.3 Agregar las variables en Netlify

1. En tu sitio de Netlify, ve a **Site configuration** → **Environment variables**
2. Haz clic en **"Add a variable"** y agrega las siguientes:

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Tu URL de Supabase | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Tu anon key de Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_OPENAI_API_KEY` | Tu API key de OpenAI | `sk-proj-...` |

3. Haz clic en **"Save"** después de agregar cada variable

---

## 🔄 Paso 4: Re-desplegar con las Variables

1. Ve a **Deploys** en tu sitio de Netlify
2. Haz clic en **"Trigger deploy"** → **"Deploy site"**
3. Espera a que termine el despliegue (2-3 minutos)

---

## ✅ Paso 5: Verificar el Despliegue

### 5.1 Probar la aplicación

1. Una vez completado el despliegue, haz clic en el enlace de tu sitio (ejemplo: `https://tu-sitio.netlify.app`)
2. Verifica que:
   - ✅ La página de inicio carga correctamente
   - ✅ Puedes registrarte/iniciar sesión
   - ✅ El dashboard funciona
   - ✅ Puedes subir facturas
   - ✅ El chat con IA responde

### 5.2 Configurar un dominio personalizado (Opcional)

1. En Netlify, ve a **Domain management**
2. Haz clic en **"Add custom domain"**
3. Sigue las instrucciones para conectar tu dominio

---

## 🔧 Paso 6: Configurar Supabase para Producción

### 6.1 Actualizar las URL permitidas

1. Ve a tu proyecto en Supabase
2. Ve a **Authentication** → **URL Configuration**
3. Agrega tu URL de Netlify a:
   - **Site URL:** `https://tu-sitio.netlify.app`
   - **Redirect URLs:** `https://tu-sitio.netlify.app/**`

---

## 🐛 Solución de Problemas Comunes

### Problema: La página muestra "Page Not Found"

**Solución:** Verifica que el archivo `netlify.toml` y `public/_redirects` existan en tu repositorio.

### Problema: Error de autenticación con Supabase

**Solución:** 
1. Verifica que las variables de entorno estén correctamente configuradas
2. Asegúrate de haber agregado la URL de Netlify en Supabase

### Problema: El chat de IA no funciona

**Solución:**
1. Verifica que `VITE_OPENAI_API_KEY` esté configurada
2. Asegúrate de tener créditos en tu cuenta de OpenAI
3. Revisa los logs en la consola del navegador (F12)

### Problema: Build falla

**Solución:**
1. Revisa los logs de build en Netlify
2. Asegúrate de que todas las dependencias estén en `package.json`
3. Verifica que no haya errores de sintaxis en el código

---

## 📊 Paso 7: Monitorear tu Aplicación

### En Netlify:
- **Analytics:** Ve el tráfico y uso de tu sitio
- **Functions:** Monitorea las funciones serverless (si las usas)
- **Logs:** Revisa los logs de despliegue

### En Supabase:
- **Database:** Monitorea el uso de la base de datos
- **Auth:** Ve los usuarios registrados
- **Logs:** Revisa los logs de queries

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios en tu código:

```bash
# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push
```

Netlify detectará automáticamente los cambios y re-desplegará tu aplicación.

---

## 📞 Soporte

Si tienes problemas:

1. **Netlify:** [Documentación oficial](https://docs.netlify.com/)
2. **Supabase:** [Documentación oficial](https://supabase.com/docs)
3. **Vite:** [Documentación oficial](https://vitejs.dev/)

---

## 🎉 ¡Listo!

Tu aplicación ahora está en línea y funcionando. Comparte el enlace con tus usuarios:

**🌐 Tu aplicación:** `https://tu-sitio.netlify.app`

---

## 📝 Checklist Final

- [ ] Repositorio creado en GitHub
- [ ] Código subido a GitHub
- [ ] Sitio creado en Netlify
- [ ] Variables de entorno configuradas
- [ ] Sitio desplegado correctamente
- [ ] URLs configuradas en Supabase
- [ ] Aplicación probada y funcionando
- [ ] Dominio personalizado configurado (opcional)

---

**¡Felicidades! 🎊 Tu aplicación está en producción.**
