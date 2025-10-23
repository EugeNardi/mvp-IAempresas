# 🎤 Configuración de Grabación de Audio con IA

## 🚀 Funcionalidad Implementada

Ahora puedes **grabar audio** directamente desde cualquier modal de movimiento y la IA procesará automáticamente la información para completar el formulario.

### ✨ Características

- 🎙️ **Grabación de audio** directamente desde el navegador
- 🤖 **Transcripción automática** con OpenAI Whisper
- 🧠 **Procesamiento inteligente** con GPT-4 para extraer datos estructurados
- ✅ **Autocompletado** de formularios con la información detectada
- 🌐 **Soporte multilenguaje** (optimizado para español)
- 📊 **Extracción de productos** con cantidades y precios

---

## 🔧 Configuración Requerida

### Paso 1: Obtener API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Inicia sesión o crea una cuenta
3. Navega a **API Keys** en el menú
4. Haz clic en **Create new secret key**
5. Copia la clave generada (empieza con `sk-...`)

### Paso 2: Configurar Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto (si no existe)
2. Agrega tu API Key:

```env
VITE_OPENAI_API_KEY=sk-tu-clave-aqui
```

3. **IMPORTANTE**: Nunca compartas tu API Key ni la subas a Git
4. El archivo `.env` ya está en `.gitignore`

### Paso 3: Instalar Dependencias (si es necesario)

```bash
npm install
```

### Paso 4: Reiniciar el Servidor de Desarrollo

```bash
npm run dev
```

---

## 📝 Cómo Usar

### Grabar Audio para Ventas

1. Abre el modal de "Nueva Venta"
2. En la sección "Análisis Automático con IA"
3. Haz clic en **"Grabar Audio"**
4. Permite el acceso al micrófono cuando el navegador lo solicite
5. Habla claramente describiendo la venta:

**Ejemplo de audio:**
> "Hice una venta a Juan Pérez por 50,000 pesos. Vendí 10 unidades de producto A a 5,000 pesos cada una. El pago fue por transferencia y ya está cobrado."

6. Haz clic en **"Detener y Procesar"**
7. Espera mientras la IA transcribe y procesa (10-15 segundos)
8. Revisa los datos autocompletados
9. Ajusta si es necesario
10. Guarda el movimiento

### Grabar Audio para Compras

**Ejemplo de audio:**
> "Compré mercadería al proveedor ABC por 30,000 pesos. Son 20 unidades de materia prima a 1,500 pesos cada una. Pagué en efectivo y ya está pagado."

### Grabar Audio para Gastos

**Ejemplo de audio:**
> "Pagué el alquiler de la oficina, 80,000 pesos a la inmobiliaria XYZ. Fue por transferencia el día de hoy. Es un gasto mensual recurrente."

### Grabar Audio para Aportes

**Ejemplo de audio:**
> "María Gómez hizo un aporte de capital de 200,000 pesos por transferencia. Representa el 25% de participación y se usará para expansión del negocio."

### Grabar Audio para Retiros

**Ejemplo de audio:**
> "Retiro de dividendos para el socio principal por 150,000 pesos. Autorizado por gerencia general, pago por transferencia."

---

## 🎯 Datos que la IA Puede Extraer

### Para Ventas
- ✅ Cliente
- ✅ Tipo (minorista/mayorista)
- ✅ Fecha
- ✅ Medio de pago
- ✅ Estado de cobro
- ✅ Productos (nombre, cantidad, precio unitario, descuento)
- ✅ Descripción

### Para Compras
- ✅ Proveedor
- ✅ Tipo
- ✅ Fecha
- ✅ Medio de pago
- ✅ Estado de pago
- ✅ Productos (categoría, nombre, cantidad, costos, precios de venta)
- ✅ Descripción

### Para Gastos
- ✅ Concepto
- ✅ Beneficiario
- ✅ Fecha
- ✅ Monto
- ✅ Medio de pago
- ✅ Estado de pago
- ✅ Categoría
- ✅ Recurrencia (si/no)
- ✅ Frecuencia (mensual, quincenal, etc.)
- ✅ Descripción

### Para Aportes
- ✅ Aportante
- ✅ Fecha
- ✅ Monto
- ✅ Medio de pago
- ✅ Tipo de aporte
- ✅ Porcentaje de participación
- ✅ Destino de fondos
- ✅ Descripción

### Para Retiros
- ✅ Beneficiario
- ✅ Fecha
- ✅ Monto
- ✅ Medio de pago
- ✅ Tipo de retiro
- ✅ Autorizado por
- ✅ Concepto
- ✅ Descripción

---

## 💡 Consejos para Mejores Resultados

### 🎤 Al Grabar Audio

1. **Habla claro y pausado**
2. **Menciona los datos importantes**:
   - Nombres (cliente, proveedor, beneficiario)
   - Montos exactos
   - Cantidades de productos
   - Precios unitarios
   - Método de pago
   - Estado (pagado/pendiente, cobrado/pendiente)

3. **Usa un ambiente silencioso**
4. **Mantén el micrófono cerca**
5. **Evita ruidos de fondo**

### 📊 Estructura Recomendada

**Para ventas/compras:**
> "[Tipo de operación] a/de [nombre] por [monto total]. [Cantidad] unidades de [producto] a [precio unitario] cada una. Pago por [método] y [estado]."

**Para gastos:**
> "Pagué [concepto] por [monto] a [beneficiario]. Fue por [método]. [Si es recurrente: Es un gasto [frecuencia]]."

**Para aportes/retiros:**
> "[Tipo] de [nombre] por [monto]. [Método de pago]. [Detalles adicionales]."

---

## 🔍 Proceso Técnico

### 1. Grabación
- Se usa la API `MediaRecorder` del navegador
- Audio en formato WebM
- Calidad optimizada (44.1kHz, cancelación de eco, reducción de ruido)

