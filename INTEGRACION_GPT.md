# 🤖 Integración GPT - Chatbot Contable

## 📋 Descripción General

Chatbot inteligente integrado con **GPT-3.5-turbo** de OpenAI que tiene acceso completo a las facturas y datos financieros del usuario para proporcionar análisis y recomendaciones contables personalizadas.

---

## 🔑 Configuración de API Key

### Paso 1: Obtener API Key de OpenAI

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys** en tu perfil
4. Crea una nueva API Key
5. **Copia la key** (solo se muestra una vez)

### Paso 2: Configurar en tu Proyecto

Agrega la API Key a tu archivo `.env`:

```bash
VITE_OPENAI_API_KEY=sk-tu-api-key-aqui
```

⚠️ **IMPORTANTE:** 
- Nunca compartas tu API Key
- No la subas a GitHub
- El archivo `.env` está en `.gitignore`

---

## 📦 Instalación

```bash
npm install openai
```

Ya incluido en `package.json`:
```json
"openai": "^4.20.1"
```

---

## 🏗️ Arquitectura

### Componentes Creados

```
src/
├── context/
│   └── DataContext.jsx          # Contexto compartido de datos
├── services/
│   └── openaiService.js         # Servicio de integración GPT
└── pages/
    ├── Dashboard.jsx            # Actualizado con DataContext
    └── Chat.jsx                 # Actualizado con GPT
```

### Flujo de Datos

```
Usuario carga facturas en Dashboard
         ↓
Datos guardados en DataContext (global)
         ↓
Chat accede a los datos via useData()
         ↓
openaiService genera contexto financiero
         ↓
Contexto + Mensaje enviado a GPT-3.5
         ↓
Respuesta mostrada al usuario
```

---

## 🧠 Contexto Financiero

El chatbot tiene acceso a:

### 1. **Información de la Empresa**
- Razón Social
- CUIT
- Rubro/Industria
- Ejercicio Fiscal
- Moneda

### 2. **Resumen Financiero**
- Total de Facturas
- Facturas de Venta (cantidad)
- Facturas de Compra (cantidad)
- Total Ingresos ($)
- Total Gastos ($)
- Balance (positivo/negativo)

### 3. **Desglose por Categoría**
- Ingresos por categoría
- Gastos por categoría

### 4. **Facturas Recientes**
- Últimas 10 facturas con detalles:
  - Tipo (VENTA/COMPRA)
  - Número
  - Fecha
  - Monto
  - Categoría
  - Descripción

---

## 💬 Funcionalidades del Chatbot

### Preguntas que Puede Responder

✅ **Análisis Financiero:**
- "¿Cuál es mi situación financiera actual?"
- "¿Cuáles son mis mayores gastos?"
- "¿Cómo está mi margen de utilidad?"

✅ **Consultas Específicas:**
- "Muéstrame las facturas de este mes"
- "¿Cuánto gasté en sueldos?"
- "¿Cuál fue mi factura más grande?"

✅ **Recomendaciones:**
- "¿Cómo puedo reducir mis gastos?"
- "¿Qué puedo hacer con mis ganancias?"
- "¿Debo preocuparme por algo?"

✅ **Educación Contable:**
- "¿Qué es un balance general?"
- "¿Cómo interpretar el estado de resultados?"
- "¿Qué impuestos debo considerar?"

### Preguntas Sugeridas Dinámicas

El sistema genera automáticamente 4 preguntas sugeridas basadas en:
- Si hay facturas cargadas o no
- Si el balance es positivo o negativo
- Si el margen de utilidad es bajo
- Contexto financiero actual

---

## 🎯 Configuración del Prompt

### System Prompt

```javascript
Eres un asistente contable inteligente especializado en PyMEs argentinas.

Tu función es:
1. Analizar facturas y datos financieros
2. Responder preguntas sobre situación contable
3. Dar recomendaciones financieras
4. Explicar conceptos contables de manera simple
5. Ayudar con balance general y estado de resultados

IMPORTANTE:
- Usa lenguaje claro y profesional
- Proporciona números exactos cuando los tengas
- Si no tienes información suficiente, pídela
- Sé proactivo sugiriendo análisis útiles
- Usa formato de moneda argentina ($)
- Menciona las facturas específicas cuando sea relevante
```

