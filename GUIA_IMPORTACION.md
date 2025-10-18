# 📋 GUÍA DE IMPORTACIÓN - PASO A PASO

## ✅ SISTEMA COMPLETAMENTE FUNCIONAL

El sistema de importación inteligente está **100% operativo** con todas las mejoras implementadas.

---

## 🚀 CÓMO USAR LA IMPORTACIÓN

### Paso 1: Preparar la Base de Datos

**IMPORTANTE**: Antes de importar, asegúrate de que las tablas existan en Supabase.

#### Ejecutar en Supabase SQL Editor:
```sql
-- Copiar y pegar el contenido de supabase-inventory-schema.sql
-- O ejecutar manualmente estas tablas mínimas:

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sku VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  unit_measure VARCHAR(50) DEFAULT 'Unidad',
  energy_cost DECIMAL(15, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política de acceso
CREATE POLICY "Users can manage products of their company"
  ON products FOR ALL
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));
```

### Paso 2: Acceder al Importador

1. Inicia sesión en la aplicación
2. Ve a **Dashboard** → **Inventario**
3. Click en **"Importar Excel"** (botón verde)

### Paso 3: Subir tu Excel

1. **Click en "Seleccionar Archivo"**
2. Elige tu archivo Excel (.xlsx, .xls, .csv)
3. La IA comienza el análisis automáticamente

**El sistema detecta:**
- ✅ Columnas válidas (ignora vacías)
- ✅ Filas con datos (filtra vacías)
- ✅ Estructura del Excel
- ✅ Tipos de datos

### Paso 4: Revisar el Mapeo

**La IA sugiere automáticamente:**
```
Productos → Nombre del Producto
Cantidad → Stock/Cantidad
Costo unitario → Costo Unitario
Precio Minorista → Precio de Venta
```

**Si el mapeo no es correcto:**
1. Ajusta manualmente los dropdowns
2. Selecciona la columna correcta para cada campo
3. Los campos con * son obligatorios

**Campos requeridos:**
- ✅ Nombre del Producto
- ✅ Costo Unitario
- ✅ Precio de Venta

### Paso 5: Vista Previa

1. Click en **"Continuar →"**
2. Revisa la tabla de vista previa
3. Verifica que los datos sean correctos
4. Los productos con errores se marcan en rojo

**Indicadores:**
- ✅ Verde = Producto válido
- ❌ Rojo = Tiene errores (no se importará)

### Paso 6: Importar

1. Click en **"Importar X Productos"**
2. Espera a que termine (verás un spinner)
3. ¡Listo! Los productos se cargan automáticamente

**Mensaje de éxito:**
```
✓ ¡Importación Exitosa!
  Se importaron 15 de 15 productos
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "relation 'products' does not exist"

**Causa**: La tabla `products` no existe en Supabase

**Solución**:
1. Ve a Supabase → SQL Editor
2. Ejecuta el script `supabase-inventory-schema.sql`
3. Verifica que la tabla se creó correctamente
4. Intenta importar nuevamente

### Error: "No hay productos válidos para importar"

**Causa**: Todos los productos tienen errores de validación

**Solución**:
1. Revisa la vista previa
2. Verifica que los campos requeridos tengan datos:
   - Nombre no vacío
   - Costo > 0
   - Precio > 0
3. Ajusta el mapeo si es necesario
4. Corrige los datos en el Excel

### Error: "Faltan campos requeridos"

**Causa**: No se mapearon los campos obligatorios

**Solución**:
1. En el paso de mapeo, asegúrate de mapear:
   - Nombre del Producto (*)
   - Costo Unitario (*)
   - Precio de Venta (*)
2. Selecciona las columnas correctas
3. Click en "Continuar"

### Los botones no funcionan

**Causa**: Posible error de JavaScript

**Solución**:
1. Abre la consola del navegador (F12)
2. Revisa si hay errores en rojo
3. Recarga la página (Ctrl+R)
4. Intenta nuevamente

### La IA no detecta bien las columnas

**Causa**: Nombres de columnas poco claros

**Solución**:
1. Usa el mapeo manual
2. Ajusta los dropdowns manualmente
3. El sistema funciona igual de bien

---

## 📊 FORMATO DEL EXCEL

### Estructura Recomendada

```
| Productos | Cantidad | Costo unitario | Precio Minorista |
|-----------|----------|----------------|------------------|
| Laptop    | 10       | 45000          | 58000            |
| Mouse     | 50       | 1500           | 2400             |
```

### Columnas Soportadas

| Columna Excel | Campo Sistema | Requerido |
|---------------|---------------|-----------|
| Productos / Nombre | Nombre del Producto | ✅ Sí |
| SKU / Código | SKU/Código | No |
| Descripción | Descripción | No |
| Categoría | Categoría | No |
| Proveedor | Proveedor | No |
| Costo unitario / Costo | Costo Unitario | ✅ Sí |
| Precio / Precio Minorista | Precio de Venta | ✅ Sí |
| Cantidad / Stock | Stock/Cantidad | No |
| Stock mínimo | Stock Mínimo | No |
| Unidad | Unidad de Medida | No |
| Energía / Costo energía | Costo Energía | No |

### Formato de Datos

**Números:**
```
✅ 45000
✅ 45.000
✅ 45,000
✅ $45,000
✅ 45000.50
```

**Texto:**
```
✅ Laptop Dell Inspiron 15
✅ Mouse Logitech MX Master
✅ Teclado Mecánico RGB
```

**Cantidades:**
```
✅ 10
✅ 50
✅ 100
```

---

## 🎯 EJEMPLOS DE USO

### Ejemplo 1: Importación Básica

**Excel:**
```
| Productos | Cantidad | Costo | Precio |
|-----------|----------|-------|--------|
| Laptop    | 10       | 500   | 750    |
| Mouse     | 50       | 15    | 25     |
```

**Resultado:**
```
✓ 2 productos importados
  - Laptop: Stock 10, Costo $500, Precio $750
  - Mouse: Stock 50, Costo $15, Precio $25
