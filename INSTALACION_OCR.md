# 📦 Instalación de Dependencias OCR

## Paso 1: Instalar Dependencias

Ejecuta el siguiente comando en la terminal para instalar las librerías necesarias para el procesamiento OCR:

```bash
npm install tesseract.js pdfjs-dist
```

## Paso 2: Verificar Instalación

Después de la instalación, verifica que las dependencias estén en tu `package.json`:

```json
"dependencies": {
  "tesseract.js": "^5.0.4",
  "pdfjs-dist": "^3.11.174"
}
```

## 📚 Librerías Instaladas

### 1. **Tesseract.js**
- **Propósito:** OCR (Reconocimiento Óptico de Caracteres)
- **Uso:** Extrae texto de imágenes (JPG, PNG)
- **Idioma:** Configurado para español ('spa')
- **Características:**
  - Procesamiento en el navegador
  - No requiere backend
  - Progreso en tiempo real

### 2. **PDF.js**
- **Propósito:** Procesamiento de archivos PDF
- **Uso:** Extrae texto de documentos PDF
- **Características:**
  - Librería oficial de Mozilla
  - Extracción de texto nativo
  - Soporte para múltiples páginas

## 🔧 Configuración

El servicio de procesamiento está configurado en:
```
src/services/invoiceProcessor.js
```

### Configuración de PDF.js Worker

El worker de PDF.js se carga desde CDN:
```javascript
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
```

## 🚀 Funcionalidades Implementadas

### Extracción Automática de Datos

El sistema extrae automáticamente:

1. **Tipo de Factura:**
   - 🛒 Compra (Gasto)
   - 📈 Venta (Ingreso)
   - Detección por palabras clave

2. **Número de Factura:**
   - Patrones: FAC-XXXX, A-XXXX-XXXX
   - Generación automática si no se encuentra

3. **Fecha:**
   - Formatos: DD/MM/YYYY, DD-MM-YYYY
   - Fecha actual si no se encuentra

4. **Monto:**
   - Busca "Total", "Importe", símbolos $
   - Limpieza de formato (puntos, comas)

5. **Categoría:**
   - Ventas, Servicios (para ingresos)
   - Compras, Gastos Operativos, Sueldos, Impuestos (para gastos)

6. **Descripción:**
   - Extracción de líneas relevantes
   - Generación automática si no se encuentra

## 📊 Algoritmos de Detección

### Detección de Tipo (Compra vs Venta)

```javascript
// Palabras clave para COMPRAS
- proveedor, compra, adquisición, orden de compra, remito, debe

// Palabras clave para VENTAS
- cliente, venta, haber, cobro, ingreso
```

### Extracción de Montos

```javascript
// Patrones de búsqueda
1. total|importe|monto: $XXX.XX
2. $XXX.XX
3. XXX.XX pesos|ars|usd
```

### Categorización Automática

```javascript
// Para INGRESOS
- "servicio" o "consultoría" → Servicios
- Otros → Ventas

// Para GASTOS
- "sueldo" o "salario" → Sueldos
- "impuesto" o "tasa" → Impuestos
- "alquiler" o "luz" → Gastos Operativos
- "compra" o "mercadería" → Compras
```

## 🎯 Tipos de Archivo Soportados

- ✅ **PDF** (.pdf) - Extracción de texto nativo
- ✅ **Imágenes** (.jpg, .jpeg, .png) - OCR con Tesseract
- ❌ **Otros formatos** - No soportados

## ⚡ Rendimiento

### Tiempos Estimados

- **PDF (1 página):** ~2-3 segundos
- **Imagen (buena calidad):** ~5-10 segundos
- **Imagen (baja calidad):** ~15-20 segundos

### Optimizaciones

- Procesamiento asíncrono
- Barra de progreso en tiempo real
- Procesamiento en lote de múltiples archivos
- Manejo de errores robusto

## 🐛 Solución de Problemas

### Error: "Worker no encontrado"

**Solución:** Verificar que el CDN de PDF.js esté accesible.

### OCR no reconoce texto

**Causas comunes:**
- Imagen de baja calidad
- Texto muy pequeño
- Imagen rotada
- Idioma incorrecto

**Soluciones:**
- Usar imágenes de alta resolución
- Asegurar que el texto sea legible
- Rotar la imagen antes de subir

### Extracción incorrecta de datos

**Solución:** Usar el ingreso manual para corregir datos.

## 📝 Notas Importantes

1. **Precisión del OCR:**
   - Depende de la calidad de la imagen
   - Funciona mejor con texto impreso claro
   - Puede tener errores con escritura a mano

2. **Privacidad:**
   - Todo el procesamiento ocurre en el navegador
   - No se envían datos a servidores externos
   - Los archivos no se almacenan

3. **Limitaciones:**
   - Tamaño máximo recomendado: 10MB por archivo
   - Mejor rendimiento con archivos pequeños
   - El OCR consume recursos del navegador

## 🔄 Flujo de Procesamiento

```
1. Usuario sube archivo(s)
   ↓
2. Detectar tipo (PDF o Imagen)
   ↓
3. Extraer texto
   - PDF: PDF.js
   - Imagen: Tesseract OCR
   ↓
4. Analizar texto extraído
   - Detectar tipo (compra/venta)
   - Extraer número, fecha, monto
   - Categorizar automáticamente
   ↓
5. Crear objeto de factura
   ↓
6. Agregar a lista de facturas
   ↓
7. Actualizar reportes financieros
```

## 🎨 Interfaz de Usuario

### Indicadores Visuales

- 🛒 **Compra** - Badge rojo
- 📈 **Venta** - Badge verde
- 🤖 **OCR** - Badge azul (procesado automáticamente)
- ✍️ **Manual** - Sin badge OCR

### Progreso de Procesamiento

- Spinner animado
- Mensaje de estado
- Barra de progreso (0-100%)
- Contador de archivos (X de Y)

## 🚀 Próximas Mejoras

1. **Mejora de Precisión:**
   - Entrenar modelo personalizado
   - Validación de datos extraídos
   - Sugerencias de corrección

2. **Más Formatos:**
   - Soporte para Excel
   - Soporte para Word
   - Soporte para XML (AFIP)

3. **Integración AFIP:**
   - Validación de CUIT
   - Verificación de facturas
   - Descarga automática

4. **Machine Learning:**
   - Aprendizaje de patrones
   - Mejora automática con uso
   - Categorización inteligente

---

**¡Listo para procesar facturas con IA! 🎉**