### Parámetros de GPT

```javascript
{
  model: 'gpt-3.5-turbo',      // Modelo más básico y económico
  temperature: 0.7,             // Balance creatividad/precisión
  max_tokens: 500,              // Respuestas concisas
  presence_penalty: 0.6,        // Evita repetición
  frequency_penalty: 0.3        // Variedad en respuestas
}
```

---

## 🔄 Historial de Conversación

- Se mantienen los **últimos 10 mensajes** en contexto
- Permite conversaciones coherentes
- GPT recuerda el contexto de la charla
- Se puede iniciar nueva conversación con botón "Nueva Conversación"

---

## 🎨 Interfaz de Usuario

### Sidebar Izquierdo

**Datos Cargados:**
- Nombre de empresa (con indicador verde si existe)
- Rubro/Industria
- Total de facturas
- Desglose: Ventas vs Compras

**Preguntas Sugeridas:**
- 4 preguntas dinámicas
- Cambian según el contexto
- Click para enviar automáticamente

### Área de Chat

**Header:**
- Título: "Asistente Contable IA"
- Contador de facturas cargadas
- Indicador de modelo: "GPT-3.5"
- Alerta de error si hay problemas

**Mensajes:**
- Usuario: Fondo negro, texto blanco
- Asistente: Fondo blanco, borde gris
- Errores: Fondo rojo claro
- Indicador de carga: 3 puntos animados

---

## 💰 Costos de OpenAI

### GPT-3.5-turbo (Modelo Usado)

**Precios (Marzo 2024):**
- Input: $0.0005 por 1K tokens
- Output: $0.0015 por 1K tokens

**Ejemplo de Uso:**
- Mensaje típico: ~200 tokens
- Respuesta típica: ~300 tokens
- **Costo por mensaje: ~$0.0006 USD** (menos de 1 centavo)

**Estimación Mensual:**
- 100 mensajes/día = $1.80 USD/mes
- 500 mensajes/día = $9.00 USD/mes
- 1000 mensajes/día = $18.00 USD/mes

### Optimizaciones de Costo

✅ **Implementadas:**
- Límite de 500 tokens por respuesta
- Solo últimos 10 mensajes en contexto
- Modelo más económico (3.5 vs 4)

📝 **Futuras:**
- Cache de respuestas comunes
- Límite de mensajes por usuario
- Upgrade a GPT-4 solo para análisis complejos

---

## 🛡️ Manejo de Errores

### Errores Capturados

**401 - API Key Inválida:**
```
"API Key inválida. Por favor, configura tu VITE_OPENAI_API_KEY en el archivo .env"
```

**429 - Rate Limit:**
```
"Límite de rate excedido. Por favor, espera un momento e intenta de nuevo."
```

**500 - Error del Servidor:**
```
"Error en el servidor de OpenAI. Por favor, intenta de nuevo más tarde."
```

**Otros Errores:**
```
"Error al procesar tu mensaje: [mensaje de error]"
```

### Indicadores Visuales

- ❌ Mensaje de error en rojo
- 🔴 Indicador en header si hay error
- 🔄 Spinner mientras procesa
- ✅ Mensaje normal cuando funciona

---

## 🔒 Seguridad

### Buenas Prácticas Implementadas

✅ **API Key:**
- Almacenada en variable de entorno
- No expuesta en código
- `.env` en `.gitignore`

⚠️ **Advertencia:**
- `dangerouslyAllowBrowser: true` está habilitado
- **Solo para desarrollo/demo**
- En producción, usar backend proxy

### Recomendación para Producción

```javascript
// NO HACER (actual - solo demo):
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

// HACER (producción):
// 1. Crear endpoint en backend
// 2. Backend llama a OpenAI
// 3. Frontend llama a tu backend
```

---

## 📊 Funciones del Servicio

### `sendMessageToGPT()`

Envía mensaje a GPT con contexto financiero completo.

**Parámetros:**
- `userMessage`: Mensaje del usuario
- `companyData`: Datos de la empresa
- `invoices`: Array de facturas
- `conversationHistory`: Últimos mensajes

**Retorna:**
```javascript
{
  success: true,
  message: "Respuesta de GPT",
  usage: { /* tokens usados */ }
}
```

