# 🔧 Configuración de Variables de Entorno en Netlify

## ⚠️ PROBLEMA ACTUAL

Tu sitio **https://iasolucions.netlify.app/** está desplegado pero muestra este error:

```
The OPENAI_API_KEY environment variable is missing or empty
```

Esto significa que **las variables de entorno NO están configuradas en Netlify**.

---

## ✅ SOLUCIÓN: Configurar Variables de Entorno

### Paso 1: Ir a la Configuración del Sitio

1. Ve a [Netlify Dashboard](https://app.netlify.com/)
2. Selecciona tu sitio **iasolucions**
3. Ve a **Site configuration** (en el menú lateral)
4. Haz clic en **Environment variables**

### Paso 2: Agregar las 3 Variables Requeridas

Haz clic en **"Add a variable"** y agrega cada una de estas:

#### Variable 1: VITE_SUPABASE_URL
```
Key: VITE_SUPABASE_URL
Value: https://ewotgkdjtgisxprsoddg.supabase.co
Scopes: ✅ All deploys
```

#### Variable 2: VITE_SUPABASE_ANON_KEY
```
Key: VITE_SUPABASE_ANON_KEY
Value: [Tu Supabase Anon Key - la encontrarás en tu archivo .env local]
Scopes: ✅ All deploys
```

Para obtener esta key:
1. Abre tu archivo `.env` local
2. Copia el valor de `VITE_SUPABASE_ANON_KEY`
3. O ve a [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API

#### Variable 3: VITE_OPENAI_API_KEY
```
Key: VITE_OPENAI_API_KEY
Value: [Tu OpenAI API Key - empieza con sk-...]
Scopes: ✅ All deploys
```

Para obtener esta key:
1. Abre tu archivo `.env` local
2. Copia el valor de `VITE_OPENAI_API_KEY`
3. O ve a [OpenAI Platform](https://platform.openai.com/api-keys)

### Paso 3: Guardar y Re-desplegar

1. Después de agregar las 3 variables, haz clic en **"Save"**
2. Ve a **Deploys**
3. Haz clic en **"Trigger deploy"** → **"Clear cache and deploy site"**
4. Espera 2-3 minutos a que termine el despliegue

---

## 🔍 Verificar que las Variables Están Configuradas

### En Netlify:
1. Ve a **Site configuration** → **Environment variables**
2. Deberías ver las 3 variables listadas:
   - ✅ VITE_SUPABASE_URL
   - ✅ VITE_SUPABASE_ANON_KEY
   - ✅ VITE_OPENAI_API_KEY

### En tu Sitio:
1. Abre https://iasolucions.netlify.app/
2. Abre la consola del navegador (F12)
3. Ya NO deberías ver el error de OpenAI
4. Deberías poder:
   - ✅ Registrarte/Iniciar sesión
   - ✅ Ver el dashboard
   - ✅ Usar el chat con IA

---

## 📋 Configuración Adicional de Supabase

### Actualizar URLs Permitidas

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **URL Configuration**
4. Actualiza estos campos:

**Site URL:**
```
https://iasolucions.netlify.app
```

**Redirect URLs:** (agrega estas líneas)
```
https://iasolucions.netlify.app
https://iasolucions.netlify.app/**
https://iasolucions.netlify.app/login
https://iasolucions.netlify.app/register
https://iasolucions.netlify.app/dashboard
```

5. Haz clic en **"Save"**

---

## 🎯 Checklist de Verificación

Marca cada item cuando lo completes:

- [ ] Variables de entorno agregadas en Netlify (3 variables)
- [ ] Sitio re-desplegado con "Clear cache and deploy"
- [ ] URLs actualizadas en Supabase
- [ ] Sitio carga sin errores en la consola
- [ ] Puedo registrarme/iniciar sesión
- [ ] El dashboard muestra datos
- [ ] El chat con IA funciona

---

## 🐛 Si Aún Hay Problemas

### Error: "API Key inválida"
**Solución:** Verifica que la API Key de OpenAI sea correcta y tenga créditos disponibles.

### Error: "Supabase connection failed"
**Solución:** Verifica que las credenciales de Supabase sean correctas.

### Error: "Cannot read properties of undefined"
**Solución:** Limpia el cache de Netlify y re-despliega.

### El sitio no carga
**Solución:** 
1. Verifica que el build haya terminado exitosamente
2. Revisa los logs de build en Netlify
3. Asegúrate de que no haya errores de sintaxis

---

## 📞 Comandos Útiles

### Ver logs de build en Netlify:
1. Ve a **Deploys**
2. Haz clic en el último deploy
3. Revisa el **Deploy log**

### Limpiar cache y re-desplegar:
1. Ve a **Deploys**
2. **Trigger deploy** → **Clear cache and deploy site**

---

## ✅ Resultado Esperado

Después de seguir estos pasos, tu sitio en **https://iasolucions.netlify.app/** debería:

- ✅ Cargar sin errores
- ✅ Permitir registro e inicio de sesión
- ✅ Mostrar el dashboard con datos
- ✅ Procesar facturas con OCR
- ✅ Responder en el chat con IA
- ✅ Funcionar completamente como en local

---

## 🎉 ¡Listo!

Una vez configuradas las variables de entorno, tu aplicación estará **100% funcional en línea**.

**URL de tu aplicación:** https://iasolucions.netlify.app/