### 2. Transcripción
- Se envía el audio a OpenAI Whisper API
- Modelo: `whisper-1`
- Idioma: Español
- Resultado: Texto transcrito

### 3. Procesamiento
- El texto se envía a GPT-4o-mini
- Prompts especializados por tipo de movimiento
- Extracción de datos estructurados en JSON
- Validación y mapeo al formato del formulario

### 4. Autocompletado
- Los datos extraídos se cargan en el formulario
- Se muestra un mensaje de confirmación
- El usuario puede revisar y ajustar antes de guardar

---

## 💰 Costos de OpenAI

### Whisper (Transcripción)
- **$0.006 por minuto** de audio
- Ejemplo: 1 minuto de audio = $0.006 USD

### GPT-4o-mini (Procesamiento)
- **Input**: ~$0.15 por 1M tokens
- **Output**: ~$0.60 por 1M tokens
- Ejemplo: Procesar 1 audio típico = ~$0.001 USD

### Costo Total Estimado
- **Por movimiento con audio**: ~$0.007 - $0.01 USD
- **100 movimientos**: ~$0.70 - $1.00 USD
- **1000 movimientos**: ~$7.00 - $10.00 USD

💡 **Tip**: Los costos son muy bajos. Con $10 USD puedes procesar ~1000 movimientos.

---

## 🛠️ Solución de Problemas

### Error: "API Key de OpenAI no configurada"
**Solución**: 
1. Verifica que el archivo `.env` existe
2. Verifica que la variable `VITE_OPENAI_API_KEY` está configurada
3. Reinicia el servidor de desarrollo

### Error: "Permiso de micrófono denegado"
**Solución**:
1. Haz clic en el ícono de candado en la barra de direcciones
2. Permite el acceso al micrófono
3. Recarga la página
4. Intenta grabar nuevamente

### Error: "No se encontró ningún micrófono"
**Solución**:
1. Verifica que tu dispositivo tiene micrófono
2. Verifica que el micrófono está conectado
3. Verifica los permisos del sistema operativo
4. Prueba con otro navegador

### La transcripción no es precisa
**Solución**:
1. Habla más claro y pausado
2. Reduce el ruido de fondo
3. Acerca el micrófono
4. Usa un micrófono de mejor calidad
5. Graba en un ambiente más silencioso

### Los datos extraídos son incorrectos
**Solución**:
1. Sé más específico al describir
2. Menciona todos los datos importantes
3. Usa la estructura recomendada
4. Revisa y ajusta manualmente los campos

---

## 🔐 Seguridad

### Buenas Prácticas

1. ✅ **Nunca compartas tu API Key**
2. ✅ **No subas el archivo `.env` a Git**
3. ✅ **Usa variables de entorno**
4. ✅ **Monitorea el uso de tu API**
5. ✅ **Establece límites de gasto en OpenAI**

### Configurar Límites en OpenAI

1. Ve a [OpenAI Usage](https://platform.openai.com/usage)
2. Configura **Usage limits**
3. Establece un límite mensual (ej: $10)
4. Activa notificaciones de uso

---

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Edge 79+
- ✅ Safari 14.1+
- ✅ Opera 47+

### Dispositivos
- ✅ PC/Laptop con micrófono
- ✅ Smartphones (Android/iOS)
- ✅ Tablets
- ⚠️ Requiere conexión a internet

---

## 🎓 Ejemplos Completos

### Ejemplo 1: Venta Completa
**Audio:**
> "Vendí a la empresa TechCorp 15 laptops Dell a 80,000 pesos cada una, con un descuento del 5%. El total fue de 1,140,000 pesos. El pago fue por transferencia bancaria y ya está cobrado. La venta fue mayorista."

**Resultado:**
- Cliente: TechCorp
- Tipo: Mayorista
- Productos: 15 laptops Dell
- Precio unitario: $80,000
- Descuento: 5%
- Total: $1,140,000
- Medio: Transferencia
- Estado: Cobrado

### Ejemplo 2: Compra con Múltiples Productos
**Audio:**
> "Compré al proveedor Mayorista SA: 50 unidades de producto A a 1,200 pesos, 30 unidades de producto B a 800 pesos, y 20 unidades de producto C a 1,500 pesos. El total fue de 114,000 pesos. Pagué con cheque y está pendiente de pago."

**Resultado:**
- Proveedor: Mayorista SA
- Producto 1: 50 unidades de A a $1,200
- Producto 2: 30 unidades de B a $800
- Producto 3: 20 unidades de C a $1,500
- Total: $114,000
- Medio: Cheque
- Estado: Pendiente

### Ejemplo 3: Gasto Recurrente
**Audio:**
> "Pagué el servicio de internet empresarial a Telecom por 15,000 pesos. Fue por débito automático. Es un gasto mensual recurrente de servicios."

**Resultado:**
- Concepto: Servicio de internet
- Beneficiario: Telecom
- Monto: $15,000
- Medio: Débito automático
- Categoría: Servicios
- Recurrente: Sí
- Frecuencia: Mensual

---

## 🚀 Próximas Mejoras

- [ ] Soporte para múltiples idiomas
- [ ] Procesamiento de imágenes con OCR
- [ ] Detección automática de tipo de movimiento
- [ ] Sugerencias inteligentes basadas en historial
- [ ] Integración con WhatsApp para enviar audios
- [ ] Modo offline con procesamiento local
- [ ] Análisis de sentimiento y alertas
- [ ] Exportación de transcripciones

---

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa esta documentación
2. Verifica la consola del navegador para errores
3. Verifica tu saldo en OpenAI
4. Contacta al equipo de desarrollo

---

**¡Disfruta de la nueva funcionalidad de audio con IA!** 🎉