```

### Ejemplo 2: Con Categorías

**Excel:**
```
| Productos | Categoría    | Cantidad | Costo | Precio |
|-----------|--------------|----------|-------|--------|
| Laptop    | Electrónica  | 10       | 500   | 750    |
| Mouse     | Electrónica  | 50       | 15    | 25     |
```

**Nota**: La categoría debe existir previamente en el sistema.

### Ejemplo 3: Completo

**Excel:**
```
| Productos | SKU      | Categoría    | Cantidad | Costo | Precio | Stock Min | Unidad |
|-----------|----------|--------------|----------|-------|--------|-----------|--------|
| Laptop    | PROD-001 | Electrónica  | 10       | 500   | 750    | 2         | Unidad |
| Mouse     | PROD-002 | Electrónica  | 50       | 15    | 25     | 10        | Unidad |
```

---

## 💡 TIPS Y MEJORES PRÁCTICAS

### Para Mejores Resultados

1. **Primera fila = Headers**
   - Siempre pon los nombres de columnas en la primera fila
   - Usa nombres descriptivos

2. **Datos limpios**
   - Evita celdas combinadas
   - No dejes filas vacías entre datos
   - Usa formato de número para precios

3. **Categorías**
   - Crea las categorías antes de importar
   - Usa nombres exactos (case-insensitive)

4. **SKU únicos**
   - Si usas SKU, asegúrate que sean únicos
   - El sistema no permite duplicados

5. **Revisar siempre**
   - Usa la vista previa antes de importar
   - Verifica que los datos sean correctos
   - Ajusta el mapeo si es necesario

### Errores Comunes a Evitar

❌ **No hacer:**
- Dejar campos requeridos vacíos
- Usar texto en campos numéricos
- Duplicar SKUs
- Omitir la primera fila de headers

✅ **Sí hacer:**
- Completar nombre, costo y precio
- Usar números en campos numéricos
- SKUs únicos o dejarlos vacíos
- Headers claros en primera fila

---

## 📱 INTERFAZ PASO A PASO

### Paso 1: Upload
```
┌─────────────────────────────────────┐
│ ✨ Importación Inteligente con IA  │
├─────────────────────────────────────┤
│                                     │
│  [📄] Descargar Ejemplo             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📤 Click para seleccionar  │   │
│  │     Formatos: xlsx, xls     │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Cancelar]                         │
└─────────────────────────────────────┘
```

### Paso 2: Mapping
```
┌─────────────────────────────────────┐
│ ✓ Análisis Completado               │
│ 7 columnas válidas, 15 filas        │
├─────────────────────────────────────┤
│                                     │
│ Nombre del Producto *               │
│ [Productos ▼]                       │
│                                     │
│ Costo Unitario *                    │
│ [Costo unitario ▼]                  │
│                                     │
│ Precio de Venta *                   │
│ [Precio Minorista ▼]                │
│                                     │
│ [← Atrás]  [Continuar →]            │
└─────────────────────────────────────┘
```

### Paso 3: Preview
```
┌─────────────────────────────────────┐
│ Vista Final (15 válidos)            │
├─────────────────────────────────────┤
│ # │ Nombre  │ Costo │ Precio │ ✓   │
│ 2 │ Laptop  │ $500  │ $750   │ ✓   │
│ 3 │ Mouse   │ $15   │ $25    │ ✓   │
│                                     │
│ [← Ajustar]  [Importar 15 Productos]│
└─────────────────────────────────────┘
```

### Paso 4: Success
```
┌─────────────────────────────────────┐
│         ✓ ¡Importación Exitosa!     │
│                                     │
│   Se importaron 15 de 15 productos  │
│                                     │
│         Cerrando...                 │
└─────────────────────────────────────┘
```

---

## ✅ CHECKLIST PRE-IMPORTACIÓN

Antes de importar, verifica:

- [ ] La tabla `products` existe en Supabase
- [ ] Las políticas RLS están configuradas
- [ ] Tu Excel tiene headers en la primera fila
- [ ] Los datos requeridos están completos
- [ ] No hay filas completamente vacías
- [ ] Los números están en formato correcto
- [ ] Las categorías existen (si las usas)

---

## 🎉 ¡LISTO PARA IMPORTAR!

El sistema está completamente funcional. Solo:

1. ✅ Prepara tu Excel
2. ✅ Sube el archivo
3. ✅ Revisa el mapeo
4. ✅ Confirma la vista previa
5. ✅ ¡Importa!

**Todo funciona automáticamente. La IA hace el trabajo pesado por ti.** 🚀

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa esta guía
2. Verifica la consola del navegador (F12)
3. Asegúrate que las tablas existan en Supabase
4. Prueba con el Excel de ejemplo

**El sistema tiene logging detallado en la consola para debugging.**

---

**Desarrollado con ❤️ para máxima facilidad de uso**