### `generateSuggestedQuestions()`

Genera 4 preguntas sugeridas dinámicas.

**Lógica:**
- Sin facturas → Preguntas básicas
- Con facturas → Preguntas sobre datos
- Balance negativo → Preguntas de optimización
- Margen bajo → Preguntas de mejora

### `generateFinancialContext()`

Construye el contexto financiero completo para GPT.

**Incluye:**
- Info de empresa
- Resumen financiero
- Desglose por categoría
- Facturas recientes

---

## 🚀 Ejemplos de Uso

### Ejemplo 1: Análisis General

**Usuario:**
```
¿Cuál es mi situación financiera actual?
```

**GPT (con contexto):**
```
Basándome en tus datos:

📊 Situación General: POSITIVA

Tienes 15 facturas cargadas:
- 8 facturas de venta: $125,450.00
- 7 facturas de compra: $89,320.00
- Balance: +$36,130.00 (28.8% de margen)

✅ Puntos Positivos:
- Balance positivo
- Margen saludable
- Más ventas que compras

⚠️ Áreas de Atención:
- Gastos operativos representan el 45% de tus ingresos
- Considera optimizar costos en "Sueldos" ($32,000)

¿Quieres que analice alguna categoría específica?
```

### Ejemplo 2: Consulta Específica

**Usuario:**
```
¿Cuánto gasté en sueldos este mes?
```

**GPT:**
```
Según tus facturas de compra en la categoría "Sueldos":

Total: $32,000.00

Desglose:
- FAC-1234 (15/03/2024): $18,000.00
- FAC-1245 (28/03/2024): $14,000.00

Esto representa el 25.5% de tus gastos totales.

💡 Recomendación: Este porcentaje está dentro del rango normal 
para PyMEs (20-30%). Si quieres reducir costos, considera 
automatizar procesos antes de reducir personal.
```

---

## 🐛 Solución de Problemas

### Error: "API Key inválida"

**Causa:** API Key no configurada o incorrecta

**Solución:**
1. Verifica que `.env` exista
2. Confirma que la key empiece con `sk-`
3. Reinicia el servidor de desarrollo
4. Verifica que no haya espacios extra

### Error: "Rate limit exceeded"

**Causa:** Demasiadas solicitudes

**Solución:**
1. Espera 1 minuto
2. Verifica tu plan de OpenAI
3. Considera upgrade si es frecuente

### GPT no tiene contexto de facturas

**Causa:** DataContext no compartido

**Solución:**
1. Verifica que `DataProvider` envuelva las rutas
2. Confirma que Dashboard use `setInvoices()`
3. Revisa que Chat use `useData()`

### Respuestas genéricas

**Causa:** Facturas no cargadas

**Solución:**
1. Ve a Dashboard
2. Carga facturas primero
3. Vuelve al Chat
4. Las preguntas sugeridas cambiarán

---

## 📈 Mejoras Futuras

### Corto Plazo

- [ ] Persistencia de conversaciones en Supabase
- [ ] Exportar conversación a PDF
- [ ] Modo voz (speech-to-text)
- [ ] Sugerencias de acciones

### Mediano Plazo

- [ ] Upgrade a GPT-4 para análisis complejos
- [ ] Fine-tuning con datos contables argentinos
- [ ] Integración con AFIP
- [ ] Gráficos generados por IA

### Largo Plazo

- [ ] Agente autónomo que procesa facturas
- [ ] Predicciones financieras
- [ ] Alertas proactivas
- [ ] Multi-idioma

---

## 📝 Notas Importantes

1. **Privacidad:** Los datos se envían a OpenAI. Lee sus [políticas de privacidad](https://openai.com/policies/privacy-policy)

2. **Precisión:** GPT puede cometer errores. Siempre verifica información crítica.

3. **Costos:** Monitorea tu uso en [platform.openai.com/usage](https://platform.openai.com/usage)

4. **Límites:** Free tier tiene límites. Considera plan pago para producción.

5. **Actualización:** OpenAI actualiza modelos regularmente. Revisa changelog.

---

**🎉 ¡Tu chatbot contable con IA está listo!**

Ahora puedes conversar con GPT sobre tus finanzas y recibir análisis personalizados basados en tus facturas reales.
